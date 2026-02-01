import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, IconButton, Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';
import NumberStepper from './NumberStepper';

interface FlexibleExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
  exerciseNumber: number;
}

const FlexibleExerciseInput: React.FC<FlexibleExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
  exerciseNumber,
}) => {
  const theme = useTheme();
  const [showUnitInput, setShowUnitInput] = useState(false);

  const isDefaultUnit = !exercise.unit || exercise.unit === '';

  const handleFieldChange = (field: keyof Exercise, value: string) => {
    onChange({ ...exercise, [field]: value });
  };

  const handleDirectionChange = (value: string) => {
    onChange({ ...exercise, direction: value as 'ascending' | 'descending' | 'constant' });
  };

  const handleStartingRepsChange = (value: number) => {
    onChange({ ...exercise, startingReps: value });
  };

  const handleStepSizeChange = (value: number) => {
    onChange({ ...exercise, stepSize: value });
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
        <TextInput
          mode="outlined"
          label="Exercise Name"
          value={exercise.name}
          onChangeText={(name) => onChange({ ...exercise, name })}
          style={styles.nameInput}
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

      {/* Direction */}
      <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurface }]}>
        Direction
      </Text>
      <SegmentedButtons
        value={exercise.direction || 'ascending'}
        onValueChange={handleDirectionChange}
        buttons={[
          {
            value: 'ascending',
            icon: 'arrow-up',
          },
          {
            value: 'descending',
            icon: 'arrow-down',
          },
          {
            value: 'constant',
            icon: 'minus',
          },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Starting Reps / Value */}
      <NumberStepper
        label={exercise.direction === 'constant' ? 'Value' : 'Starting Reps'}
        value={exercise.startingReps || 1}
        onChange={handleStartingRepsChange}
        min={1}
        max={1000}
        step={1}
      />

      {/* Step Size - hidden for constant */}
      {exercise.direction !== 'constant' && (
        <NumberStepper
          label="Step Size"
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
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  unitButton: {
    borderWidth: 1,
    borderRadius: 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: 0,
  },
  unitButtonIcon: {
    width: 50,
    paddingHorizontal: 0,
  },
  unitIcon: {
    margin: 0,
  },
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  unitText: {
    fontWeight: '500',
  },
  editIcon: {
    margin: 0,
  },
  unitEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  unitTextInput: {
    flex: 1,
  },
  checkButton: {
    margin: 0,
  },
  label: {
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
});

export default FlexibleExerciseInput;
