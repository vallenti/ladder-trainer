import { create } from 'zustand';
import { Workout, Round, Template } from '../types';
import { saveWorkoutHistory, loadWorkoutHistory } from '../utils/storage';

interface ActiveWorkoutStore {
  activeWorkout: Workout | null;
  currentRoundStartTime: Date | null;
  
  startWorkout: (template: Template) => void;
  completeRound: () => void;
  startNextRound: () => void;
  completeWorkout: () => Promise<void>;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  
  // History
  workoutHistory: Workout[];
  loadHistory: () => Promise<void>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set, get) => ({
  activeWorkout: null,
  currentRoundStartTime: null,
  workoutHistory: [],

  startWorkout: (template: Template) => {
    const workout: Workout = {
      id: Date.now().toString(),
      templateName: template.name,
      exercises: template.exercises,
      restPeriodSeconds: template.restPeriodSeconds,
      startTime: new Date(),
      endTime: undefined,
      status: 'incomplete',
      totalTime: 0,
      rounds: [],
      currentRoundIndex: 0,
    };
    
    set({ 
      activeWorkout: workout,
      currentRoundStartTime: new Date(),
    });
  },

  completeRound: () => {
    const { activeWorkout, currentRoundStartTime } = get();
    if (!activeWorkout || !currentRoundStartTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentRoundStartTime.getTime()) / 1000);

    const round: Round = {
      roundNumber: activeWorkout.currentRoundIndex + 1,
      startTime: currentRoundStartTime,
      endTime,
      duration,
    };

    set({
      activeWorkout: {
        ...activeWorkout,
        rounds: [...activeWorkout.rounds, round],
      },
      currentRoundStartTime: null,
    });
  },

  startNextRound: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        currentRoundIndex: activeWorkout.currentRoundIndex + 1,
      },
      currentRoundStartTime: new Date(),
    });
  },

  completeWorkout: async () => {
    const { activeWorkout, workoutHistory } = get();
    if (!activeWorkout) return;

    const endTime = new Date();
    const totalTime = Math.floor((endTime.getTime() - activeWorkout.startTime.getTime()) / 1000);

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime,
      totalTime,
      status: 'completed',
    };

    const updatedHistory = [completedWorkout, ...workoutHistory];
    await saveWorkoutHistory(updatedHistory);

    set({
      activeWorkout: null,
      currentRoundStartTime: null,
      workoutHistory: updatedHistory,
    });
  },

  pauseWorkout: () => {
    // Implementation for pause if needed
  },

  resumeWorkout: () => {
    // Implementation for resume if needed
  },

  loadHistory: async () => {
    const history = await loadWorkoutHistory();
    set({ workoutHistory: history });
  },
}));