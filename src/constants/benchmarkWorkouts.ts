import { Template } from '../types';

/**
 * Predefined benchmark workouts that come with the app.
 * These serve as examples of different workout types and capabilities.
 * Users can modify or delete these, and restore them using the restore feature.
 */

export const BENCHMARK_WORKOUTS: Omit<Template, 'id' | 'createdAt'>[] = [
  {
    name: 'Fran',
    ladderType: 'descending',
    exercises: [
      {
        position: 1,
        name: 'Thrusters',
        unit: 'reps',
      },
      {
        position: 2,
        name: 'Pull-ups',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 3,
    startingReps: 21,
    stepSize: 6, // 21 -> 15 -> 9 (decrease by 6 each round)
  },
];

/**
 * Prefix used to identify benchmark workout IDs.
 * Format: benchmark_<timestamp>
 */
export const BENCHMARK_ID_PREFIX = 'benchmark_';

/**
 * Storage key for tracking if benchmarks have been initialized
 */
export const BENCHMARKS_INITIALIZED_KEY = '@benchmarks_initialized';

/**
 * Check if a workout ID indicates it's a benchmark workout
 */
export const isBenchmarkWorkout = (id: string): boolean => {
  return id.startsWith(BENCHMARK_ID_PREFIX);
};

/**
 * Generate benchmark workouts with proper IDs
 */
export const generateBenchmarkWorkouts = (): Template[] => {
  return BENCHMARK_WORKOUTS.map((workout, index) => ({
    ...workout,
    id: `${BENCHMARK_ID_PREFIX}${index}`,
    createdAt: new Date(),
  }));
};
