/**
 * Default exercise catalog with common CrossFit and functional fitness exercises.
 * Each exercise includes a suggested unit that will auto-fill when selected.
 */

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  suggestedUnit?: string; // 'reps', 'calories', 'meters', etc.
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
  { name: 'Deadlifts', isCustom: false },
  { name: 'Squats', isCustom: false },
  { name: 'Front Squats', isCustom: false },
  { name: 'Overhead Squats', isCustom: false },
  { name: 'Thrusters', isCustom: false },
  { name: 'Cleans', isCustom: false },
  { name: 'Hang Cleans', isCustom: false },
  { name: 'Power Cleans', isCustom: false },
  { name: 'Clean and Jerks', isCustom: false },
  { name: 'Snatches', isCustom: false },
  { name: 'Hang Snatches', isCustom: false },
  { name: 'Power Snatches', isCustom: false },
  { name: 'Shoulder Press', isCustom: false },
  { name: 'Push Press', isCustom: false },
  { name: 'Push Jerks', isCustom: false },
  { name: 'Bench Press', isCustom: false },
  { name: 'Sumo Deadlift High Pulls', isCustom: false },
  { name: 'Kettlebell Swings', isCustom: false },
  { name: 'Goblet Squats', isCustom: false },
  { name: 'Turkish Get-ups', isCustom: false },
  { name: 'Dumbbell Thrusters', isCustom: false },
  { name: 'Dumbbell Snatches', isCustom: false },
  
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
  { name: 'Farmers Carry', suggestedUnit: 'meters', isCustom: false },
  { name: 'Sled Push', suggestedUnit: 'meters', isCustom: false },
  { name: 'Sled Pull', suggestedUnit: 'meters', isCustom: false },
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
    id: `default_${index}`,
  }));
};
