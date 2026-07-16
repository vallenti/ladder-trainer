# Implementation Plan Template — LadFit

> Use this template to structure an AI-assisted implementation plan before writing code.
> Filling this out first dramatically improves AI output quality.

---

## Implementation Plan

**Feature / Fix:**  
<!-- Title from FEATURE_TEMPLATE.md or BUG_REPORT_TEMPLATE.md -->

**Plan Author:**  
<!-- Your name or "AI-generated" -->

**Date:**  
<!-- YYYY-MM-DD -->

**Estimated Complexity:**  
<!-- XS (< 1h) / S (1-2h) / M (half day) / L (full day) / XL (multi-day) -->

---

## Objective

> One paragraph: what will be implemented and what problem it solves.

---

## Pre-Implementation Checklist

- [ ] Read `AI_CONTEXT.md` to understand project context
- [ ] Read `docs/business-rules.md` for relevant domain rules
- [ ] Read `docs/coding-standards.md` for conventions
- [ ] Read `src/types/index.ts` to understand current data shapes
- [ ] Identify all files that will be modified
- [ ] Confirm no conflicting in-progress changes

---

## Files to Modify

| File | Change Type | Description |
|---|---|---|
| `src/types/index.ts` | Modify | Add new field `X` to `Template` |
| `src/store/workoutStore.ts` | Modify | Add action `doX` |
| `src/screens/workouts/XScreen.tsx` | Create | New screen |
| ... | ... | ... |

---

## Data Model Changes

```typescript
// Before
interface Template {
  // ...existing fields
}

// After
interface Template {
  // ...existing fields
  newField?: string;   // Description of new field
}
```

**Migration required:**
- [ ] Yes → describe below
- [ ] No

**Migration logic:**
```typescript
// In storage.ts loadWorkouts():
const workout = {
  ...w,
  newField: w.newField ?? 'defaultValue',   // backward compat
};
```

---

## Store Changes

### New / Modified Store Actions

```typescript
// useXStore
newAction: async (params) => {
  // Implementation outline
  // 1. Read current state
  // 2. Compute new state
  // 3. Write to AsyncStorage
  // 4. Update Zustand state
},
```

---

## New Utility Functions (if any)

```typescript
// src/utils/X.ts

/**
 * Description
 */
export const newFunction = (input: InputType): OutputType => {
  // outline
};
```

---

## Ladder Strategy Changes (if any)

> Only needed if adding a new ladder type or modifying an existing strategy.

```typescript
// New strategy class outline:
export class NewLadderStrategy implements LadderStrategy {
  getExercisesForRound(roundNumber, exercises) { ... }
  calculateTotalReps(exercise, totalRounds) { ... }
  getDescription() { ... }
}
```

**Steps:**
1. [ ] Add type to `LadderType` union in `src/types/index.ts`
2. [ ] Add defaults to `LADDER_DEFAULTS` in `src/constants/ladderDefaults.ts`
3. [ ] Implement strategy class in `src/utils/ladderStrategies.ts`
4. [ ] Add case to `getLadderStrategy()` factory
5. [ ] Create `XExerciseInput.tsx` component
6. [ ] Wire into `CreateEditWorkoutScreen.tsx`

---

## Navigation Changes (if any)

```typescript
// New screen param:
export type WorkoutStackParamList = {
  // ...existing
  NewScreen: { param: string };
};
```

---

## UI Implementation Steps

1. [ ] Screen/component created at `src/screens/X/XScreen.tsx`
2. [ ] Props interface defined
3. [ ] StyleSheet uses `spacing.*` and `borderRadius.*` tokens
4. [ ] Loaded state handled (show `ActivityIndicator` while store loads)
5. [ ] Empty state handled (show placeholder when no data)
6. [ ] Error state handled (show `Snackbar` on action failure)
7. [ ] Theme-aware (uses `useTheme()` for colors)

---

## Implementation Order

> Step-by-step sequence to avoid breaking things mid-way.

1. Update types (`src/types/index.ts`)
2. Update storage utilities (`src/utils/storage.ts`) with migration
3. Update store actions (`src/store/X.ts`)
4. Add utility functions (`src/utils/X.ts`)
5. Create/update components (`src/components/X.tsx`)
6. Create/update screens (`src/screens/X/X.tsx`)
7. Update navigation params (`src/types/navigation.ts`)
8. Wire navigation in navigators
9. Write tests

---

## Testing Plan

| Test | Type | File |
|---|---|---|
| `newFunction` returns correct output | Unit | `src/utils/X.test.ts` |
| `newAction` updates store and persists | Unit | `src/store/X.test.ts` |
| `XScreen` renders correctly | Snapshot | `src/screens/X/XScreen.test.tsx` |

---

## Rollout Considerations

- [ ] Requires data migration for existing users
- [ ] Requires feature flag (gradual rollout)
- [ ] Affects benchmark workout definitions
- [ ] Potentially breaking change for persisted data

---

## Definition of Done

- [ ] All files modified per plan
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No `any` types introduced
- [ ] Migration tested with empty storage (first launch)
- [ ] Migration tested with existing storage (upgrade from v1.0.0)
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] PR description references this plan
