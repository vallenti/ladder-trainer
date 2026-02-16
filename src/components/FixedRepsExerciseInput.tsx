import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { TextInput, IconButton, Text, useTheme } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';
import NumberStepper from './NumberStepper';
import AutocompleteExerciseInput from './AutocompleteExerciseInput';

interface FixedRepsExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
  repsProperty?: 'fixedReps' | 'repsPerRound';
  scrollViewRef?: React.RefObject<ScrollView>;
}

const FixedRepsExerciseInput: React.FC<FixedRepsExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
  repsProperty = 'fixedReps',
  scrollViewRef,
}) => {
  const theme = useTheme();
  const [showUnitInput, setShowUnitInput] = useState(false);
  const containerRef = useRef<View>(null);

  const isDefaultUnit = !exercise.unit || exercise.unit === '';

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

  const handleCountChange = (value: number) => {
    onChange({ ...exercise, [repsProperty]: value });
  };

  const repsValue = (exercise[repsProperty] as number) || 1;

  return (
    <View ref={containerRef} style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
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

      {/* Count Field */}
      <NumberStepper
        label="Reps"
        value={repsValue}
        onChange={handleCountChange}
        min={1}
        max={1000}
        step={1}
      />
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
    overflow: 'visible',
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
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  unitText: {
    flex: 1,
    textAlign: 'center',
  },
  unitIcon: {
    margin: 0,
  },
  editIcon: {
    margin: 0,
    marginLeft: -8,
  },
  unitEditContainer: {
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
});

export default FixedRepsExerciseInput;
