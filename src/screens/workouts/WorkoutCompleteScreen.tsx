import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, PanResponder, Platform } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { spacing } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

const WorkoutCompleteScreen: React.FC = () => {
  const navigation = useNavigation();
  const { workoutHistory } = useActiveWorkoutStore();
  const [activeTab, setActiveTab] = useState<'exercises' | 'rounds'>('exercises');

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only activate if horizontal swipe is significant
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Swipe left (show rounds)
        if (gestureState.dx < -50 && activeTab === 'exercises') {
          setActiveTab('rounds');
        }
        // Swipe right (show exercises)
        else if (gestureState.dx > 50 && activeTab === 'rounds') {
          setActiveTab('exercises');
        }
      },
    })
  ).current;

  // Get the most recent workout (just completed)
  const completedWorkout = workoutHistory[0];

  const handleDone = () => {
    navigation.navigate('HomeTabs' as never);
  };

  if (!completedWorkout) {
    return (
      <View style={styles.container}>
        <Text>No workout data</Text>
        <Button onPress={handleDone}>Go Home</Button>
      </View>
    );
  }

  // Calculate exercise totals
  const exerciseTotals = completedWorkout.exercises.map(exercise => {
    const roundsCompleted = completedWorkout.rounds.length;
    // Exercise at position N is performed in rounds N through 12
    const timesPerformed = Math.max(0, roundsCompleted - exercise.position + 1);
    const totalAmount = exercise.position * timesPerformed;
    
    return {
      ...exercise,
      timesPerformed,
      totalAmount
    };
  }).filter(ex => ex.timesPerformed > 0); // Only show exercises that were performed

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
          <Text variant="headlineMedium" style={styles.title}>
            Workout Complete!
          </Text>
          <View style={styles.totalTimeContainer}>
            <Text variant="displaySmall" style={styles.totalTime}>
              {formatTimeWithMs(completedWorkout.totalTime).main}
            </Text>
            <Text variant="headlineSmall" style={styles.totalTimeMs}>
              {formatTimeWithMs(completedWorkout.totalTime).ms}
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
                onPress={() => setActiveTab('exercises')}
              >
                <Text
                  variant="titleSmall"
                  style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}
                >
                  Exercise Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'rounds' && styles.activeTab]}
                onPress={() => setActiveTab('rounds')}
              >
                <Text
                  variant="titleSmall"
                  style={[styles.tabText, activeTab === 'rounds' && styles.activeTabText]}
                >
                  Round Times
                </Text>
              </TouchableOpacity>
            </View>

            <View {...panResponder.panHandlers} style={styles.swipeContainer}>
              {activeTab === 'exercises' ? (
                <View style={styles.tabContent}>
                  {exerciseTotals.map((exercise) => (
                    <View key={exercise.position} style={styles.exerciseSummaryItem}>
                      <Text variant="bodyLarge">{exercise.name}</Text>
                      <Text variant="bodyLarge" style={styles.exerciseTotalText}>
                        {exercise.totalAmount} {(exercise.unit || 'reps').toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.tabContent}>
                  {completedWorkout.rounds.map((round) => (
                    <View key={round.roundNumber} style={styles.roundItem}>
                      <Text variant="bodyLarge">Round {round.roundNumber}</Text>
                      <Text variant="bodyLarge" style={styles.roundTime}>
                        {formatTimeWithMs(round.duration).main}{formatTimeWithMs(round.duration).ms}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Button
        mode="contained"
        onPress={handleDone}
        style={styles.doneButton}
        contentStyle={styles.doneButtonContent}
      >
        Done
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  title: {
    marginTop: spacing.sm,
    fontWeight: 'bold',
  },
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  totalTime: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  totalTimeMs: {
    fontWeight: 'bold',
    color: '#6200ee',
    opacity: 0.7,
  },
  card: {
    marginBottom: spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -2,
  },
  activeTab: {
    borderBottomColor: '#6200ee',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  swipeContainer: {
    minHeight: 100,
  },
  tabContent: {
    marginTop: spacing.sm,
  },
  exerciseSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseTotalText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roundTime: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  doneButton: {
    margin: spacing.md,
    marginBottom: Platform.OS === 'android' ? 40 : spacing.xl,
  },
  doneButtonContent: {
    paddingVertical: spacing.sm,
  },
});

export default WorkoutCompleteScreen;