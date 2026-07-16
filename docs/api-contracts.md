# API Contracts — LadFit

> Last updated: June 24, 2026

## Overview

LadFit is a **fully offline** application with no backend API. There are no HTTP endpoints. All data contracts are internal: between Zustand stores, utility functions, and AsyncStorage.

`axios` is listed as a dependency but is **not used** anywhere in the codebase (dead dependency — should be removed).

---

## Internal Store API Contracts

### `useWorkoutStore`

| Action | Signature | Side Effects |
|---|---|---|
| `loadWorkouts` | `() => Promise<void>` | Reads `@workouts`, runs migration, sets state |
| `addWorkout` | `(workout: Omit<Template, 'id' \| 'createdAt'>) => Promise<void>` | Generates ID + createdAt, writes `@workouts` |
| `updateWorkout` | `(id: string, workout: Partial<Template>) => Promise<void>` | Merges partial, writes `@workouts` |
| `deleteWorkout` | `(id: string) => Promise<void>` | Filters out, writes `@workouts` |
| `getWorkout` | `(id: string) => Template \| undefined` | Read-only selector |
| `restoreBenchmarks` | `() => Promise<void>` | Calls `restoreBenchmarkWorkouts()`, then reloads |
| `getBenchmarkWorkouts` | `() => Template[]` | Filtered + sorted selector |
| `getCustomWorkouts` | `() => Template[]` | Filtered + sorted selector |

---

### `useActiveWorkoutStore`

| Action | Signature | Side Effects |
|---|---|---|
| `startWorkout` | `(template: Template) => void` | Snapshots template → Workout, sets state |
| `completeBuyIn` | `() => void` | Sets `buyInCompleted: true` |
| `completeBuyOut` | `() => void` | Sets `buyOutCompleted: true` |
| `completeRound` | `() => void` | Records Round with timing, clears `currentRoundStartTime` |
| `startNextRound` | `() => void` | Increments `currentRoundIndex`, sets new `currentRoundStartTime` |
| `completeWorkout` | `() => Promise<void>` | Sets status/endTime, saves to history, clears paused state |
| `pauseWorkout` | `(elapsed: number, totalPaused: number) => Promise<void>` | Serializes state to `@ladder_trainer_paused_workout` |
| `resumeWorkout` | `() => void` | Sets `isPaused: false` |
| `discardPausedWorkout` | `() => Promise<void>` | Clears `@ladder_trainer_paused_workout`, resets state |
| `loadPausedWorkout` | `() => Promise<boolean>` | Reads + hydrates `@ladder_trainer_paused_workout`; returns `true` if found |
| `toggleMute` | `() => void` | Toggles `isMuted` |
| `setTimerFocusMode` | `(enabled: boolean) => void` | Sets `isTimerFocusMode` |

---

### `useWorkoutHistoryStore`

| Action | Signature | Side Effects |
|---|---|---|
| `loadHistory` | `() => Promise<void>` | Reads `@workout_history`, runs migration |
| `addWorkout` | `(workout: Workout) => Promise<void>` | Prepends to history, writes `@workout_history` |
| `deleteWorkoutFromHistory` | `(workoutId: string) => Promise<void>` | Filters out, writes `@workout_history` |
| `savePartialRoundReps` | `(workoutId: string, exercises: Exercise[]) => Promise<void>` | Updates exercise data on history entry (AMRAP partial) |

---

### `useExerciseStore`

| Action | Signature | Side Effects |
|---|---|---|
| `loadExercises` | `() => Promise<void>` | Seeds defaults on first launch, reads `@exercise_catalog` |
| `addExercise` | `(name: string, unit?: string) => Promise<ExerciseCatalogItem>` | Creates new custom exercise, writes catalog |
| `addExerciseIfNotExists` | `(name: string, unit?: string) => Promise<ExerciseCatalogItem \| null>` | No-op if name exists (case-insensitive) |
| `updateExercise` | `(id: string, updates: Partial<ExerciseCatalogItem>) => Promise<void>` | Merges, writes catalog |
| `deleteExercise` | `(id: string) => Promise<void>` | Filters, writes catalog |
| `restoreDefaults` | `() => Promise<void>` | Re-seeds defaults while preserving custom exercises |
| `searchExercises` | `(query: string) => ExerciseCatalogItem[]` | Fuzzy search, returns sorted by relevance score |
| `getDefaultExercises` | `() => ExerciseCatalogItem[]` | Selector: `isCustom === false` |
| `getCustomExercises` | `() => ExerciseCatalogItem[]` | Selector: `isCustom === true` |

---

### `useThemeStore`

| Action | Signature | Side Effects |
|---|---|---|
| `loadThemePreference` | `() => Promise<void>` | Reads `@ladder_trainer_theme_mode`, defaults to `'light'` |
| `setThemeMode` | `(mode: ThemeMode) => Promise<void>` | Writes `@ladder_trainer_theme_mode`, updates state |

---

## Utility Function Contracts

### `ladderStrategies.ts` — `getLadderStrategy`

```typescript
function getLadderStrategy(
  ladderType: LadderType,
  stepSize?: number,       // default 1
  maxRounds?: number,      // required for Descending / Pyramid
  startingReps?: number    // required for Ascending / Descending
): LadderStrategy
```

### `LadderStrategy` Interface

```typescript
interface LadderStrategy {
  getExercisesForRound(
    roundNumber: number,      // 1-indexed
    exercises: Exercise[]
  ): Array<{ exercise: Exercise; reps: number }>;

  calculateTotalReps(
    exercise: Exercise,
    totalRounds: number
  ): number;

  getDescription(): string;
}
```

---

### `shareUtils.ts`

```typescript
// Share workout result as PNG via native share sheet
shareWorkoutImage(viewRef: React.RefObject<any>, workoutName: string): Promise<void>

// Save PNG to file system, return URI
saveWorkoutImage(viewRef: React.RefObject<any>, workoutName: string): Promise<string>

// Capture as base64 string
captureWorkoutAsBase64(viewRef: React.RefObject<any>): Promise<string>
```

---

### `soundUtils.ts`

```typescript
playBeep(frequency?: number, duration?: number): Promise<void>   // default 800Hz, 200ms
playShortBeep(): Promise<void>    // 800Hz, 300ms
playLongBeep(): Promise<void>     // 800Hz, 1000ms
playSuccessSound(): Promise<void> // Two-tone: 1200Hz + 1600Hz
setAudioEnabled(enabled: boolean): void
```

---

## Future API Considerations

- [ ] **Cloud sync endpoint** — if cloud backup is added, define REST or GraphQL API for workout templates and history.
- [ ] **Strava OAuth** — `StravaTokens` type is defined; POST workout to Strava after completion.
- [ ] **MCP server** — see `docs/mcp-architecture.md` for proposed AI tooling interface.
