# Database Schema — LadFit

> Last updated: June 24, 2026  
> Storage Engine: AsyncStorage (React Native) — JSON serialized, device-local

There is no relational database. All persistence is key-value JSON stored in `AsyncStorage`. This document describes the shape of each stored collection.

---

## Storage Keys

| Key | Type | Description |
|---|---|---|
| `@workouts` | `Template[]` | All workout templates (user + benchmark) |
| `@workout_history` | `Workout[]` | All completed/incomplete workout sessions |
| `@exercise_catalog` | `ExerciseCatalogItem[]` | Exercise name catalog |
| `@exercises_initialized` | `"true"` | First-launch flag for exercise catalog seed |
| `@benchmarks_initialized` | `"true"` | First-launch flag for benchmark seed |
| `@ladder_trainer_theme_mode` | `"light" \| "dark"` | User theme preference |
| `@ladder_trainer_paused_workout` | `PausedWorkoutState` | Active paused session (optional) |

---

## Type: `Template`

Workout blueprint (never mutated during a session).

```typescript
interface Template {
  id: string;                    // Timestamp string: Date.now().toString()
  name: string;                  // User-defined workout name
  exercises: Exercise[];         // 1–12 exercises
  restPeriodSeconds: number;     // 0 = no rest
  ladderType: LadderType;        // See LadderType below
  maxRounds: number;             // Total rounds to complete
  stepSize?: number;             // Rep increment per round (ascending/descending/pyramid)
  startingReps?: number;         // Starting rep count (ascending/descending)
  timeCap?: number;              // Seconds (AMRAP only)
  buyInOutExercise?: Exercise;   // Optional single exercise for buy-in and buy-out
  hasBuyInOut?: boolean;         // Whether buy-in/out is enabled
  buyInOutRestSeconds?: number;  // Rest after buy-in / before buy-out
  createdAt: Date;               // ISO string in storage, re-hydrated to Date on load
}
```

---

## Type: `Exercise`

An individual movement within a template or workout session.

```typescript
interface Exercise {
  position: number;              // 1–12; also the rep count in Christmas ladders
  unit: string;                  // "reps" | "calories" | "meters" | "seconds" | custom
  name: string;                  // Display name, e.g. "Thrusters"

  // Flexible ladder only
  direction?: 'ascending' | 'descending' | 'constant';
  startingReps?: number;
  stepSize?: number;

  // Chipper ladder only
  fixedReps?: number;

  // AMRAP only (partial round tracking)
  partialReps?: number;

  // ForReps only
  repsPerRound?: number;
}
```

---

## Type: `LadderType`

```typescript
type LadderType =
  | 'christmas'
  | 'ascending'
  | 'descending'
  | 'pyramid'
  | 'flexible'
  | 'chipper'
  | 'amrap'
  | 'forreps';
```

---

## Type: `Workout`

An in-progress or completed workout session. Snapshots all relevant template data at start time.

```typescript
interface Workout {
  id: string;                    // Timestamp string
  templateName: string;          // Snapshot of template name at start time
  exercises: Exercise[];         // Snapshot of template exercises
  restPeriodSeconds: number;     // Snapshot
  ladderType: LadderType;        // Snapshot
  maxRounds: number;             // Snapshot
  stepSize?: number;             // Snapshot
  startingReps?: number;         // Snapshot
  timeCap?: number;              // Snapshot (AMRAP)
  buyInOutExercise?: Exercise;   // Snapshot
  hasBuyInOut?: boolean;         // Snapshot
  buyInOutRestSeconds?: number;  // Snapshot
  buyInCompleted?: boolean;      // Live tracking
  buyOutCompleted?: boolean;     // Live tracking
  startTime: Date;               // ISO string in storage
  endTime?: Date;                // ISO string in storage; undefined until completed
  status: WorkoutStatus;         // 'incomplete' | 'completed'
  totalTime: number;             // Total elapsed seconds
  rounds: Round[];               // Completed rounds
  currentRoundIndex: number;     // 0-indexed; used for resume
}

type WorkoutStatus = 'incomplete' | 'completed';
```

---

## Type: `Round`

A time-tracked round within a workout session.

```typescript
interface Round {
  roundNumber: number;   // 1-indexed
  startTime: Date;       // ISO string in storage
  endTime?: Date;        // ISO string in storage
  duration: number;      // Seconds (float for ms precision)
}
```

---

## Type: `ExerciseCatalogItem`

An entry in the exercise name catalog.

```typescript
interface ExerciseCatalogItem {
  id: string;                // "default_N" for seeded; timestamp string for custom
  name: string;              // e.g. "Pull-ups"
  suggestedUnit?: string;    // Pre-filled unit when selected (e.g. "calories" for Row)
  isCustom: boolean;         // false for defaults, true for user-added
}
```

---

## Type: `PausedWorkoutState`

Serialized in `@ladder_trainer_paused_workout` when a user pauses mid-session.

```typescript
interface PausedWorkoutState {
  activeWorkout: Workout;
  currentRoundStartTime: Date | null;
  elapsedTime: number;
  totalPausedTime: number;
  pauseStartTime: number;
  isTimerFocusMode: boolean;
}
```

---

## Type: `StravaTokens` (Defined but unused)

```typescript
interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;   // Unix timestamp seconds
}
```

> **Note:** Strava integration is not implemented. This type is a placeholder for future work.

---

## Data Migration History

| Version | Migration | Location |
|---|---|---|
| v1 → v2 | Added `ladderType` and `maxRounds` to `Template` and `Workout` | `workoutStore.loadWorkouts()`, `workoutHistoryStore.loadHistory()` |

---

## Recommended Future Schema Changes

- [ ] Add `templateId` foreign key to `Workout` so history entries can link back to templates.
- [ ] Add `version` field to `Template` for tracking edit history.
- [ ] Add `tags` array to `Template` for user-defined categorization.
- [ ] Cap `@workout_history` to the last N entries (e.g. 500) to prevent storage bloat.
- [ ] Consider SQLite (via `expo-sqlite`) for improved query performance as history grows.
