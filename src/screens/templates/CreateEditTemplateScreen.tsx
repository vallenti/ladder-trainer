import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, Divider, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTemplateStore } from '../../store/templateStore';
import ExerciseInput from '../../components/ExerciseInput';
import { Exercise } from '../../types';
import { spacing } from '../../constants/theme';

type RouteParams = {
  CreateEditTemplate: {
    templateId?: string;
  };
};

const CreateEditTemplateScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'CreateEditTemplate'>>();
  const { addTemplate, updateTemplate, getTemplate } = useTemplateStore();
  
  const templateId = route.params?.templateId;
  const isEditing = !!templateId;
  const existingTemplate = isEditing ? getTemplate(templateId) : undefined;

  const [name, setName] = useState(existingTemplate?.name || '');
  const [hasRest, setHasRest] = useState((existingTemplate?.restPeriodSeconds || 0) > 0);
  const [restPeriod, setRestPeriod] = useState(
    existingTemplate?.restPeriodSeconds?.toString() || '60'
  );
  const [exercises, setExercises] = useState<Exercise[]>(
    existingTemplate?.exercises || [{ position: 1, unit: '', name: '' }]
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
      newErrors.push('Template name is required');
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

    const templateData = {
      name: name.trim(),
      exercises,
      restPeriodSeconds: hasRest ? parseInt(restPeriod, 10) : 0,
    };

    if (isEditing && templateId) {
      await updateTemplate(templateId, templateData);
    } else {
      await addTemplate(templateData);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Template' : 'Create Template'} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TextInput
              mode="outlined"
              label="Template Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Classic 12 Days"
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Exercises ({exercises.length}/12)
            </Text>

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

            <Divider style={styles.divider} />

            {/* Rest Period Section - Less Prominent */}
            <View style={styles.restSection}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={hasRest ? 'checked' : 'unchecked'}
                  onPress={() => setHasRest(!hasRest)}
                />
                <Text 
                  variant="bodyLarge" 
                  style={styles.checkboxLabel}
                  onPress={() => setHasRest(!hasRest)}
                >
                  Add rest between rounds
                </Text>
              </View>
              
              {hasRest && (
                <TextInput
                  mode="outlined"
                  label="Rest Duration (seconds)"
                  value={restPeriod}
                  onChangeText={setRestPeriod}
                  keyboardType="numeric"
                  placeholder="60"
                  style={styles.restInput}
                  dense
                />
              )}
            </View>

            {errors.length > 0 && (
              <View style={styles.errorContainer}>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.button}
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    padding: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.lg,
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
    marginLeft: spacing.xs,
    flex: 1,
  },
  restInput: {
    marginLeft: 40,
    marginTop: spacing.sm,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: spacing.md,
    borderRadius: 8,
    marginVertical: spacing.md,
  },
  errorText: {
    color: '#c62828',
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default CreateEditTemplateScreen;