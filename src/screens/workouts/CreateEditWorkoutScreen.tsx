import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, Divider, Checkbox, useTheme, Card, Chip } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import ExerciseInput from '../../components/ExerciseInput';
import FlexibleExerciseInput from '../../components/FlexibleExerciseInput';
import ChipperExerciseInput from '../../components/ChipperExerciseInput';
import AMRAPExerciseInput from '../../components/AMRAPExerciseInput';
import ForRepsExerciseInput from '../../components/ForRepsExerciseInput';
import NumberStepper from '../../components/NumberStepper';
import { Exercise, LadderType } from '../../types';
import { spacing } from '../../constants/theme';
import { getLadderStrategy } from '../../utils/ladderStrategies';
import { getLadderDefaults } from '../../constants/ladderDefaults';

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

  // Step tracking for creation flow (1 = Select Type, 2 = Configure Details)
  const [currentStep, setCurrentStep] = useState(isEditing ? 2 : 1);

  const initialLadderType = existingWorkout?.ladderType || 'christmas';
  const initialDefaults = getLadderDefaults(initialLadderType);
  
  const [ladderType, setLadderType] = useState<LadderType>(initialLadderType);
  const [maxRounds, setMaxRounds] = useState(existingWorkout?.maxRounds?.toString() || initialDefaults.maxRounds.toString());
  const [stepSize, setStepSize] = useState(existingWorkout?.stepSize?.toString() || initialDefaults.stepSize.toString());
  const [startingReps, setStartingReps] = useState(existingWorkout?.startingReps?.toString() || initialDefaults.startingReps.toString());
  
  // AMRAP time cap - stored as minutes and seconds separately for better UX
  const initialTimeCap = existingWorkout?.timeCap || initialDefaults.timeCap || 600;
  const [timeCapMinutes, setTimeCapMinutes] = useState(Math.floor(initialTimeCap / 60));
  const [timeCapSeconds, setTimeCapSeconds] = useState(initialTimeCap % 60);
  
  const [name, setName] = useState(existingWorkout?.name || '');
  const [hasRest, setHasRest] = useState((existingWorkout?.restPeriodSeconds || 0) > 0);
  const [restPeriod, setRestPeriod] = useState(
    existingWorkout?.restPeriodSeconds?.toString() || '60'
  );
  const [exercises, setExercises] = useState<Exercise[]>(
    existingWorkout?.exercises || [{ 
      position: 1, 
      unit: '', 
      name: '',
      ...(ladderType === 'flexible' ? {
        direction: 'ascending' as const,
        startingReps: 1,
        stepSize: 1
      } : ladderType === 'chipper' ? {
        fixedReps: 0
      } : ladderType === 'forreps' ? {
        repsPerRound: 0
      } : {})
    }]
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Update defaults when ladder type changes (only for new workouts)
  useEffect(() => {
    if (!isEditing) {
      const defaults = getLadderDefaults(ladderType);
      setMaxRounds(defaults.maxRounds.toString());
      setStepSize(defaults.stepSize.toString());
      setStartingReps(defaults.startingReps.toString());
      const defaultTimeCap = defaults.timeCap || 600;
      setTimeCapMinutes(Math.floor(defaultTimeCap / 60));
      setTimeCapSeconds(defaultTimeCap % 60);
    }
  }, [ladderType, isEditing]);

  // When switching ladder types, update exercises to have correct fields
  useEffect(() => {
    setExercises(prevExercises => 
      prevExercises.map(ex => {
        if (ladderType === 'flexible') {
          // Add flexible ladder fields if not present
          const { fixedReps, ...rest } = ex;
          return {
            ...rest,
            direction: ex.direction || 'ascending',
            startingReps: ex.startingReps || 1,
            stepSize: ex.stepSize || 1
          };
        } else if (ladderType === 'chipper') {
          // Add chipper fields if not present
          const { direction, startingReps: exStartingReps, stepSize: exStepSize, ...rest } = ex;
          return {
            ...rest,
            fixedReps: ex.fixedReps || 0
          };
        } else if (ladderType === 'amrap') {
          // Add AMRAP fields if not present
          const { fixedReps, repsPerRound, ...rest } = ex;
          return {
            ...rest,
            startingReps: ex.startingReps || 1,
            stepSize: ex.stepSize || 0
          };
        } else if (ladderType === 'forreps') {
          // Add forreps fields if not present
          const { direction, startingReps: exStartingReps, stepSize: exStepSize, fixedReps, ...rest } = ex;
          return {
            ...rest,
            repsPerRound: ex.repsPerRound || 0
          };
        } else {
          // Remove flexible, chipper, AMRAP, and forreps ladder fields for other types
          const { direction, startingReps: exStartingReps, stepSize: exStepSize, fixedReps, repsPerRound, ...rest } = ex;
          return rest as Exercise;
        }
      })
    );
  }, [ladderType]);

  const handleAddExercise = () => {
    if (exercises.length < 12) {
      const newExercise: Exercise = {
        position: exercises.length + 1,
        unit: '',
        name: '',
        ...(ladderType === 'flexible' && {
          direction: 'ascending',
          startingReps: 1,
          stepSize: 1,
        }),
        ...(ladderType === 'chipper' && {
          fixedReps: 0,
        }),
        ...(ladderType === 'amrap' && {
          startingReps: 1,
          stepSize: 0,
        }),
        ...(ladderType === 'forreps' && {
          repsPerRound: 0,
        }),
      };
      setExercises([...exercises, newExercise]);
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
    if (ladderType !== 'amrap' && (isNaN(rounds) || rounds <= 0)) {
      newErrors.push('Max rounds must be a positive number');
    }

    if (ladderType === 'amrap') {
      const totalCap = timeCapMinutes * 60 + timeCapSeconds;
      if (totalCap <= 0) {
        newErrors.push('Time cap must be greater than 0');
      }
      // Validate that each exercise has startingReps and stepSize
      exercises.forEach((ex, index) => {
        if (!ex.startingReps || ex.startingReps <= 0) {
          newErrors.push(`Exercise ${index + 1}: Starting reps must be a positive number`);
        }
        if (ex.stepSize === undefined || ex.stepSize < 0) {
          newErrors.push(`Exercise ${index + 1}: Step size must be 0 or greater`);
        }
      });
    }

    if (ladderType === 'christmas') {
      if (rounds > 12) {
        newErrors.push('Christmas ladder cannot exceed 12 rounds');
      }
      if (rounds > exercises.length) {
        newErrors.push(`Christmas ladder requires at least ${rounds} exercises for ${rounds} rounds`);
      }
    }

    if (ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') {
      const step = parseInt(stepSize, 10);
      if (isNaN(step) || step <= 0) {
        newErrors.push('Step size must be a positive number');
      }
    }

    if (ladderType === 'flexible') {
      // Validate that each exercise has direction, startingReps, and stepSize (except constant)
      exercises.forEach((ex, index) => {
        if (!ex.direction) {
          newErrors.push(`Exercise ${index + 1}: Direction is required`);
        }
        if (!ex.startingReps || ex.startingReps <= 0) {
          newErrors.push(`Exercise ${index + 1}: ${ex.direction === 'constant' ? 'Value' : 'Starting reps'} must be a positive number`);
        }
        
        // Step size only required for ascending/descending
        if (ex.direction !== 'constant' && (!ex.stepSize || ex.stepSize <= 0)) {
          newErrors.push(`Exercise ${index + 1}: Step size must be a positive number`);
        }
        
        // Validate that exercise configuration results in exactly maxRounds rounds
        // Constant exercises are always valid for any number of rounds
        if (ex.direction !== 'constant') {
          const startReps = ex.startingReps || 1;
          const step = ex.stepSize || 1;
          const calculatedRounds = ex.direction === 'ascending' 
            ? Math.floor((rounds - startReps) / step) + 1
            : Math.floor(startReps / step);
          
          if (calculatedRounds < rounds) {
            newErrors.push(`Exercise ${index + 1}: Configuration results in only ${calculatedRounds} rounds, but ${rounds} rounds are required`);
          }
        }
      });
    }

    if (ladderType === 'chipper') {
      // Validate that each exercise has fixedReps
      exercises.forEach((ex, index) => {
        if (!ex.fixedReps || ex.fixedReps <= 0) {
          newErrors.push(`Exercise ${index + 1}: Count must be a positive number`);
        }
      });
    }

    if (ladderType === 'forreps') {
      // Validate that each exercise has repsPerRound
      exercises.forEach((ex, index) => {
        if (!ex.repsPerRound || ex.repsPerRound <= 0) {
          newErrors.push(`Exercise ${index + 1}: Reps per round must be a positive number`);
        }
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // For chipper, maxRounds equals number of exercises; for AMRAP, set high number
    const finalMaxRounds = ladderType === 'chipper' ? exercises.length : ladderType === 'amrap' ? 999 : parseInt(maxRounds, 10);
    
    // Calculate total time cap in seconds from minutes and seconds
    const totalTimeCap = timeCapMinutes * 60 + timeCapSeconds;

    const workoutData = {
      name: name.trim(),
      exercises,
      restPeriodSeconds: hasRest ? parseInt(restPeriod, 10) : 0,
      ladderType,
      maxRounds: finalMaxRounds,
      stepSize: (ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') ? parseInt(stepSize, 10) : undefined,
      startingReps: (ladderType === 'ascending' || ladderType === 'descending') ? parseInt(startingReps, 10) : undefined,
      timeCap: ladderType === 'amrap' ? totalTimeCap : undefined,
    };

    if (isEditing && workoutId) {
      await updateWorkout(workoutId, workoutData);
    } else {
      await addWorkout(workoutData);
    }

    navigation.goBack();
  };

  const handleTimeCapPreset = (minutes: number) => {
    setTimeCapMinutes(minutes);
    setTimeCapSeconds(0);
  };

  const generateDefaultWorkoutName = (): string => {
    const typeNames = {
      christmas: 'Christmas',
      ascending: 'Ascending',
      descending: 'Descending',
      pyramid: 'Pyramid',
      flexible: 'Flexible',
      chipper: 'Chipper',
      amrap: 'AMRAP',
      forreps: 'For Reps',
    };
    
    return `${typeNames[ladderType]} WOD`;
  };

  const handleNextStep = () => {
    setCurrentStep(2);
    setErrors([]); // Clear any errors when moving to next step
    
    // Set default workout name if not already set or still has old default
    if (!name.trim() || name === generateDefaultWorkoutName()) {
      setName(generateDefaultWorkoutName());
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2 && !isEditing) {
      setCurrentStep(1);
      setErrors([]); // Clear any errors when going back
    } else {
      navigation.goBack();
    }
  };

  const getStepTitle = () => {
    if (isEditing) return 'Edit Workout';
    return currentStep === 1 ? 'Select Workout Type' : 'Configure Workout';
  };

  const generateRepsPreview = (): string | string[] => {
    const rounds = parseInt(maxRounds, 10) || 0;
    const step = parseInt(stepSize, 10) || 1;
    const starting = parseInt(startingReps, 10) || 1;
    
    if (rounds <= 0 || rounds > 20) return '';
    
    const repsArray: number[] = [];
    
    switch (ladderType) {
      case 'ascending':
        for (let i = 0; i < rounds; i++) {
          repsArray.push(starting + i * step);
        }
        break;
      
      case 'descending':
        for (let i = 0; i < rounds; i++) {
          repsArray.push(starting - i * step);
        }
        break;
      
      case 'pyramid':
        const peak = Math.ceil(rounds / 2);
        for (let i = 1; i <= rounds; i++) {
          if (i <= peak) {
            repsArray.push(i * step);
          } else {
            repsArray.push((rounds - i + 1) * step);
          }
        }
        break;
      
      case 'christmas':
        // Format: 1, 2-1, 3-2-1, 4-3-2-1, ...
        const lines: string[] = [];
        const maxLines = rounds > 4 ? 4 : rounds;
        
        for (let i = 1; i <= maxLines; i++) {
          const roundReps = [];
          for (let j = i; j >= 1; j--) {
            roundReps.push(j);
          }
          lines.push(roundReps.join(' - '));
        }
        
        if (rounds > 4) {
          lines.push('...');
        }
        
        return lines;
    }
    
    return repsArray.join(' - ');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBackStep} />
        <Appbar.Content title={getStepTitle()} />
        {currentStep === 2 && <Appbar.Action icon="check" onPress={handleSave} />}
      </Appbar.Header>

      {/* Step Indicator - Only show when creating new workout */}
      {!isEditing && (
        <View style={[styles.stepIndicator, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle, 
              currentStep === 1 ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceVariant }
            ]}>
              <Text style={[styles.stepNumber, { color: currentStep === 1 ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }]}>1</Text>
            </View>
            <Text variant="bodySmall" style={[styles.stepLabel, currentStep === 1 && { color: theme.colors.primary }]}>
              Select Type
            </Text>
          </View>
          
          <View style={[styles.stepLine, { backgroundColor: currentStep === 2 ? theme.colors.primary : theme.colors.surfaceVariant }]} />
          
          <View style={styles.stepItem}>
            <View style={[
              styles.stepCircle, 
              currentStep === 2 ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surfaceVariant }
            ]}>
              <Text style={[styles.stepNumber, { color: currentStep === 2 ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }]}>2</Text>
            </View>
            <Text variant="bodySmall" style={[styles.stepLabel, currentStep === 2 && { color: theme.colors.primary }]}>
              Configure
            </Text>
          </View>
        </View>
      )}

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
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                {errors.map((error, index) => (
                  <Text key={index} style={[styles.errorText, { color: theme.colors.error }]}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}

            {/* STEP 1: Ladder Type Selection */}
            {currentStep === 1 && !isEditing && (
              <>
                <Text variant="titleLarge" style={styles.stepMainTitle}>
                  Choose Your Ladder Type
                </Text>
                <Text variant="bodyMedium" style={[styles.stepDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Select the workout style that best fits your training goals. This cannot be changed later.
                </Text>

                

                {/* Ascending Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'ascending' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('ascending')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'ascending' && { color: theme.colors.primary }]}>
                        Ascending
                      </Text>
                      {ladderType === 'ascending' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'ascending' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('ascending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10, parseInt(startingReps, 10) || 1).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* Descending Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'descending' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('descending')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'descending' && { color: theme.colors.primary }]}>
                        Descending
                      </Text>
                      {ladderType === 'descending' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'descending' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('descending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10, parseInt(startingReps, 10) || 1).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* Pyramid Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'pyramid' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('pyramid')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'pyramid' && { color: theme.colors.primary }]}>
                        Pyramid
                      </Text>
                      {ladderType === 'pyramid' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'pyramid' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('pyramid', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
                

                {/* Flexible Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'flexible' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('flexible')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'flexible' && { color: theme.colors.primary }]}>
                        Flexible
                      </Text>
                      {ladderType === 'flexible' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'flexible' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('flexible', 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* Chipper Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'chipper' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('chipper')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'chipper' && { color: theme.colors.primary }]}>
                        Chipper
                      </Text>
                      {ladderType === 'chipper' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'chipper' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('chipper', 1, parseInt(maxRounds, 10) || 5).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* AMRAP Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'amrap' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('amrap')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'amrap' && { color: theme.colors.primary }]}>
                        AMRAP
                      </Text>
                      {ladderType === 'amrap' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'amrap' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('amrap', 1, parseInt(maxRounds, 10) || 999).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* For Reps Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'forreps' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('forreps')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'forreps' && { color: theme.colors.primary }]}>
                        For Reps
                      </Text>
                      {ladderType === 'forreps' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'forreps' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('forreps', 1, parseInt(maxRounds, 10) || 5).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>

                {/* Christmas Ladder Card */}
                <Card 
                  style={[
                    styles.ladderTypeCard,
                    { backgroundColor: theme.colors.surface },
                    ladderType === 'christmas' && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2, 
                      backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => setLadderType('christmas')}
                >
                  <Card.Content>
                    <View style={styles.ladderTypeHeader}>
                      <Text variant="titleMedium" style={[styles.ladderTypeName, ladderType === 'christmas' && { color: theme.colors.primary }]}>
                          Christmas
                      </Text>
                      {ladderType === 'christmas' && (
                        <Text style={{ color: theme.colors.primary, fontSize: 20 }}>✓</Text>
                      )}
                    </View>
                    {ladderType === 'christmas' && (
                      <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                        {getLadderStrategy('christmas', 1, parseInt(maxRounds, 10) || 10).getDescription()}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              </>
            )}

            {/* STEP 2: Workout Configuration */}
            {currentStep === 2 && (
              <>
                {/* Show selected ladder type for reference when creating new workout */}
                {!isEditing && (
                  <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Card.Content>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        SELECTED TYPE
                      </Text>
                      <Text variant="titleMedium" style={{ color: theme.colors.primary, marginTop: 4 }}>
                        {{
                          christmas: 'Christmas Ladder',
                          ascending: 'Ascending Ladder',
                          descending: 'Descending Ladder',
                          pyramid: 'Pyramid Ladder',
                          flexible: 'Flexible Ladder',
                          chipper: 'Chipper Ladder',
                          amrap: 'AMRAP',
                          forreps: 'For Reps',
                        }[ladderType]}
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                {/* Workout Name */}
                <TextInput
                  mode="outlined"
                  label="Workout Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder={generateDefaultWorkoutName()}
                />

            {/* Time Cap - Only for AMRAP */}
            {ladderType === 'amrap' && (
              <View style={styles.timeCapSection}>
                <Text variant="labelLarge" style={[styles.timeCapLabel, { color: theme.colors.onSurface }]}>
                  Time Cap
                </Text>
                
                {/* Quick Preset Chips */}
                <View style={styles.presetChipsContainer}>
                  {[5, 10, 15, 20].map((minutes) => (
                    <Chip
                      key={minutes}
                      selected={timeCapMinutes === minutes && timeCapSeconds === 0}
                      onPress={() => handleTimeCapPreset(minutes)}
                      style={styles.presetChip}
                      textStyle={styles.presetChipText}
                    >
                      {minutes}m
                    </Chip>
                  ))}
                </View>

                {/* Fine-tune with steppers */}
                <View style={styles.timeSteppersContainer}>
                  <View style={styles.timeStepperWrapper}>
                    <NumberStepper
                      label="Minutes"
                      value={timeCapMinutes}
                      onChange={setTimeCapMinutes}
                      min={0}
                      max={60}
                      step={1}
                    />
                  </View>
                  <View style={styles.timeStepperWrapper}>
                    <NumberStepper
                      label="Seconds"
                      value={timeCapSeconds}
                      onChange={setTimeCapSeconds}
                      min={0}
                      max={59}
                      step={15}
                    />
                  </View>
                </View>

                {/* Display total time */}
                <Text variant="bodySmall" style={[styles.totalTimeDisplay, { color: theme.colors.primary }]}>
                  Total: {timeCapMinutes}:{timeCapSeconds.toString().padStart(2, '0')} 
                </Text>
              </View>
            )}

            {/* Max Rounds - Not shown for chipper (auto-calculated from exercise count) or AMRAP (unlimited) */}
            {ladderType !== 'chipper' && ladderType !== 'amrap' && (
              <TextInput
                mode="outlined"
                label="Maximum Rounds"
                value={maxRounds}
                onChangeText={setMaxRounds}
                keyboardType="numeric"
                style={styles.input}
              />
            )}

            {/* Starting Reps - Only for ascending and descending ladder */}
            {(ladderType === 'ascending' || ladderType === 'descending') && (
              <TextInput
                mode="outlined"
                label="Starting Reps"
                value={startingReps}
                onChangeText={setStartingReps}
                keyboardType="numeric"
                style={styles.input}
                right={<TextInput.Affix text="reps" />}
              />
            )}

            {/* Step Size - Only for ascending, descending, and pyramid ladder */}
            {(ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') && (
              <TextInput
                mode="outlined"
                label="Step Size"
                value={stepSize}
                onChangeText={setStepSize}
                keyboardType="numeric"
                style={styles.input}
                right={<TextInput.Affix text="reps per round" />}
              />
            )}

            {/* Reps Preview */}
            {(() => {
              const preview = generateRepsPreview();
              return preview && (Array.isArray(preview) ? preview.length > 0 : preview) && (
                <Card style={[styles.previewCard, { 
                  backgroundColor: theme.dark ? `${theme.colors.primary}25` : theme.colors.primaryContainer,
                  borderColor: theme.colors.primary,
                  borderWidth: 1,
                }]}>
                  <Card.Content>
                    <Text variant="labelSmall" style={{ 
                      color: theme.colors.primary, 
                      marginBottom: 4, 
                      fontWeight: 'bold' 
                    }}>
                      REPS PREVIEW
                    </Text>
                    {Array.isArray(preview) ? (
                      <View style={styles.christmasPreview}>
                        {preview.map((line, index) => (
                          <Text 
                            key={index} 
                            variant="bodyLarge" 
                            style={{ 
                              color: theme.colors.onSurface, 
                              fontWeight: line === '...' ? 'normal' : '600',
                              textAlign: 'center',
                              opacity: line === '...' ? 0.6 : 1,
                            }}
                          >
                            {line}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {preview}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              );
            })()}

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
              
            </View>

            {ladderType === 'flexible' ? (
              exercises.map((exercise, index) => (
                <FlexibleExerciseInput
                  key={index}
                  exercise={exercise}
                  onChange={(ex) => handleExerciseChange(index, ex)}
                  onDelete={() => handleDeleteExercise(index)}
                  canDelete={exercises.length > 1}
                  exerciseNumber={index + 1}
                />
              ))
            ) : ladderType === 'amrap' ? (
              exercises.map((exercise, index) => (
                <AMRAPExerciseInput
                  key={index}
                  exercise={exercise}
                  onChange={(ex) => handleExerciseChange(index, ex)}
                  onDelete={() => handleDeleteExercise(index)}
                  canDelete={exercises.length > 1}
                  exerciseNumber={index + 1}
                />
              ))
            ) : ladderType === 'chipper' ? (
              exercises.map((exercise, index) => (
                <ChipperExerciseInput
                  key={index}
                  exercise={exercise}
                  onChange={(ex) => handleExerciseChange(index, ex)}
                  onDelete={() => handleDeleteExercise(index)}
                  canDelete={exercises.length > 1}
                />
              ))
            ) : ladderType === 'forreps' ? (
              exercises.map((exercise, index) => (
                <ForRepsExerciseInput
                  key={index}
                  exercise={exercise}
                  onChange={(ex) => handleExerciseChange(index, ex)}
                  onDelete={() => handleDeleteExercise(index)}
                  canDelete={exercises.length > 1}
                />
              ))
            ) : (
              exercises.map((exercise, index) => (
                <ExerciseInput
                  key={index}
                  exercise={exercise}
                  onChange={(ex) => handleExerciseChange(index, ex)}
                  onDelete={() => handleDeleteExercise(index)}
                  canDelete={exercises.length > 1}
                />
              ))
            )}

            {(() => {
              const rounds = parseInt(maxRounds, 10) || 10;
              const canAddExercise = ladderType === 'christmas' 
                ? exercises.length < rounds && exercises.length < 12
                : exercises.length < 12;
              
              return canAddExercise && (
                <Button
                  mode="outlined"
                  onPress={handleAddExercise}
                  icon="plus"
                  style={styles.addButton}
                >
                  Add Exercise
                </Button>
              );
            })()}
              </>
            )}
          </View>
        </ScrollView>

        {/* Fixed Next Button for Step 1 */}
        {currentStep === 1 && !isEditing && (
          <View style={[styles.buttonContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
            <Button
              mode="contained"
              onPress={handleNextStep}
              icon="arrow-right"
              contentStyle={styles.nextButtonContent}
              style={styles.fixedNextButton}
              textColor='#fff'
            >
              Next: Configure Workout
            </Button>
          </View>
        )}
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
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: spacing.xs,
    marginBottom: 14,
  },
  // Step 1 Styles
  stepMainTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  stepDescription: {
    marginBottom: spacing.lg,
  },
  ladderTypeCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ladderTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ladderTypeName: {
    fontWeight: '600',
  },
  ladderTypeDescription: {
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  fixedNextButton: {
    marginTop: 0,
  },
  nextButton: {
    marginTop: spacing.lg,
  },
  nextButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: spacing.sm,
    color: '#FFFFFF',
  },
  previewCard: {
    marginBottom: spacing.md,
  },
  christmasPreview: {
    alignItems: 'center',
    gap: 4,
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
  timeCapSection: {
    marginBottom: spacing.md,
  },
  timeCapLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  presetChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetChip: {
    marginRight: 0,
  },
  presetChipText: {
    fontSize: 14,
  },
  timeSteppersContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  timeStepperWrapper: {
    flex: 1,
  },
  totalTimeDisplay: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CreateEditWorkoutScreen;