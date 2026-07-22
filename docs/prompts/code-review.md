# Prompt: Code Review — LadFit

> Require source evidence, old-JSON compatibility, and consistency across execution, details preview, completion, logbook, and sharing.

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Use it to request an AI code review.

---

## Prompt Template

```
You are a senior React Native / TypeScript engineer performing a code review for LadFit.

## Project Context
Read before reviewing:
- AI_CONTEXT.md — project rules and constraints
- docs/coding-standards.md — the expected conventions
- .github/copilot-instructions.md — full coding guidelines

## Code to Review
[PASTE THE CODE HERE — or reference a file path and line range]

## Review Focus
Check for the following (mark as pass ✅ or fail ❌ with explanation):

### Architecture
- [ ] No direct AsyncStorage calls from screens or components (must go through store or storage.ts)
- [ ] No business logic in screens (ladder rep logic must be in ladderStrategies.ts)
- [ ] No navigation state stored in Zustand
- [ ] Template immutability preserved (startWorkout() snapshots — no mutation)
- [ ] Offline-first: no HTTP calls or external API usage

### TypeScript
- [ ] No `any` types
- [ ] All exported functions have typed return values
- [ ] Date objects are re-hydrated after JSON.parse
- [ ] Interfaces used for object shapes; type for unions

### React Native / Expo
- [ ] No bare `<Text>` — uses react-native-paper `<Text>`
- [ ] No inline styles — uses StyleSheet.create()
- [ ] No hardcoded hex colors — uses useTheme()
- [ ] No hardcoded pixel values — uses spacing.* / borderRadius.*
- [ ] Screen wrapped in SafeAreaView
- [ ] Lists use FlatList, not ScrollView+map

### State Management
- [ ] Store actions that touch AsyncStorage are async
- [ ] State updates are immutable (spread, not mutate)
- [ ] No React Context used for business data

### Error Handling
- [ ] AsyncStorage operations wrapped in try/catch
- [ ] Errors logged with console.error
- [ ] Graceful degradation (no crashes on storage failure)

### Performance
- [ ] No expensive operations in render path
- [ ] FlatList has keyExtractor
- [ ] Memo / useCallback used where appropriate

### Naming
- [ ] Components: PascalCase .tsx
- [ ] Utilities: camelCase .ts
- [ ] Stores: camelCase Store.ts
- [ ] AsyncStorage keys: @prefix + snake_case
- [ ] Zustand stores: use prefix

Please provide:
1. Overall assessment (approve / request changes)
2. Critical issues (must fix)
3. Minor issues (should fix)
4. Suggestions (optional improvements)
5. Positive observations (what's done well)
```

---

## Targeted Review Sub-Prompts

### Review a new Ladder Strategy
```
Review this new LadderStrategy implementation against the interface contract in
src/utils/ladderStrategies.ts:

[PASTE CODE]

Verify:
1. getExercisesForRound(roundNumber, exercises) — roundNumber is 1-indexed; returns correct reps
2. calculateTotalReps(exercise, totalRounds) — sum is mathematically correct
3. getDescription() — returns a clear human-readable description
4. Edge cases: roundNumber=1, totalRounds=0, empty exercises array
5. No mutation of the input exercises array
```

### Review a new Store Action
```
Review this new Zustand store action:

[PASTE CODE]

Verify:
1. Calls the correct storage.ts function (not AsyncStorage directly)
2. Writes to storage BEFORE setting state (avoids state/storage desync)
3. Wrapped in try/catch with console.error on failure
4. Uses immutable spread (not Object.assign or direct mutation)
5. Handles the case where get().collection is empty
6. Is properly typed — no any, return type is Promise<void>
```

### Review a new Screen
```
Review this new React Native screen:

[PASTE CODE]

Verify:
1. Wrapped in SafeAreaView from react-native-safe-area-context
2. Uses useTheme() for all color values
3. Text components are from react-native-paper
4. StyleSheet.create() at bottom of file (no inline styles)
5. Uses spacing.* and borderRadius.* from theme.ts
6. Lists use FlatList (not map+ScrollView)
7. Handles isLoading state
8. Handles empty data state
9. Navigation params come from typed param list
10. No any types
```
