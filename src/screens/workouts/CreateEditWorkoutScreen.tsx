import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Appbar, Divider, Checkbox, useTheme, Card, Chip, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  // Buy In/Out state
  const [hasBuyInOut, setHasBuyInOut] = useState(existingWorkout?.hasBuyInOut || false);
  const [buyInOutExercise, setBuyInOutExercise] = useState<Exercise>(
    existingWorkout?.buyInOutExercise || {
      position: 0,
      unit: '',
      name: '',
      repsPerRound: undefined,
    }
  );
  const [hasBuyInOutRest, setHasBuyInOutRest] = useState((existingWorkout?.buyInOutRestSeconds || 0) > 0);
  const [buyInOutRestPeriod, setBuyInOutRestPeriod] = useState(
    existingWorkout?.buyInOutRestSeconds?.toString() || '60'
  );
  const [showBuyInOutUnitInput, setShowBuyInOutUnitInput] = useState(false);

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
      // Validate that each exercise has direction, startingReps, and stepSize (except fixed)
      exercises.forEach((ex, index) => {
        if (!ex.direction) {
          newErrors.push(`Exercise ${index + 1}: Direction is required`);
        }
        if (!ex.startingReps || ex.startingReps <= 0) {
          newErrors.push(`Exercise ${index + 1}: ${ex.direction === 'constant' ? 'Fixed value' : 'Starting reps'} must be a positive number`);
        }
        
        // Step size only required for ascending/descending
        if (ex.direction !== 'constant' && (!ex.stepSize || ex.stepSize <= 0)) {
          newErrors.push(`Exercise ${index + 1}: Step size must be a positive number`);
        }
        
        // Validate that exercise configuration results in exactly maxRounds rounds
        // Fixed exercises are always valid for any number of rounds
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

    // Buy In/Out validation
    if (hasBuyInOut && (ladderType === 'amrap' || ladderType === 'chipper' || ladderType === 'forreps')) {
      if (!buyInOutExercise.name.trim()) {
        newErrors.push('Buy In/Out: Exercise name is required');
      }
      if (buyInOutExercise.name.length > 100) {
        newErrors.push('Buy In/Out: Exercise name must be 100 characters or less');
      }
      if (hasBuyInOutRest) {
        const rest = parseInt(buyInOutRestPeriod, 10);
        if (isNaN(rest) || rest <= 0) {
          newErrors.push('Buy In/Out: Rest period must be a positive number');
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Validate workout name length
    if (name.trim().length > 100) {
      setErrors(['Workout name must be 100 characters or less']);
      return;
    }

    // For chipper, maxRounds equals number of exercises; for AMRAP, set high number
    const finalMaxRounds = ladderType === 'chipper' ? exercises.length : ladderType === 'amrap' ? 999 : parseInt(maxRounds, 10);
    
    // Calculate total time cap in seconds from minutes and seconds
    const totalTimeCap = timeCapMinutes * 60 + timeCapSeconds;

    // Determine if buy-in/out should be included (only for amrap, chipper, forreps)
    const shouldIncludeBuyInOut = hasBuyInOut && (ladderType === 'amrap' || ladderType === 'chipper' || ladderType === 'forreps');

    const workoutData = {
      name: name.trim(),
      exercises,
      restPeriodSeconds: hasRest ? parseInt(restPeriod, 10) : 0,
      ladderType,
      maxRounds: finalMaxRounds,
      stepSize: (ladderType === 'ascending' || ladderType === 'descending' || ladderType === 'pyramid') ? parseInt(stepSize, 10) : undefined,
      startingReps: (ladderType === 'ascending' || ladderType === 'descending') ? parseInt(startingReps, 10) : undefined,
      timeCap: ladderType === 'amrap' ? totalTimeCap : undefined,
      // Buy In/Out
      hasBuyInOut: shouldIncludeBuyInOut,
      buyInOutExercise: shouldIncludeBuyInOut ? buyInOutExercise : undefined,
      buyInOutRestSeconds: shouldIncludeBuyInOut && hasBuyInOutRest ? parseInt(buyInOutRestPeriod, 10) : undefined,
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
                      <MaterialCommunityIcons 
                        name="trending-up" 
                        size={48} 
                        color={ladderType === 'ascending' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'ascending' && { color: theme.colors.primary }]}>
                          Ascending
                        </Text>
                        {ladderType === 'ascending' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('ascending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10, parseInt(startingReps, 10) || 1).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'ascending' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="trending-down" 
                        size={48} 
                        color={ladderType === 'descending' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'descending' && { color: theme.colors.primary }]}>
                          Descending
                        </Text>
                        {ladderType === 'descending' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('descending', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10, parseInt(startingReps, 10) || 1).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'descending' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="triangle" 
                        size={48} 
                        color={ladderType === 'pyramid' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'pyramid' && { color: theme.colors.primary }]}>
                          Pyramid
                        </Text>
                        {ladderType === 'pyramid' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('pyramid', parseInt(stepSize, 10) || 1, parseInt(maxRounds, 10) || 10).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'pyramid' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="tune-variant" 
                        size={48} 
                        color={ladderType === 'flexible' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'flexible' && { color: theme.colors.primary }]}>
                          Flexible
                        </Text>
                        {ladderType === 'flexible' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('flexible', 1, parseInt(maxRounds, 10) || 10).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'flexible' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="fire" 
                        size={48} 
                        color={ladderType === 'chipper' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'chipper' && { color: theme.colors.primary }]}>
                          Chipper
                        </Text>
                        {ladderType === 'chipper' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('chipper', 1, parseInt(maxRounds, 10) || 5).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'chipper' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="timer" 
                        size={48} 
                        color={ladderType === 'amrap' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'amrap' && { color: theme.colors.primary }]}>
                          AMRAP
                        </Text>
                        {ladderType === 'amrap' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('amrap', 1, parseInt(maxRounds, 10) || 999).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'amrap' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="counter" 
                        size={48} 
                        color={ladderType === 'forreps' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'forreps' && { color: theme.colors.primary }]}>
                          For Reps
                        </Text>
                        {ladderType === 'forreps' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('forreps', 1, parseInt(maxRounds, 10) || 5).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'forreps' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                      <MaterialCommunityIcons 
                        name="pine-tree" 
                        size={48} 
                        color={ladderType === 'christmas' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                        style={styles.ladderTypeIcon}
                      />
                      <View style={styles.ladderTypeContent}>
                        <Text variant="titleLarge" style={[styles.ladderTypeName, ladderType === 'christmas' && { color: theme.colors.primary }]}>
                          Christmas
                        </Text>
                        {ladderType === 'christmas' && (
                          <Text variant="bodySmall" style={[styles.ladderTypeDescription, { color: theme.colors.onSurface }]}>
                            {getLadderStrategy('christmas', 1, parseInt(maxRounds, 10) || 10).getDescription()}
                          </Text>
                        )}
                      </View>
                      {ladderType === 'christmas' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                      )}
                    </View>
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
                  maxLength={100}
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

            {/* Buy In/Out Section - Only for AMRAP, Chipper, ForReps */}
            {(ladderType === 'amrap' || ladderType === 'chipper' || ladderType === 'forreps') && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.buyInOutSection}>
                  <View style={styles.checkboxRow}>
                    <Checkbox.Android
                      status={hasBuyInOut ? 'checked' : 'unchecked'}
                      onPress={() => setHasBuyInOut(!hasBuyInOut)}
                    />
                    <View>
                      <Text variant="bodyLarge" style={styles.checkboxLabel}>
                        Add Buy In/Out exercise
                      </Text>
                      <Text variant="bodySmall" style={[{ color: theme.colors.onSurfaceVariant }, styles.buyInOutDescription]}>
                        Same exercise performed before and after the main workout
                      </Text>
                    </View>
                  </View>

                  {hasBuyInOut && (
                    <Card style={[styles.buyInOutCard, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
                      <Card.Content>
                        {/* Header */}
                        <View style={styles.buyInOutCardHeader}>
                          <View style={[styles.buyInOutBadge, { backgroundColor: theme.colors.primary }]}>
                            <Text variant="titleMedium" style={[styles.buyInOutBadgeText, { color: '#FFFFFF' }]}>
                              B
                            </Text>
                          </View>
                          <Text variant="bodySmall" style={[styles.buyInOutLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Buy In/Out Exercise
                          </Text>
                        </View>

                        {/* Amount + Unit Row (similar to ForRepsExerciseInput) */}
                        <View style={styles.buyInOutInputRow}>
                          <TextInput
                            mode="outlined"
                            label="Amount / Distance / Reps"
                            value={buyInOutExercise.repsPerRound?.toString() || ''}
                            onChangeText={(value) => {
                              const numValue = parseInt(value, 10);
                              setBuyInOutExercise({ 
                                ...buyInOutExercise, 
                                repsPerRound: isNaN(numValue) ? undefined : numValue 
                              });
                            }}
                            keyboardType="numeric"
                            style={styles.buyInOutAmountInput}
                            placeholder="e.g., 1, 400"
                          />

                          {!showBuyInOutUnitInput ? (
                            <TouchableOpacity 
                              onPress={() => setShowBuyInOutUnitInput(true)}
                              
                              style={[
                                styles.buyInOutUnitButton,
                                { borderColor: theme.colors.outline },
                                (!buyInOutExercise.unit || buyInOutExercise.unit === '') && styles.buyInOutUnitButtonIcon
                              ]}
                            >
                              {(!buyInOutExercise.unit || buyInOutExercise.unit === '') ? (
                                <IconButton
                                  icon="pencil"
                                  size={20}
                                  style={styles.buyInOutUnitIcon}
                                />
                              ) : (
                                <View style={styles.buyInOutUnitButtonContent}>
                                  <Text variant="bodyMedium" style={[styles.buyInOutUnitText, { color: theme.colors.onSurface }]}>
                                    {buyInOutExercise.unit}
                                  </Text>
                                  <IconButton
                                    icon="pencil"
                                    size={16}
                                    style={styles.buyInOutEditIcon}
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.buyInOutUnitEditContainer}>
                              <TextInput
                                mode="outlined"
                                label="Unit"
                                value={buyInOutExercise.unit}
                                onChangeText={(text) => setBuyInOutExercise({ ...buyInOutExercise, unit: text })}
                                style={styles.buyInOutUnitTextInput}
                              />
                              <IconButton
                                icon="check"
                                size={20}
                                onPress={() => setShowBuyInOutUnitInput(false)}
                                style={styles.buyInOutCheckButton}
                              />
                            </View>
                          )}
                        </View>

                        {/* Exercise Name Input */}
                        <TextInput
                          mode="outlined"
                          label="Exercise Name"
                          value={buyInOutExercise.name}
                          onChangeText={(text) => setBuyInOutExercise({ ...buyInOutExercise, name: text })}
                          style={styles.buyInOutNameInput}
                          placeholder="e.g., Run, Row, Bike"
                          maxLength={100}
                        />

                        {/* Buy In/Out Rest Period */}
                        <View style={styles.buyInOutRestSection}>
                          <View style={styles.checkboxRow}>
                            <Checkbox.Android
                              status={hasBuyInOutRest ? 'checked' : 'unchecked'}
                              onPress={() => setHasBuyInOutRest(!hasBuyInOutRest)}
                            />
                            <Text variant="bodyMedium" style={styles.checkboxLabel}>
                              Rest after Buy In / before Buy Out
                            </Text>
                          </View>

                          {hasBuyInOutRest && (
                            <TextInput
                              mode="outlined"
                              label="Rest Period (seconds)"
                              value={buyInOutRestPeriod}
                              onChangeText={setBuyInOutRestPeriod}
                              keyboardType="numeric"
                              placeholder="60"
                              style={styles.restInput}
                            />
                          )}
                        </View>

                        {/* Improved Example Flow */}
                        <View style={[styles.buyInOutExample, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}>
                          <Text variant="labelSmall" style={[{ color: theme.colors.primary }, styles.exampleLabel]}>
                            WORKOUT FLOW
                          </Text>
                          <View style={styles.flowStep}>
                            <View style={[styles.flowNumber, { backgroundColor: theme.colors.primary }]}>
                              <Text style={[styles.flowNumberText, { color: '#FFFFFF' }]}>1</Text>
                            </View>
                            <Text variant="bodyMedium" style={[styles.flowText, { color: theme.colors.onSurface }]}>
                              {buyInOutExercise.repsPerRound || ''}{buyInOutExercise.unit ? ' ' + buyInOutExercise.unit : ''} {buyInOutExercise.name || 'Buy In Exercise'}
                            </Text>
                          </View>
                          {hasBuyInOutRest && (
                            <View style={styles.flowStep}>
                              <View style={[styles.flowNumber, { backgroundColor: theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.colors.outline }]}>
                                <Text style={[styles.flowNumberText, { color: theme.colors.onSurfaceVariant }]}>⏱</Text>
                              </View>
                              <Text variant="bodyMedium" style={[styles.flowText, { color: theme.colors.onSurfaceVariant }]}>
                                Rest {buyInOutRestPeriod}s
                              </Text>
                            </View>
                          )}
                          <View style={styles.flowStep}>
                            <View style={[styles.flowNumber, { backgroundColor: theme.colors.primary }]}>
                              <Text style={[styles.flowNumberText, { color: '#FFFFFF' }]}>2</Text>
                            </View>
                            <Text variant="bodyMedium" style={[styles.flowText, { color: theme.colors.onSurface, fontWeight: 'bold' }]}>
                              Main Workout ({ladderType === 'amrap' ? 'AMRAP' : ladderType === 'chipper' ? 'Chipper' : 'For Reps'})
                            </Text>
                          </View>
                          {hasBuyInOutRest && (
                            <View style={styles.flowStep}>
                              <View style={[styles.flowNumber, { backgroundColor: theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.colors.outline }]}>
                                <Text style={[styles.flowNumberText, { color: theme.colors.onSurfaceVariant }]}>⏱</Text>
                              </View>
                              <Text variant="bodyMedium" style={[styles.flowText, { color: theme.colors.onSurfaceVariant }]}>
                                Rest {buyInOutRestPeriod}s
                              </Text>
                            </View>
                          )}
                          <View style={styles.flowStep}>
                            <View style={[styles.flowNumber, { backgroundColor: theme.colors.primary }]}>
                              <Text style={[styles.flowNumberText, { color: '#FFFFFF' }]}>3</Text>
                            </View>
                            <Text variant="bodyMedium" style={[styles.flowText, { color: theme.colors.onSurface }]}>
                              {buyInOutExercise.repsPerRound || ''}{buyInOutExercise.unit ? ' ' + buyInOutExercise.unit : ''} {buyInOutExercise.name || 'Buy Out Exercise'}
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </View>
              </>
            )}
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

        {/* Fixed Save Button for Step 2 */}
        {currentStep === 2 && (
          <View style={[styles.buttonContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
            <Button
              mode="contained"
              onPress={handleSave}
              
              contentStyle={styles.nextButtonContent}
              style={styles.fixedNextButton}
              textColor='#fff'
            >
              {isEditing ? 'Update Workout' : 'Save Workout'}
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
    alignItems: 'center',
    gap: spacing.md,
  },
  ladderTypeIcon: {
    marginRight: spacing.xs,
  },
  ladderTypeContent: {
    flex: 1,
  },
  ladderTypeName: {
    fontWeight: '700',
    fontSize: 20,
  },
  ladderTypeDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
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
  // Buy In/Out Styles
  buyInOutSection: {
    marginTop: spacing.md,
  },
  buyInOutDescription: {
    marginTop: 2,
    marginLeft: spacing.sm,
  },
  buyInOutCard: {
    borderRadius: 12,
    marginTop: spacing.md,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buyInOutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buyInOutBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  buyInOutBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyInOutLabel: {
    flex: 1,
    fontWeight: '500',
  },
  buyInOutInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  buyInOutAmountInput: {
    flex: 1,
    minWidth: 80,
  },
  buyInOutUnitButton: {
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    top:6,
    height: 49,
    minWidth: 56,
  },
  buyInOutUnitButtonIcon: {
    paddingVertical: 0,
    width: 56,
  },
  buyInOutUnitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    minWidth: 100,
  },
  buyInOutUnitText: {
    fontWeight: '600',
  },
  buyInOutUnitIcon: {
    margin: 0,
  },
  buyInOutEditIcon: {
    margin: 0,
    marginLeft: spacing.xs,
  },
  buyInOutUnitEditContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  buyInOutUnitTextInput: {
    flex: 1,
  },
  buyInOutCheckButton: {
    margin: 0,
  },
  buyInOutUnitInput: {
    flex: 1,
  },
  buyInOutNameInput: {
    marginBottom: spacing.md,
  },
  buyInOutRestSection: {
    marginBottom: spacing.md,
  },
  buyInOutExample: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  exampleLabel: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  flowNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  flowNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  flowText: {
    flex: 1,
  },
});

export default CreateEditWorkoutScreen;