import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, useTheme, IconButton, Portal, Dialog, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { playShortBeep, playLongBeep } from '../../utils/soundUtils';
import { spacing } from '../../constants/theme';

const RestScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { activeWorkout, startNextRound, isMuted, discardPausedWorkout } = useActiveWorkoutStore();
  const [timeRemaining, setTimeRemaining] = useState(activeWorkout?.restPeriodSeconds || 60);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseDialogVisible, setPauseDialogVisible] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    if (timeRemaining === 0) {
      handleSkipRest();
      return;
    }

    // Play beeps at 3, 2, 1 seconds remaining
    if (!isMuted) {
      if (timeRemaining === 3 || timeRemaining === 2) {
        playShortBeep();
      } else if (timeRemaining === 1) {
        playLongBeep();
      }
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, isMuted, isPaused]);

  const handleSkipRest = () => {
    startNextRound();
    // @ts-ignore
    navigation.replace('ActiveWorkout', { workoutId: activeWorkout?.id });
  };

  const handleAddTime = (seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
  };

  const handlePause = () => {
    setIsPaused(true);
    setPauseDialogVisible(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    setPauseDialogVisible(false);
  };

  const handleStopAndDiscard = async () => {
    await discardPausedWorkout();
    setPauseDialogVisible(false);
    navigation.navigate('HomeTabs' as never);
  };

  if (!activeWorkout) {
    return (
      <View style={styles.container}>
        <Text>No active workout</Text>
      </View>
    );
  }

  const nextRound = activeWorkout.currentRoundIndex + 2;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <IconButton
        icon={isPaused ? "play" : "pause"}
        size={32}
        iconColor="#FFFFFF"
        onPress={handlePause}
        disabled={isPaused}
        style={styles.pauseButton}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      />
      
      <View style={styles.content}>
        <Text variant="headlineLarge" style={[styles.title, { color: '#FFFFFF' }]}>
          Rest
        </Text>
        
        <Text variant="displayLarge" style={[styles.timer, { color: '#FFFFFF' }]}>
          {formatTime(timeRemaining)}
        </Text>
        
        {isPaused && (
          <Text variant="bodyLarge" style={[styles.pausedLabel, { color: '#FFFFFF' }]}>
            PAUSED
          </Text>
        )}
        
        <View style={styles.quickTimeContainer}>
          <Chip
            mode="outlined"
            onPress={() => handleAddTime(15)}
            style={styles.timeChip}
            textStyle={styles.timeChipText}
            disabled={isPaused}
          >
            +15s
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => handleAddTime(30)}
            style={styles.timeChip}
            textStyle={styles.timeChipText}
            disabled={isPaused}
          >
            +30s
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => handleAddTime(60)}
            style={styles.timeChip}
            textStyle={styles.timeChipText}
            disabled={isPaused}
          >
            +60s
          </Chip>
        </View>
        
        <Text variant="titleMedium" style={[styles.nextRound, { color: '#FFFFFF' }]}>
          Next: Round {nextRound}
        </Text>
        
        <Button
          mode="contained"
          onPress={handleSkipRest}
          style={styles.skipButton}
          contentStyle={styles.skipButtonContent}
          buttonColor="#FFFFFF"
          textColor={theme.colors.primary}
          disabled={isPaused}
        >
          Skip Rest
        </Button>
      </View>

      <Portal>
        <Dialog visible={pauseDialogVisible} onDismiss={handleResume}>
          <Dialog.Title>Rest Paused</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Rest timer is paused. Resume when you're ready or stop to discard this workout.
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
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  pauseButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    right: spacing.md,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    marginBottom: 40,
  },
  timer: {
    fontSize: 100,
    fontWeight: 'bold',
    lineHeight: 120,
    textAlignVertical: 'center',
  },
  pausedLabel: {
    fontWeight: 'bold',
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  quickTimeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  timeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  timeChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextRound: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  skipButton: {
    marginTop: spacing.md,
  },
  skipButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});

export default RestScreen;
