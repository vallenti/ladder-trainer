# Development Workflow for Coding Agents

## Definition of ready

Before editing, state the user-visible outcome, identify the persisted entities and routes involved, and read every source-of-truth file listed for that feature in `ai/feature-index.md`. Check `git status` and preserve unrelated changes.

## Implementation sequence

1. Write acceptance cases, including old persisted data, empty/error states, app backgrounding, and type-specific behavior.
2. Update domain and navigation types. Decide whether a field belongs to a template, session snapshot, round, or UI-only state.
3. Add hydration/default/migration behavior at the key owner. Never change a storage key in place.
4. Implement pure business logic or strategy behavior.
5. Update store actions and lifecycle transitions.
6. Update create/edit validation and inputs.
7. Update every reader: cards, details preview, active UI, completion, logbook, text/image sharing.
8. Add focused tests and run validation.
9. Update business rules, schema/contracts, feature index, and project memory.

## Compatibility rules

- Adding a required runtime field to persisted JSON is breaking even if TypeScript compiles. Hydrate a default or run a versioned migration.
- New template execution fields normally need a corresponding workout snapshot field.
- Rehydrate all new dates in templates, history, rounds, and paused state.
- Treat parsed JSON as `unknown`; reject or repair invalid collection/items deliberately.
- A migration must be idempotent and must not destroy valid user data.
- Because save helpers may swallow errors today, do not assume awaiting them proves durability; improve error propagation when the feature requires reliable feedback.

## Feature checklists

### New ladder type

- `LadderType`, defaults, strategy class, factory case, and formula tests.
- Type-selection card, exercise input mode, add/reset transformation, validation, save mapping.
- Active round list and end condition, rest behavior, pause/restore.
- Workout card/details labels and preview.
- Completion/logbook totals, round labels, partial-work rules, text and image sharing.
- Seed examples if desired; docs and migration for existing values.

### New template/session field

- Define ownership and optionality separately on `Template` and `Workout`.
- Populate it during `startWorkout` if history must snapshot it.
- Cover template load, history load, and paused-workout load.
- Update edit initialization, reset on type changes, validation, save mapping, details, execution, and results.

### New screen or route

- Add an exact param type and navigator registration.
- Type `navigation` and `route`; do not copy current `any` patterns.
- Update every caller, including startup restoration and nested navigators.
- Define missing/invalid-param behavior and Android back behavior.

### Persistence change

- Locate the owner using `AI_CONTEXT.md`.
- Test absent key, valid old data, malformed JSON, invalid item, read failure, write failure, and idempotent migration.
- Preserve initialization flags unless reseeding is explicitly required.

## Validation

Always run:

```powershell
npx tsc --noEmit
```

The repository provides `npm run typecheck` and `npm test -- --ci`. The current suite covers strategy formulas, calculation utilities, and date hydration. Extend it for every changed rule. For UI/lifecycle work, manually smoke-test the affected path on Expo, including background/foreground when timing or persistence changes.

## Review gates

- No duplicated business formula unless it is clearly presentation-only and covered against the strategy.
- No new `any`, untyped route, hardcoded storage key at a second owner, or mutation of Zustand arrays.
- User-facing errors are actionable; storage failures are not reported as success.
- Accessibility labels/roles and touch targets exist for new controls.
- Documentation describes current behavior and labels proposals explicitly.
