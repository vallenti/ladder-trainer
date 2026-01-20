import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, Divider, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import ExerciseInput from '../../components/ExerciseInput';
import { Exercise } from '../../types';
import { spacing } from '../../constants/theme';

type RouteParams = {
  CreateEditWorkout: {
    workoutId?: string;
  };
};

const CreateEditWorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateEditWorkout'>>();
  const { addWorkout, updateWorkout, getWorkout } = useWorkoutStore();
  
  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;
  const existingWorkout = isEditing ? getWorkout(workoutId) : undefined;

  const [name, setName] = useState(existingWorkout?.name || '');
  const [hasRest, setHasRest] = useState((existingWorkout?.restPeriodSeconds || 0) > 0);
  const [restPeriod, setRestPeriod] = useState(
    existingWorkout?.restPeriodSeconds?.toString() || '60'
  );
  const [exercises, setExercises] = useState<Exercise[]>(
    existingWorkout?.exercises || [{ position: 1, unit: '', name: '' }]
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddExercise = () => {
    if (exercises.length < 12) {
      setExercises([
        ...exercises,
        { position: exercises.length + 1, unit: '', name: '' },
      ]);
    }
  };

  const handleDeleteExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    // Re-assign positions
    const reindexed = newExercises.map((ex, i) => ({
      ...ex,
      position: i + 1,
    }));
    setExercises(reindexed);
  };

  const handleExerciseChange = (index: number, exercise: Exercise) => {
    const newExercises = [...exercises];
    newExercises[index] = exercise;
    setExercises(newExercises);
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Workout name is required');
    }

    if (exercises.length === 0) {
      newErrors.push('At least one exercise is required');
    }

    exercises.forEach((ex, index) => {
      if (!ex.name.trim()) {
        newErrors.push(`Exercise ${index + 1}: Name is required`);
      }
    });

    if (hasRest) {
      const rest = parseInt(restPeriod, 10);
      if (isNaN(rest) || rest <= 0) {
        newErrors.push('Rest period must be a positive number');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const workoutData = {
      name: name.trim(),
      exercises,
      restPeriodSeconds: hasRest ? parseInt(restPeriod, 10) : 0,
    };

    if (isEditing && workoutId) {
      await updateWorkout(workoutId, workoutData);
    } else {
      await addWorkout(workoutData);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Workout' : 'Create Workout'} />
        <Appbar.Action icon="check" onPress={handleSave} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Error Display */}
            {errors.length > 0 && (
              <View style={styles.errorContainer}>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {/* Workout Name */}
            <TextInput
              mode="outlined"
              label="Workout Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Ladder, CrossFit WOD"
              style={styles.input}
            />

            {/* Rest Period */}
            <View style={styles.restSection}>
              <View style={styles.checkboxRow}>
                <Checkbox.Android
                  status={hasRest ? 'checked' : 'unchecked'}
                  onPress={() => setHasRest(!hasRest)}
                />
                <Text variant="bodyLarge" style={styles.checkboxLabel}>
                  Include rest period between rounds
                </Text>
              </View>

              {hasRest && (
                <TextInput
                  mode="outlined"
                  label="Rest Period (seconds)"
                  value={restPeriod}
                  onChangeText={setRestPeriod}
                  keyboardType="numeric"
                  placeholder="60"
                  style={styles.restInput}
                />
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Exercises Section */}
            <View style={styles.exercisesHeader}>
              <Text variant="titleLarge">Exercises</Text>
              <Text variant="bodyMedium" style={styles.exerciseCount}>
                {exercises.length}/12
              </Text>
            </View>

            {exercises.map((exercise, index) => (
              <ExerciseInput
                key={index}
                exercise={exercise}
                onChange={(ex) => handleExerciseChange(index, ex)}
                onDelete={() => handleDeleteExercise(index)}
                canDelete={exercises.length > 1}
              />
            ))}

            {exercises.length < 12 && (
              <Button
                mode="outlined"
                onPress={handleAddExercise}
                icon="plus"
                style={styles.addButton}
              >
                Add Exercise
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  restSection: {
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkboxLabel: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  restInput: {
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseCount: {
    color: '#666',
  },
  addButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#c62828',
    marginVertical: 2,
  },
});

export default CreateEditWorkoutScreen;