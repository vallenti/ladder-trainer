import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, BackHandler, useWindowDimensions } from 'react-native';
import { Text, Button, Card, ProgressBar, Appbar, Portal, Dialog, IconButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { getLadderStrategy } from '../../utils/ladderStrategies';
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
  const theme = useTheme();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const { 
    activeWorkout, 
    completeRound, 
    startNextRound, 
    completeWorkout,
    isPaused: storePaused,
    elapsedTime: storeElapsedTime,
    totalPausedTime: storeTotalPausedTime,
    pauseWorkout,
    resumeWorkout,
    discardPausedWorkout,
    isMuted,
    toggleMute,
    isTimerFocusMode,
    setTimerFocusMode,
  } = useActiveWorkoutStore();
  const [elapsedTime, setElapsedTime] = useState(storeElapsedTime);
  const [isPaused, setIsPaused] = useState(storePaused);
  const [pauseDialogVisible, setPauseDialogVisible] = useState(storePaused);
  const [quitDialogVisible, setQuitDialogVisible] = useState(false);
  const [totalPausedTime, setTotalPausedTime] = useState(storeTotalPausedTime);
  const [frozenElapsedTime, setFrozenElapsedTime] = useState(storeElapsedTime);

  // Sync with store state when it changes (e.g., after loading paused workout)
  useEffect(() => {
    setIsPaused(storePaused);
    setElapsedTime(storeElapsedTime);
    setTotalPausedTime(storeTotalPausedTime);
    setFrozenElapsedTime(storeElapsedTime);
    setPauseDialogVisible(storePaused);
  }, [storePaused, storeElapsedTime, storeTotalPausedTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeWorkout && !isPaused) {
        const totalElapsedMs = new Date().getTime() - activeWorkout.startTime.getTime();
        const elapsed = (totalElapsedMs / 1000) - totalPausedTime;
        setElapsedTime(elapsed);
        
        // Check time cap for AMRAP workouts
        if (activeWorkout.ladderType === 'amrap' && activeWorkout.timeCap && elapsed >= activeWorkout.timeCap) {
          // Time cap reached - trigger partial round completion
          handleTimeCapReached();
        }
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
        // Pause the workout when back button is pressed
        setFrozenElapsedTime(elapsedTime);
        setIsPaused(true);
        setPauseDialogVisible(true);
        pauseWorkout(elapsedTime, totalPausedTime);
        return true; // Prevent default back behavior
      }
      return false; // Allow default behavior when already paused
    });

    return () => backHandler.remove();
  }, [isPaused, elapsedTime, totalPausedTime, pauseWorkout]);

  if (!activeWorkout) {
    return (
      <View style={styles.container}>
        <Text>No active workout</Text>
      </View>
    );
  }

  const currentRound = activeWorkout.currentRoundIndex + 1;
  const totalRounds = activeWorkout.maxRounds;
  const ladderStrategy = getLadderStrategy(activeWorkout.ladderType, activeWorkout.stepSize || 1, activeWorkout.maxRounds, activeWorkout.startingReps);
  const exercisesInRound = ladderStrategy.getExercisesForRound(currentRound, activeWorkout.exercises);
  const progress = activeWorkout.currentRoundIndex / totalRounds;

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

  const handleTimeCapReached = async () => {
    // For AMRAP, complete the current round and navigate to workout complete with partial round input
    completeRound();
    await completeWorkout();
    // @ts-ignore
    navigation.replace('WorkoutComplete', { workoutId: activeWorkout.id, showPartialRoundInput: true });
  };

  const handleQuit = () => {
    setQuitDialogVisible(false);
    navigation.navigate('HomeTabs' as never);
  };

  const handlePause = () => {
    setFrozenElapsedTime(elapsedTime);
    setIsPaused(true);
    setPauseDialogVisible(true);
    // Save to store for persistence
    pauseWorkout(elapsedTime, totalPausedTime);
  };

  const handleResume = () => {
    resumeWorkout();
    // Get the updated totalPausedTime from the store after resume
    setTimeout(() => {
      const store = useActiveWorkoutStore.getState();
      setTotalPausedTime(store.totalPausedTime);
      setIsPaused(false);
      setPauseDialogVisible(false);
    }, 0);
  };

  const handleStopAndDiscard = async () => {
    await discardPausedWorkout();
    setPauseDialogVisible(false);
    navigation.navigate('HomeTabs' as never);
  };

  const toggleViewMode = () => {
    setTimerFocusMode(!isTimerFocusMode);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.timerContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.timerRow}>
          <IconButton
            icon={isMuted ? "volume-off" : "volume-high"}
            size={28}
            iconColor={theme.colors.primary}
            onPress={toggleMute}
            style={styles.muteButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
          <IconButton
            icon={isTimerFocusMode ? "format-list-bulleted" : "timer"}
            size={28}
            iconColor={theme.colors.primary}
            onPress={toggleViewMode}
            style={styles.toggleButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
          {!isTimerFocusMode && (
            <View style={styles.timerContent}>
              <View style={styles.timerTextContainer}>
                <Text 
                  variant="displayMedium"
                  style={[styles.timer, { color: theme.colors.primary }]}
                >
                  {formatTimeWithMs(elapsedTime).main}
                </Text>
                <Text 
                  variant="headlineSmall"
                  style={[styles.timerMs, { color: theme.colors.primary }]}
                >
                  {formatTimeWithMs(elapsedTime).ms}
                </Text>
              </View>
              {isPaused && (
                <Text 
                  variant="bodyMedium"
                  style={[styles.pausedLabel, { color: theme.colors.error }]}
                >
                  PAUSED
                </Text>
              )}
            </View>
          )}
          {isTimerFocusMode && <View style={[styles.timerContent, styles.timerContentPlaceholder]} />}
          <IconButton
            icon={isPaused ? "play" : "pause"}
            size={28}
            iconColor={theme.colors.primary}
            onPress={handlePause}
            disabled={isPaused}
            style={styles.pauseButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <ProgressBar
          progress={
            activeWorkout.ladderType === 'amrap' && activeWorkout.timeCap
              ? Math.min(elapsedTime / activeWorkout.timeCap, 1)
              : activeWorkout.currentRoundIndex / totalRounds
          }
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </View>

      {/* Exercise List View - Hidden in Timer Focus Mode */}
      {!isTimerFocusMode && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {activeWorkout.ladderType === 'chipper' ? (
              <>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {currentRound} of {totalRounds} Complete
                </Text>
                {activeWorkout.exercises.map((exercise, index) => {
                  const roundNumber = index + 1;
                  const isCompleted = roundNumber <= currentRound - 1;
                  const isCurrent = roundNumber === currentRound;
                  
                  return (
                    <View 
                      key={exercise.position} 
                      style={[
                        styles.exerciseRow,
                        { borderBottomColor: theme.colors.outline },
                        isCurrent && [
                          styles.newExerciseRow,
                          { 
                            backgroundColor: theme.dark 
                              ? 'rgba(255, 140, 97, 0.15)'
                              : 'rgba(255, 107, 53, 0.1)',
                            borderLeftColor: theme.colors.primary
                          }
                        ],
                        isCompleted && styles.completedExerciseRow
                      ]}
                    >
                      <View style={styles.repsContainer}>
                        {isCompleted ? (
                          <Text variant="titleLarge" style={[styles.checkmark, { color: theme.colors.primary }]}>
                            ✓
                          </Text>
                        ) : (
                          <Text variant="titleLarge" style={[
                            styles.repsNumber,
                            { color: theme.colors.primary },
                            isCurrent && { fontWeight: 'bold' }
                          ]}>
                            {exercise.fixedReps}
                          </Text>
                        )}
                      </View>
                      <Text variant="bodyLarge" style={[
                        styles.exerciseName,
                        { color: theme.colors.onSurface },
                        isCurrent && { fontWeight: 'bold' },
                        isCompleted && { textDecorationLine: 'line-through', opacity: 0.6 }
                      ]}>
                        {(exercise.unit || '').toLowerCase()} {exercise.name}
                      </Text>
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {activeWorkout.ladderType === 'amrap' ? `Round ${currentRound}` : `Round ${currentRound} of ${totalRounds}`}
                </Text>
                {exercisesInRound.map((item) => {
                  const isNewExercise = activeWorkout.ladderType === 'christmas' && item.exercise.position === currentRound;
                  return (
                    <View 
                      key={item.exercise.position} 
                      style={[
                        styles.exerciseRow,
                        { borderBottomColor: theme.colors.outline },
                        isNewExercise && [
                          styles.newExerciseRow,
                          { 
                            backgroundColor: theme.dark 
                              ? 'rgba(255, 140, 97, 0.15)'
                              : 'rgba(255, 107, 53, 0.1)',
                            borderLeftColor: theme.colors.primary
                          }
                        ]
                      ]}
                    >
                      <View style={styles.repsContainer}>
                        <Text variant="titleLarge" style={[
                          styles.repsNumber,
                          { color: theme.colors.primary },
                          isNewExercise && { fontWeight: 'bold' }
                        ]}>
                          {item.reps}
                        </Text>
                      </View>
                      <Text variant="bodyLarge" style={[
                        styles.exerciseName,
                        { color: theme.colors.onSurface },
                        isNewExercise && { fontWeight: 'bold' }
                      ]}>
                        {(item.exercise.unit || '').toLowerCase()} {item.exercise.name}
                      </Text>
                    </View>
                  );
                })}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      )}

      {/* Timer Focus Mode - Show centered large timer */}
      {isTimerFocusMode && (
        <View style={[
          styles.timerFocusContent,
          isLandscape && styles.timerFocusContentLandscape
        ]}>
          <View style={styles.timerFocusDisplay}>
            <View style={[
              styles.timerTextContainer,
              isLandscape && styles.timerTextContainerLandscape
            ]}>
              <Text 
                variant="displayLarge"
                style={[
                  styles.timer, 
                  { color: theme.colors.primary },
                  styles.timerFocus,
                  isLandscape && styles.timerLandscape
                ]}
              >
                {formatTimeWithMs(elapsedTime).main}
              </Text>
              <Text 
                variant="headlineLarge"
                style={[
                  styles.timerMs, 
                  { color: theme.colors.primary },
                  styles.timerMsFocus,
                  isLandscape && styles.timerMsLandscape
                ]}
              >
                {formatTimeWithMs(elapsedTime).ms}
              </Text>
            </View>
            {isPaused && (
              <Text 
                variant="headlineSmall"
                style={[
                  styles.pausedLabel, 
                  { color: theme.colors.error },
                  styles.pausedLabelFocus
                ]}
              >
                PAUSED
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={[
        isTimerFocusMode ? styles.buttonContainerFocus : styles.buttonContainer,
        isLandscape && styles.buttonContainerLandscape,
        { 
          backgroundColor: theme.colors.surface, 
          borderTopColor: theme.colors.outline,
          shadowColor: theme.colors.shadow 
        }
      ]}>
        <Button
          mode="contained"
          onPress={handleRoundComplete}
          style={styles.completeButton}
          contentStyle={isTimerFocusMode ? styles.completeButtonContentFocus : styles.completeButtonContent}
          buttonColor={theme.colors.primary}
          textColor="#FFFFFF"
          labelStyle={isTimerFocusMode && styles.completeButtonLabelFocus}
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
            <Button onPress={handleStopAndDiscard} textColor={theme.colors.error}>
              Stop & Discard
            </Button>
            <Button onPress={handleResume} mode="contained" buttonColor={theme.colors.primary}>
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
            <Button onPress={handleQuit} textColor={theme.colors.error}>Quit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerContainer: {
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: spacing.md,
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
    minHeight: 50,
  },
  timerContentPlaceholder: {
    minHeight: 50,
  },
  timerTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timer: {
    fontWeight: 'bold',
  },
  timerMs: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  pausedLabel: {
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  muteButton: {
    position: 'absolute',
    left: spacing.md,
  },
  toggleButton: {
    position: 'absolute',
    right: spacing.md + 48,
  },
  pauseButton: {
    position: 'absolute',
    right: spacing.md,
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 0,
  },
  progressBar: {
    height: 6,
    borderRadius: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  // Timer Focus Mode Content Area
  timerFocusContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    overflow: 'visible',
  },
  timerFocusContentLandscape: {
    paddingHorizontal: spacing.xl,
  },
  timerFocusDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  newExerciseRow: {
    borderLeftWidth: 4,
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
  },
  checkmark: {
    fontWeight: 'bold',
    fontSize: 28,
  },
  completedExerciseRow: {
    opacity: 0.7,
  },
  newExerciseText: {
    fontWeight: 'bold',
  },
  exerciseName: {
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'android' ? 40 : spacing.md,
    borderTopWidth: 1,
    elevation: 8,
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
  // Timer Focus Mode Styles
  timerTextContainerLandscape: {
    transform: [{ scale: 1.2 }],
  },
  timerFocus: {
    fontSize: 96,
    fontWeight: 'bold',
    lineHeight: 110,
    includeFontPadding: false,
  },
  timerLandscape: {
    fontSize: 120,
    lineHeight: 140,
  },
  timerMsFocus: {
    fontSize: 48,
    opacity: 0.8,
    lineHeight: 58,
    includeFontPadding: false,
  },
  timerMsLandscape: {
    fontSize: 56,
    lineHeight: 68,
  },
  pausedLabelFocus: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: spacing.md,
    letterSpacing: 4,
  },
  buttonContainerFocus: {
    padding: spacing.md,
    paddingBottom: Platform.OS === 'android' ? 40 : spacing.md,
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainerLandscape: {
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'android' ? spacing.md : spacing.sm,
  },
  completeButtonContentFocus: {
    paddingVertical: spacing.md,
  },
  completeButtonLabelFocus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ActiveWorkoutScreen;