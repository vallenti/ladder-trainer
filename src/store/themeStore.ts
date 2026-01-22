import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loadThemePreference: () => Promise<void>;
}

const THEME_STORAGE_KEY = '@ladder_trainer_theme_mode';

export const useThemeStore = create<ThemeStore>((set) => ({
  themeMode: 'light',

  setThemeMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ themeMode: mode });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  },

  loadThemePreference: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode = (savedMode as ThemeMode) || 'light';
      set({ themeMode: mode });
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  },
}));
