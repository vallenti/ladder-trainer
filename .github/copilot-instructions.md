# GitHub Copilot Instructions — LadFit

> This file provides persistent project context for GitHub Copilot and other AI coding assistants.
> Keep this file up to date as the architecture evolves.

---

## Project Overview

**LadFit** is a React Native / Expo mobile app (iOS + Android) for functional fitness ladder-style workout training. Users create workout templates, run timed sessions, and log results. There is **no backend** — all data is stored locally using `AsyncStorage`.

- **App version:** 1.0.0
- **Expo SDK:** ~54
- **React Native:** ^0.81
- **TypeScript:** ~5.9
- **State management:** Zustand ^5
- **UI library:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation v7

---

## Architecture Rules

1. **Offline-first, always.** No HTTP calls to external APIs (axios is present but unused and should be removed).
2. **All global state lives in Zustand stores** in `src/store/`. Never use React Context for business data.
3. **AsyncStorage is only touched by `src/utils/storage.ts`** utility functions or directly inside store actions. Never call it from screens or components.
4. **Templates are immutable snapshots.** When a workout session starts (`startWorkout()`), all template data is copied into a `Workout` object. Template edits do not affect historical sessions.
5. **The Strategy Pattern governs all ladder logic.** All rep calculation and exercise sequencing lives in `src/utils/ladderStrategies.ts`. Never inline ladder logic in screens or stores.
6. **Navigation is typed.** Always use the param list types from `src/types/navigation.ts`. Never cast navigation to `any`.

---

## Coding Conventions

### TypeScript
- Strict TypeScript — no `any`. Use `unknown` + type guards for truly dynamic data.
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Re-hydrate `Date` objects from ISO strings after every `JSON.parse` call.

### Components
- Functional components with explicit `Props` interface.
- Pattern: `const MyComponent: React.FC<Props> = ({ ... }) => { ... }; export default MyComponent;`
- Use `StyleSheet.create()` at the bottom of every component file.
- Never use bare React Native `<Text>` — always use `<Text>` from `react-native-paper`.

### State
- Local UI state (modals open/closed, input values): `useState`.
- App data (workouts, history, exercises): Zustand stores.
- All store actions that touch AsyncStorage must be `async`.
- Immutable state updates: always spread (`{ ...w, field: value }`), never mutate.

### Imports Order
1. React / React Native core
2. Third-party (alphabetical)
3. Internal stores
4. Internal components
5. Internal constants, utils, types

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase + `.tsx` | `WorkoutCard.tsx` |
| Utility files | camelCase + `.ts` | `ladderStrategies.ts` |
| Store files | camelCase + `Store.ts` | `workoutStore.ts` |
| Interfaces | PascalCase, no `I` prefix | `WorkoutStore` |
| Type aliases | PascalCase | `LadderType` |
| Module constants | SCREAMING_SNAKE_CASE | `BENCHMARK_WORKOUTS` |
| AsyncStorage keys | `@` prefix + snake_case | `@workout_history` |
| Zustand stores | `use` prefix | `useWorkoutStore` |
| IDs | `Date.now().toString()` | `"1719200000000"` |

---

## Key Files Reference

| Purpose | File |
|---|---|
| All domain types | `src/types/index.ts` |
| Navigation types | `src/types/navigation.ts` |
| Ladder business logic | `src/utils/ladderStrategies.ts` |
| Time/rep calculations | `src/utils/calculations.ts` |
| Storage wrappers | `src/utils/storage.ts` |
| Theme tokens | `src/constants/theme.ts` |
| App config (version, email) | `src/constants/config.ts` |
| Benchmark workouts | `src/constants/benchmarkWorkouts.ts` |
| Exercise catalog defaults | `src/constants/defaultExercises.ts` |
| Ladder type defaults | `src/constants/ladderDefaults.ts` |

---

## The 8 Ladder Types

| Type | Pattern |
|---|---|
| `christmas` | Accumulates round by round — each round adds the newest exercise at top |
| `ascending` | All exercises: reps go up each round by `stepSize` |
| `descending` | All exercises: reps go down each round by `stepSize` (e.g. Fran: 21-15-9) |
| `pyramid` | Ascend to peak then mirror down |
| `flexible` | Each exercise has independent direction, startingReps, stepSize |
| `chipper` | Each exercise done once in sequence with fixed `fixedReps` |
| `amrap` | Max rounds in `timeCap` seconds; each exercise has optional progression |
| `forreps` | Fixed rounds, same `repsPerRound` per exercise every round |

### Adding a New Ladder Type

1. Add to `LadderType` union in `src/types/index.ts`
2. Add defaults to `LADDER_DEFAULTS` in `src/constants/ladderDefaults.ts`
3. Create class implementing `LadderStrategy` in `src/utils/ladderStrategies.ts`
4. Add case in `getLadderStrategy()` factory function
5. Create `XExerciseInput.tsx` component in `src/components/`
6. Wire into `CreateEditWorkoutScreen.tsx`

---

## Testing Requirements

> Tests do not yet exist but should be added.

- Unit test every `LadderStrategy` class method.
- Unit test `calculations.ts` utility functions.
- Unit test store actions with mocked `AsyncStorage`.
- Target: ≥ 80% coverage on `src/utils/` and `src/store/`.
- Test file location: co-located with source (`MyFile.test.ts` next to `MyFile.ts`).
- Runner: Jest (configured in `package.json`).

---

## React Native Best Practices

1. **Always wrap screens in `<SafeAreaView>`** from `react-native-safe-area-context`.
2. **Use `useTheme()` from `react-native-paper`** for all color access — never hardcode hex values.
3. **Use `spacing.*` and `borderRadius.*` from `theme.ts`** for all dimensions — never hardcode `16` or `8`.
4. **Lists: use `FlatList` or `react-native-draggable-flatlist`** — never `ScrollView` with `map()` for large lists.
5. **Keep screen awake during active workouts** via `expo-keep-awake` (already implemented).
6. **Play audio in silent mode** via `Audio.setAudioModeAsync({ playsInSilentModeIOS: true })` (already implemented).
7. **Avoid `Dimensions.get('window')`** — prefer Flexbox layout.
8. **All haptic feedback** must be via `expo-haptics` — not via `Vibration` API.
9. **Platform-specific code**: use `Platform.OS` checks sparingly; prefer cross-platform implementations.

---

## Common Patterns to Follow

### Screen with store data

```tsx
const MyScreen: React.FC = () => {
  const { workouts, isLoading } = useWorkoutStore();
  const theme = useTheme();

  if (isLoading) return <ActivityIndicator />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkoutCard workout={item} />}
      />
    </SafeAreaView>
  );
};
```

### Async store action error handling

```ts
someAction: async (param) => {
  try {
    const data = get().someData;
    const updated = [...data, param];
    await saveData(updated);  // utils/storage.ts function
    set({ someData: updated });
  } catch (error) {
    console.error('someAction failed:', error);
    // Do NOT crash — graceful degradation
  }
},
```

---

## What NOT to Do

- ❌ Do not call `AsyncStorage` from a component or screen directly
- ❌ Do not use `class` components
- ❌ Do not add inline styles (`style={{ padding: 16 }}`) — use `StyleSheet.create()`
- ❌ Do not hardcode colors — use `theme.colors.*`
- ❌ Do not use `any` type
- ❌ Do not add navigation state to Zustand
- ❌ Do not put ladder rep calculation logic inside screens
- ❌ Do not use `navigate` to go to the modal workout flow screens from outside the workout context
- ❌ Do not import `axios` — the app has no backend

---

## Documentation

| Doc | Location |
|---|---|
| Architecture overview | `docs/architecture.md` |
| Business rules | `docs/business-rules.md` |
| Coding standards | `docs/coding-standards.md` |
| Database / storage schema | `docs/database-schema.md` |
| API / store contracts | `docs/api-contracts.md` |
| UI guidelines | `docs/ui-guidelines.md` |
| Project roadmap | `docs/project-roadmap.md` |
| AI context (short) | `AI_CONTEXT.md` |
| MCP architecture | `docs/mcp-architecture.md` |
| Development workflow | `DEVELOPMENT_WORKFLOW.md` |
