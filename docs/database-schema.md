# Persistence Schema

AsyncStorage contains unversioned JSON. TypeScript interfaces are compile-time only; current loaders do little runtime validation.

## Keys and owners

| Key | JSON value | Owner/loader |
|---|---|---|
| `@workouts` | `Template[]` | `storage.ts` / workout store |
| `@workout_history` | `Workout[]` | `storage.ts` / history store |
| `@benchmarks_initialized` | string `"true"` | `storage.ts` |
| `@exercise_catalog` | `ExerciseCatalogItem[]` | exercise store |
| `@exercises_initialized` | string `"true"` | exercise store |
| `@ladder_trainer_theme_mode` | `"light" | "dark"` | theme store |
| `@ladder_trainer_paused_workout` | `PausedWorkoutState` | active store |

## Persisted shapes

```ts
type LadderType =
  | 'christmas' | 'ascending' | 'descending' | 'pyramid'
  | 'flexible' | 'chipper' | 'amrap' | 'forreps';

interface Exercise {
  position: number;
  unit: string;
  name: string;
  direction?: 'ascending' | 'descending' | 'constant';
  startingReps?: number;
  stepSize?: number;
  fixedReps?: number;
  partialReps?: number;
  repsPerRound?: number;
}

interface Template {
  id: string; name: string; exercises: Exercise[];
  restPeriodSeconds: number; ladderType: LadderType; maxRounds: number;
  stepSize?: number; startingReps?: number; timeCap?: number;
  buyInOutExercise?: Exercise; hasBuyInOut?: boolean;
  buyInOutRestSeconds?: number; createdAt: Date;
}

interface Round {
  roundNumber: number; startTime: Date; endTime?: Date; duration: number;
}

interface Workout {
  id: string; templateName: string; exercises: Exercise[];
  restPeriodSeconds: number; ladderType: LadderType; maxRounds: number;
  stepSize?: number; startingReps?: number; timeCap?: number;
  buyInOutExercise?: Exercise; hasBuyInOut?: boolean;
  buyInOutRestSeconds?: number; buyInCompleted?: boolean; buyOutCompleted?: boolean;
  startTime: Date; endTime?: Date; status: 'incomplete' | 'completed';
  totalTime: number; rounds: Round[]; currentRoundIndex: number;
}
```

`ExerciseCatalogItem` is defined in `defaultExercises.ts` (not the domain types file) and contains `id`, `name`, optional `suggestedUnit`, `isCustom`, and optional usage metadata. `PausedWorkoutState` is private to `activeWorkoutStore.ts` and includes the active workout plus timer/pause/focus fields.

## Serialization and hydration

Dates serialize to ISO strings. Template load rehydrates `createdAt`; history load rehydrates workout start/end and every round start/end; paused load rehydrates workout start and round/current-round dates. Adding a date anywhere requires updating all relevant loaders.

The only implemented migration adds missing `ladderType = 'christmas'` and derives `maxRounds` from exercise count in workout, history, and paused paths. There is no schema version, migration registry, rollback, validation library, or quarantine for bad records.

## Schema-change protocol

1. Decide whether the field belongs to template, session snapshot, round, paused-only, or catalog data.
2. Keep new persisted fields optional at the read boundary until old data is normalized.
3. Hydrate a deterministic default or implement an idempotent versioned migration.
4. Rehydrate nested dates and validate discriminated type-specific fields.
5. Test missing key, old record, malformed JSON, partially invalid collection, read/write failure, and repeated migration.
6. Never rename/remove a key or discriminator without copying old data and verifying the new write before cleanup.

Recommended future work is a small codec/schema layer with a `schemaVersion`, runtime validation, explicit error propagation, and fixtures for every historical version.
