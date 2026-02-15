import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { TextInput, IconButton, Text, useTheme, Icon } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';
import NumberStepper from './NumberStepper';
import AutocompleteExerciseInput from './AutocompleteExerciseInput';

interface FlexibleExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
  exerciseNumber: number;
  scrollViewRef?: React.RefObject<ScrollView>;
}

const FlexibleExerciseInput: React.FC<FlexibleExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
  exerciseNumber,
  scrollViewRef,
}) => {
  const theme = useTheme();
  const [showUnitInput, setShowUnitInput] = useState(false);
  const containerRef = useRef<View>(null);

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

  const handleExerciseNameFocus = () => {
    if (scrollViewRef?.current && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 64), animated: true });
          },
          () => {}
        );
      }, 150);
    }
  };

  return (
    <View ref={containerRef} style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
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
          onFocus={handleExerciseNameFocus}
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
      <View style={styles.customSegmentedButtons}>
        <TouchableOpacity
          onPress={() => handleDirectionChange('constant')}
          style={[
            styles.segmentButton,
            styles.segmentButtonLeft,
            { borderColor: theme.colors.outline },
            (exercise.direction || 'ascending') === 'constant' && [
              styles.segmentButtonSelected,
              { backgroundColor: theme.colors.secondaryContainer, flex: 1 }
            ],
          ]}
        >
          <Icon source="minus" size={20} color={(exercise.direction || 'ascending') === 'constant' ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant} />
          {(exercise.direction || 'ascending') === 'constant' && (
            <Text style={[styles.segmentButtonText, { color: theme.colors.onSecondaryContainer }]}>Fixed</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDirectionChange('ascending')}
          style={[
            styles.segmentButton,
            styles.segmentButtonMiddle,
            { borderColor: theme.colors.outline },
            (exercise.direction || 'ascending') === 'ascending' && [
              styles.segmentButtonSelected,
              { backgroundColor: theme.colors.secondaryContainer, flex: 1 }
            ],
          ]}
        >
          <Icon source="trending-up" size={20} color={(exercise.direction || 'ascending') === 'ascending' ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant} />
          {(exercise.direction || 'ascending') === 'ascending' && (
            <Text style={[styles.segmentButtonText, { color: theme.colors.onSecondaryContainer }]}>Increasing</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDirectionChange('descending')}
          style={[
            styles.segmentButton,
            styles.segmentButtonRight,
            { borderColor: theme.colors.outline },
            (exercise.direction || 'ascending') === 'descending' && [
              styles.segmentButtonSelected,
              { backgroundColor: theme.colors.secondaryContainer, flex: 1 }
            ],
          ]}
        >
          <Icon source="trending-down" size={20} color={(exercise.direction || 'ascending') === 'descending' ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant} />
          {(exercise.direction || 'ascending') === 'descending' && (
            <Text style={[styles.segmentButtonText, { color: theme.colors.onSecondaryContainer }]}>Decreasing</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Starting Reps / Fixed Value and Step Size Row */}
      <View style={styles.steppersRow}>
        <View style={styles.stepperContainer}>
          <NumberStepper
            label={exercise.direction === 'constant' ? 'Reps (each round)' : 'Starting Reps'}
            value={exercise.startingReps || 1}
            onChange={handleStartingRepsChange}
            min={1}
            max={1000}
            step={1}
          />
        </View>

        {/* Step Size - hidden for fixed */}
        {exercise.direction !== 'constant' && (
          <View style={styles.stepperContainer}>
            <NumberStepper
              label="Step Size"
              value={exercise.stepSize || 1}
              onChange={handleStepSizeChange}
              min={1}
              max={50}
              step={1}
            />
          </View>
        )}
      </View>
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
  customSegmentedButtons: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  segmentButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentButtonLeft: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderRightWidth: 0.5,
  },
  segmentButtonMiddle: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
  },
  segmentButtonRight: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: 0.5,
  },
  segmentButtonSelected: {
    borderWidth: 1,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  steppersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepperContainer: {
    flex: 1,
  },
});

export default FlexibleExerciseInput;
