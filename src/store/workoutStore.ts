import { create } from 'zustand';
import { Template } from '../types';
import { loadWorkouts, saveWorkouts, initializeBenchmarkWorkouts, restoreBenchmarkWorkouts } from '../utils/storage';
import { isBenchmarkWorkout } from '../constants/benchmarkWorkouts';

interface WorkoutStore {
  workouts: Template[];
  isLoading: boolean;
  loadWorkouts: () => Promise<void>;
  addWorkout: (workout: Omit<Template, 'id' | 'createdAt' | 'source'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Template>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkout: (id: string) => Template | undefined;
  restoreBenchmarks: () => Promise<void>;
  getBenchmarkWorkouts: () => Template[];
  getCustomWorkouts: () => Template[];
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  isLoading: false,

  loadWorkouts: async () => {
    set({ isLoading: true });
    
    // Initialize benchmark workouts on first launch
    await initializeBenchmarkWorkouts();
    
    const loadedWorkouts = await loadWorkouts();
    
    // Data migration: retain existing built-in classification and make benchmark
    // status explicit so any user workout can be promoted to a benchmark.
    const workouts = loadedWorkouts.map(workout => {
      const isBuiltIn = workout.source === 'built-in' || isBenchmarkWorkout(workout.id);
      return {
        ...workout,
        ladderType: workout.ladderType || 'christmas' as const,
        maxRounds: workout.maxRounds || workout.exercises.length,
        source: workout.source || (isBuiltIn ? 'built-in' : 'user'),
        isBenchmark: workout.isBenchmark ?? isBuiltIn,
      };
    });
    
    // Save migrated data if any changes were made
    if (workouts.some((w, i) =>
      !loadedWorkouts[i].ladderType || !loadedWorkouts[i].source || loadedWorkouts[i].isBenchmark === undefined
    )) {
      await saveWorkouts(workouts);
    }
    
    set({ workouts, isLoading: false });
  },

  addWorkout: async (workoutData) => {
    const newWorkout: Template = {
      ...workoutData,
      id: Date.now().toString(),
      source: 'user',
      createdAt: new Date(),
    };
    const workouts = [...get().workouts, newWorkout];
    await saveWorkouts(workouts);
    set({ workouts });
  },

  updateWorkout: async (id, updates) => {
    const workouts = get().workouts.map(w =>
      w.id === id ? { ...w, ...updates } : w
    );
    await saveWorkouts(workouts);
    set({ workouts });
  },

  deleteWorkout: async (id) => {
    const workouts = get().workouts.filter(w => w.id !== id);
    await saveWorkouts(workouts);
    set({ workouts });
  },

  getWorkout: (id) => {
    return get().workouts.find(w => w.id === id);
  },

  restoreBenchmarks: async () => {
    await restoreBenchmarkWorkouts();
    await get().loadWorkouts();
  },

  getBenchmarkWorkouts: () => {
    return get().workouts
      .filter(w => w.isBenchmark)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getCustomWorkouts: () => {
    return get().workouts
      .filter(w => !w.isBenchmark)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));
