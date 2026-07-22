# Feature Template — LadFit

> Complete the impact analysis in `ai/development-workflow.md`: persisted compatibility, snapshot behavior, lifecycle/background behavior, result/share readers, accessibility, and validation.

> Use this template when requesting a new feature from an AI agent or writing a feature spec.

---

## Feature Request

**Feature Name:**  
<!-- Short, descriptive title. E.g.: "Workout Notes Field" -->

**Requested By:**  
<!-- Developer / stakeholder name or "AI-generated" -->

**Date:**  
<!-- YYYY-MM-DD -->

**Priority:**  
<!-- High / Medium / Low -->

---

## Problem Statement

> Describe the user problem or gap this feature addresses.

**As a** [type of user],  
**I want** [goal or feature],  
**so that** [benefit or reason].

---

## Context for AI Agent

> Provide relevant codebase context so the AI can locate and understand the relevant code.

**Affected area(s):**
- [ ] Data types (`src/types/index.ts`)
- [ ] Zustand store (`src/store/`)
- [ ] Storage layer (`src/utils/storage.ts`)
- [ ] Ladder strategies (`src/utils/ladderStrategies.ts`)
- [ ] Navigation (`src/navigation/`)
- [ ] Screen(s): ________________
- [ ] Component(s): ________________
- [ ] Constants: ________________
- [ ] Utils: ________________

**Related types / interfaces:**
```
<!-- List type names that will need to change or be created -->
```

**Related store(s):**
```
<!-- E.g.: useWorkoutStore, useActiveWorkoutStore -->
```

**Related screens:**
```
<!-- E.g.: CreateEditWorkoutScreen, WorkoutDetailsScreen -->
```

---

## Acceptance Criteria

> List specific, testable requirements.

- [ ] AC1: ...
- [ ] AC2: ...
- [ ] AC3: ...

---

## UI/UX Description

> Describe what the user sees and does. Include screen names, navigation flows, and component behaviors.

**Screen changes:**

**Navigation changes:**

**New components needed:**

**Existing components affected:**

---

## Data Model Changes

> Describe any changes to types or AsyncStorage.

**New fields on existing types:**
```typescript
// Example:
interface Template {
  // ... existing fields ...
  notes?: string;   // NEW — optional workout notes
}
```

**New types:**
```typescript
// Define any new interfaces or type aliases
```

**Migration needed:**
- [ ] Yes — describe the migration logic required
- [ ] No

**AsyncStorage impact:**
- [ ] New key needed: `@_____`
- [ ] Existing key format changes: `@_____`
- [ ] No storage changes

---

## Business Logic Changes

> Describe rule changes, new calculations, or strategy changes.

**Ladder strategy impact:**
- [ ] New ladder type needed
- [ ] Existing strategy modified
- [ ] No strategy changes

**Store action changes:**
```
<!-- List new or modified store actions -->
```

---

## Out of Scope

> Explicitly list what this feature does NOT include.

- ...

---

## Open Questions

> List unresolved design decisions.

1. ...
2. ...

---

## Implementation Notes for AI Agent

> Optional: guidance hints, similar patterns already in the codebase, files to reference.

**Reference implementations:**
- Similar feature: `src/___` → look at how `___` was implemented

**Watch out for:**
- ...

---

## Definition of Done

- [ ] Types updated in `src/types/index.ts`
- [ ] Store actions added/updated
- [ ] Data migration written if needed
- [ ] Screen(s) updated or created
- [ ] Component(s) updated or created
- [ ] No `any` types introduced
- [ ] Styles use `spacing.*` and `borderRadius.*` tokens
- [ ] No hardcoded AsyncStorage keys (use constants)
- [ ] Unit tests written (if applicable)
- [ ] Tested on iOS and Android
