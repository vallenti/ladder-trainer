import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { useWorkoutStore } from '../../store/workoutStore';

type RouteParams = {
  Countdown: {
    workoutId: string;
  };
};

const CountdownScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Countdown'>>();
  const { getWorkout } = useWorkoutStore();
  const { startWorkout } = useActiveWorkoutStore();
  const [countdown, setCountdown] = useState(5);

  const template = getWorkout(route.params.workoutId);

  useEffect(() => {
    if (countdown === 0) {
      if (template) {
        startWorkout(template);
        // @ts-ignore
        navigation.replace('ActiveWorkout', { workoutId: route.params.workoutId });
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, template]);

  if (!template) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text variant="headlineLarge" style={[styles.workoutName, { color: '#FFFFFF' }]}>
        {template.name}
      </Text>
      <Text variant="displayLarge" style={[styles.countdown, { color: '#FFFFFF' }]}>
        {countdown}
      </Text>
      <Text variant="titleMedium" style={[styles.subtitle, { color: '#FFFFFF' }]}>
        Get Ready!
      </Text>
      <Text variant="bodyLarge" style={[styles.info, { color: '#FFFFFF' }]}>
        {template.exercises.length} rounds
      </Text>
      {template.restPeriodSeconds > 0 && (
        <Text variant="bodyMedium" style={[styles.info, { color: '#FFFFFF' }]}>
          {template.restPeriodSeconds}s rest between rounds
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  workoutName: {
    marginBottom: 40,
    textAlign: 'center',
  },
  countdown: {
    fontSize: 120,
    fontWeight: 'bold',
    lineHeight: 140,
    textAlignVertical: 'center',
  },
  subtitle: {
    marginTop: 20,
  },
  info: {
    opacity: 0.8,
    marginTop: 10,
  },
});

export default CountdownScreen;