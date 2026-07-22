# Architecture Summary

## Runtime layers

```text
App startup and navigation
  -> screens and reusable input/result components
    -> Zustand stores (state, orchestration, most persistence ownership)
      -> ladder/calculation/share/audio utilities
        -> AsyncStorage and Expo device APIs
```

There is no service/API layer. Screens legitimately own presentation-only formatting and local form state, but persistent mutations should pass through the store that owns the data.

## Startup and navigation

`index.js` registers `src/App.tsx`. `App` loads theme, history, exercises, and any paused session. Template loading/benchmark initialization happens when `WorkoutListScreen` mounts, not in `App`.

```text
Root stack
├─ HomeTabs
│  ├─ Workouts -> WorkoutList -> CreateEditWorkout | WorkoutDetails
│  ├─ Logbook -> LogBookScreen
│  └─ Settings -> SettingsMain -> ManageExercises
├─ modal: Countdown -> ActiveWorkout <-> Rest -> WorkoutComplete
└─ Legal
```

Route contracts live in `src/types/navigation.ts`. Nested navigation is currently loosely typed in several screens; new code should use typed composite/navigation props instead of casts.

## Stores and ownership

| Store | State and responsibility | Durable data |
|---|---|---|
| `useWorkoutStore` | template CRUD, benchmark/custom projections | `@workouts` |
| `useWorkoutHistoryStore` | ordered completed-session history, AMRAP partial reps | `@workout_history` |
| `useActiveWorkoutStore` | current session, round clock state, pause/mute/focus flags | paused snapshot only |
| `useExerciseStore` | defaults/custom catalog and fuzzy search | catalog + initialization flag |
| `useThemeStore` | light/dark preference | theme key |

Zustand stores are singleton hooks. Cross-store completion is intentional: `activeWorkoutStore.completeWorkout()` writes through `useWorkoutHistoryStore.getState()`.

## Session state machine

```text
Template selected
  -> Countdown calls startWorkout(template)
  -> optional buy-in
  -> active round
  -> completeRound()
     -> Rest when configured and more work remains
     -> startNextRound()
  -> optional buy-out
  -> completeWorkout()
  -> history prepend + paused snapshot removal
  -> WorkoutComplete
```

AMRAP completion is time-cap-driven and can request partial-round rep input. Other types complete at `maxRounds`. Chipper makes one exercise a round. Buy-in/out segments are currently appended to the same `rounds` array as main rounds, which is an architectural ambiguity consumers must handle.

## Strategy boundary

`getLadderStrategy(type, stepSize, maxRounds, startingReps)` returns one of eight implementations. `getExercisesForRound()` is the execution source of truth. `calculateTotalReps()` drives results/share totals. Any change must keep those two methods consistent and update manual preview logic in `WorkoutDetailsScreen`.

| Type | Per-round behavior | Termination/config |
|---|---|---|
| `christmas` | positions `round..1`, reps equal position | max 12; rounds require matching exercises |
| `ascending` | all exercises; `start + (round-1)*step` | configured rounds |
| `descending` | all exercises; `start - (round-1)*step` | configured rounds; UI should prevent non-positive work |
| `pyramid` | all exercises; rise then fall | configured rounds and global step |
| `flexible` | all exercises; independent direction/start/step | configured rounds |
| `chipper` | exercise whose position equals round | exercise count |
| `amrap` | all exercises; independent fixed/increasing reps | time cap; sentinel 999 |
| `forreps` | all exercises; fixed `repsPerRound` | configured rounds |

## Change-impact rules

| Change | Also inspect |
|---|---|
| Domain field | both Template/Workout shapes, snapshot, all persistence paths, results/share |
| Session transition | active store, active/rest/countdown screens, background restore, history |
| Ladder semantics | strategy, form validation/defaults, details preview, completion/logbook/share |
| Storage key/schema | owner store, initialization flags, migration, corrupt/old data behavior |
| Route | param list, navigator registration, every caller, deep restore behavior |
| Theme/UI token | both themes, navigation theme mapping, all states and accessibility |

## Architectural boundaries versus current exceptions

- Prefer store-owned persistence. Current direct AsyncStorage usage inside active, exercise, and theme stores is established architecture, not a screen-level precedent.
- Prefer strategy-owned rules. Details previews currently duplicate formulas and must be updated with strategy changes.
- Prefer exact route typing. Existing `any` refs/casts are debt, not a convention.
- There is no repository, dependency-injection, error-boundary, validation-schema, or telemetry layer.
