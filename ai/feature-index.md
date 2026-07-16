# Feature Index — LadFit

> A searchable index of all implemented features. Use this to locate relevant code quickly.

---

## Workout Templates

| Feature | Key Files |
|---|---|
| Create new template | `CreateEditWorkoutScreen.tsx`, `useWorkoutStore.addWorkout()` |
| Edit existing template | `CreateEditWorkoutScreen.tsx` (workoutId param), `useWorkoutStore.updateWorkout()` |
| Delete template | `WorkoutListScreen.tsx` or `WorkoutDetailsScreen.tsx`, `useWorkoutStore.deleteWorkout()` |
| View template details | `WorkoutDetailsScreen.tsx`, `useWorkoutStore.getWorkout()` |
| List all templates | `WorkoutListScreen.tsx`, `useWorkoutStore.workouts` |
| Restore benchmark workouts | `SettingsScreen.tsx`, `useWorkoutStore.restoreBenchmarks()`, `storage.restoreBenchmarkWorkouts()` |
| Benchmark workout detection | `isBenchmarkWorkout()` in `benchmarkWorkouts.ts` |

---

## Exercise Catalog

| Feature | Key Files |
|---|---|
| Search exercises with autocomplete | `AutocompleteExerciseInput.tsx`, `useExerciseStore.searchExercises()` |
| Add custom exercise | `ManageExercisesScreen.tsx`, `useExerciseStore.addExercise()` |
| Edit exercise | `ManageExercisesScreen.tsx`, `useExerciseStore.updateExercise()` |
| Delete exercise | `ManageExercisesScreen.tsx`, `useExerciseStore.deleteExercise()` |
| Restore default exercises | `ManageExercisesScreen.tsx`, `useExerciseStore.restoreDefaults()` |

---

## Ladder Type Configuration

| Ladder Type | Exercise Input Component | Config Fields |
|---|---|---|
| `christmas` | `ExerciseInput.tsx` (base) | None |
| `ascending` | `ExerciseInput.tsx` (base) | `startingReps`, `stepSize`, `maxRounds` |
| `descending` | `ExerciseInput.tsx` (base) | `startingReps`, `stepSize`, `maxRounds` |
| `pyramid` | `ExerciseInput.tsx` (base) | `stepSize`, `maxRounds` |
| `flexible` | `FlexibleExerciseInput.tsx` | per-exercise: `direction`, `startingReps`, `stepSize` |
| `chipper` | `ChipperExerciseInput.tsx` | per-exercise: `fixedReps` |
| `amrap` | `AMRAPExerciseInput.tsx` | `timeCap`; per-exercise: `startingReps`, `stepSize` |
| `forreps` | `ForRepsExerciseInput.tsx` | `maxRounds`; per-exercise: `repsPerRound` |

---

## Active Workout Session

| Feature | Key Files |
|---|---|
| Start workout | `WorkoutDetailsScreen.tsx` → navigate to Countdown, `useActiveWorkoutStore.startWorkout()` |
| 3-2-1 countdown | `CountdownScreen.tsx` |
| Track active round | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore` |
| Complete a round | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.completeRound()` |
| Rest between rounds | `RestScreen.tsx` |
| Start next round | `RestScreen.tsx`, `useActiveWorkoutStore.startNextRound()` |
| Buy-in exercise | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.completeBuyIn()` |
| Buy-out exercise | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.completeBuyOut()` |
| Complete workout | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.completeWorkout()` |
| Workout complete summary | `WorkoutCompleteScreen.tsx` |
| Pause workout | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.pauseWorkout()` |
| Resume workout | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.resumeWorkout()` |
| Discard paused workout | Dialog in app, `useActiveWorkoutStore.discardPausedWorkout()` |
| Restore paused workout on relaunch | `App.tsx` or initial screen, `useActiveWorkoutStore.loadPausedWorkout()` |
| Mute audio | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.toggleMute()` |
| Timer focus mode | `ActiveWorkoutScreen.tsx`, `useActiveWorkoutStore.setTimerFocusMode()` |
| Keep screen awake | `ActiveWorkoutScreen.tsx`, `expo-keep-awake` |

---

## Audio / Haptics

| Feature | Key Files |
|---|---|
| Short beep (round complete, etc.) | `soundUtils.playShortBeep()` |
| Long beep | `soundUtils.playLongBeep()` |
| Success sound (workout complete) | `soundUtils.playSuccessSound()` |
| Silent mode playback (iOS) | `soundUtils.ts` — `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` |
| Haptic feedback | `expo-haptics` (installed, TODO: wire up to round completion) |

---

## Workout History / Logbook

| Feature | Key Files |
|---|---|
| View history | `LogBookScreen.tsx`, `useWorkoutHistoryStore.workoutHistory` |
| Search by workout name | `LogBookScreen.tsx` — `Searchbar` + filter logic |
| Filter by date | `LogBookScreen.tsx` — `DateTimePicker` + `isSameDay()` |
| Filter by ladder type | `LogBookScreen.tsx` — chip selector |
| Delete history entry | `LogBookScreen.tsx`, `useWorkoutHistoryStore.deleteWorkoutFromHistory()` |
| Share workout result as image | `LogBookScreen.tsx`, `shareUtils.shareWorkoutImage()`, `ShareableWorkoutCard.tsx` |
| AMRAP partial round reps | `LogBookScreen.tsx`, `useWorkoutHistoryStore.savePartialRoundReps()` |

---

## Settings

| Feature | Key Files |
|---|---|
| Toggle light/dark theme | `SettingsScreen.tsx`, `useThemeStore.setThemeMode()` |
| Restore benchmark workouts | `SettingsScreen.tsx`, `useWorkoutStore.restoreBenchmarks()` |
| Manage exercise catalog | Navigate to `ManageExercisesScreen` |
| View legal / privacy policy | `LegalScreen.tsx` |
| App version display | `SettingsScreen.tsx`, `APP_VERSION` from `constants/config.ts` |
| Support email | `SUPPORT_EMAIL` from `constants/config.ts` |

---

## Sharing Feature

| Feature | Key Files |
|---|---|
| Share workout card as PNG | `shareUtils.shareWorkoutImage()`, `expo-sharing` |
| Capture workout card as screenshot | `react-native-view-shot`, `ShareableWorkoutCard.tsx` |
| Save to file system | `shareUtils.saveWorkoutImage()`, `expo-file-system` |

---

## Data Persistence

| Feature | Key Files |
|---|---|
| Load templates on startup | `useWorkoutStore.loadWorkouts()`, `storage.loadWorkouts()` |
| Save template changes | `storage.saveWorkouts()` |
| Load workout history | `useWorkoutHistoryStore.loadHistory()`, `storage.loadWorkoutHistory()` |
| Save workout to history | `storage.saveWorkoutHistory()` |
| First-launch benchmark seeding | `storage.initializeBenchmarkWorkouts()` |
| First-launch exercise seeding | `useExerciseStore.loadExercises()` |
| Data migration (v1 → v2) | `useWorkoutStore.loadWorkouts()`, `useWorkoutHistoryStore.loadHistory()` |
