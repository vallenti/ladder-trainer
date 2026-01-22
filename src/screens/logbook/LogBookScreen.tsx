import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Portal, Dialog, Button, useTheme } from 'react-native-paper';
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
  const theme = useTheme();
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
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={80} color={theme.colors.onSurfaceVariant} />
        <Text variant="headlineSmall" style={styles.emptyText}>
          No workouts completed yet
        </Text>
        <Text variant="bodyLarge" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Complete your first workout to see it here!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                      <Text variant="bodySmall" style={[styles.workoutDate, { color: theme.colors.onSurfaceVariant }]}>
                        {new Date(workout.startTime).toLocaleDateString()} {new Date(workout.startTime).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <Text variant="titleLarge" style={[styles.totalTime, { color: theme.colors.primary }]}>
                        {formatTimeWithMs(workout.totalTime)}
                      </Text>
                      <Text variant="bodySmall" style={[styles.roundsCompleted, { color: theme.colors.onSurfaceVariant }]}>
                        {workout.rounds.length} rounds
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={[styles.actionButtons, { borderTopColor: theme.colors.outline }]}>
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
                          iconColor={theme.colors.error}
                          size={24}
                          onPress={() => handleDelete(workout.id)}
                        />
                      </View>

                      <View style={styles.section}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>
                          Exercise Summary
                        </Text>
                        {exerciseTotals.map((exercise) => (
                          <View key={exercise.position} style={[styles.exerciseItem, { borderBottomColor: theme.colors.outline }]}>
                            <Text variant="bodyMedium">{exercise.name}</Text>
                            <Text variant="bodyMedium" style={[styles.exerciseTotal, { color: theme.colors.tertiary }]}>
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
                          <View key={round.roundNumber} style={[styles.roundItem, { borderBottomColor: theme.colors.outline }]}>
                            <Text variant="bodyMedium">Round {round.roundNumber}</Text>
                            <Text variant="bodyMedium" style={[styles.roundTime, { color: theme.colors.primary }]}>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
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
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  totalTime: {
    fontWeight: 'bold',
  },
  roundsCompleted: {
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
  },
});

export default LogbookScreen;