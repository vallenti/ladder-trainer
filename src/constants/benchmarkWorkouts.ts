import { Template } from '../types';

/**
 * Predefined benchmark workouts that come with the app.
 * These serve as examples of different workout types and capabilities.
 * Users can modify or delete these, and restore them using the restore feature.
 */

export const BENCHMARK_WORKOUTS: Omit<Template, 'id' | 'createdAt'>[] = [
  // ============ DESCENDING LADDER ============
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
  
  // ============ CHRISTMAS LADDER ============
  {
    name: '12 Days',
    ladderType: 'christmas',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
      },
      {
        position: 2,
        name: 'Box Jumps',
        unit: 'reps',
      },
      {
        position: 3,
        name: 'Kettlebell Swings',
        unit: 'reps',
      },
      {
        position: 4,
        name: 'Wall Balls',
        unit: 'reps',
      },
      {
        position: 5,
        name: 'Double Unders',
        unit: 'reps',
      },
      {
        position: 6,
        name: 'Pull-ups',
        unit: 'reps',
      },
      {
        position: 7,
        name: 'Push-ups',
        unit: 'reps',
      },
      {
        position: 8,
        name: 'Sit-ups',
        unit: 'reps',
      },
      {
        position: 9,
        name: 'Air Squats',
        unit: 'reps',
      },
      {
        position: 10,
        name: 'Lunges',
        unit: 'reps',
      },
      {
        position: 11,
        name: 'Mountain Climbers',
        unit: 'reps',
      },
      {
        position: 12,
        name: 'Jumping Jacks',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 12,
  },
  {
    name: 'Christmas Sprint',
    ladderType: 'christmas',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
      },
      {
        position: 2,
        name: 'Thrusters',
        unit: 'reps',
      },
      {
        position: 3,
        name: 'Pull-ups',
        unit: 'reps',
      },
      {
        position: 4,
        name: 'Box Jumps',
        unit: 'reps',
      },
      {
        position: 5,
        name: 'Kettlebell Swings',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 5,
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Run',
      unit: 'meters',
    },
    buyInOutRestSeconds: 60,
  },

  // ============ ASCENDING LADDER ============
  {
    name: 'Build Up',
    ladderType: 'ascending',
    exercises: [
      {
        position: 1,
        name: 'Double Unders',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 30,
    maxRounds: 10,
    startingReps: 10,
    stepSize: 10, // 10, 20, 30, 40, 50...
  },
  {
    name: 'Row & Jump',
    ladderType: 'ascending',
    exercises: [
      {
        position: 1,
        name: 'Wall Balls',
        unit: 'reps',
      },
      {
        position: 2,
        name: 'Box Jumps',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 45,
    maxRounds: 8,
    startingReps: 5,
    stepSize: 5, // 5, 10, 15, 20...
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Row',
      unit: 'meters',
    },
    buyInOutRestSeconds: 90,
  },

  // ============ PYRAMID LADDER ============
  {
    name: 'The Peak',
    ladderType: 'pyramid',
    exercises: [
      {
        position: 1,
        name: 'Pull-ups',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 30,
    maxRounds: 9,
    startingReps: 1,
    stepSize: 1, // 1, 2, 3, 4, 5, 4, 3, 2, 1
  },
  {
    name: 'Pyramid Power',
    ladderType: 'pyramid',
    exercises: [
      {
        position: 1,
        name: 'Air Squats',
        unit: 'reps',
      },
      {
        position: 2,
        name: 'Push-ups',
        unit: 'reps',
      },
    ],
    restPeriodSeconds: 20,
    maxRounds: 7,
    startingReps: 2,
    stepSize: 2, // 2, 4, 6, 8, 6, 4, 2
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Sit-ups',
      unit: 'reps',
    },
    buyInOutRestSeconds: 30,
  },

  // ============ FLEXIBLE LADDER ============
  {
    name: 'Mixed Signals',
    ladderType: 'flexible',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
        direction: 'ascending',
        startingReps: 5,
        stepSize: 5, // 5, 10, 15, 20, 25
      },
      {
        position: 2,
        name: 'Pull-ups',
        unit: 'reps',
        direction: 'descending',
        startingReps: 20,
        stepSize: 4, // 20, 16, 12, 8, 4
      },
      {
        position: 3,
        name: 'Box Jumps',
        unit: 'reps',
        direction: 'constant',
        startingReps: 15,
        stepSize: 0, // 15, 15, 15, 15, 15
      },
    ],
    restPeriodSeconds: 60,
    maxRounds: 5,
  },

  // ============ CHIPPER ============
  {
    name: 'The Grinder',
    ladderType: 'chipper',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
        fixedReps: 50,
      },
      {
        position: 2,
        name: 'Wall Balls',
        unit: 'reps',
        fixedReps: 40,
      },
      {
        position: 3,
        name: 'Box Jumps',
        unit: 'reps',
        fixedReps: 30,
      },
      {
        position: 4,
        name: 'Pull-ups',
        unit: 'reps',
        fixedReps: 20,
      },
      {
        position: 5,
        name: 'Thrusters',
        unit: 'reps',
        fixedReps: 10,
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 5,
  },
  {
    name: 'Row & Chipper',
    ladderType: 'chipper',
    exercises: [
      {
        position: 1,
        name: 'Double Unders',
        unit: 'reps',
        fixedReps: 100,
      },
      {
        position: 2,
        name: 'Kettlebell Swings',
        unit: 'reps',
        fixedReps: 75,
      },
      {
        position: 3,
        name: 'Push-ups',
        unit: 'reps',
        fixedReps: 50,
      },
      {
        position: 4,
        name: 'Sit-ups',
        unit: 'reps',
        fixedReps: 25,
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 4,
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Row',
      unit: 'calories',
    },
    buyInOutRestSeconds: 120,
  },

  // ============ AMRAP ============
  {
    name: 'Cindy',
    ladderType: 'amrap',
    exercises: [
      {
        position: 1,
        name: 'Pull-ups',
        unit: 'reps',
        repsPerRound: 5,
      },
      {
        position: 2,
        name: 'Push-ups',
        unit: 'reps',
        repsPerRound: 10,
      },
      {
        position: 3,
        name: 'Air Squats',
        unit: 'reps',
        repsPerRound: 15,
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 999,
    timeCap: 1200, // 20 minutes
  },
  {
    name: 'AMRAP Challenge',
    ladderType: 'amrap',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
        repsPerRound: 10,
      },
      {
        position: 2,
        name: 'Wall Balls',
        unit: 'reps',
        repsPerRound: 15,
      },
      {
        position: 3,
        name: 'Box Jumps',
        unit: 'reps',
        repsPerRound: 12,
      },
    ],
    restPeriodSeconds: 0,
    maxRounds: 999,
    timeCap: 900, // 15 minutes
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Run',
      unit: 'meters',
    },
    buyInOutRestSeconds: 90,
  },

  // ============ FOR REPS ============
  {
    name: 'The Repeater',
    ladderType: 'forreps',
    exercises: [
      {
        position: 1,
        name: 'Kettlebell Swings',
        unit: 'reps',
        repsPerRound: 15,
      },
      {
        position: 2,
        name: 'Box Jumps',
        unit: 'reps',
        repsPerRound: 12,
      },
      {
        position: 3,
        name: 'Thrusters',
        unit: 'reps',
        repsPerRound: 9,
      },
    ],
    restPeriodSeconds: 90,
    maxRounds: 5,
  },
  {
    name: 'Row & Repeat',
    ladderType: 'forreps',
    exercises: [
      {
        position: 1,
        name: 'Burpees',
        unit: 'reps',
        repsPerRound: 20,
      },
      {
        position: 2,
        name: 'Pull-ups',
        unit: 'reps',
        repsPerRound: 15,
      },
      {
        position: 3,
        name: 'Wall Balls',
        unit: 'reps',
        repsPerRound: 10,
      },
    ],
    restPeriodSeconds: 120,
    maxRounds: 4,
    hasBuyInOut: true,
    buyInOutExercise: {
      position: 0,
      name: 'Row',
      unit: 'meters',
    },
    buyInOutRestSeconds: 60,
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
