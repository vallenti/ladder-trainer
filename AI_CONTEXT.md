# AI Context — LadFit

> This file is the primary AI onboarding document. Read this before working on any task in this repository.

---

## Project Identity

- **App Name:** LadFit (internal codebase name: `ladder-trainer-app`)
- **Platform:** React Native + Expo (iOS & Android)
- **Version:** 1.0.0
- **Language:** TypeScript
- **Architecture:** Offline-first, no backend

---

## What This App Does

LadFit is a functional fitness workout timer and logger. Users create workout **templates** using one of 8 **ladder types**, then run live workout **sessions** which are timed, tracked, and saved to a **logbook**. Workout results can be shared as images.

**Core user flow:**  
Create Template → Start Session → Complete Rounds → View Results → Log History

---

## Critical Domain Knowledge

### The 8 Ladder Types (memorize these)

| Type | Pattern | Key Config |
|---|---|---|
| `christmas` | "12 Days" — accumulates exercises round by round (reverse order) | `maxRounds` (≤12) |
| `ascending` | Reps go up each round | `startingReps`, `stepSize`, `maxRounds` |
| `descending` | Reps go down each round (e.g. Fran: 21-15-9) | `startingReps`, `stepSize`, `maxRounds` |
| `pyramid` | Ascend to peak then descend | `stepSize`, `maxRounds` |
| `flexible` | Each exercise has independent direction + reps | per-exercise `direction`, `startingReps`, `stepSize` |
| `chipper` | Each exercise done once with fixed reps | per-exercise `fixedReps` |
| `amrap` | Max rounds in time cap | per-exercise `startingReps`, `stepSize`; `timeCap` |
| `forreps` | Fixed rounds, same reps each round | per-exercise `repsPerRound`, `maxRounds` |

### Key Design Decision
Templates are **snapshots** — when a workout starts, all template data is copied into the `Workout` object. Editing a template never changes historical workout records.

### Strategy Pattern
All ladder logic is in `src/utils/ladderStrategies.ts`. Adding a new ladder type requires:
1. New class implementing `LadderStrategy`
2. New entry in `LadderType` union (`src/types/index.ts`)
3. New entry in `LADDER_DEFAULTS` (`src/constants/ladderDefaults.ts`)
4. New case in `getLadderStrategy()` factory
5. New `ExerciseInput` component variant
6. UI wiring in `CreateEditWorkoutScreen`

---

## File Location Quick Reference

| What | Where |
|---|---|
| Domain types | `src/types/index.ts` |
| Navigation types | `src/types/navigation.ts` |
| All ladder business logic | `src/utils/ladderStrategies.ts` |
| Time/rep calculations | `src/utils/calculations.ts` |
| AsyncStorage wrappers | `src/utils/storage.ts` |
| Share feature | `src/utils/shareUtils.ts` |
| Audio beeps | `src/utils/soundUtils.ts` |
| All Zustand stores | `src/store/` |
| Theme tokens | `src/constants/theme.ts` |
| App config | `src/constants/config.ts` |
| Benchmark workouts | `src/constants/benchmarkWorkouts.ts` |
| Exercise catalog defaults | `src/constants/defaultExercises.ts` |
| Ladder type defaults | `src/constants/ladderDefaults.ts` |

---

## State Management Pattern

All global state → Zustand stores. No Context API for data, no prop-drilling for business state.

Stores: `useWorkoutStore`, `useWorkoutHistoryStore`, `useActiveWorkoutStore`, `useExerciseStore`, `useThemeStore`

Each store has load/save actions that wrap `AsyncStorage` operations. Do not call `AsyncStorage` directly from screens or components.

---

## Persistence Keys

All `AsyncStorage` keys: `@workouts`, `@workout_history`, `@exercise_catalog`, `@exercises_initialized`, `@benchmarks_initialized`, `@ladder_trainer_theme_mode`, `@ladder_trainer_paused_workout`

---

## Things That Do NOT Exist

- No backend / REST API
- No authentication
- No real-time features
- No push notifications
- No analytics tracking
- No Strava integration (type defined, not implemented)
- No tests (Jest configured but no test files)

---

## Known Issues / Tech Debt

1. `axios` dependency unused — should be removed
2. `HomeScreen.tsx` is dead code — no navigator references it
3. `ExampleComponent.tsx` is scaffold placeholder — should be removed
4. `@types/react-native` pinned to `0.73.0` but RN is `^0.81.5`
5. No ESLint/Prettier config
6. `HomeScreenProps.navigation` typed as `any` in `src/types/index.ts`
7. No React Error Boundary in `App.tsx`
8. No unit tests

---

## How to Generate IDs

Templates and workout sessions use `Date.now().toString()` as IDs. This is a timestamp-string pattern — not a UUID. Be aware of this when writing code that creates new entities.

---

## Theming

- Always use `useTheme()` from `react-native-paper` to get the current theme.
- Use `spacing.*` and `borderRadius.*` from `src/constants/theme.ts` — never hardcode pixel values.
- Primary accent: `#FF6B35` (energetic orange). Do not introduce new brand colors without updating `theme.ts`.

---

## How Exercise Positions Work in Christmas Ladder

In the Christmas ladder, `exercise.position` serves two purposes:
1. The order/step number of the exercise
2. The rep count when that exercise appears in a round

So position=3 means: perform 3 reps of that exercise, starting from round 3 onward.

---

## Recommended Reading Order for New AI Context

1. `src/types/index.ts` — understand the data shapes
2. `src/utils/ladderStrategies.ts` — understand the core business logic
3. `src/store/workoutStore.ts` + `activeWorkoutStore.ts` — understand state management
4. `src/navigation/AppNavigator.tsx` — understand the screen flow
5. `docs/business-rules.md` — understand the rules governing data
