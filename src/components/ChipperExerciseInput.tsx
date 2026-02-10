import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, IconButton, Text, useTheme } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';
import AutocompleteExerciseInput from './AutocompleteExerciseInput';

interface ChipperExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

const ChipperExerciseInput: React.FC<ChipperExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
  scrollViewRef,
}) => {
  const theme = useTheme();
  const [showUnitInput, setShowUnitInput] = useState(false);

  const isDefaultUnit = !exercise.unit || exercise.unit === '';

  const handleOpenUnitEdit = () => {
    setShowUnitInput(true);
  };

  const handleCloseUnitEdit = () => {
    setShowUnitInput(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
      {/* Header Row: Position + Delete */}
      <View style={styles.headerRow}>
        <View style={[styles.positionContainer, { backgroundColor: theme.colors.primary }]}>
          <Text variant="titleMedium" style={[styles.position, { color: '#FFFFFF' }]}>
            {exercise.position}
          </Text>
        </View>
        <Text variant="bodySmall" style={[styles.positionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Exercise {exercise.position}
        </Text>
        <View style={styles.spacer} />
        {canDelete && (
          <IconButton
            icon="close"
            size={20}
            onPress={onDelete}
            style={styles.deleteButton}
          />
        )}
      </View>

      {/* Exercise Name + Count Row */}
      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          label="Count"
          value={exercise.fixedReps?.toString() || ''}
          onChangeText={(value) => {
            const numValue = parseInt(value, 10);
            onChange({ 
              ...exercise, 
              fixedReps: isNaN(numValue) ? 0 : numValue 
            });
          }}
          keyboardType="numeric"
          style={styles.countInput}
        />

        {!showUnitInput ? (
          <TouchableOpacity 
            onPress={handleOpenUnitEdit} 
            style={[
              styles.unitButton,
              { borderColor: theme.colors.outline },
              isDefaultUnit && styles.unitButtonIcon
            ]}
          >
            {isDefaultUnit ? (
              <IconButton
                icon="pencil"
                size={20}
                style={styles.unitIcon}
              />
            ) : (
              <View style={styles.unitButtonContent}>
                <Text variant="bodyMedium" style={[styles.unitText, { color: theme.colors.onSurface }]}>
                  {exercise.unit}
                </Text>
                <IconButton
                  icon="pencil"
                  size={16}
                  style={styles.editIcon}
                />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.unitEditContainer}>
            <TextInput
              mode="outlined"
              label="Unit"
              value={exercise.unit}
              onChangeText={(unit) => onChange({ ...exercise, unit })}
              style={styles.unitTextInput}
            />
            <IconButton
              icon="check"
              size={20}
              onPress={handleCloseUnitEdit}
              style={styles.checkButton}
            />
          </View>
        )}
      </View>

      {/* Exercise Name Input */}
      <AutocompleteExerciseInput
        label="Exercise Name"
        value={exercise.name}
        onChangeText={(name) => onChange({ ...exercise, name })}
        onSelectExercise={(selectedExercise) => {
          onChange({ 
            ...exercise, 
            name: selectedExercise.name,
            unit: selectedExercise.suggestedUnit || exercise.unit,
          });
        }}
        style={styles.nameInput}
        maxLength={100}
        scrollViewRef={scrollViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  positionContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  position: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  positionLabel: {
    fontSize: 12,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    margin: 0,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  countInput: {
    flex: 0.3,
    minWidth: 80,
  },
  unitButton: {
    flex: 0.7,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
    height: 48,
    top:5,
  },
  unitButtonIcon: {
    paddingVertical: spacing.sm,
  },
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  unitText: {
    fontWeight: '600',
  },
  unitIcon: {
    margin: 0,
  },
  editIcon: {
    margin: 0,
    marginLeft: spacing.xs,
  },
  unitEditContainer: {
    flex: 0.7,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  unitTextInput: {
    flex: 1,
  },
  checkButton: {
    margin: 0,
  },
  nameInput: {
    marginBottom: 0,
  },
});

export default ChipperExerciseInput;
