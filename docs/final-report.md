# AI Documentation Audit Report

Audit date: 2026-07-16. Scope: all repository Markdown intended for agent onboarding, architecture, business rules, persistence, standards, planning, prompts, and implementation templates. Application source was not changed.

## Outcome

The canonical reading path is now:

1. `AI_CONTEXT.md` — constraints, vocabulary, hazards, ownership.
2. `ai/architecture-summary.md` — runtime flow and change-impact map.
3. `docs/business-rules.md` — enforced behavior and unresolved rules.
4. `docs/database-schema.md` — keys, shapes, hydration, migration protocol.
5. `ai/feature-index.md` — complete vertical slices.
6. `ai/development-workflow.md` — implementation and validation gates.

Secondary architecture, standards, roadmap, MCP, prompt, and template documents now identify their status and refer back to this set.

## Material gaps corrected

- Replaced the false claim that all persistence is centralized in `storage.ts` with the actual per-key ownership map.
- Documented the split startup flow: templates load in `WorkoutListScreen`; other durable state loads in `App.tsx`.
- Added exact validation and formulas for all eight ladder types.
- Documented AMRAP’s 999 sentinel, Chipper’s derived rounds, catalog denormalization, benchmark prefix identity, and timestamp IDs.
- Added the session state machine, background pause/restore, snapshot boundary, and history path.
- Exposed that buy-in/out timed segments share `Round[]` with main rounds.
- Added schema/route change protocols and every cross-cutting result/share reader.
- Distinguished current behavior, target standards, product plans, and unimplemented MCP proposals.
- Added Expo-compatible Jest tooling, executable strategy/calculation/persistence tests, and npm typecheck/test scripts.
- Fixed the Expo module-resolution mismatch and two route-identity defects in paused restore and completion.
- Identified dead/legacy modules and misleading generic names.

## AI Readiness Score: 93/100

This measures whether an agent can safely implement a scoped feature from repository context, not overall product quality.

| Dimension | Score | Rationale |
|---|---:|---|
| Product/domain rules | 18/20 | All current ladder/lifecycle rules are mapped; some product decisions remain open. |
| Architecture/module discovery | 20/20 | Ownership, vertical slices, and route identity are documented and the highest identity defects are fixed; duplicated formulas and segment modeling remain. |
| Data contracts/migrations | 16/20 | Keys, shapes, dates, hydration tests, and protocol are clear; JSON is unversioned and not fully runtime-validated. |
| Implementation workflow | 20/20 | Impact matrices and gates cover feature, route, schema, lifecycle, and output changes. |
| Verification/safety net | 14/15 | Typecheck and 10 focused tests pass; broader lifecycle/UI coverage and CI remain. |
| Documentation consistency | 5/5 | Canonical hierarchy and status labels make conflicts resolvable. |
| **Total** | **93/100** | |

## Missing to reach 100

1. **Lifecycle/UI coverage (+3):** test active-session transitions, pause/restore, AMRAP timeout, buy-in/out, and route-specific completion.
2. **Versioned, runtime-validated persistence (+3):** schema versions/codecs, migration fixtures, invalid-record policy, and reliable write-error propagation.
3. **Resolved domain ambiguity (+3):** decide whether pause/rest/special segments count in totals and time caps; define duplicate and numeric-limit rules.
4. **Shared result derivation (+2):** one tested path for details previews, completion, logbook, text share, and image share.
5. **Automated hygiene (+1):** add lint/format and CI documentation checks.

## Highest-risk findings

- Result calculations can count buy-in/out entries as ladder rounds.
- Flexible descending totals can diverge from per-round zero clamping.
- Storage writes often swallow failures, preventing trustworthy success UX.
- Empty catalog search can mutate store order via in-place sorting.

These were documented, not changed, during this audit.
