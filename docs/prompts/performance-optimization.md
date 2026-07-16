# Prompt: Performance Optimization — LadFit

> Copy this prompt and fill in the `[PLACEHOLDERS]`. Use it to investigate and fix performance issues.

---

## Prompt Template

```
You are an expert React Native performance engineer working on LadFit — an Expo app using Zustand and React Native Paper.

## Project Context
Read: AI_CONTEXT.md for architecture overview.

## Performance Issue
[DESCRIBE THE SYMPTOM — e.g. "The LogBook screen is slow when there are >50 history entries"]

## Target File(s)
[LIST FILES TO INVESTIGATE]

## Performance Goals
- [ ] Screen renders in <16ms (60fps)
- [ ] List scrolling is smooth (no dropped frames)
- [ ] Workout timer does not re-render unrelated components
- [ ] Store subscriptions are scoped (selectors not whole-store)

## Optimization Approach
Analyze for:
1. Unnecessary re-renders (missing memo/useCallback/useMemo)
2. Zustand subscription scope (subscribing to whole store vs. selector)
3. Expensive computations in render path
4. FlatList optimizations (getItemLayout, initialNumToRender, maxToRenderPerBatch)
5. Images not cached or re-decoded on scroll
6. Unoptimized reanimated animations
7. AsyncStorage read on every render (should be in useEffect or store)

Please:
1. Identify the specific performance bottleneck
2. Show the optimized code
3. Explain why each change improves performance
4. Estimate the impact (high / medium / low)
```

---

## Common Performance Optimization Recipes

### Scope Zustand Subscription
```
Currently subscribing to entire store:
const store = useWorkoutStore();  // re-renders on ANY store change

Optimize to subscribe only to needed fields:
const workouts = useWorkoutStore(state => state.workouts);
const isLoading = useWorkoutStore(state => state.isLoading);

Or use a combined selector for related data:
const { workouts, isLoading } = useWorkoutStore(
  state => ({ workouts: state.workouts, isLoading: state.isLoading }),
  shallow  // from zustand/shallow — prevents re-render if values are the same
);
```

### Memoize Expensive List Item
```
The renderItem function in [SCREEN] creates a new function reference on every render.

// Before
<FlatList
  renderItem={({ item }) => <WorkoutCard workout={item} onPress={() => navigate(...)} />}
/>

// After
const renderItem = useCallback(({ item }: { item: Template }) => (
  <WorkoutCard workout={item} onPress={() => handlePress(item.id)} />
), [handlePress]);

const handlePress = useCallback((id: string) => {
  navigation.navigate('WorkoutDetails', { workoutId: id });
}, [navigation]);

<FlatList renderItem={renderItem} />
```

### Memoize Filtered / Sorted Data
```
Currently filtering/sorting in render:
const sorted = workouts.filter(w => ...).sort((a, b) => ...);

Move to useMemo:
const sorted = useMemo(
  () => workouts.filter(w => ...).sort((a, b) => ...),
  [workouts]
);
```

### Optimize FlatList for Long Lists
```
For LogBookScreen with many workout history entries:

<FlatList
  data={filteredHistory}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  // Performance props:
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  // Optional: provide item layout for instant scroll
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,  // fixed height in px
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Prevent Timer From Re-rendering Workout List
```
The ActiveWorkoutScreen timer runs every second and may cause the exercises list to re-render.

Separate the timer into its own component:
- TimerDisplay: subscribes to elapsedTime (changes every second)
- ExerciseList: subscribes only to activeWorkout.exercises (rarely changes)

This prevents the exercise list from re-rendering every second.
```

### Defer Heavy Computation to Worker
```
If calculateTotalReps() or getExercisesForRound() is called in a loop during render,
consider caching results in a useMemo with the workout and roundNumber as dependencies.

const exercisesWithReps = useMemo(
  () => strategy.getExercisesForRound(currentRound, exercises),
  [strategy, currentRound, exercises]
);
```
