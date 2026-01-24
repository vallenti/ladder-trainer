import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, Divider, Checkbox, useTheme, RadioButton, Card } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import ExerciseInput from '../../components/ExerciseInput';
import { Exercise, LadderType } from '../../types';
import { spacing } from '../../constants/theme';
import { getLadderStrategy } from '../../utils/ladderStrategies';

type RouteParams = {
  CreateEditWorkout: {
    workoutId?: string;
  };
};

const CreateEditWorkoutScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateEditWorkout'>>();
  const { addWorkout, updateWorkout, getWorkout } = useWorkoutStore();
  
  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;
  const existingWorkout = isEditing ? getWorkout(workoutId) : undefined;

  const [ladderType, setLadderType] = useState<LadderType>(existingWorkout?.ladderType || 'christmas');
  const [maxRounds, setMaxRounds] = useState(existingWorkout?.maxRounds?.toString() || '10');
  const [stepSize, setStepSize] = useState(existingWorkout?.stepSize?.toString() || '1');
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

    const rounds = parseInt(maxRounds, 10);
    if (isNaN(rounds) || rounds <= 0) {
      newErrors.push('Max rounds must be a positive number');
    }

    if (ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') {
      const step = parseInt(stepSize, 10);
      if (isNaN(step) || step <= 0) {
        newErrors.push('Step size must be a positive number');
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
      ladderType,
      maxRounds: parseInt(maxRounds, 10),
      stepSize: (ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') ? parseInt(stepSize, 10) : undefined,
    };

    if (isEditing && workoutId) {
      await updateWorkout(workoutId, workoutData);
    } else {
      await addWorkout(workoutData);
    }

    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Workout' : 'Create Workout'} />
        <Appbar.Action icon="check" onPress={handleSave} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            {/* Error Display */}
            {errors.length > 0 && (
              <View style={[styles.errorContainer, { backgroundColor: theme.dark ? '#3D1F1F' : '#ffebee' }]}>
                {errors.map((error, index) => (
                  <Text key={index} style={[styles.errorText, { color: theme.colors.error }]}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {/* Ladder Type Selection - Only shown when creating new workout */}
            {!isEditing && (
              <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Ladder Type
                  </Text>
                  <Text variant="bodySmall" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
                    Choose your ladder workout style (cannot be changed later)
                  </Text>
                  
                  <RadioButton.Group onValueChange={(value) => setLadderType(value as LadderType)} value={ladderType}>
                    <View style={styles.radioOption}>
                      <RadioButton.Item
                        label="Christmas Ladder"
                        value="christmas"
                        labelVariant="bodyLarge"
                        position="leading"
                        style={styles.radioItem}
                        labelStyle={styles.radioLabel}
                      />
                      <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {getLadderStrategy('christmas', 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    </View>
                    
                    <View style={styles.radioOption}>
                      <RadioButton.Item
                        label="Ascending Ladder"
                        value="ascending"
                        labelVariant="bodyLarge"
                        position="leading"
                        style={styles.radioItem}
                        labelStyle={styles.radioLabel}
                      />
                      <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {getLadderStrategy('ascending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    </View>
                    
                    <View style={styles.radioOption}>
                      <RadioButton.Item
                        label="Descending Ladder"
                        value="descending"
                        labelVariant="bodyLarge"
                        position="leading"
                        style={styles.radioItem}
                        labelStyle={styles.radioLabel}
                      />
                      <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {getLadderStrategy('descending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    </View>
                    
                    <View style={styles.radioOption}>
                      <RadioButton.Item
                        label="Pyramid Ladder"
                        value="pyramid"
                        labelVariant="bodyLarge"
                        position="leading"
                        style={styles.radioItem}
                        labelStyle={styles.radioLabel}
                      />
                      <Text variant="bodySmall" style={[styles.radioDescription, { color: theme.colors.onSurfaceVariant }]}>
                        {getLadderStrategy('pyramid', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    </View>
                  </RadioButton.Group>
                </Card.Content>
              </Card>
            )}

            {/* Max Rounds */}
            <TextInput
              mode="outlined"
              label="Maximum Rounds"
              value={maxRounds}
              onChangeText={setMaxRounds}
              keyboardType="numeric"
              placeholder="10"
              style={styles.input}
            />

            {/* Step Size - Only for ascending, descending, and pyramid ladder */}
            {(ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') && (
              <TextInput
                mode="outlined"
                label="Step Size"
                value={stepSize}
                onChangeText={setStepSize}
                keyboardType="numeric"
                placeholder="1"
                style={styles.input}
                right={<TextInput.Affix text="reps per round" />}
              />
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
              <Text variant="bodyMedium" style={[styles.exerciseCount, { color: theme.colors.onSurfaceVariant }]}>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  sectionDescription: {
    marginBottom: spacing.md,
  },
  radioOption: {
    marginBottom: spacing.sm,
  },
  radioItem: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  radioLabel: {
    textAlign: 'left',
  },
  radioDescription: {
    marginLeft: 40,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
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
  },
  addButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    marginVertical: 2,
  },
});

export default CreateEditWorkoutScreen;