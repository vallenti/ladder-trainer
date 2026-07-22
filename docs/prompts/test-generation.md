# Prompt: Test Generation — LadFit

> Jest is configured but unproven: no committed suite or test script exists. Add compatible setup and a reproducible npm script with generated tests.

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Use it to generate unit tests with an AI assistant.

---

## Prompt Template

```
You are an expert TypeScript / Jest engineer generating tests for LadFit — a React Native app.

## Testing Setup
- Runner: Jest (configured in package.json, preset: react-native)
- No test files exist yet
- Test files should be co-located: MyFile.test.ts next to MyFile.ts
- Target coverage: ≥80% on src/utils/ and src/store/

## Code to Test
File: [FILE PATH]
[PASTE THE CODE TO TEST — or describe the function/class precisely]

## Test Requirements
1. Test normal / happy path cases
2. Test edge cases (empty inputs, zero, maxRounds, etc.)
3. Test error cases (invalid inputs, storage failures)
4. Use descriptive test names: describe('[ClassName/function]', () => { it('should [behavior]', ...) })

## Mocking Setup
For AsyncStorage tests:
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

For Zustand store tests:
- Use the real store but reset between tests with beforeEach(() => { useXStore.setState(initialState); })

Please generate:
1. A complete .test.ts file
2. All necessary imports
3. All necessary mocks
4. Tests for every exported function/class/method
```

---

## Ready-to-Use Test Prompts

### Ladder Strategy Tests
```
Generate comprehensive Jest unit tests for all 8 LadderStrategy classes in
src/utils/ladderStrategies.ts.

For each strategy, test:

getExercisesForRound():
- Round 1 returns correct exercises and reps
- Round N returns correct exercises and reps (middle of progression)
- Round maxRounds returns correct exercises and reps (final round)
- Returns correct exercise count per round
- Does not mutate the input exercises array

calculateTotalReps():
- Returns 0 for totalRounds=0
- Returns correct value for totalRounds=1
- Returns correct value for totalRounds=maxRounds
- Matches manual calculation for known benchmarks (e.g. Fran: 21+15+9=45 total per exercise)

getDescription():
- Returns a non-empty string

Specific benchmarks to verify:
- Christmas: Round 12 has 12 exercises (positions 12 down to 1); exercise at position 1 has reps=1
- Descending (Fran): startingReps=21, stepSize=6, 3 rounds → [21, 15, 9]
- Ascending: startingReps=1, stepSize=1, 5 rounds → [1, 2, 3, 4, 5]
- Pyramid: stepSize=1, maxRounds=5 → [1, 2, 3, 2, 1]
- ForReps: repsPerRound=10, 3 rounds → each exercise gets 10 reps every round

Use these sample exercises:
const sampleExercises: Exercise[] = [
  { position: 1, name: 'Push-ups', unit: 'reps' },
  { position: 2, name: 'Pull-ups', unit: 'reps' },
];
```

### Storage Utility Tests
```
Generate Jest unit tests for src/utils/storage.ts.

Mock: import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

Test loadWorkouts():
- Returns [] when AsyncStorage has no data
- Returns typed Template[] with Date objects re-hydrated
- Skips malformed individual entries (logs warning, continues)
- Returns [] when AsyncStorage throws an error

Test saveWorkouts():
- Calls AsyncStorage.setItem with @workouts key
- Serializes Template[] as JSON

Test loadWorkoutHistory():
- Returns [] when no data
- Re-hydrates startTime, endTime, and round dates as Date objects
- Skips malformed entries

Test initializeBenchmarkWorkouts():
- Does nothing if @benchmarks_initialized is already set
- Saves BENCHMARK_WORKOUTS on first call
- Sets @benchmarks_initialized after seeding
```

### Calculations Tests
```
Generate Jest unit tests for src/utils/calculations.ts.

Test formatTime(seconds):
- 0 → "0:00"
- 65 → "1:05"
- 3661 → "1:01:01"
- 3600 → "1:00:00"
- Fractional seconds are floored

Test calculateTotalReps(exercises):
- Exercise at position 1: performed 12 times, 1 rep each = 12 total
- Exercise at position 12: performed 1 time, 12 reps = 12 total
- Exercise at position 6: performed 7 times, 6 reps each = 42 total
(These are Christmas ladder specific)

Test getExercisesForRound(roundNumber, allExercises):
- Round 1 returns only position=1 exercise
- Round 3 returns positions 3, 2, 1 in descending order
- Round 12 returns all 12 exercises
- Exercises with position > roundNumber are excluded
```

### Store Action Tests
```
Generate Jest unit tests for [STORE_FILE] store actions.

Setup:
import { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

Use beforeEach to reset store state and clear AsyncStorage mocks.

Test each action:
- [ACTION_NAME]: [describe the expected behavior and side effects]
```
