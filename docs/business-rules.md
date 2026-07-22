# Business Rules

This document records behavior enforced by the current application. “Required” means the create/edit UI or runtime enforces it; architectural recommendations are kept elsewhere.

## Entities and identity

- A `Template` is a reusable definition. New IDs are `Date.now().toString()` and `createdAt` is set at creation.
- A `Workout` is a session snapshot with a separately generated timestamp ID. It has no link to the source template other than `templateName`.
- A `Round` records one timed segment with one-based `roundNumber`, dates, and duration seconds.
- Template exercises are embedded values. The catalog supplies suggestions only and is updated automatically when a saved exercise name is new (case-insensitive).
- Template and session names are snapshots; renaming or deleting a template does not alter history.

## Common template validation

- Name is trimmed, required, and at most 100 characters.
- At least one named exercise is required; the UI permits at most 12.
- Positions are contiguous integers starting at one.
- Optional regular rest must be a positive integer; disabled rest persists as zero.
- Units are free text; blank units are displayed as reps in several result views.
- There is no uniqueness requirement for template names or exercise names within a template.

## Ladder rules

### Christmas

Round N performs positions N down to 1. Each exercise’s reps equal its position. Maximum rounds is 12 and the template must contain at least as many exercises as rounds.

### Ascending

Every round contains every exercise. Reps are `startingReps + (round - 1) * stepSize`. Step and rounds must be positive. The current form does not separately validate global `startingReps` as positive; preserve compatibility or fix explicitly.

### Descending

Every round contains every exercise. Reps are `startingReps - (round - 1) * stepSize`. Step and rounds must be positive. The current form does not guarantee the last round remains positive, so invalid-looking configurations can be persisted.

### Pyramid

Every round contains every exercise. With total R, peak index is `ceil(R/2)`; reps rise by step and then fall. Even round counts repeat the peak. Global starting reps is not used.

### Flexible

Every exercise has `ascending`, `descending`, or `constant`, a positive starting/fixed value, and a positive step for non-constant directions. Runtime descending reps clamp to zero. The create form attempts to ensure configurations cover `maxRounds`, but its ascending “calculated rounds” validation is based on the round count as though it were a target rep value; treat changes here as bug-sensitive.

### Chipper

Each exercise is one round in position order with positive `fixedReps`. On save, `maxRounds` is overwritten with the exercise count.

### AMRAP

Every round contains all exercises. Each exercise has positive `startingReps` and `stepSize >= 0`; zero means fixed. `timeCap` must exceed zero seconds. `maxRounds` persists as 999 solely as an internal “unlimited” sentinel. On timeout, the completion route may prompt for per-exercise reps from the incomplete round; those values are stored as `partialReps` on session exercises and added by AMRAP total calculations.

### For Reps

Every round contains all exercises with positive per-exercise `repsPerRound`. `maxRounds` is positive and ends the workout.

## Buy-in/out and rest

- The saved create/edit workflow supports buy-in/out only for AMRAP, Chipper, and For Reps.
- One embedded exercise definition is used for both buy-in and buy-out; its displayed count comes from `repsPerRound` or defaults to one.
- An optional positive `buyInOutRestSeconds` is used after buy-in and before buy-out.
- Completion flags are stored on the session.
- Timing for buy-in/out is currently mixed into `Workout.rounds`; consumers infer the first/last special segments from flags. Do not assume every round entry is a main ladder round.
- Regular `restPeriodSeconds` occurs between main rounds when nonzero; the rest screen can be skipped and supports pause/discard.

## Session lifecycle and timing

- Countdown looks up a template and calls `startWorkout`, creating a snapshot and setting round index zero.
- Completing a segment appends a round and clears `currentRoundStartTime`; advancing increments the zero-based index and starts a new timer.
- Non-AMRAP sessions terminate after configured work. AMRAP terminates at the time cap.
- App backgrounding calls `pauseWorkout` when a session is active and not already paused.
- A paused snapshot is restored on launch. Mute is not restored; timer focus mode is.
- Resume adds wall-clock pause duration to `totalPausedTime`.
- Completion calculates `totalTime` from session start to end, prepends history, removes the paused key, and clears active state. Confirm whether pause/rest exclusion is intended before changing timing formulas.
- Stop/discard removes paused state and does not add history.

## History and sharing

- Only completed workouts are added by the active store.
- New history entries are prepended. Delete is permanent after confirmation.
- Logbook search is case-insensitive by template name; an eight-digit `YYYYMMDD` query is interpreted as a local date. A date picker provides a second same-day filter.
- Result totals come from the ladder strategy using `workout.rounds.length`; because special rounds share that array, buy-in/out can affect totals unless consumers compensate. This is a known ambiguity.
- Image sharing requires native sharing availability and uses an off-screen `ViewShot`. Logbook also builds a native text share message.

## Benchmark and catalog rules

- Benchmarks seed once when `@benchmarks_initialized` is absent.
- Benchmark identity is an ID beginning with `benchmark_`.
- Restore removes all current templates with that prefix, regenerates benchmarks, and preserves other templates.
- Catalog add is trimmed and case-insensitive duplicate-safe. Default restore regenerates defaults and retains custom entries.
- Editing or deleting catalog items never changes existing templates/history.

## Compatibility and unresolved rules

The product currently lacks explicit decisions for duplicate template names, maximum numeric inputs/time caps, whether paused time counts toward AMRAP/total time, whether history totals exclude special segments, and recovery UX for persistence failures. New features touching these areas must define acceptance criteria and tests rather than inventing a silent convention.
