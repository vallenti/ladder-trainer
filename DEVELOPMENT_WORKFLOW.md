# Development Workflow — LadFit

> Canonical agent workflow: `ai/development-workflow.md`. Resolve conflicts in favor of that guide and current source.

> This document describes the end-to-end development process from idea to merged code.
> Follow this process for all features, bug fixes, and refactors.

---

## Workflow Overview

```
Idea
  ↓
Specification (FEATURE_TEMPLATE.md)
  ↓
Review (AI code review / peer review)
  ↓
Implementation Plan (IMPLEMENTATION_PLAN_TEMPLATE.md)
  ↓
Implementation
  ↓
Tests
  ↓
Pull Request
```

---

## Stage 1: Idea

**Goal:** Capture the problem or opportunity clearly.

**Actions:**
1. Write a one-sentence description: "Users need to [do X] because [reason Y]."
2. Check `docs/project-roadmap.md` — is this already planned?
3. Check `ai/feature-index.md` — does related code already exist?
4. Decide: bug fix, new feature, refactor, or tech debt.

**Output:** A clear problem statement.

---

## Stage 2: Specification

**Goal:** Define what will be built, not how.

**Actions:**
1. Copy `FEATURE_TEMPLATE.md` (for features) or `BUG_REPORT_TEMPLATE.md` (for bugs).
2. Fill in all sections: user story, acceptance criteria, data model changes, UI description.
3. Identify affected files and stores.
4. List what is explicitly out of scope.

**AI-Assisted:**
```
Prompt: "I want to add [FEATURE]. Help me fill out FEATURE_TEMPLATE.md with:
- Acceptance criteria
- Required data model changes
- Affected files
Use AI_CONTEXT.md for project rules."
```

**Output:** Completed spec document.

**Gate:** Spec must answer: What does the user see? What data changes? What are the edge cases?

---

## Stage 3: Review (Spec Review)

**Goal:** Validate the spec before writing any code.

**Checklist:**
- [ ] Does this violate any business rule in `docs/business-rules.md`?
- [ ] Does this require a breaking data migration?
- [ ] Does this introduce any new external dependencies?
- [ ] Are all acceptance criteria testable?
- [ ] Is scope clearly bounded?

**AI-Assisted:**
```
Prompt: "Review this feature spec against the business rules in docs/business-rules.md
and the architecture rules in AI_CONTEXT.md. Identify any conflicts or concerns."
[Paste spec]
```

**Output:** Approved spec or revision notes.

---

## Stage 4: Implementation Plan

**Goal:** Define exactly what code will change and in what order.

**Actions:**
1. Copy `IMPLEMENTATION_PLAN_TEMPLATE.md`.
2. List every file that will be modified and why.
3. Write type changes, store changes, and utility changes.
4. Define the implementation order (types → storage → store → utils → components → screens → navigation).
5. Write the testing plan.

**AI-Assisted:**
```
Prompt: "Based on this spec [paste spec], create an implementation plan using
IMPLEMENTATION_PLAN_TEMPLATE.md. List all files to change, describe the data model
changes, and define the implementation order."
```

**Output:** Completed implementation plan.

---

## Stage 5: Implementation

**Goal:** Write the code following the plan.

**Rules:**
1. Always implement in the order defined in the plan (types first, screens last).
2. After each file change, verify TypeScript compiles: `npx tsc --noEmit`.
3. Never introduce `any` types.
4. Never skip data migrations.
5. Commit atomically — one logical change per commit.

**AI-Assisted:**
Use the prompts in `docs/prompts/feature-implementation.md` to implement each step.

**Commit message format:**
```
feat: add workout notes field to Template
fix: correct round numbering in descending ladder
refactor: extract formatRoundTime into calculations.ts
test: add unit tests for ChristmasLadderStrategy
chore: remove unused axios dependency
```

**Output:** Working implementation with no TypeScript errors.

---

## Stage 6: Tests

**Goal:** Verify correctness and prevent regressions.

**Required tests (when applicable):**
- [ ] Unit tests for any new utility function in `src/utils/`
- [ ] Unit tests for any new or modified `LadderStrategy` class
- [ ] Unit tests for any new or modified store action
- [ ] Snapshot test for any new component

**AI-Assisted:**
Use the prompts in `docs/prompts/test-generation.md`.

**Test run:**
```bash
npx jest --watchAll=false
```

**Coverage check:**
```bash
npx jest --coverage
```

Target: ≥ 80% on `src/utils/` and `src/store/`.

**Output:** Passing test suite.

---

## Stage 7: Pull Request

**Goal:** Get the change reviewed and merged.

**PR Checklist:**
- [ ] Title: `[feat|fix|refactor|test|chore]: brief description`
- [ ] Description links to the spec / implementation plan
- [ ] All acceptance criteria are checked off
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tests pass: `npx jest`
- [ ] Tested manually on iOS simulator
- [ ] Tested manually on Android emulator
- [ ] No `console.log` debugging left in code
- [ ] No `any` types introduced
- [ ] `AI_CONTEXT.md` updated if architecture changed
- [ ] `ai/project-memory.md` updated with any new gotchas or ADRs

**AI-Assisted Code Review:**
Use `docs/prompts/code-review.md` to request an AI review of the diff before submitting.

**Output:** Merged PR.

---

## Hotfix Process

For critical bugs (data loss, crash):

1. **Skip spec stage** — go directly to BUG_REPORT_TEMPLATE.md.
2. Use `docs/prompts/bug-fixing.md` to diagnose quickly.
3. Write minimal fix — do not refactor.
4. Write a regression test immediately.
5. PR with `fix:` prefix and link to bug report.

---

## AI Agent Quick Reference

| Stage | Prompt File |
|---|---|
| Feature spec | `FEATURE_TEMPLATE.md` |
| Bug report | `BUG_REPORT_TEMPLATE.md` |
| Implementation plan | `IMPLEMENTATION_PLAN_TEMPLATE.md` |
| Implementation | `docs/prompts/feature-implementation.md` |
| Bug fix | `docs/prompts/bug-fixing.md` |
| Refactoring | `docs/prompts/refactoring.md` |
| Code review | `docs/prompts/code-review.md` |
| Tests | `docs/prompts/test-generation.md` |
| Performance | `docs/prompts/performance-optimization.md` |
