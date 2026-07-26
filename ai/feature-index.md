# Feature Index

Use this index to find an entire implementation slice. File names are relative to `src/`.

| Feature | Entry/UI | State/business logic | Persistence/output |
|---|---|---|---|
| App bootstrap | `App.tsx` | theme, history, exercise, paused-session loads | each owning store |
| Template list/tabs | `screens/workouts/WorkoutListScreen.tsx`, `components/WorkoutCard.tsx` | `store/workoutStore.ts` | `utils/storage.ts` |
| Create/edit template | `CreateEditWorkoutScreen.tsx`, exercise input components | validation in screen; `ladderDefaults.ts`; workout/exercise stores | workouts + auto-added catalog items |
| Template details/preview | `WorkoutDetailsScreen.tsx` | manual preview formulas plus strategy semantics | none |
| Benchmark seed/restore | list and settings screens | `benchmarkWorkouts.ts`, workout store | `storage.ts`; prefix `benchmark_` |
| Exercise catalog | `ManageExercisesScreen.tsx`, `AutocompleteExerciseInput.tsx` | `exerciseStore.ts`, `defaultExercises.ts` | exercise store direct AsyncStorage |
| Session countdown/start | `CountdownScreen.tsx` | workout lookup + `activeWorkoutStore.startWorkout()` | in memory until pause/complete |
| Active execution | `ActiveWorkoutScreen.tsx` | active store + `getLadderStrategy()` | paused snapshot/history |
| Round rest | `RestScreen.tsx` | active store next-round/pause actions | paused snapshot |
| Buy-in/out | create/edit, details, active, completion/logbook | active store flags; ordinary rounds currently record timing | template/session/history JSON |
| AMRAP timeout/partial reps | active + complete screens | time cap; history `savePartialRoundReps()`; AMRAP strategy totals | history exercises `partialReps` |
| Completion | `WorkoutCompleteScreen.tsx` | active store writes history; completion reads newest history entry | history + paused-key removal |
| Logbook filters/delete | `LogBookScreen.tsx` | local name/date filters; history store | history |
| Result sharing | completion/logbook, `ShareableWorkoutCard.tsx` | `shareUtils.ts`, native text Share in logbook | temporary PNG/file sharing |
| Theme | settings and `App.tsx` | `themeStore.ts`, `theme.ts` | theme key |
| Legal/config | settings, `LegalScreen.tsx` | `legal.ts`, `config.ts` | none |
| Audio/focus/awake | active/countdown/rest | `soundUtils.ts`, active mute/focus state, Expo keep-awake | mute not persisted; focus persists only in paused state |

## Ladder implementation matrix

All types use `ladderStrategies.ts`; creation is coordinated by `CreateEditWorkoutScreen.tsx`.

| Type | Input component | Persisted special fields | End rule |
|---|---|---|---|
| `christmas` | `ExerciseInput` | global `maxRounds` | round cap, max 12 |
| `ascending` | `ExerciseInput` | `startingReps`, `stepSize`, `maxRounds` | round cap |
| `descending` | `ExerciseInput` | `startingReps`, `stepSize`, `maxRounds` | round cap |
| `pyramid` | `ExerciseInput` | `stepSize`, `maxRounds` | round cap |
| `reversepyramid` | `ExerciseInput` | `stepSize`, `maxRounds` | round cap |
| `flexible` | `FlexibleExerciseInput` | per exercise direction/start/step; global rounds | round cap |
| `chipper` | `FixedRepsExerciseInput` | per exercise `fixedReps`; rounds derived from count | last exercise |
| `amrap` | `AMRAPExerciseInput` | per exercise start/step; `timeCap`; sentinel rounds | time cap |
| `forreps` | `ForRepsExerciseInput` | per exercise `repsPerRound`; global rounds | round cap |

## Undocumented/dead modules agents should recognize

- `calculations.ts`: generic time formatter plus legacy Christmas-only helpers.
- `shareUtils.ts`: PNG capture/share/save utilities; text sharing is implemented inside `LogBookScreen`.
- `soundUtils.ts`: generated beep/success audio and iOS silent-mode setup.
- `HomeScreen.tsx` and `ExampleComponent.tsx`: unused scaffolding, not extension points.
- `ChipperExerciseInput.tsx` exists, but current create/edit imports `FixedRepsExerciseInput.tsx`; verify usage before changing either.
- `src/types/index.ts` contains unused scaffold/API/Strava types.

## Cross-cutting readers to search before a change

For a ladder type or session field, search by the discriminator/field across `CreateEditWorkoutScreen`, `WorkoutDetailsScreen`, `WorkoutCard`, `ActiveWorkoutScreen`, `WorkoutCompleteScreen`, `LogBookScreen`, `ShareableWorkoutCard`, strategies, defaults, benchmarks, stores, types, and docs. Do not stop after the factory compiles.
