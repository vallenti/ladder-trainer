import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { spacing } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WorkoutCompleteScreen: React.FC = () => {
  const navigation = useNavigation();
  const { workoutHistory } = useActiveWorkoutStore();

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

  const totalRounds = completedWorkout.rounds.length;
  const avgRoundTime = totalRounds > 0
    ? Math.floor(completedWorkout.rounds.reduce((sum, r) => sum + r.duration, 0) / totalRounds)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
        <Text variant="headlineLarge" style={styles.title}>
          Workout Complete!
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.workoutName}>
            {completedWorkout.templateName}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="displayMedium" style={styles.statValue}>
                {formatTime(completedWorkout.totalTime)}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Time
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="displayMedium" style={styles.statValue}>
                {totalRounds}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Rounds
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="displayMedium" style={styles.statValue}>
                {formatTime(avgRoundTime)}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Avg Round
              </Text>
            </View>
          </View>

          <View style={styles.roundsList}>
            <Text variant="titleMedium" style={styles.roundsTitle}>
              Round Times
            </Text>
            {completedWorkout.rounds.map((round) => (
              <View key={round.roundNumber} style={styles.roundItem}>
                <Text variant="bodyLarge">Round {round.roundNumber}</Text>
                <Text variant="bodyLarge" style={styles.roundTime}>
                  {formatTime(round.duration)}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

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
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: spacing.lg,
  },
  workoutName: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    color: '#666',
    marginTop: spacing.xs,
  },
  roundsList: {
    marginTop: spacing.md,
  },
  roundsTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
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
    marginTop: spacing.md,
  },
  doneButtonContent: {
    paddingVertical: spacing.sm,
  },
});

export default WorkoutCompleteScreen;