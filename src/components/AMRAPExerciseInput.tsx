import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, IconButton, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';
import NumberStepper from './NumberStepper';
import AutocompleteExerciseInput from './AutocompleteExerciseInput';

interface AMRAPExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
  exerciseNumber: number;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

const AMRAPExerciseInput: React.FC<AMRAPExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
  exerciseNumber,
  scrollViewRef,
}) => {
  const theme = useTheme();
  const [showUnitInput, setShowUnitInput] = useState(false);

  const isDefaultUnit = !exercise.unit || exercise.unit === '';
  const isFixed = (exercise.stepSize === undefined || exercise.stepSize === 0);
  const progressionType = isFixed ? 'fixed' : 'increasing';

  const handleStartingRepsChange = (value: number) => {
    onChange({ ...exercise, startingReps: value });
  };

  const handleStepSizeChange = (value: number) => {
    onChange({ ...exercise, stepSize: value });
  };

  const handleProgressionTypeChange = (value: string) => {
    if (value === 'fixed') {
      onChange({ ...exercise, stepSize: 0 });
    } else {
      onChange({ ...exercise, stepSize: exercise.stepSize || 1 });
    }
  };

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
            {exerciseNumber}
          </Text>
        </View>
        <Text variant="bodySmall" style={[styles.positionLabel, { color: theme.colors.onSurfaceVariant }]}>
          Exercise {exerciseNumber}
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

      {/* Exercise Name + Unit Button Row */}
      <View style={styles.inputRow}>
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

      {/* Progression Type */}
      <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurface }]}>
        Progression Type
      </Text>
      <SegmentedButtons
        value={progressionType}
        onValueChange={handleProgressionTypeChange}
        buttons={[
          {
            value: 'fixed',
            label: 'Fixed',
            icon: 'minus',
          },
          {
            value: 'increasing',
            label: 'Increasing',
            icon: 'trending-up',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Starting Reps */}
      <NumberStepper
        label={isFixed ? 'Reps (each round)' : 'Starting Reps'}
        value={exercise.startingReps || 1}
        onChange={handleStartingRepsChange}
        min={1}
        max={1000}
        step={1}
      />

      {/* Step Size - only shown when increasing */}
      {!isFixed && (
        <NumberStepper
          label="Step Size (reps per round)"
          value={exercise.stepSize || 1}
          onChange={handleStepSizeChange}
          min={1}
          max={50}
          step={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  positionContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  position: {
    fontWeight: 'bold',
  },
  positionLabel: {
    flex: 0,
  },
  spacer: {
    flex: 1,
  },
  deleteButton: {
    margin: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  unitButton: {
    width: 80,
    height: 56,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitButtonIcon: {
    width: 56,
    height: 50,
    top: 3
  },
  unitIcon: {
    margin: 0,
  },
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unitText: {
    flex: 1,
    textAlign: 'center',
  },
  editIcon: {
    margin: 0,
    marginLeft: -8,
  },
  unitEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0,
    minWidth: 120,
  },
  unitTextInput: {
    flex: 1,
    minWidth: 80,
  },
  checkButton: {
    margin: 0,
  },
  label: {
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
});

export default AMRAPExerciseInput;
