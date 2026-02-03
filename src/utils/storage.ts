import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, Workout } from '../types';
import { generateBenchmarkWorkouts, BENCHMARKS_INITIALIZED_KEY } from '../constants/benchmarkWorkouts';

const WORKOUTS_KEY = '@workouts';
const WORKOUT_HISTORY_KEY = '@workout_history';

export const loadWorkouts = async (): Promise<Template[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!data) return [];
    const workouts = JSON.parse(data);
    
    // Filter out any workouts that fail to parse
    const validWorkouts: Template[] = [];
    
    for (const w of workouts) {
      try {
        const workout = {
          ...w,
          createdAt: new Date(w.createdAt),
        };
        validWorkouts.push(workout);
      } catch (itemError) {
        console.warn('Skipping invalid workout template:', itemError);
        // Continue processing other workouts instead of failing completely
      }
    }
    
    return validWorkouts;
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
    
    // Filter out any workouts that fail to parse
    const validWorkouts: Workout[] = [];
    
    for (const w of history) {
      try {
        const workout = {
          ...w,
          startTime: new Date(w.startTime),
          endTime: w.endTime ? new Date(w.endTime) : undefined,
          rounds: w.rounds?.map((r: any) => ({
            ...r,
            startTime: new Date(r.startTime),
            endTime: r.endTime ? new Date(r.endTime) : undefined,
          })) || [],
        };
        validWorkouts.push(workout);
      } catch (itemError) {
        console.warn('Skipping invalid workout entry:', itemError);
        // Continue processing other workouts instead of failing completely
      }
    }
    
    return validWorkouts;
  } catch (error) {
    console.error('Error loading workout history:', error);
    // Don't return empty array - try to recover the raw data
    try {
      const data = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
      console.log('Raw workout history data exists, but failed to parse. Data length:', data?.length);
    } catch (e) {
      console.error('Could not even retrieve raw data');
    }
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

/**
 * Initialize benchmark workouts on first app launch
 */
export const initializeBenchmarkWorkouts = async (): Promise<void> => {
  try {
    const initialized = await AsyncStorage.getItem(BENCHMARKS_INITIALIZED_KEY);
    
    if (!initialized) {
      const existingWorkouts = await loadWorkouts();
      const benchmarkWorkouts = generateBenchmarkWorkouts();
      
      const allWorkouts = [...benchmarkWorkouts, ...existingWorkouts];
      await saveWorkouts(allWorkouts);
      await AsyncStorage.setItem(BENCHMARKS_INITIALIZED_KEY, 'true');
    }
  } catch (error) {
    console.error('Error initializing benchmark workouts:', error);
  }
};

/**
 * Restore benchmark workouts to their original state
 * Removes any modified versions and adds fresh copies
 */
export const restoreBenchmarkWorkouts = async (): Promise<void> => {
  try {
    const existingWorkouts = await loadWorkouts();
    const benchmarkWorkouts = generateBenchmarkWorkouts();
    
    // Remove all existing benchmark workouts
    const customWorkouts = existingWorkouts.filter(w => !w.id.startsWith('benchmark_'));
    
    // Add fresh benchmark workouts
    const allWorkouts = [...benchmarkWorkouts, ...customWorkouts];
    await saveWorkouts(allWorkouts);
  } catch (error) {
    console.error('Error restoring benchmark workouts:', error);
    throw error;
  }
};
