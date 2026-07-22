/**
 * Default exercise catalog with common CrossFit and functional fitness exercises.
 * Each exercise includes a suggested unit that will auto-fill when selected.
 */

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  suggestedUnit?: string; // 'reps', 'calories', 'meters', etc.
  supportsLoad?: boolean;
  isCustom: boolean;      // false for defaults, true for user-added
}

/**
 * Comprehensive list of default exercises
 */
export const DEFAULT_EXERCISES: Omit<ExerciseCatalogItem, 'id' | 'usageCount' | 'lastUsed'>[] = [
  // Gymnastics
  { name: 'Pull-ups', isCustom: false },
  { name: 'Push-ups', isCustom: false },
  { name: 'Air Squats', isCustom: false },
  { name: 'Burpees', isCustom: false },
  { name: 'Box Jumps', isCustom: false },
  { name: 'Muscle-ups', isCustom: false },
  { name: 'Handstand Push-ups', isCustom: false },
  { name: 'Toes-to-Bar', isCustom: false },
  { name: 'Knees-to-Elbows', isCustom: false },
  { name: 'Chest-to-Bar Pull-ups', isCustom: false },
  { name: 'Dips', isCustom: false },
  { name: 'Sit-ups', isCustom: false },
  { name: 'Wall Walks', isCustom: false },
  { name: 'Pistols', isCustom: false },
  { name: 'Lunges', isCustom: false },
  { name: 'Jump Rope Singles', isCustom: false },
  { name: 'Double Unders', isCustom: false },
  { name: 'Triple Unders', isCustom: false },
  
  // Weightlifting
  { name: 'Deadlifts', supportsLoad: true, isCustom: false },
  { name: 'Squats', supportsLoad: true, isCustom: false },
  { name: 'Front Squats', supportsLoad: true, isCustom: false },
  { name: 'Overhead Squats', supportsLoad: true, isCustom: false },
  { name: 'Thrusters', supportsLoad: true, isCustom: false },
  { name: 'Cleans', supportsLoad: true, isCustom: false },
  { name: 'Hang Cleans', supportsLoad: true, isCustom: false },
  { name: 'Power Cleans', supportsLoad: true, isCustom: false },
  { name: 'Clean and Jerks', supportsLoad: true, isCustom: false },
  { name: 'Snatches', supportsLoad: true, isCustom: false },
  { name: 'Hang Snatches', supportsLoad: true, isCustom: false },
  { name: 'Power Snatches', supportsLoad: true, isCustom: false },
  { name: 'Shoulder Press', supportsLoad: true, isCustom: false },
  { name: 'Push Press', supportsLoad: true, isCustom: false },
  { name: 'Push Jerks', supportsLoad: true, isCustom: false },
  { name: 'Bench Press', supportsLoad: true, isCustom: false },
  { name: 'Sumo Deadlift High Pulls', supportsLoad: true, isCustom: false },
  { name: 'Kettlebell Swings', supportsLoad: true, isCustom: false },
  { name: 'Goblet Squats', supportsLoad: true, isCustom: false },
  { name: 'Turkish Get-ups', supportsLoad: true, isCustom: false },
  { name: 'Dumbbell Thrusters', supportsLoad: true, isCustom: false },
  { name: 'Dumbbell Snatches', supportsLoad: true, isCustom: false },
  
  // Cardio
  { name: 'Run', suggestedUnit: 'meters', isCustom: false },
  { name: 'Row', suggestedUnit: 'calories', isCustom: false },
  { name: 'Bike', suggestedUnit: 'calories', isCustom: false },
  { name: 'Ski Erg', suggestedUnit: 'calories', isCustom: false },
  { name: 'Assault Bike', suggestedUnit: 'calories', isCustom: false },
  
  // Core & Other
  { name: 'Plank Hold', suggestedUnit: 'seconds', isCustom: false },
  { name: 'Hollow Hold', suggestedUnit: 'seconds', isCustom: false },
  { name: 'L-Sit', suggestedUnit: 'seconds', isCustom: false },
  { name: 'Russian Twists', isCustom: false },
  { name: 'V-ups', isCustom: false },
  { name: 'GHD Sit-ups', isCustom: false },
  { name: 'Back Extensions', isCustom: false },
  { name: 'Rope Climbs', isCustom: false },
  { name: 'Bear Crawls', suggestedUnit: 'meters', isCustom: false },
  { name: 'Farmers Carry', suggestedUnit: 'meters', supportsLoad: true, isCustom: false },
  { name: 'Sled Push', suggestedUnit: 'meters', supportsLoad: true, isCustom: false },
  { name: 'Sled Pull', suggestedUnit: 'meters', supportsLoad: true, isCustom: false },
];

/**
 * Storage key for exercise catalog
 */
export const EXERCISE_CATALOG_KEY = '@exercise_catalog';

/**
 * Storage key for tracking if default exercises have been initialized
 */
export const EXERCISES_INITIALIZED_KEY = '@exercises_initialized';

/**
 * Generate default exercises with proper IDs and initial values
 */
export const generateDefaultExercises = (): ExerciseCatalogItem[] => {
  return DEFAULT_EXERCISES.map((exercise, index) => ({
    ...exercise,
    supportsLoad: exercise.supportsLoad ?? false,
    id: `default_${index}`,
  }));
};
