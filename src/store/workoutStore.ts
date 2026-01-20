import { create } from 'zustand';
import { Template } from '../types';
import { loadWorkouts, saveWorkouts } from '../utils/storage';

interface WorkoutStore {
  workouts: Template[];
  isLoading: boolean;
  loadWorkouts: () => Promise<void>;
  addWorkout: (workout: Omit<Template, 'id' | 'createdAt'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Template>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkout: (id: string) => Template | undefined;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  isLoading: false,

  loadWorkouts: async () => {
    set({ isLoading: true });
    const workouts = await loadWorkouts();
    set({ workouts, isLoading: false });
  },

  addWorkout: async (workoutData) => {
    const newWorkout: Template = {
      ...workoutData,
      id: Date.now().toString(),
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
}));