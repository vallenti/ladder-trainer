import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ExerciseCatalogItem, 
  generateDefaultExercises, 
  EXERCISE_CATALOG_KEY, 
  EXERCISES_INITIALIZED_KEY 
} from '../constants/defaultExercises';

interface ExerciseStore {
  exercises: ExerciseCatalogItem[];
  isLoading: boolean;
  loadExercises: () => Promise<void>;
  addExercise: (name: string, unit?: string) => Promise<ExerciseCatalogItem>;
  addExerciseIfNotExists: (name: string, unit?: string) => Promise<ExerciseCatalogItem | null>;
  updateExercise: (id: string, updates: Partial<ExerciseCatalogItem>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  restoreDefaults: () => Promise<void>;
  searchExercises: (query: string) => ExerciseCatalogItem[];
  getDefaultExercises: () => ExerciseCatalogItem[];
  getCustomExercises: () => ExerciseCatalogItem[];
}

/**
 * Simple fuzzy search helper
 */
const fuzzyMatch = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match or starts with gets priority
  if (lowerText.includes(lowerQuery)) {
    return true;
  }
  
  // Fuzzy match: check if all query characters appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
};

/**
 * Score for sorting search results
 */
const getSearchScore = (exercise: ExerciseCatalogItem, query: string): number => {
  const lowerName = exercise.name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match = highest priority
  if (lowerName === lowerQuery) return 1000;
  
  // Starts with query = high priority
  if (lowerName.startsWith(lowerQuery)) return 500;
  
  // Contains query = medium priority
  if (lowerName.includes(lowerQuery)) return 250;
  
  // Fuzzy match = lower priority
  return 0;
};

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: [],
  isLoading: false,

  loadExercises: async () => {
    set({ isLoading: true });
    
    try {
      // Check if exercises have been initialized
      const initialized = await AsyncStorage.getItem(EXERCISES_INITIALIZED_KEY);
      
      if (!initialized) {
        // First launch: initialize with defaults
        const defaultExercises = generateDefaultExercises();
        await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(defaultExercises));
        await AsyncStorage.setItem(EXERCISES_INITIALIZED_KEY, 'true');
        set({ exercises: defaultExercises, isLoading: false });
        return;
      }
      
      // Load existing exercises
      const stored = await AsyncStorage.getItem(EXERCISE_CATALOG_KEY);
      if (stored) {
        const exercises: ExerciseCatalogItem[] = JSON.parse(stored);
        set({ exercises, isLoading: false });
      } else {
        // Fallback: initialize with defaults if storage is empty
        const defaultExercises = generateDefaultExercises();
        await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(defaultExercises));
        set({ exercises: defaultExercises, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
      set({ isLoading: false });
    }
  },

  addExercise: async (name: string, unit?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Exercise name cannot be empty');
    }

    // Check if exercise already exists (case-insensitive)
    const existing = get().exercises.find(
      ex => ex.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    const newExercise: ExerciseCatalogItem = {
      id: `custom_${Date.now()}`,
      name: trimmedName,
      suggestedUnit: unit,
      isCustom: true,
    };

    const exercises = [...get().exercises, newExercise];
    await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(exercises));
    set({ exercises });
    
    return newExercise;
  },

  addExerciseIfNotExists: async (name: string, unit?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return null;
    }

    // Check if exercise already exists (case-insensitive)
    const existing = get().exercises.find(
      ex => ex.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return null;
    }

    // Add new custom exercise
    return await get().addExercise(trimmedName, unit);
  },

  updateExercise: async (id: string, updates: Partial<ExerciseCatalogItem>) => {
    const exercises = get().exercises.map(ex =>
      ex.id === id ? { ...ex, ...updates } : ex
    );
    await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(exercises));
    set({ exercises });
  },

  deleteExercise: async (id: string) => {
    const exercises = get().exercises.filter(ex => ex.id !== id);
    await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(exercises));
    set({ exercises });
  },

  restoreDefaults: async () => {
    const defaultExercises = generateDefaultExercises();
    const customExercises = get().exercises.filter(ex => ex.isCustom);
    
    // Merge defaults with custom exercises
    const exercises = [...defaultExercises, ...customExercises];
    
    await AsyncStorage.setItem(EXERCISE_CATALOG_KEY, JSON.stringify(exercises));
    set({ exercises });
  },

  searchExercises: (query: string) => {
    if (!query.trim()) {
      // No query: return all sorted alphabetically
      return get().exercises.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Filter with fuzzy matching
    const matched = get().exercises.filter(ex => fuzzyMatch(ex.name, query));
    
    // Sort by relevance score
    return matched.sort((a, b) => getSearchScore(b, query) - getSearchScore(a, query));
  },

  getDefaultExercises: () => {
    return get().exercises.filter(ex => !ex.isCustom);
  },

  getCustomExercises: () => {
    return get().exercises.filter(ex => ex.isCustom);
  },
}));
