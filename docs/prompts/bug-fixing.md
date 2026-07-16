# Prompt: Bug Fixing — LadFit

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Paste it into your AI coding assistant to diagnose and fix a bug.

---

## Prompt Template

```
You are an expert React Native / TypeScript engineer working on LadFit — an offline-first functional fitness app.

## Project Context
Before investigating, read:
- AI_CONTEXT.md — project overview
- src/types/index.ts — domain types
- docs/business-rules.md — the rules governing data and behavior

## The Bug
[DESCRIBE THE BUG — include what the user sees vs. what should happen]

## Steps to Reproduce
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

## Suspected Area
[LADDER TYPE / SCREEN NAME / STORE / UTILITY FUNCTION]

## Relevant Code / Data
[PASTE ANY RELEVANT CONSOLE OUTPUT, STORED DATA, OR STACK TRACE]

## Investigation Instructions
1. Read the relevant store action(s) for this flow
2. Read the ladder strategy for the affected type (in src/utils/ladderStrategies.ts)
3. Check round numbering: strategy uses 1-indexed roundNumber; store uses 0-indexed currentRoundIndex
4. Check Date hydration: JSON.parse returns strings, not Date objects — ensure re-hydration
5. Check AsyncStorage key consistency between storage.ts and store

## Fix Requirements
- Do NOT change unrelated code
- Preserve backward compatibility with existing stored data
- If the fix requires a data migration, add it to storage.ts with a comment
- Add a code comment explaining why the fix works

Please:
1. Diagnose the root cause
2. Show the exact code change (diff-style if possible)
3. Explain why the fix is correct
4. Describe how to verify the fix
```

---

## Common Bug Investigation Checklist

Use these targeted sub-prompts to narrow down bugs:

### Round Numbering Bug
```
In LadFit:
- Ladder strategies use roundNumber starting at 1
- activeWorkoutStore.currentRoundIndex starts at 0
- When calling getExercisesForRound(roundNumber, exercises), pass currentRoundIndex + 1

Check if [SCREEN/COMPONENT] is passing the correct round number to the strategy.
Read: src/utils/ladderStrategies.ts, src/store/activeWorkoutStore.ts
```

### Data Not Persisting
```
In LadFit, AsyncStorage writes happen in store actions via src/utils/storage.ts.
Check:
1. Is the action calling await saveWorkouts(updatedArray)?
2. Is the state update happening AFTER the save?
3. Is the AsyncStorage key correct? (keys: @workouts, @workout_history, @exercise_catalog)
Read: src/utils/storage.ts, src/store/[AFFECTED_STORE].ts
```

### Date Comparison Bug
```
In LadFit, Dates are stored as ISO strings in AsyncStorage and re-hydrated in storage.ts.
The bug may be caused by comparing a Date object to a string, or vice versa.
Check: src/utils/storage.ts loadWorkoutHistory() and loadWorkouts() for the hydration code.
Also check: src/screens/logbook/LogBookScreen.tsx for date filter logic.
```

### Christmas Ladder Rep Count Bug
```
Christmas ladder rule:
- Exercise at position N is performed starting from Round N
- When performed, it uses reps = N (position = rep count)
- Round R: exercises at positions R, R-1, ..., 1 in descending order

Check: src/utils/ladderStrategies.ts ChristmasLadderStrategy.getExercisesForRound()
```

### Paused Workout Not Restoring
```
In LadFit, paused workouts are serialized to @ladder_trainer_paused_workout in AsyncStorage.
Check:
1. src/store/activeWorkoutStore.ts pauseWorkout() — is it serializing all needed state?
2. src/store/activeWorkoutStore.ts loadPausedWorkout() — is it deserializing Dates correctly?
3. Is the screen calling loadPausedWorkout() on mount?
```
