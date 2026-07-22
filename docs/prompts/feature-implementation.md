# Prompt: Feature Implementation — LadFit

> Use with `AI_CONTEXT.md` and `ai/development-workflow.md`; inspect source and update contracts/business docs when behavior changes.

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Paste it into your AI coding assistant to implement a new feature.

---

## Prompt Template

```
You are an expert React Native / TypeScript engineer working on LadFit — an offline-first functional fitness app built with Expo, Zustand, and React Native Paper.

## Project Context
Before implementing, read these files for context:
- AI_CONTEXT.md — project overview and key rules
- src/types/index.ts — all domain types
- src/utils/ladderStrategies.ts — the Strategy Pattern for ladder logic
- docs/coding-standards.md — coding conventions

## Key Rules
- No backend / API calls (offline-first)
- All global state → Zustand stores in src/store/
- AsyncStorage only through src/utils/storage.ts or store actions
- No any types
- Use spacing.* and borderRadius.* from src/constants/theme.ts (never hardcode pixel values)
- Use <Text> from react-native-paper (never bare RN Text)
- Use StyleSheet.create() (no inline styles)
- Templates are immutable snapshots — when a workout starts, data is copied into a Workout object
- All new ladder logic must go in src/utils/ladderStrategies.ts implementing the LadderStrategy interface

## Feature to Implement
[DESCRIBE THE FEATURE IN DETAIL]

## Specific Requirements
1. [REQUIREMENT 1]
2. [REQUIREMENT 2]
3. [REQUIREMENT 3]

## Files to Modify
- [LIST FILES HERE]

## Data Model Changes (if any)
[DESCRIBE TYPE CHANGES OR NEW TYPES]

## Acceptance Criteria
- [ ] [CRITERION 1]
- [ ] [CRITERION 2]

## Implementation Notes
[ANY SPECIAL CONSIDERATIONS, SIMILAR PATTERNS TO REFERENCE, EDGE CASES]

Please:
1. Start by listing all files you'll modify and why
2. Show type changes first
3. Show storage migration if needed
4. Implement store actions
5. Implement UI changes
6. Do NOT modify application logic outside the described scope
```

---

## Common Feature Variants

### Add a new field to Template

Replace the feature section with:
```
Add a `[FIELD_NAME]: [TYPE]` field to the Template interface in src/types/index.ts.
- The field is optional (backward compatible)
- Add it to the CreateEditWorkoutScreen UI so users can set it
- Add it to the WorkoutDetailsScreen display
- Add a migration in storage.ts loadWorkouts() to default existing records to [DEFAULT_VALUE]
- Add it to the snapshot copy in activeWorkoutStore.ts startWorkout()
```

### Add a new Ladder Type

Replace the feature section with:
```
Add a new ladder type called '[TYPE_NAME]' to the app.

Behavior:
[DESCRIBE THE REP PATTERN]

Steps required:
1. Add '[TYPE_NAME]' to LadderType union in src/types/index.ts
2. Add defaults in src/constants/ladderDefaults.ts
3. Implement [TypeName]LadderStrategy class in src/utils/ladderStrategies.ts implementing LadderStrategy
4. Add case in getLadderStrategy() factory in src/utils/ladderStrategies.ts
5. Create src/components/[TypeName]ExerciseInput.tsx for exercise-level settings
6. Wire the new input component into CreateEditWorkoutScreen.tsx
7. Add per-exercise fields to the Exercise interface if needed
```

### Add a new Screen

Replace the feature section with:
```
Add a new screen called [ScreenName] to the [WorkoutStack/SettingsStack] navigator.

Purpose: [WHAT IT DISPLAYS / ALLOWS]
Navigation: Reached from [SOURCE SCREEN] via navigate('[ScreenName]', { [PARAMS] })
Data: Reads from [STORE NAME] using [STORE ACTIONS]

UI elements:
- [ELEMENT 1]
- [ELEMENT 2]

Add the screen to:
1. src/types/navigation.ts — param list
2. src/navigation/[Navigator].tsx — route registration
3. src/screens/[category]/[ScreenName].tsx — screen implementation
```
