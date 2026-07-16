# Development Workflow — AI Agent Guide

> This file describes how an AI agent should approach development tasks in the LadFit codebase.

---

## Before Starting Any Task

1. **Read `AI_CONTEXT.md`** — project rules, key files, known issues.
2. **Read `ai/architecture-summary.md`** — fast architectural orientation.
3. **Read `ai/feature-index.md`** — locate relevant existing code.
4. **Read `docs/coding-standards.md`** — conventions to follow.
5. **Identify all files that will change** before writing any code.

---

## Task Execution Order

### For Feature Work
```
1. Read FEATURE_TEMPLATE.md for the spec
2. Read IMPLEMENTATION_PLAN_TEMPLATE.md to plan
3. Update types first (src/types/index.ts)
4. Update storage/migration (src/utils/storage.ts)
5. Update stores (src/store/)
6. Add utility functions (src/utils/)
7. Build/update components (src/components/)
8. Build/update screens (src/screens/)
9. Update navigation (src/types/navigation.ts + src/navigation/)
10. Write tests
```

### For Bug Fixes
```
1. Read BUG_REPORT_TEMPLATE.md for context
2. Locate root cause: store → storage → strategy → screen
3. Write a minimal fix — do not refactor while fixing
4. Add a comment explaining why the fix is correct
5. Check for migration needs (does stored data need updating?)
```

### For Refactoring
```
1. Read docs/prompts/refactoring.md for recipes
2. Confirm external behavior is preserved before starting
3. Make one change at a time
4. Check no public API was renamed
5. Verify TypeScript compiles after each change
```

---

## File Change Checklist

When modifying a file, verify:

### `src/types/index.ts`
- [ ] New fields are optional (`?`) for backward compatibility
- [ ] `LadderType` union updated if adding a new type
- [ ] No `any` types introduced

### `src/utils/storage.ts`
- [ ] New fields re-hydrated with defaults in `loadWorkouts()` / `loadWorkoutHistory()`
- [ ] `Date` fields re-hydrated with `new Date(w.fieldName)`
- [ ] Migration comment added explaining what changed

### `src/store/*.ts`
- [ ] Actions are `async` if touching AsyncStorage
- [ ] State updates are immutable (spread operator)
- [ ] `try/catch` wraps all AsyncStorage operations
- [ ] `console.error` on failures

### `src/utils/ladderStrategies.ts`
- [ ] New strategy implements all 3 `LadderStrategy` methods
- [ ] `getLadderStrategy()` factory has new case
- [ ] Round numbers are 1-indexed in strategy methods

### `src/screens/*.tsx`
- [ ] Wrapped in `SafeAreaView`
- [ ] Uses `useTheme()` for colors
- [ ] `StyleSheet.create()` at bottom
- [ ] Text from `react-native-paper`
- [ ] Navigation types are correct (no `any`)

---

## AI Agent Task Patterns

### "Add field X to Template"

**Minimal change set:**
1. `src/types/index.ts` — add `x?: Type` to `Template`
2. `src/utils/storage.ts` — add `x: w.x ?? defaultValue` in `loadWorkouts()`
3. `src/store/activeWorkoutStore.ts` — add `x: template.x` to `startWorkout()` snapshot
4. UI: `CreateEditWorkoutScreen.tsx` + `WorkoutDetailsScreen.tsx`

### "Fix a rep count bug in ladder type X"

**Investigation path:**
1. `src/utils/ladderStrategies.ts` — read the strategy class
2. Check: is `roundNumber` 1-indexed in the call from the screen?
3. Check: is `stepSize` and `startingReps` passed correctly to `getLadderStrategy()`?
4. Verify with the `getDescription()` example values

### "Add a new screen to the Workout tab"

**Minimal change set:**
1. `src/types/navigation.ts` — add `NewScreen: { param: Type }` to `WorkoutStackParamList`
2. `src/navigation/WorkoutNavigator.tsx` — add `<Stack.Screen name="NewScreen" component={NewScreen} />`
3. `src/screens/workouts/NewScreen.tsx` — create the screen

### "Fix data not persisting"

**Investigation path:**
1. Store action: is `await saveX(updated)` called before `set({ ... })`?
2. Storage function: is the AsyncStorage key correct?
3. Load function: is the key correct on load?
4. App startup: is `loadX()` called in `App.tsx` or screen `useEffect`?

---

## Common Mistake Prevention

| Mistake | Prevention |
|---|---|
| Calling `AsyncStorage` in a screen | Always use a store action |
| 0-indexed vs 1-indexed round confusion | `currentRoundIndex + 1` when calling `getExercisesForRound()` |
| Forgetting to snapshot new fields | Check `activeWorkoutStore.startWorkout()` when adding Template fields |
| Missing migration for new fields | Always add default in `storage.ts loadWorkouts()` |
| Using `any` | Use `unknown` + type guard, or define the exact interface |
| Hardcoding colors or spacing | `theme.colors.*`, `spacing.*`, `borderRadius.*` |
| Forgetting to re-hydrate Dates | All `Date` fields must use `new Date(w.fieldName)` in storage.ts |
