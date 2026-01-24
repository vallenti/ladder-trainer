import { create } from 'zustand';
import { Workout, Round, Template } from '../types';
import { saveWorkoutHistory, loadWorkoutHistory } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAUSED_WORKOUT_KEY = '@ladder_trainer_paused_workout';

interface PausedWorkoutState {
  activeWorkout: Workout;
  currentRoundStartTime: Date | null;
  elapsedTime: number;
  totalPausedTime: number;
  pauseStartTime: number;
}

interface ActiveWorkoutStore {
  activeWorkout: Workout | null;
  currentRoundStartTime: Date | null;
  isPaused: boolean;
  elapsedTime: number;
  totalPausedTime: number;
  pauseStartTime: number;
  
  startWorkout: (template: Template) => void;
  completeRound: () => void;
  startNextRound: () => void;
  completeWorkout: () => Promise<void>;
  pauseWorkout: (elapsedTime: number, totalPausedTime: number) => Promise<void>;
  resumeWorkout: () => void;
  discardPausedWorkout: () => Promise<void>;
  loadPausedWorkout: () => Promise<boolean>;
  
  // History
  workoutHistory: Workout[];
  loadHistory: () => Promise<void>;
  deleteWorkoutFromHistory: (workoutId: string) => Promise<void>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set, get) => ({
  activeWorkout: null,
  currentRoundStartTime: null,
  isPaused: false,
  elapsedTime: 0,
  totalPausedTime: 0,
  pauseStartTime: 0,
  workoutHistory: [],

  startWorkout: (template: Template) => {
    const workout: Workout = {
      id: Date.now().toString(),
      templateName: template.name,
      exercises: template.exercises,
      restPeriodSeconds: template.restPeriodSeconds,
      ladderType: template.ladderType,
      maxRounds: template.maxRounds,
      stepSize: template.stepSize,
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
      isPaused: false,
      elapsedTime: 0,
      totalPausedTime: 0,
      pauseStartTime: 0,
    });
  },

  completeRound: () => {
    const { activeWorkout, currentRoundStartTime } = get();
    if (!activeWorkout || !currentRoundStartTime) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - currentRoundStartTime.getTime()) / 1000;

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
    const totalTime = (endTime.getTime() - activeWorkout.startTime.getTime()) / 1000;

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime,
      totalTime,
      status: 'completed',
    };

    const updatedHistory = [completedWorkout, ...workoutHistory];
    await saveWorkoutHistory(updatedHistory);

    // Clear paused workout from storage
    await AsyncStorage.removeItem(PAUSED_WORKOUT_KEY);

    set({
      activeWorkout: null,
      currentRoundStartTime: null,
      workoutHistory: updatedHistory,
      isPaused: false,
      elapsedTime: 0,
      totalPausedTime: 0,
      pauseStartTime: 0,
    });
  },

  pauseWorkout: async (elapsedTime: number, totalPausedTime: number) => {
    const { activeWorkout, currentRoundStartTime } = get();
    if (!activeWorkout) return;

    const pauseStartTime = Date.now();
    
    const pausedState: PausedWorkoutState = {
      activeWorkout: {
        ...activeWorkout,
        startTime: activeWorkout.startTime,
      },
      currentRoundStartTime,
      elapsedTime,
      totalPausedTime,
      pauseStartTime,
    };

    try {
      await AsyncStorage.setItem(PAUSED_WORKOUT_KEY, JSON.stringify(pausedState));
      set({ 
        isPaused: true,
        elapsedTime,
        totalPausedTime,
        pauseStartTime,
      });
    } catch (error) {
      console.error('Failed to save paused workout:', error);
    }
  },

  resumeWorkout: () => {
    const { pauseStartTime, totalPausedTime } = get();
    const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
    
    set({ 
      isPaused: false,
      totalPausedTime: totalPausedTime + pauseDuration,
    });
  },

  discardPausedWorkout: async () => {
    try {
      await AsyncStorage.removeItem(PAUSED_WORKOUT_KEY);
      set({
        activeWorkout: null,
        currentRoundStartTime: null,
        isPaused: false,
        elapsedTime: 0,
        totalPausedTime: 0,
        pauseStartTime: 0,
      });
    } catch (error) {
      console.error('Failed to discard paused workout:', error);
    }
  },

  loadPausedWorkout: async () => {
    try {
      const savedState = await AsyncStorage.getItem(PAUSED_WORKOUT_KEY);
      if (!savedState) return false;

      const pausedState: PausedWorkoutState = JSON.parse(savedState);
      
      // Data migration: Add default ladderType and maxRounds if missing
      if (!pausedState.activeWorkout.ladderType) {
        pausedState.activeWorkout.ladderType = 'christmas';
        pausedState.activeWorkout.maxRounds = pausedState.activeWorkout.exercises.length;
      }
      
      // Convert date strings back to Date objects
      pausedState.activeWorkout.startTime = new Date(pausedState.activeWorkout.startTime);
      if (pausedState.currentRoundStartTime) {
        pausedState.currentRoundStartTime = new Date(pausedState.currentRoundStartTime);
      }
      pausedState.activeWorkout.rounds = pausedState.activeWorkout.rounds.map(round => ({
        ...round,
        startTime: new Date(round.startTime),
        endTime: round.endTime ? new Date(round.endTime) : undefined,
      }));

      set({
        activeWorkout: pausedState.activeWorkout,
        currentRoundStartTime: pausedState.currentRoundStartTime,
        isPaused: true,
        elapsedTime: pausedState.elapsedTime,
        totalPausedTime: pausedState.totalPausedTime,
        pauseStartTime: pausedState.pauseStartTime, // Use the saved pause start time
      });

      return true;
    } catch (error) {
      console.error('Failed to load paused workout:', error);
      return false;
    }
  },

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

  deleteWorkoutFromHistory: async (workoutId: string) => {
    const { workoutHistory } = get();
    const updatedHistory = workoutHistory.filter(w => w.id !== workoutId);
    await saveWorkoutHistory(updatedHistory);
    set({ workoutHistory: updatedHistory });
  },
}));