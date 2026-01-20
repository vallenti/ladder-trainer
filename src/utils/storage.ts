import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, Workout } from '../types';

const TEMPLATES_KEY = '@templates';
const WORKOUTS_KEY = '@workouts';

export const loadTemplates = async (): Promise<Template[]> => {
  try {
    const data = await AsyncStorage.getItem(TEMPLATES_KEY);
    if (!data) return [];
    const templates = JSON.parse(data);
    // Convert date strings back to Date objects
    return templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
    }));
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
};

export const saveTemplates = async (templates: Template[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates:', error);
  }
};

export const loadWorkouts = async (): Promise<Workout[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!data) return [];
    const workouts = JSON.parse(data);
    // Convert date strings back to Date objects
    return workouts.map((w: any) => ({
      ...w,
      startTime: new Date(w.startTime),
      endTime: w.endTime ? new Date(w.endTime) : undefined,
      rounds: w.rounds.map((r: any) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime: r.endTime ? new Date(r.endTime) : undefined,
      })),
    }));
  } catch (error) {
    console.error('Error loading workouts:', error);
    return [];
  }
};

export const saveWorkouts = async (workouts: Workout[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts:', error);
  }
};