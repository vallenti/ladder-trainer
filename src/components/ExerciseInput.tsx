import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, IconButton, Text, Chip } from 'react-native-paper';
import { Exercise } from '../types';
import { spacing } from '../constants/theme';

interface ExerciseInputProps {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const ExerciseInput: React.FC<ExerciseInputProps> = ({
  exercise,
  onChange,
  onDelete,
  canDelete,
}) => {
  const [showUnitInput, setShowUnitInput] = useState(false);

  const isDefaultUnit = !exercise.unit || exercise.unit === '';

  const handleOpenUnitEdit = () => {
    setShowUnitInput(true);
  };

  const handleCloseUnitEdit = () => {
    setShowUnitInput(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Row: Position + Delete */}
      <View style={styles.headerRow}>
        <View style={styles.positionContainer}>
          <Text variant="titleMedium" style={styles.position}>
            {exercise.position}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.positionLabel}>
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
        <TextInput
          mode="outlined"
          label="Exercise Name"
          value={exercise.name}
          onChangeText={(name) => onChange({ ...exercise, name })}
          placeholder="e.g., Wall Walk, Row"
          style={styles.nameInput}
        />

        {!showUnitInput ? (
          <TouchableOpacity 
            onPress={handleOpenUnitEdit} 
            style={[styles.unitButton, isDefaultUnit && styles.unitButtonIcon]}
          >
            {isDefaultUnit ? (
              <IconButton
                icon="pencil"
                size={20}
                style={styles.unitIcon}
              />
            ) : (
              <View style={styles.unitButtonContent}>
                <Text variant="bodyMedium" style={styles.unitText}>
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
              placeholder="e.g., reps, calories, meters"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
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
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  position: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  positionLabel: {
    color: '#666',
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
    borderColor: '#79747E',
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
    color: '#1C1B1F',
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
});

export default ExerciseInput;