# Architecture — LadFit

> Last updated: June 24, 2026

## Overview

LadFit is a React Native / Expo mobile application (iOS + Android) for creating, managing, and logging functional fitness ladder-style workouts. There is no backend server; all state is stored locally on the device using `AsyncStorage`.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Expo (managed workflow) | ~54.0 |
| UI Framework | React Native | ^0.81 |
| Language | TypeScript | ~5.9 |
| State Management | Zustand | ^5.0 |
| UI Component Library | React Native Paper (MD3) | ^5.14 |
| Navigation | React Navigation v7 | ^7.x |
| Persistence | AsyncStorage | ^2.2 |
| Audio | Expo AV | ~14.0 |
| Haptics | Expo Haptics | ~15.0 |
| Sharing | Expo Sharing + expo-file-system | ~14.0 / ~19.0 |
| Screenshot | react-native-view-shot | 4.0.3 |
| Date Utilities | date-fns | ^4.1 |
| Gesture Handling | react-native-gesture-handler + reanimated | ~2.28 / ~4.1 |
| HTTP Client | axios | ^1.13 (present but unused) |

---

## Folder Structure

```
src/
├── App.tsx                     # Root component — theme provider, navigation container
├── components/                 # Shared presentational components
│   ├── AMRAPExerciseInput.tsx
│   ├── AutocompleteExerciseInput.tsx
│   ├── ChipperExerciseInput.tsx
│   ├── ExampleComponent.tsx    # Scaffold placeholder — unused
│   ├── ExerciseInput.tsx       # Router: delegates to type-specific input
│   ├── FixedRepsExerciseInput.tsx
│   ├── FlexibleExerciseInput.tsx
│   ├── ForRepsExerciseInput.tsx
│   ├── NumberStepper.tsx
│   ├── ShareableWorkoutCard.tsx
│   └── WorkoutCard.tsx
├── constants/
│   ├── benchmarkWorkouts.ts    # Seeded benchmark templates (Fran, 12 Days, etc.)
│   ├── config.ts               # APP_VERSION, SUPPORT_EMAIL
│   ├── defaultExercises.ts     # Exercise catalog seed data
│   ├── ladderDefaults.ts       # Default maxRounds / stepSize per ladder type
│   ├── legal.ts                # Privacy policy / terms text
│   └── theme.ts                # MD3 light/dark themes, spacing, borderRadius
├── navigation/
│   ├── AppNavigator.tsx        # Root stack (HomeTabs + modal workout flow)
│   ├── BottomTabNavigator.tsx  # Workouts / Logbook / Settings tabs
│   ├── SettingsNavigator.tsx   # Settings stack
│   └── WorkoutNavigator.tsx    # Workout list / create / details stack
├── screens/
│   ├── HomeScreen.tsx          # Unused legacy screen
│   ├── LegalScreen.tsx
│   ├── ManageExercisesScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── logbook/
│   │   └── LogBookScreen.tsx   # Workout history with filter/search/share
│   └── workouts/
│       ├── ActiveWorkoutScreen.tsx
│       ├── CountdownScreen.tsx
│       ├── CreateEditWorkoutScreen.tsx
│       ├── RestScreen.tsx
│       ├── WorkoutCompleteScreen.tsx
│       ├── WorkoutDetailsScreen.tsx
│       └── WorkoutListScreen.tsx
├── store/
│   ├── activeWorkoutStore.ts   # In-flight workout session (pause/resume)
│   ├── exerciseStore.ts        # Exercise catalog (CRUD + fuzzy search)
│   ├── themeStore.ts           # Light/dark preference
│   ├── workoutHistoryStore.ts  # Completed & incomplete workout log
│   └── workoutStore.ts        # Workout templates (CRUD + benchmarks)
├── types/
│   ├── index.ts                # Domain types: Exercise, Template, Workout, Round, etc.
│   └── navigation.ts           # React Navigation param lists
└── utils/
    ├── calculations.ts         # formatTime, getExercisesForRound, calculateTotalReps
    ├── ladderStrategies.ts     # Strategy pattern for all 8 ladder types
    ├── shareUtils.ts           # Screenshot-to-share via expo-sharing
    ├── soundUtils.ts           # Programmatic WAV beep generation (expo-av)
    └── storage.ts              # AsyncStorage wrappers with data migration
```

---

## Navigation Architecture

```
RootStack (AppNavigator)
├── HomeTabs (BottomTabNavigator)           [persistent bottom tab bar]
│   ├── Workouts (WorkoutNavigator)
│   │   ├── WorkoutList
│   │   ├── CreateEditWorkout              [+ workoutId for edit mode]
│   │   └── WorkoutDetails                 [workoutId]
│   ├── Logbook (LogBookScreen)
│   └── Settings (SettingsNavigator)
│       ├── SettingsMain
│       └── ManageExercises
├── Modal group (full-screen workout flow) [presented as modal]
│   ├── Countdown                          [workoutId]
│   ├── ActiveWorkout                      [workoutId]
│   ├── Rest                               [workoutId]
│   └── WorkoutComplete                    [workoutId]
└── Legal
```

---

## State Management Architecture

All state is managed with **Zustand** stores. Each store is a singleton that persists to `AsyncStorage`.

| Store | Responsibility | Persistence |
|---|---|---|
| `useWorkoutStore` | Template CRUD + benchmark seeding | `@workouts` |
| `useWorkoutHistoryStore` | Completed workout log | `@workout_history` |
| `useActiveWorkoutStore` | Live session state (rounds, pause/resume) | `@ladder_trainer_paused_workout` |
| `useExerciseStore` | Exercise catalog (default + custom) | `@exercise_catalog` |
| `useThemeStore` | Light/dark mode preference | `@ladder_trainer_theme_mode` |

### Data Flow

```
User Action → Zustand Action → AsyncStorage (write) → Zustand State (update) → Component re-render
```

---

## Ladder Strategy Pattern

`src/utils/ladderStrategies.ts` implements the **Strategy Pattern** for all workout types:

```
LadderStrategy (interface)
├── ChristmasLadderStrategy    — "12 Days of Christmas" accumulation
├── AscendingLadderStrategy    — reps increase each round
├── DescendingLadderStrategy   — reps decrease each round  
├── PyramidLadderStrategy      — ascends to peak then descends
├── FlexibleLadderStrategy     — per-exercise independent progression
├── ChipperLadderStrategy      — each exercise completed once in sequence
├── AMRAPLadderStrategy        — max rounds within time cap
└── ForRepsLadderStrategy      — fixed reps, fixed rounds
```

Strategies are instantiated via `getLadderStrategy(ladderType, stepSize, maxRounds, startingReps)`.

---

## Persistence Layer

All data is serialized as JSON in `AsyncStorage`. Key prefixes:

| Key | Type | Notes |
|---|---|---|
| `@workouts` | `Template[]` | All workout templates |
| `@workout_history` | `Workout[]` | All completed/incomplete sessions |
| `@exercise_catalog` | `ExerciseCatalogItem[]` | Exercise name+unit catalog |
| `@exercises_initialized` | `string` | One-time seed flag |
| `@benchmarks_initialized` | `string` | One-time benchmark seed flag |
| `@ladder_trainer_theme_mode` | `'light' \| 'dark'` | Theme preference |
| `@ladder_trainer_paused_workout` | `PausedWorkoutState` | In-flight paused session |

### Data Migration

Both `workoutStore` and `workoutHistoryStore` include inline migration logic that adds missing `ladderType` and `maxRounds` fields on load — used to upgrade data from the original single-ladder-type version.

---

## Audio System

`soundUtils.ts` generates raw WAV audio data URIs programmatically (sine wave, 44100 Hz sample rate) and plays them via `expo-av`. This avoids bundling audio asset files. Frequency and duration are configurable.

---

## Sharing Feature

`shareUtils.ts` uses `react-native-view-shot` to capture a `<ViewShot>` ref as a PNG, then shares via `expo-sharing`. The `ShareableWorkoutCard` component renders an off-screen card used as the capture target.

---

## Known Architectural Issues

1. **`axios` is a dead dependency** — imported in `package.json` but never used in source code.
2. **`HomeScreen.tsx` is a dead screen** — never referenced in any navigator.
3. **`ExampleComponent.tsx` is scaffold code** — should be removed.
4. **`navigation.any` in `types/index.ts`** — `HomeScreenProps.navigation` typed as `any`.
5. **No test suite** — Jest is configured in `package.json` but no test files exist.
6. **`@types/react-native` version mismatch** — pinned to `0.73.0` while React Native is `^0.81.5`.
7. **No error boundary** — unhandled errors in render will crash the app silently.
8. **No offline-resilience strategy** — AsyncStorage errors are swallowed with `console.error`.
