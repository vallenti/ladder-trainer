# Project Memory — LadFit AI Agent

> This file stores accumulated knowledge about design decisions, gotchas, and resolved issues.
> Update it after every significant implementation session.

---

## Architecture Decisions (ADRs)

### ADR-001: Offline-First, No Backend
- **Date:** Pre-v1.0.0
- **Decision:** All data stored locally via AsyncStorage. No REST API, no user accounts.
- **Rationale:** Simplicity, privacy, no server cost, works without internet.
- **Consequences:** No cross-device sync, no social features, no crash reporting.

### ADR-002: Zustand for State Management
- **Date:** Pre-v1.0.0
- **Decision:** Zustand v5 as the sole state management library.
- **Rationale:** Minimal boilerplate vs Redux, works well with TypeScript, no Provider wrapper needed.
- **Consequences:** Each store is a singleton; testing requires manual state reset.

### ADR-003: Strategy Pattern for Ladder Logic
- **Date:** Pre-v1.0.0
- **Decision:** All ladder rep calculations are in `LadderStrategy` class implementations.
- **Rationale:** New ladder types can be added without touching screens; business logic is testable in isolation.
- **Consequences:** Adding a ladder type requires changes in 6 places (see AI_CONTEXT.md).

### ADR-004: Template Snapshot on Workout Start
- **Date:** Pre-v1.0.0
- **Decision:** When `startWorkout()` is called, all template fields are copied into the `Workout` object.
- **Rationale:** Historical workout records should reflect the workout as performed, not the current template state.
- **Consequences:** Editing a template does not retroactively change history. There is no FK link between Workout and Template.

### ADR-005: Programmatic Audio Generation
- **Date:** Pre-v1.0.0
- **Decision:** Generate WAV audio via raw ArrayBuffer / data URI rather than bundling audio files.
- **Rationale:** Avoids audio asset files in the bundle; frequency and duration are runtime configurable.
- **Consequences:** Audio generation is CPU-bound but short (300-1000ms clips). May have issues on some Android versions.

---

## Known Gotchas

### Round Indexing Mismatch
- `LadderStrategy.getExercisesForRound(roundNumber)` — **1-indexed**
- `Workout.currentRoundIndex` — **0-indexed**
- Always call: `strategy.getExercisesForRound(currentRoundIndex + 1, exercises)`

### Christmas Ladder Position = Reps
- `exercise.position` is both the exercise's order AND its rep count in the Christmas ladder.
- Position 1 = 1 rep; Position 12 = 12 reps.
- Other ladder types ignore `position` for rep calculation.

### Date Deserialization
- AsyncStorage stores all data as JSON strings.
- `Date` objects become ISO strings on serialization.
- Must re-hydrate: `new Date(w.startTime)` after every `JSON.parse`.
- This is done in `src/utils/storage.ts` — the single place for AsyncStorage reads.

### AMRAP maxRounds = 999
- AMRAP workouts have no round cap — they're time-bounded.
- `maxRounds = 999` is a sentinel value meaning "unlimited".
- Do not display this to users; the time cap is the relevant constraint.

### Chipper: exercise.position = roundNumber
- In a Chipper, `round 1` means `exercise at position 1`.
- `ChipperLadderStrategy.getExercisesForRound(roundNumber, exercises)` finds the exercise where `exercise.position === roundNumber`.
- `maxRounds` should equal the number of exercises in a Chipper.

---

## Resolved Issues

### Issue: Old templates missing ladderType field
- **Problem:** Before multi-ladder support, templates had no `ladderType`.
- **Resolution:** Migration in `workoutStore.loadWorkouts()` and `workoutHistoryStore.loadHistory()` — defaults to `'christmas'` if missing.
- **Status:** Resolved in v1.0.0

---

## Pending Decisions

### Should benchmark workouts have a special `isBenchmark: boolean` field?
- **Current:** Benchmarks are identified by a hardcoded list of ID strings in `benchmarkWorkouts.ts`.
- **Problem:** Fragile; if IDs change, the filter breaks.
- **Recommendation:** Add `isBenchmark: boolean` to `Template` interface and set it during seeding.
- **Status:** TODO

### Should `Workout` store a reference to the originating `templateId`?
- **Current:** `Workout` stores `templateName` (string snapshot) but no `templateId`.
- **Problem:** Cannot link history entries back to templates (e.g., "all sessions of Fran").
- **Recommendation:** Add `templateId?: string` to `Workout` and populate it in `startWorkout()`.
- **Status:** TODO

---

## Performance Notes

- `LogBookScreen` renders up to N workout history cards. With large history, FlatList optimizations should be applied (see `docs/prompts/performance-optimization.md`).
- `ChristmasLadderStrategy.getExercisesForRound` is O(exercises) — negligible.
- No memoization exists on store selectors. If re-renders become an issue, add `shallow` comparisons from `zustand/shallow`.
