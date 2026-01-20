import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, Workout } from '../types';

const WORKOUTS_KEY = '@workouts';
const WORKOUT_HISTORY_KEY = '@workout_history';

export const loadWorkouts = async (): Promise<Template[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!data) return [];
    const workouts = JSON.parse(data);
    // Convert date strings back to Date objects
    return workouts.map((w: any) => ({
      ...w,
      createdAt: new Date(w.createdAt),
    }));
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
};

export const saveWorkouts = async (workouts: Template[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts:', error);
  }
};

export const loadWorkoutHistory = async (): Promise<Workout[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
    if (!data) return [];
    const history = JSON.parse(data);
    return history.map((w: any) => ({
      ...w,
      startTime: new Date(w.startTime),
      endTime: w.endTime ? new Date(w.endTime) : undefined,
      rounds: w.rounds?.map((r: any) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: r.endTime ? new Date(r.endTime) : undefined,
      })),
    }));
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
};

export const saveWorkoutHistory = async (history: Workout[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving workout history:', error);
  }
};