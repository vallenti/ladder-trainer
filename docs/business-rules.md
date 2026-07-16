# Business Rules — LadFit

> Last updated: June 24, 2026

---

## Core Domain Concepts

### Workout Template (`Template`)
A reusable workout blueprint that a user creates and saves. Templates are never mutated during a live session — all active session data is snapshotted from the template at start time.

### Workout Session (`Workout`)
An immutable snapshot of a template's configuration at start time, plus live session tracking (rounds completed, timestamps, paused state). Stored in workout history after completion.

### Exercise
An individual movement within a template. Has a `position` (1–12), a `name`, a `unit` (reps / calories / meters / seconds), and optional per-ladder-type fields.

### Round
A time-tracked unit of work within a workout session. Each completed round records its `startTime`, `endTime`, and `duration`.

---

## Ladder Types and Their Rules

### Christmas (`christmas`)
- Inspired by "12 Days of Christmas".
- Exercises are numbered by position (1–12). Position doubles as that exercise's rep count.
- Round N: exercises at positions N, N-1, …, 1 performed in descending position order.
- Each exercise is performed with reps = its position number.
- Maximum 12 exercises / 12 rounds.
- Default: `maxRounds = 12`.

### Ascending (`ascending`)
- All exercises are performed every round.
- Reps per round = `startingReps + (roundNumber - 1) × stepSize`.
- Default: `startingReps = 1`, `stepSize = 1`, `maxRounds = 10`.

### Descending (`descending`)
- All exercises are performed every round.
- Reps per round = `startingReps - (roundNumber - 1) × stepSize`.
- Classic benchmark: Fran (21-15-9).
- Default: `startingReps = 10`, `stepSize = 1`, `maxRounds = 10`.

### Pyramid (`pyramid`)
- All exercises are performed every round.
- Ascends to peak rep count then descends symmetrically.
- Peak round = `ceil(maxRounds / 2)`.
- Odd `maxRounds`: peak occurs once; Even: peak repeats twice.
- Default: `stepSize = 1`, `maxRounds = 5`.

### Flexible (`flexible`)
- Each exercise has independent direction (`ascending`, `descending`, or `constant`), `startingReps`, and `stepSize`.
- All exercises must yield the same number of rounds.
- Default: `maxRounds = 5`.

### Chipper (`chipper`)
- Each exercise is completed exactly once with a fixed rep count (`fixedReps`).
- Each exercise = one round (performed sequentially).
- `maxRounds` equals the number of exercises.
- Default: `maxRounds = 5`.

### AMRAP (`amrap`)
- As Many Rounds As Possible within a `timeCap` (seconds).
- `maxRounds = 999` (conceptually unlimited; time is the constraint).
- Each exercise has optional `startingReps` and `stepSize` for progressive rep increases per round.
- Supports partial round completion (`partialReps` per exercise).
- Default: `timeCap = 600` (10 minutes).

### ForReps (`forreps`)
- Fixed number of rounds; each round contains all exercises with the same `repsPerRound`.
- Default: `maxRounds = 5`.

---

## Exercise Rules

- A template can have 1–12 exercises.
- Exercises are identified by `position` (1-indexed). Position is also the rep count in Christmas ladders.
- Valid `unit` values: `"reps"`, `"calories"`, `"meters"`, `"seconds"` (and any free-text string the user enters).
- Exercise names come from the exercise catalog (default + custom). Users may add custom exercises.
- The exercise catalog supports fuzzy search (exact match > starts-with > contains > character-order fuzzy).

---

## Buy-In / Buy-Out Rules

- Optional feature on any template (`hasBuyInOut = true`).
- A single `buyInOutExercise` is performed once before the first round (buy-in) and once after the last round (buy-out).
- Optional `buyInOutRestSeconds` introduces a rest period after buy-in and before buy-out.
- Session tracks `buyInCompleted` and `buyOutCompleted` independently.

---

## Rest Period Rules

- `restPeriodSeconds = 0` means no rest between rounds.
- When `restPeriodSeconds > 0`, the app navigates to `RestScreen` after each completed round.
- Rest is skipped after the final round.

---

## Benchmark Workouts

- Seeded from `benchmarkWorkouts.ts` on first app launch (guarded by `@benchmarks_initialized` flag).
- Cannot be distinguished from user workouts by type — identified by a hardcoded list of IDs.
- Users may delete benchmarks; they can be restored via **Settings → Restore Benchmarks**.
- Benchmarks include: Fran, 12 Days, plus other examples for each ladder type.

---

## Session Lifecycle

```
Template Selected
      ↓
startWorkout() — snapshot template → Workout object
      ↓
CountdownScreen (3-2-1)
      ↓
ActiveWorkoutScreen
      ↓  [optional: buy-in if hasBuyInOut]
completeBuyIn()
      ↓  [for each round]
completeRound() → [if rest > 0] RestScreen → startNextRound()
      ↓  [optional: buy-out if hasBuyInOut]
completeBuyOut()
      ↓
completeWorkout() → saveToHistory() → WorkoutCompleteScreen
```

### Pause / Resume
- User can pause mid-workout; state is serialized to `@ladder_trainer_paused_workout`.
- On app reload, `loadPausedWorkout()` restores the session.
- User can choose to resume or discard the paused workout.

---

## Workout History Rules

- All completed sessions (status `'completed'`) and manually-stopped sessions are stored.
- History is sorted newest-first.
- Logbook allows:
  - Search by workout name.
  - Filter by date (single day selection via date picker).
  - Filter by ladder type (chip selector).
  - Delete individual history entries.
  - Share workout results as a PNG image.

---

## Theme Rules

- Supports `'light'` and `'dark'` modes.
- Theme selection is persisted per-device.
- Primary color: `#FF6B35` (energetic orange) in both themes.
- Secondary color: `#4ECDC4` (teal) in light / `#6EDDD6` in dark.

---

## Data Integrity Rules

- On every load, both `workoutStore` and `workoutHistoryStore` run data migrations to add missing fields introduced in newer app versions.
- Individual malformed records in storage arrays are skipped (logged as warnings) rather than crashing the load.
- `Date` objects are serialized as ISO strings in JSON and re-hydrated on load.

---

## TODO / Open Questions

- [ ] **Maximum history entries** — no cap enforced; could cause performance issues on long-running devices.
- [ ] **Template versioning** — history snapshots do not link back to the original template; if a template is edited, old history entries show stale exercise names.
- [ ] **Unit validation** — no enforcement that `reps ≥ 1` or `timeCap > 0` at the store layer.
- [ ] **Multi-device sync** — not supported; all data is local.
- [ ] **Strava integration** — `StravaTokens` type is defined but no Strava functionality is implemented.
