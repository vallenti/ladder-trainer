# Coding Standards — LadFit

> Last updated: June 24, 2026

---

## Language & Tooling

- **TypeScript** strict mode is expected (tsconfig enforces it).
- All new files must be `.ts` or `.tsx` — no `.js` files in `src/`.
- Formatting: no Prettier or ESLint config is currently present (TODO: add).
- Target: Expo managed workflow — no native code modifications.

---

## File & Folder Conventions

| Pattern | Convention |
|---|---|
| React components | PascalCase filename, `.tsx` extension |
| Utility modules | camelCase filename, `.ts` extension |
| Constant modules | camelCase filename, `.ts` extension |
| Store modules | camelCase filename ending in `Store.ts` |
| Test files | Co-located: `MyComponent.test.tsx` |
| Screen files | Located in `src/screens/[category]/` |

---

## Naming Conventions

### Components
```tsx
// Filename: WorkoutCard.tsx
const WorkoutCard: React.FC<WorkoutCardProps> = ({ ... }) => { ... };
export default WorkoutCard;
```

### Hooks / Stores
```tsx
// Always prefix Zustand stores with "use"
export const useWorkoutStore = create<WorkoutStore>(...);
```

### Types & Interfaces
```ts
// Interfaces: PascalCase, no "I" prefix
interface WorkoutStore { ... }

// Type aliases: PascalCase
type LadderType = 'christmas' | 'ascending' | ...;
```

### Constants
```ts
// Screaming snake case for module-level constants
export const BENCHMARK_WORKOUTS: Template[] = [...];
export const LADDER_DEFAULTS: Record<LadderType, LadderDefaults> = { ... };
```

### AsyncStorage Keys
```ts
// Prefix all keys with '@' and use snake_case
const WORKOUTS_KEY = '@workouts';
const THEME_STORAGE_KEY = '@ladder_trainer_theme_mode';
```

---

## Component Rules

1. **Functional components only** — no class components.
2. **Explicit prop interfaces** — always define a `Props` interface; avoid `any`.
3. **`React.FC<Props>` pattern** — used for all components in this codebase.
4. **Export default** — components use default exports; utilities and stores use named exports.
5. **No inline styles** — use `StyleSheet.create()` at the bottom of each file.
6. **Avoid magic numbers** — use values from `theme.ts` (`spacing.md`, `borderRadius.lg`, etc.).

```tsx
// ✅ Correct
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
});

// ❌ Wrong
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
});
```

---

## State Management Rules

1. **Zustand for all global state** — no `useState` for data that must survive navigation.
2. **Local `useState` only for UI state** — modal open/close, text input, loading spinners within a screen.
3. **Never call `AsyncStorage` directly from a screen** — always go through a store action.
4. **Store actions must be `async`** when they touch `AsyncStorage`.
5. **Immutable updates** — always spread existing state rather than mutating objects.

```ts
// ✅ Correct
updateWorkout: async (id, updates) => {
  const workouts = get().workouts.map(w =>
    w.id === id ? { ...w, ...updates } : w
  );
  await saveWorkouts(workouts);
  set({ workouts });
},

// ❌ Wrong
updateWorkout: async (id, updates) => {
  const workouts = get().workouts;
  const workout = workouts.find(w => w.id === id);
  Object.assign(workout, updates); // mutation!
  await saveWorkouts(workouts);
  set({ workouts });
},
```

---

## Navigation Rules

1. **Never `navigate` directly to modal screens from non-workout screens** — the modal group (Countdown, ActiveWorkout, Rest, WorkoutComplete) forms a linear flow.
2. **Always pass typed params** — use the param list types from `src/types/navigation.ts`.
3. **Never store navigation state in Zustand** — navigation state belongs to React Navigation.

```tsx
// ✅ Correct — typed navigation
const navigation = useNavigation<RootStackScreenProps<'ActiveWorkout'>['navigation']>();
navigation.navigate('Rest', { workoutId: workout.id });
```

---

## Ladder Strategy Rules

1. **All new ladder types must implement `LadderStrategy`** interface.
2. **Add new types to `LadderType` union** in `src/types/index.ts`.
3. **Add defaults to `LADDER_DEFAULTS`** in `src/constants/ladderDefaults.ts`.
4. **Register in `getLadderStrategy` factory** in `src/utils/ladderStrategies.ts`.
5. **Create a corresponding `ExerciseInput` component** for the Create/Edit screen.

---

## Error Handling

1. **Always `try/catch` AsyncStorage operations** — storage can fail on low-memory devices.
2. **Log errors with `console.error`** — do not swallow them silently.
3. **Graceful degradation** — if a storage load fails, return an empty array, not `null`.
4. **TODO: Add a React error boundary** at the `App.tsx` level.

---

## TypeScript Rules

1. **No `any`** — use `unknown` + type guards, or explicit interfaces.
2. **Prefer `interface` over `type` for object shapes** — use `type` for unions/intersections.
3. **Always type function return values** for store actions and utility functions.
4. **`Date` objects** must be re-hydrated explicitly from ISO strings after `JSON.parse`.

---

## Import Order

1. React / React Native core
2. Third-party libraries (alphabetically)
3. Internal stores
4. Internal components
5. Internal constants / utils / types

```tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

import { useWorkoutStore } from '../../store/workoutStore';
import WorkoutCard from '../../components/WorkoutCard';
import { spacing } from '../../constants/theme';
import { formatTime } from '../../utils/calculations';
import type { Template } from '../../types';
```

---

## Testing Requirements (TODO — Not Yet Implemented)

- Unit tests for all `ladderStrategies.ts` strategy classes.
- Unit tests for `calculations.ts` utility functions.
- Unit tests for `storage.ts` with mocked `AsyncStorage`.
- Integration tests for store actions (Zustand + AsyncStorage mocks).
- Component snapshot tests for `WorkoutCard` and `ShareableWorkoutCard`.
- Test runner: Jest (already configured in `package.json`).
- Coverage target: ≥ 80% for `utils/` and `store/`.
