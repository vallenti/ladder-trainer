# LadFit AI Context

This is the entry point for coding agents. It describes the repository as implemented, not an aspirational architecture.

## Product and runtime

LadFit is an offline-first Expo 54 / React Native 0.81 application for creating, running, recording, and sharing functional-fitness workouts. It has no backend, accounts, synchronization, analytics, or network requirement. Device data is JSON in AsyncStorage and application state is held in five Zustand stores.

The supported user journey is:

`template list -> create/edit or details -> countdown -> active workout -> optional rest -> completion -> logbook`

Read in this order before changing code:

1. `ai/architecture-summary.md`
2. `docs/business-rules.md`
3. `ai/feature-index.md`
4. The affected types, store, screen, and utility
5. `ai/development-workflow.md`

## Vocabulary

- **Template**: reusable workout definition (`Template`).
- **Workout/session**: a snapshot created from a template when countdown begins (`Workout`).
- **Round**: a timed segment stored in `Workout.rounds`.
- **Exercise catalog item**: an autocomplete suggestion; it is not referenced by ID from template exercises.
- **Benchmark**: a seeded template whose ID starts with `benchmark_`; it is not a separate entity type.
- **Ladder type**: the persisted lowercase discriminator in `LadderType`.

Use these exact terms in types and documentation. UI labels may use “For Reps”, “AMRAP”, and “Workout History”.

## Non-negotiable invariants

- `Exercise.position` is contiguous and one-based. Reindex after deletion or reordering.
- `Workout.currentRoundIndex` is zero-based; strategy `roundNumber` and `Round.roundNumber` are one-based.
- Starting a session snapshots template values. Later template edits must not change history.
- Persisted dates must be rehydrated after `JSON.parse`.
- Existing AsyncStorage key strings are compatibility contracts; do not rename them without a copy-and-verify migration.
- Ladder calculations belong in `src/utils/ladderStrategies.ts`. Screens currently contain preview/display calculations; new execution rules must use the strategy first and keep previews consistent.
- Chipper persists `maxRounds = exercises.length`. AMRAP persists `maxRounds = 999` and terminates by `timeCap`.
- Buy-in/out is currently saved only for `amrap`, `chipper`, and `forreps`, even though the fields exist on the shared types.

## Source-of-truth map

| Concern | Authoritative code |
|---|---|
| Domain shapes | `src/types/index.ts` |
| Route names/params | `src/types/navigation.ts` and `src/navigation/` |
| Workout validation/defaulting | `CreateEditWorkoutScreen.tsx`, `ladderDefaults.ts` |
| Executed reps | `src/utils/ladderStrategies.ts` |
| Session transitions/timing | `activeWorkoutStore.ts`, `ActiveWorkoutScreen.tsx`, `RestScreen.tsx` |
| Template/history serialization | `storage.ts`, workout/history stores |
| Paused session serialization | `activeWorkoutStore.ts` |
| Exercise catalog serialization | `exerciseStore.ts` |
| Theme serialization | `themeStore.ts` |
| Startup hydration | `App.tsx`, `WorkoutListScreen.tsx` |
| Results and sharing | `WorkoutCompleteScreen.tsx`, `LogBookScreen.tsx`, `shareUtils.ts` |

## Persistence ownership

Do not assume every key is wrapped by `storage.ts`.

| Key | Owner |
|---|---|
| `@workouts` | `storage.ts` via `workoutStore.ts` |
| `@workout_history` | `storage.ts` via `workoutHistoryStore.ts` |
| `@benchmarks_initialized` | `storage.ts` |
| `@exercise_catalog`, `@exercises_initialized` | `exerciseStore.ts` |
| `@ladder_trainer_theme_mode` | `themeStore.ts` |
| `@ladder_trainer_paused_workout` | `activeWorkoutStore.ts` |

New persistence should have one named owner and typed load/save boundaries. Validate unknown parsed data before trusting it. Preserve old records by supplying defaults during hydration.

## Adding or changing a feature

Trace the full vertical slice: persisted type -> hydration/migration -> store action -> strategy/business utility -> UI input and display -> route contract -> history/share output -> tests and docs. A new `Template` field generally also needs a `Workout` snapshot field and paused/history hydration behavior.

A new ladder type requires at least:

1. `LadderType`, field semantics, and defaults.
2. A strategy and factory case.
3. Create/edit selection, input component, validation, serialization, and reset logic.
4. Details preview, workout card label, active execution/termination behavior.
5. Completion, logbook, text share, and image share display.
6. Benchmark data if applicable and strategy/lifecycle tests.
7. Updates to `docs/business-rules.md` and `ai/feature-index.md`.

## Validation baseline

There is no `test` or `typecheck` npm script and no test files. The intended check is `npx tsc --noEmit`, but it currently fails before checking source with TS5095 because local `module: commonjs` conflicts with Expo's `moduleResolution: bundler`. Fix that configuration as scoped quality work; until then, report the blocker rather than claiming type safety. Expo smoke testing should cover creation, start, background/pause/restore, completion, history, and sharing as applicable.

## Known implementation hazards

- `WorkoutCompleteScreen` uses `workoutHistory[0]` instead of its `workoutId` route param.
- `App.tsx` restores by navigating to `ActiveWorkout` without the required `workoutId` param and types its navigation ref as `any`.
- Buy-in/out timing is represented by ordinary `Round` entries, so consumers slice the first/last round heuristically.
- Strategy defaults use `||`; a persisted zero is treated as missing in several calculations.
- Flexible descending total calculation can disagree with per-round clamping after values reach zero.
- `calculateTotalReps` in `calculations.ts` assumes a full 12-round Christmas workout and is not a general total calculator.
- Store persistence helpers often swallow write failures, so UI state may appear successful without durable storage.
- `searchExercises()` sorts the Zustand array in place when the query is empty.
- Dead scaffold/domain types and unused dependencies remain; see `ai/project-memory.md`.

Do not silently “fix” these while implementing unrelated work. Account for them, add regression coverage, and scope a fix explicitly.
