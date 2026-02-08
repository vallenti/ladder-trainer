import { create } from 'zustand';
import { Workout, Round, Template } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutHistoryStore } from './workoutHistoryStore';

const PAUSED_WORKOUT_KEY = '@ladder_trainer_paused_workout';

interface PausedWorkoutState {
  activeWorkout: Workout;
  currentRoundStartTime: Date | null;
  elapsedTime: number;
  totalPausedTime: number;
  pauseStartTime: number;
  isTimerFocusMode: boolean;
}

interface ActiveWorkoutStore {
  activeWorkout: Workout | null;
  currentRoundStartTime: Date | null;
  isPaused: boolean;
  elapsedTime: number;
  totalPausedTime: number;
  pauseStartTime: number;
  isMuted: boolean;
  isTimerFocusMode: boolean;
  
  startWorkout: (template: Template) => void;
  toggleMute: () => void;
  setTimerFocusMode: (isTimerFocusMode: boolean) => void;
  completeBuyIn: () => void;
  completeBuyOut: () => void;
  completeRound: () => void;
  startNextRound: () => void;
  completeWorkout: () => Promise<void>;
  pauseWorkout: (elapsedTime: number, totalPausedTime: number) => Promise<void>;
  resumeWorkout: () => void;
  discardPausedWorkout: () => Promise<void>;
  loadPausedWorkout: () => Promise<boolean>;
}

export const useActiveWorkoutStore = create<ActiveWorkoutStore>((set, get) => ({
  activeWorkout: null,
  currentRoundStartTime: null,
  isPaused: false,
  elapsedTime: 0,
  totalPausedTime: 0,
  pauseStartTime: 0,
  isMuted: false,
  isTimerFocusMode: false,

  startWorkout: (template: Template) => {
    const workout: Workout = {
      id: Date.now().toString(),
      templateName: template.name,
      exercises: template.exercises,
      restPeriodSeconds: template.restPeriodSeconds,
      ladderType: template.ladderType,
      maxRounds: template.maxRounds,
      stepSize: template.stepSize,
      startingReps: template.startingReps,
      timeCap: template.timeCap,
      // Buy In/Out
      hasBuyInOut: template.hasBuyInOut,
      buyInOutExercise: template.buyInOutExercise,
      buyInOutRestSeconds: template.buyInOutRestSeconds,
      buyInCompleted: false,
      buyOutCompleted: false,
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

  completeBuyIn: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        buyInCompleted: true,
      },
    });
  },

  completeBuyOut: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        buyOutCompleted: true,
      },
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
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const endTime = new Date();
    const totalTime = (endTime.getTime() - activeWorkout.startTime.getTime()) / 1000;

    const completedWorkout: Workout = {
      ...activeWorkout,
      endTime,
      totalTime,
      status: 'completed',
    };

    // Add to workout history store
    await useWorkoutHistoryStore.getState().addWorkout(completedWorkout);

    // Clear paused workout from storage
    await AsyncStorage.removeItem(PAUSED_WORKOUT_KEY);

    set({
      activeWorkout: null,
      currentRoundStartTime: null,
      isPaused: false,
      elapsedTime: 0,
      totalPausedTime: 0,
      pauseStartTime: 0,
    });
  },

  pauseWorkout: async (elapsedTime: number, totalPausedTime: number) => {
    const { activeWorkout, currentRoundStartTime, isTimerFocusMode } = get();
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
      isTimerFocusMode,
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
        isTimerFocusMode: pausedState.isTimerFocusMode || false, // Restore view mode, default to false for old saved states
      });

      return true;
    } catch (error) {
      console.error('Failed to load paused workout:', error);
      return false;
    }
  },

  toggleMute: () => {
    const { isMuted } = get();
    set({ isMuted: !isMuted });
  },

  setTimerFocusMode: (isTimerFocusMode: boolean) => {
    set({ isTimerFocusMode });
  },
}));