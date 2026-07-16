# MCP Architecture — LadFit

> Model Context Protocol (MCP) integration design for LadFit.  
> This document defines how AI agents should interact with the project's knowledge and tooling.

---

## Overview

This document proposes an MCP server architecture that exposes LadFit's project knowledge, business rules, and code generation capabilities to AI agents (GitHub Copilot, Claude, Cursor, etc.).

The MCP server would run locally as a development tool — not as part of the production app.

---

## Goals

1. Give AI agents reliable, structured access to LadFit's domain knowledge.
2. Reduce prompt engineering overhead — agents can query facts instead of relying on injected context.
3. Enable agents to validate code changes against business rules.
4. Expose code generation templates for common patterns (new ladder type, new screen, new store action).
5. Support multi-agent workflows (planning agent → implementation agent → review agent).

---

## Proposed MCP Resources

Resources are read-only data sources that AI agents can query.

### `ladfit://project/context`
Returns the full content of `AI_CONTEXT.md`.  
Use: Agent orientation before starting any task.

### `ladfit://project/architecture`
Returns the content of `docs/architecture.md`.  
Use: Understanding the layer structure, navigation, and store topology.

### `ladfit://project/business-rules`
Returns the content of `docs/business-rules.md`.  
Use: Validating that a proposed change doesn't violate domain rules.

### `ladfit://project/coding-standards`
Returns the content of `docs/coding-standards.md`.  
Use: Code review and generation to match codebase conventions.

### `ladfit://project/api-contracts`
Returns the content of `docs/api-contracts.md`.  
Use: Understanding store action signatures and utility function contracts.

### `ladfit://project/database-schema`
Returns the content of `docs/database-schema.md`.  
Use: Understanding what data shapes exist in AsyncStorage.

### `ladfit://ladder-types`
Returns a structured JSON description of all 8 ladder types:
```json
[
  {
    "type": "christmas",
    "description": "...",
    "defaultMaxRounds": 12,
    "perExerciseFields": [],
    "templateLevelFields": ["maxRounds"],
    "strategyClass": "ChristmasLadderStrategy"
  },
  ...
]
```
Use: Agent needs to understand ladder types without reading strategy code.

### `ladfit://features`
Returns the content of `ai/feature-index.md`.  
Use: Locating which files implement a given feature.

### `ladfit://project/roadmap`
Returns the content of `docs/project-roadmap.md`.  
Use: Understanding what's planned vs. what's built.

### `ladfit://store/{storeName}`
Returns the TypeScript interface + action signatures for a given Zustand store.  
Parameters: `storeName` ∈ `{workout, activeWorkout, workoutHistory, exercise, theme}`  
Use: Agent can understand store contracts without reading full source.

### `ladfit://types/all`
Returns the contents of `src/types/index.ts` and `src/types/navigation.ts`.  
Use: Understanding all domain types in one query.

---

## Proposed MCP Tools

Tools are callable functions that perform actions on behalf of the AI agent.

### `ladfit_validate_ladder_strategy`
**Description:** Validate that a proposed `LadderStrategy` implementation is correct.  
**Inputs:**
- `ladderType: string` — the new type name
- `strategyCode: string` — the TypeScript class code

**Logic:**
- Verify the class implements `getExercisesForRound`, `calculateTotalReps`, `getDescription`
- Run a series of mathematical verification checks (e.g., round 1 output, total reps calculation)
- Return pass/fail with detailed output

---

### `ladfit_generate_exercise_input`
**Description:** Scaffold a new `ExerciseInput` component for a given ladder type.  
**Inputs:**
- `ladderType: string`
- `perExerciseFields: Array<{ name: string; type: string; description: string }>`

**Output:** TypeScript + React Native Paper component code ready to paste into `src/components/`.

---

### `ladfit_check_type_change`
**Description:** Given a proposed change to `src/types/index.ts`, detect if it requires a data migration.  
**Inputs:**
- `beforeType: string` — TypeScript interface before change
- `afterType: string` — TypeScript interface after change

**Logic:**
- Detect new required fields (breaking — migration needed)
- Detect new optional fields (safe — default needed in storage.ts)
- Detect removed fields (breaking — check all usages)
- Return list of required actions

---

### `ladfit_search_codebase`
**Description:** Semantic search across the LadFit source code.  
**Inputs:**
- `query: string`

**Output:** Array of `{ file, lineRange, relevanceScore, snippet }` matching the query.

---

### `ladfit_get_feature_context`
**Description:** Given a feature name or area, return all relevant files, types, and store actions.  
**Inputs:**
- `feature: string` — e.g., "buy-in/out", "rest screen", "chipper ladder"

**Output:**
```json
{
  "files": ["src/store/activeWorkoutStore.ts", "..."],
  "types": ["Template", "Workout"],
  "storeActions": ["completeBuyIn", "completeBuyOut"],
  "relatedBusinessRules": ["Buy-In / Buy-Out Rules section in business-rules.md"]
}
```

---

### `ladfit_generate_store_action`
**Description:** Generate a Zustand store action stub following project conventions.  
**Inputs:**
- `storeName: string`
- `actionName: string`
- `description: string`
- `inputType: string`
- `affectsStorage: boolean`

**Output:** TypeScript store action code following the async/try-catch/immutable-update pattern.

---

## Recommended Implementation Approach

### Technology
- **Runtime:** Node.js (TypeScript)
- **Protocol:** MCP (Model Context Protocol SDK from Anthropic)
- **Package:** `@modelcontextprotocol/sdk`

### Server Structure
```
mcp-server/
├── index.ts              # MCP server entrypoint
├── resources/
│   ├── docs.ts           # Serve markdown docs as resources
│   ├── types.ts          # Parse and serve type information
│   └── ladderTypes.ts    # Structured ladder type data
├── tools/
│   ├── validateStrategy.ts
│   ├── generateComponent.ts
│   ├── checkTypeChange.ts
│   └── searchCodebase.ts
└── data/
    └── ladderTypeRegistry.json  # Static structured ladder type data
```

### Configuration in `.vscode/settings.json`
```json
{
  "mcp": {
    "servers": {
      "ladfit": {
        "command": "node",
        "args": ["./mcp-server/index.js"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

---

## How AI Agents Should Use This MCP Server

### Agent Onboarding (any task)
```
1. GET ladfit://project/context
2. GET ladfit://features
→ Agent now has full project orientation
```

### Feature Implementation
```
1. GET ladfit://project/business-rules — understand domain rules
2. GET ladfit://project/api-contracts — understand store signatures
3. GET ladfit://types/all — understand data shapes
4. CALL ladfit_get_feature_context({ feature: "..." }) — locate relevant files
5. CALL ladfit_check_type_change(...) — validate before modifying types
```

### Adding a New Ladder Type
```
1. GET ladfit://ladder-types — understand existing patterns
2. GET ladfit://project/coding-standards — follow conventions
3. CALL ladfit_generate_exercise_input(...) — scaffold ExerciseInput component
4. Write LadderStrategy class
5. CALL ladfit_validate_ladder_strategy(...) — verify mathematical correctness
```

### Code Review
```
1. GET ladfit://project/coding-standards
2. GET ladfit://project/api-contracts
3. Evaluate proposed code against returned standards
```

---

## Priority Implementation Order

1. **Phase 1 (Minimum Viable):** Resource server for markdown docs + `ladfit://ladder-types` + `ladfit://types/all`
2. **Phase 2:** `ladfit_search_codebase` tool + `ladfit_get_feature_context` tool
3. **Phase 3:** Validation tools (`ladfit_validate_ladder_strategy`, `ladfit_check_type_change`)
4. **Phase 4:** Code generation tools (`ladfit_generate_store_action`, `ladfit_generate_exercise_input`)

---

## Estimated Effort

| Phase | Effort |
|---|---|
| Phase 1 | ~4 hours |
| Phase 2 | ~1 day |
| Phase 3 | ~1–2 days |
| Phase 4 | ~2–3 days |
