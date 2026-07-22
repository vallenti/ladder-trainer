# Project Memory

## Accepted decisions

1. **Offline-only:** no backend, authentication, synchronization, or required network access.
2. **Zustand stores:** five singleton stores own shared state and orchestration.
3. **Strategy-based ladder execution:** round exercise/repetition logic belongs in `ladderStrategies.ts`.
4. **Session snapshots:** history is independent of later template edits. There is currently no `templateId` on `Workout`.
5. **Programmatic sounds:** `soundUtils.ts` creates WAV data URIs and plays them through `expo-av`.
6. **Benchmarks by ID prefix:** `benchmark_` identifies seeded templates; restoring removes every template with that prefix and prepends regenerated seeds.
7. **Catalog is denormalized:** template exercises store name/unit values, not catalog IDs. Editing/deleting a catalog item does not rewrite templates.

## Gotchas confirmed in code

- Round strategy input is one-based; `currentRoundIndex` is zero-based.
- Christmas position is both order and repetitions.
- Chipper round N selects position N and saves `maxRounds` as exercise count.
- AMRAP uses `maxRounds = 999` as an internal sentinel and `timeCap` as the real limit.
- Buy-in/out is enabled by the create/edit save path only for AMRAP, Chipper, and For Reps.
- Paused state stores active workout, current-round start, elapsed/pause totals, pause start, and focus mode. Mute is not persisted.
- Completion prepends history; several completion consumers assume index zero is the just-finished workout.
- `calculations.calculateTotalReps()` is Christmas-only and hardcodes 12 rounds despite its generic name.
- Empty exercise search sorts store state in place.

## Open architectural decisions

- Add `templateId?: string` to sessions for progress/PR grouping.
- Replace prefix-only benchmark identity with explicit metadata while retaining ID compatibility.
- Model buy-in, work rounds, rests, and buy-out as typed segments rather than overloading `Round[]`.
- Choose and document persistence failure semantics; current helpers inconsistently swallow and throw.
- Introduce schema versions/runtime validation for persisted JSON.
- Decide whether paused/background time counts toward AMRAP time cap and total time; lock with tests.
- Consolidate details previews and totals onto shared strategy-derived helpers.

## Debt relevant to feature work

- No committed tests, `test` script, lint configuration, or format configuration.
- `App.tsx` navigation ref and several event/ref/error values use `any`.
- Restore navigation omits the required `workoutId` param.
- Completion route param is ignored in favor of history index zero.
- `HomeScreen.tsx`, `ExampleComponent.tsx`, `User`, `ApiResponse`, and `StravaTokens` are unused scaffolding.
- `axios`, legacy `react-navigation`, and legacy type packages appear unused or mismatched.
- Accessibility and reduced-motion handling are incomplete.

Update this file only for durable decisions, confirmed traps, or resolved debt. Put planned product features in `docs/project-roadmap.md`.
