import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { Exercise, WeightUnit } from '../types';
import { useExerciseStore } from '../store/exerciseStore';
import { useSettingsStore } from '../store/settingsStore';
import { roundedDisplayWeight, toKg } from '../utils/weight';
import { spacing } from '../constants/theme';

interface Props { exercise: Exercise; onChange: (exercise: Exercise) => void; }

const LoadInput: React.FC<Props> = ({ exercise, onChange }) => {
  const theme = useTheme();
  const catalogItem = useExerciseStore(state => state.exercises.find(item => item.name.toLowerCase() === exercise.name.trim().toLowerCase()));
  const preferredUnit = useSettingsStore(state => state.preferredWeightUnit);
  const [enabled, setEnabled] = useState(Boolean(exercise.load));
  const unit = exercise.load?.displayUnit ?? preferredUnit;
  const value = exercise.load ? String(roundedDisplayWeight(exercise.load.valueKg, unit)) : '';

  useEffect(() => setEnabled(Boolean(exercise.load)), [exercise.load]);
  // An exercise typed directly into a workout is not in the catalog yet, so let
  // the user decide here. Saving the workout then adds it to the catalog.
  if (catalogItem && !catalogItem.supportsLoad) return null;

  const toggle = (next: boolean) => {
    setEnabled(next);
    onChange(next ? { ...exercise, load: { valueKg: 0, displayUnit: preferredUnit } } : { ...exercise, load: undefined });
  };
  const setValue = (text: string) => {
    const parsed = Number(text.replace(',', '.'));
    onChange({ ...exercise, load: { valueKg: Number.isFinite(parsed) ? toKg(parsed, unit) : 0, displayUnit: unit } });
  };
  const toggleUnit = () => {
    const nextUnit: WeightUnit = unit === 'kg' ? 'lb' : 'kg';
    const kg = exercise.load?.valueKg ?? 0;
    onChange({ ...exercise, load: { valueKg: kg, displayUnit: nextUnit } });
  };
  return <View style={styles.container}>
    <View style={styles.header}><Text variant="bodyMedium">External load</Text><Switch value={enabled} onValueChange={toggle} /></View>
    {enabled && <View style={styles.row}>
      <TextInput label="Load" mode="outlined" keyboardType="decimal-pad" value={value} onChangeText={setValue} style={styles.input} />
      <TouchableOpacity
        onPress={toggleUnit}
        style={[styles.unitButton, { borderColor: theme.colors.outline }]}
      >
        <Text variant="bodyMedium" style={[styles.unitText, { color: theme.colors.onSurface }]}>
          {unit}
        </Text>
      </TouchableOpacity>
    </View>}
  </View>;
};
const styles = StyleSheet.create({
  container: { marginTop: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  input: { flex: 1 },
  // Matches the exercise-unit edit button used throughout workout editing.
  unitButton: {
    width: 80,
    height: 56,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitText: {
    textAlign: 'center',
  },
});
export default LoadInput;
