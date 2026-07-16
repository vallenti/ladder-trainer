# Architecture Summary — LadFit AI Agent

> A condensed architecture reference for AI agents. Read this for a fast orientation before starting a task.

---

## One-Paragraph Summary

LadFit is an offline-first React Native / Expo app for functional fitness ladder workouts. Users create **Templates** (workout blueprints), start live **Sessions** (which snapshot the template), complete timed **Rounds**, and review their **History** in a Logbook. All data lives in **AsyncStorage** accessed through **Zustand stores**. Ladder rep logic is entirely contained in the **Strategy Pattern** in `ladderStrategies.ts`. The UI uses **React Native Paper** (MD3) with a custom orange theme.

---

## Layer Map

```
┌─────────────────────────────────────────────┐
│  Screens (src/screens/)                      │  ← User-facing UI
│  Components (src/components/)               │  ← Reusable UI
├─────────────────────────────────────────────┤
│  Zustand Stores (src/store/)                 │  ← Global state + actions
├─────────────────────────────────────────────┤
│  Utilities (src/utils/)                      │  ← Business logic + helpers
│  Constants (src/constants/)                  │  ← Static config + seeds
├─────────────────────────────────────────────┤
│  AsyncStorage (device-local JSON)            │  ← Persistence
└─────────────────────────────────────────────┘
```

---

## Core Data Flow

```
User taps Start
    → useWorkoutStore.getWorkout(id)
    → useActiveWorkoutStore.startWorkout(template)  ← snapshots template → Workout object
    → navigate('Countdown', { workoutId })
    → navigate('ActiveWorkout', { workoutId })
    → completeRound() × N rounds
    → completeWorkout()
    → useWorkoutHistoryStore.addWorkout(completedWorkout)
    → navigate('WorkoutComplete', { workoutId })
```

---

## Store Responsibilities (5 stores total)

| Store | Single Responsibility |
|---|---|
| `useWorkoutStore` | CRUD for workout templates + benchmark seeding |
| `useActiveWorkoutStore` | In-flight session state (rounds, timing, pause/resume) |
| `useWorkoutHistoryStore` | Completed/incomplete session log |
| `useExerciseStore` | Exercise name catalog (default + user-created) |
| `useThemeStore` | Light/dark mode preference |

---

## Critical Path Files

| Task | Files to Read First |
|---|---|
| Add ladder type | `src/types/index.ts` → `src/utils/ladderStrategies.ts` → `src/constants/ladderDefaults.ts` |
| Modify workout session flow | `src/store/activeWorkoutStore.ts` → `src/navigation/AppNavigator.tsx` |
| Add field to Template | `src/types/index.ts` → `src/utils/storage.ts` → `src/store/workoutStore.ts` |
| Fix storage/persistence bug | `src/utils/storage.ts` → affected store |
| Modify share feature | `src/utils/shareUtils.ts` → `src/components/ShareableWorkoutCard.tsx` |
| Add screen | `src/types/navigation.ts` → `src/navigation/[navigator].tsx` → new screen file |
| Change theme/colors | `src/constants/theme.ts` |

---

## Navigation Structure (abbreviated)

```
AppNavigator (RootStack)
├── HomeTabs (BottomTabs)
│   ├── WorkoutNavigator → WorkoutList, CreateEditWorkout, WorkoutDetails
│   ├── LogBookScreen
│   └── SettingsNavigator → SettingsMain, ManageExercises
└── Modal group: Countdown → ActiveWorkout → Rest → WorkoutComplete
```

Navigation params are typed in `src/types/navigation.ts`. Never cast to `any`.

---

## Ladder Type → Strategy Class Map

| `LadderType` string | Strategy Class |
|---|---|
| `christmas` | `ChristmasLadderStrategy` |
| `ascending` | `AscendingLadderStrategy` |
| `descending` | `DescendingLadderStrategy` |
| `pyramid` | `PyramidLadderStrategy` |
| `flexible` | `FlexibleLadderStrategy` |
| `chipper` | `ChipperLadderStrategy` |
| `amrap` | `AMRAPLadderStrategy` |
| `forreps` | `ForRepsLadderStrategy` |

All created via: `getLadderStrategy(ladderType, stepSize?, maxRounds?, startingReps?)`

---

## AsyncStorage Keys Quick Reference

| Key | Content |
|---|---|
| `@workouts` | `Template[]` |
| `@workout_history` | `Workout[]` |
| `@exercise_catalog` | `ExerciseCatalogItem[]` |
| `@exercises_initialized` | `"true"` (first-launch guard) |
| `@benchmarks_initialized` | `"true"` (first-launch guard) |
| `@ladder_trainer_theme_mode` | `"light"` or `"dark"` |
| `@ladder_trainer_paused_workout` | `PausedWorkoutState` |

---

## What You Must Not Do

1. Call `AsyncStorage` from a screen or component
2. Put ladder rep calculation logic in a screen
3. Use `any` type
4. Hardcode colors — use `useTheme()` and `theme.colors.*`
5. Hardcode spacing — use `spacing.*` and `borderRadius.*` from `theme.ts`
6. Navigate to the modal workout flow from outside a workout start context
7. Import `axios` — there's no backend

---

## Dependency Quick Reference

| Package | Purpose |
|---|---|
| `react-native-paper` | UI components (Text, Button, Card, etc.) |
| `@react-navigation/stack` + `bottom-tabs` | Navigation |
| `zustand` | State management |
| `@react-native-async-storage/async-storage` | Persistence |
| `expo-av` | Audio playback |
| `expo-haptics` | Haptic feedback |
| `expo-keep-awake` | Keep screen on during workout |
| `expo-sharing` + `expo-file-system` | Share workout images |
| `react-native-view-shot` | Screenshot to share |
| `react-native-draggable-flatlist` | Drag-to-reorder exercise list |
| `date-fns` | Date formatting helpers |
| `axios` | ⚠️ Unused — dead dependency |
