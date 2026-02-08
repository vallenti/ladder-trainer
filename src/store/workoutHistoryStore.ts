import { create } from 'zustand';
import { Workout, Exercise } from '../types';
import { saveWorkoutHistory, loadWorkoutHistory } from '../utils/storage';

interface WorkoutHistoryStore {
  workoutHistory: Workout[];
  loadHistory: () => Promise<void>;
  addWorkout: (workout: Workout) => Promise<void>;
  deleteWorkoutFromHistory: (workoutId: string) => Promise<void>;
  savePartialRoundReps: (workoutId: string, exercises: Exercise[]) => Promise<void>;
}

export const useWorkoutHistoryStore = create<WorkoutHistoryStore>((set, get) => ({
  workoutHistory: [],

  loadHistory: async () => {
    const loadedHistory = await loadWorkoutHistory();
    
    // Data migration: Add default ladderType and maxRounds to existing workout history
    const history = loadedHistory.map(workout => {
      if (!workout.ladderType) {
        return {
          ...workout,
          ladderType: 'christmas' as const,
          maxRounds: workout.maxRounds || workout.exercises.length,
        };
      }
      return workout;
    });
    
    // Save migrated data if any changes were made
    if (history.some((w, i) => !loadedHistory[i].ladderType)) {
      await saveWorkoutHistory(history);
    }
    
    set({ workoutHistory: history });
  },

  addWorkout: async (workout: Workout) => {
    const { workoutHistory } = get();
    const updatedHistory = [workout, ...workoutHistory];
    await saveWorkoutHistory(updatedHistory);
    set({ workoutHistory: updatedHistory });
  },

  deleteWorkoutFromHistory: async (workoutId: string) => {
    const { workoutHistory } = get();
    const updatedHistory = workoutHistory.filter(w => w.id !== workoutId);
    await saveWorkoutHistory(updatedHistory);
    set({ workoutHistory: updatedHistory });
  },

  savePartialRoundReps: async (workoutId: string, exercises: Exercise[]) => {
    const { workoutHistory } = get();
    const updatedHistory = workoutHistory.map(w => {
      if (w.id === workoutId) {
        return {
          ...w,
          exercises: exercises,
        };
      }
      return w;
    });
    await saveWorkoutHistory(updatedHistory);
    set({ workoutHistory: updatedHistory });
  },
}));
