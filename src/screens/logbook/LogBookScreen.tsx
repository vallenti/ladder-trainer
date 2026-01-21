import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import { spacing } from '../../constants/theme';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const formatTimeWithMs = (totalSeconds: number): string => {
  const seconds = Math.floor(totalSeconds);
  const ms = Math.floor((totalSeconds - seconds) * 100);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const LogbookScreen: React.FC = () => {
  const { workoutHistory, loadHistory, deleteWorkoutFromHistory } = useActiveWorkoutStore();
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (workoutToDelete) {
      await deleteWorkoutFromHistory(workoutToDelete);
      setDeleteDialogVisible(false);
      setWorkoutToDelete(null);
      setExpandedWorkoutId(null);
    }
  };

  const handleStravaShare = (workoutId: string) => {
    // Placeholder for Strava integration
    console.log('Share to Strava:', workoutId);
  };

  if (workoutHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#ccc" />
        <Text variant="headlineSmall" style={styles.emptyText}>
          No workouts completed yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptySubtext}>
          Complete your first workout to see it here!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {workoutHistory.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;
          const exerciseTotals = workout.exercises.map(exercise => {
            const roundsCompleted = workout.rounds.length;
            const timesPerformed = Math.max(0, roundsCompleted - exercise.position + 1);
            const totalAmount = exercise.position * timesPerformed;
            return {
              ...exercise,
              timesPerformed,
              totalAmount
            };
          }).filter(ex => ex.timesPerformed > 0);

          return (
            <Card key={workout.id} style={styles.workoutCard}>
              <TouchableOpacity
                onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
              >
                <Card.Content>
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutInfo}>
                      <Text variant="titleMedium" style={styles.workoutName}>
                        {workout.templateName}
                      </Text>
                      <Text variant="bodySmall" style={styles.workoutDate}>
                        {new Date(workout.startTime).toLocaleDateString()} {new Date(workout.startTime).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <Text variant="titleLarge" style={styles.totalTime}>
                        {formatTimeWithMs(workout.totalTime)}
                      </Text>
                      <Text variant="bodySmall" style={styles.roundsCompleted}>
                        {workout.rounds.length} rounds
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.actionButtons}>
                        <Button
                          mode="outlined"
                          icon="share-variant"
                          onPress={() => handleStravaShare(workout.id)}
                          style={styles.stravaButton}
                          compact
                        >
                          Share to Strava
                        </Button>
                        <IconButton
                          icon="delete"
                          iconColor="#c62828"
                          size={24}
                          onPress={() => handleDelete(workout.id)}
                        />
                      </View>

                      <View style={styles.section}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>
                          Exercise Summary
                        </Text>
                        {exerciseTotals.map((exercise) => (
                          <View key={exercise.position} style={styles.exerciseItem}>
                            <Text variant="bodyMedium">{exercise.name}</Text>
                            <Text variant="bodyMedium" style={styles.exerciseTotal}>
                              {exercise.totalAmount} {(exercise.unit || 'reps').toLowerCase()}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.section}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>
                          Round Times
                        </Text>
                        {workout.rounds.map((round) => (
                          <View key={round.roundNumber} style={styles.roundItem}>
                            <Text variant="bodyMedium">Round {round.roundNumber}</Text>
                            <Text variant="bodyMedium" style={styles.roundTime}>
                              {formatTimeWithMs(round.duration)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </Card.Content>
              </TouchableOpacity>
            </Card>
          );
        })}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this workout? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} textColor="#c62828">Delete</Button>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  workoutCard: {
    marginBottom: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  workoutDate: {
    color: '#666',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  totalTime: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  roundsCompleted: {
    color: '#666',
    marginTop: spacing.xs,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stravaButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseTotal: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roundTime: {
    fontWeight: '600',
    color: '#6200ee',
  },
});

export default LogbookScreen;