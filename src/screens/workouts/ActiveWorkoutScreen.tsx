import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, BackHandler } from 'react-native';
import { Text, Button, Card, ProgressBar, Appbar, Portal, Dialog, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { getExercisesForRound, formatTime } from '../../utils/calculations';
import { spacing } from '../../constants/theme';
import { Exercise } from '../../types';

const formatTimeWithMs = (totalSeconds: number): { main: string; ms: string } => {
  const seconds = Math.floor(totalSeconds);
  const ms = Math.floor((totalSeconds - seconds) * 100);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return {
      main: `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      ms: `.${ms.toString().padStart(2, '0')}`
    };
  }
  return {
    main: `${minutes}:${secs.toString().padStart(2, '0')}`,
    ms: `.${ms.toString().padStart(2, '0')}`
  };
};

const ActiveWorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeWorkout, completeRound, startNextRound, completeWorkout } = useActiveWorkoutStore();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseDialogVisible, setPauseDialogVisible] = useState(false);
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number>(0);
  const [totalPausedTime, setTotalPausedTime] = useState<number>(0);
  const [frozenElapsedTime, setFrozenElapsedTime] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeWorkout && !isPaused) {
        const totalElapsedMs = new Date().getTime() - activeWorkout.startTime.getTime();
        const elapsed = (totalElapsedMs / 1000) - totalPausedTime;
        setElapsedTime(elapsed);
      } else if (isPaused) {
        // Keep showing the frozen time while paused
        setElapsedTime(frozenElapsedTime);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [activeWorkout, isPaused, totalPausedTime, frozenElapsedTime]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isPaused) {
        handlePause();
        return true; // Prevent default back behavior
      }
      return false; // Allow default behavior when already paused
    });

    return () => backHandler.remove();
  }, [isPaused]);

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

  const handlePause = () => {
    setFrozenElapsedTime(elapsedTime);
    setPauseStartTime(Date.now());
    setIsPaused(true);
    setPauseDialogVisible(true);
  };

  const handleResume = () => {
    const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
    setTotalPausedTime(totalPausedTime + pauseDuration);
    setIsPaused(false);
    setPauseDialogVisible(false);
  };

  const handleStopAndDiscard = () => {
    setPauseDialogVisible(false);
    navigation.navigate('HomeTabs' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={styles.timerRow}>
          <View style={styles.timerContent}>
            <View style={styles.timerTextContainer}>
              <Text variant="displayMedium" style={styles.timer}>
                {formatTimeWithMs(elapsedTime).main}
              </Text>
              <Text variant="headlineSmall" style={styles.timerMs}>
                {formatTimeWithMs(elapsedTime).ms}
              </Text>
            </View>
            {isPaused && (
              <Text variant="bodyMedium" style={styles.pausedLabel}>
                PAUSED
              </Text>
            )}
          </View>
          <IconButton
            icon={isPaused ? "play" : "pause"}
            size={32}
            iconColor="#6200ee"
            onPress={handlePause}
            disabled={isPaused}
            style={styles.pauseButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
        </View>
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
                    {(exercise.unit || '').toLowerCase()} {exercise.name}
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
        <Dialog visible={pauseDialogVisible} onDismiss={handleResume}>
          <Dialog.Title>Workout Paused</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Take a breather! Your progress is saved. Resume when you're ready or stop to discard this workout.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleStopAndDiscard} textColor="#c62828">
              Stop & Discard
            </Button>
            <Button onPress={handleResume} mode="contained">
              Resume
            </Button>
          </Dialog.Actions>
        </Dialog>

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
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  timerContent: {
    alignItems: 'center',
    flex: 1,
  },
  timerTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timer: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  timerMs: {
    fontWeight: 'bold',
    color: '#6200ee',
    opacity: 0.7,
  },
  pausedLabel: {
    color: '#c62828',
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  pauseButton: {
    position: 'absolute',
    right: spacing.md,
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
    textAlign: 'center',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingLeft: spacing.xs + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  newExerciseRow: {
    backgroundColor: '#E8F5E9',
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