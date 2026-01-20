import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';

const RestScreen: React.FC = () => {
  const navigation = useNavigation();
  const { activeWorkout, startNextRound } = useActiveWorkoutStore();
  const [timeRemaining, setTimeRemaining] = useState(activeWorkout?.restPeriodSeconds || 60);

  useEffect(() => {
    if (timeRemaining === 0) {
      handleSkipRest();
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const handleSkipRest = () => {
    startNextRound();
    // @ts-ignore
    navigation.replace('ActiveWorkout', { workoutId: activeWorkout?.id });
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
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Rest
      </Text>
      <Text variant="displayLarge" style={styles.timer}>
        {formatTime(timeRemaining)}
      </Text>
      <Text variant="titleMedium" style={styles.nextRound}>
        Next: Round {nextRound}
      </Text>
      <Button
        mode="outlined"
        onPress={handleSkipRest}
        style={styles.skipButton}
        contentStyle={styles.skipButtonContent}
        buttonColor="white"
        textColor="#4CAF50"
      >
        Skip Rest
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 20,
  },
  title: {
    color: 'white',
    marginBottom: 40,
  },
  timer: {
    color: 'white',
    fontSize: 100,
    fontWeight: 'bold',
    lineHeight: 120,
    textAlignVertical: 'center',
  },
  nextRound: {
    color: 'white',
    marginTop: 20,
    marginBottom: 40,
  },
  skipButton: {
    marginTop: 20,
  },
  skipButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
});

export default RestScreen;