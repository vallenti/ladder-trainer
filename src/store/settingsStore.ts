import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { WeightUnit } from '../types';

const WEIGHT_UNIT_KEY = '@preferred_weight_unit';

interface SettingsState {
  preferredWeightUnit: WeightUnit;
  loadWeightUnit: () => Promise<void>;
  setPreferredWeightUnit: (unit: WeightUnit) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  preferredWeightUnit: 'kg',
  loadWeightUnit: async () => {
    const saved = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
    if (saved === 'kg' || saved === 'lb') set({ preferredWeightUnit: saved });
  },
  setPreferredWeightUnit: async (preferredWeightUnit) => {
    await AsyncStorage.setItem(WEIGHT_UNIT_KEY, preferredWeightUnit);
    set({ preferredWeightUnit });
  },
}));
