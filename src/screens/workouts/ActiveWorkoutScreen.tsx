import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Text, Button, Card, ProgressBar, Appbar, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { getExercisesForRound, formatTime } from '../../utils/calculations';
import { spacing } from '../../constants/theme';
import { Exercise } from '../../types';

const ActiveWorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeWorkout, completeRound, startNextRound, completeWorkout } = useActiveWorkoutStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeWorkout) {
        const elapsed = Math.floor((new Date().getTime() - activeWorkout.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeWorkout]);

  if (!activeWorkout) {
    return (
      <View style={styles.container}>
        <Text>No active workout</Text>
      </View>
    );
  }

  const currentRound = activeWorkout.currentRoundIndex + 1;
  const totalRounds = activeWorkout.exercises.length;
  const exercisesInRound = getExercisesForRound(currentRound, activeWorkout.exercises);
  const progress = activeWorkout.currentRoundIndex / totalRounds;
  const newExercisePosition = currentRound; // The new exercise introduced this round

  const handleRoundComplete = () => {
    completeRound();

    if (currentRound >= totalRounds) {
      // Workout complete
      handleWorkoutComplete();
    } else if (activeWorkout.restPeriodSeconds > 0) {
      // Go to rest screen
      // @ts-ignore
      navigation.navigate('Rest', { workoutId: activeWorkout.id });
    } else {
      // Start next round immediately
      startNextRound();
    }
  };

  const handleWorkoutComplete = async () => {
    await completeWorkout();
    // @ts-ignore
    navigation.replace('WorkoutComplete', { workoutId: activeWorkout.id });
  };

  const handleQuit = () => {
    setQuitDialogVisible(false);
    navigation.navigate('HomeTabs' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text variant="displayMedium" style={styles.timer}>
          {formatTime(elapsedTime)}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Round {currentRound} Exercises
            </Text>
            {exercisesInRound.map((exercise: Exercise) => {
              const isNewExercise = exercise.position === newExercisePosition;
              return (
                <View 
                  key={exercise.position} 
                  style={[
                    styles.exerciseRow,
                    isNewExercise && styles.newExerciseRow
                  ]}
                >
                  <View style={styles.repsContainer}>
                    <Text variant="titleLarge" style={[styles.repsNumber, isNewExercise && styles.newExerciseText]}>
                      {exercise.position}
                    </Text>
                  </View>
                  <Text variant="bodyLarge" style={[styles.exerciseName, isNewExercise && styles.newExerciseText]}>
                    {exercise.name}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleRoundComplete}
          style={styles.completeButton}
          contentStyle={styles.completeButtonContent}
        >
          {currentRound >= totalRounds ? 'Finish Workout' : 'Complete Round'}
        </Button>
      </View>

      <Portal>
        <Dialog visible={quitDialogVisible} onDismiss={() => setQuitDialogVisible(false)}>
          <Dialog.Title>Quit Workout?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to quit? Your progress will not be saved.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setQuitDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleQuit} textColor="#c62828">Quit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  timerContainer: {
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: spacing.md,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 0,
  },
  timer: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    marginBottom: 0,
  },
  cardTitle: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  newExerciseRow: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 4,
    marginVertical: 2,
  },
  repsContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  repsNumber: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  newExerciseText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  exerciseName: {
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'android' ? 40 : spacing.md,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButton: {
    marginTop: 0,
  },
  completeButtonContent: {
    paddingVertical: spacing.sm,
  },
});

export default ActiveWorkoutScreen;