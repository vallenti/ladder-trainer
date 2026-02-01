import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text, Card, IconButton, Portal, Dialog, Button, useTheme, Divider } from 'react-native-paper';
import { spacing } from '../../constants/theme';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { getLadderStrategy } from '../../utils/ladderStrategies';
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

const formatDateTime = (date: Date) => {
  const now = new Date();
  const workoutDate = new Date(date);
  const isToday = workoutDate.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = workoutDate.toDateString() === yesterday.toDateString();
  
  const dateStr = isToday 
    ? 'Today' 
    : isYesterday 
    ? 'Yesterday' 
    : workoutDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: workoutDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  
  const timeStr = workoutDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  
  return { dateStr, timeStr };
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

  const handleShare = async (workoutId: string) => {
    const workout = workoutHistory.find(w => w.id === workoutId);
    if (!workout) return;

    const { dateStr, timeStr } = formatDateTime(workout.startTime);
    const ladderStrategy = getLadderStrategy(workout.ladderType, workout.stepSize || 1, workout.maxRounds);
    
    // Calculate exercise summary using ladder strategy
    const exerciseTotals = workout.exercises.map(exercise => {
      const totalAmount = ladderStrategy.calculateTotalReps(exercise, workout.rounds.length);
      return {
        ...exercise,
        totalAmount
      };
    });

    // Format the share message
    const ladderTypeName = 
      workout.ladderType === 'christmas' ? 'Christmas Ladder' : 
      workout.ladderType === 'ascending' ? 'Ascending Ladder' : 
      workout.ladderType === 'descending' ? 'Descending Ladder' :
      'Pyramid Ladder';
    let message = `🏋️ ${workout.templateName}\n`;
    message += `📊 ${ladderTypeName}\n\n`;
    message += `📅 ${dateStr} at ${timeStr}\n`;
    message += `⏱️ Total Time: ${formatTimeWithMs(workout.totalTime)}\n`;
    message += `🔄 Rounds Completed: ${workout.rounds.length}/${workout.maxRounds}\n\n`;
    
    if (exerciseTotals.length > 0) {
      message += `💪 Exercise Summary:\n`;
      exerciseTotals.forEach(ex => {
        message += `  • ${ex.name}: ${ex.totalAmount} ${ex.unit || 'reps'}\n`;
      });
      message += '\n';
    }
    
    message += `🔥 Round Times:\n`;
    workout.rounds.forEach(round => {
      message += `  Round ${round.roundNumber}: ${formatTimeWithMs(round.duration)}\n`;
    });
    
    message += `\n💪 Powered by LadFit`;

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
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
          const { dateStr, timeStr } = formatDateTime(workout.startTime);
          const ladderStrategy = getLadderStrategy(workout.ladderType, workout.stepSize || 1, workout.maxRounds);
          const exerciseTotals = workout.exercises.map(exercise => {
            const totalAmount = ladderStrategy.calculateTotalReps(exercise, workout.rounds.length);
            return {
              ...exercise,
              totalAmount
            };
          });

          return (
            <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
              <TouchableOpacity
                onPress={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                activeOpacity={0.7}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <View style={styles.leftContent}>
                      <Text variant="titleLarge" style={[styles.workoutName, { color: theme.colors.onSurface }]}>
                        {workout.templateName}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                            {dateStr}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                            {timeStr}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.rightContent}>
                      <Text variant="headlineSmall" style={[styles.totalTime, { color: theme.colors.primary }]}>
                        {formatTimeWithMs(workout.totalTime)}
                      </Text>
                      <View style={[styles.roundsBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text variant="bodySmall" style={[styles.roundsText, { color: theme.colors.onSurfaceVariant }]}>
                          {workout.rounds.length} {workout.rounds.length === 1 ? 'round' : 'rounds'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {isExpanded && (
                    <>
                      <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
                      
                      <View style={styles.expandedContent}>
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="dumbbell" size={18} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                              Exercise Summary
                            </Text>
                          </View>
                          {exerciseTotals.map((exercise, index) => (
                            <View 
                              key={exercise.position} 
                              style={[
                                styles.exerciseItem,
                                index < exerciseTotals.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant }
                              ]}
                            >
                              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                                {exercise.name}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.exerciseTotal, { color: theme.colors.tertiary }]}>
                                {exercise.totalAmount} {(exercise.unit || 'reps').toLowerCase()}
                              </Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="timer-outline" size={18} color={theme.colors.primary} />
                            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                              Round Times
                            </Text>
                          </View>
                          {workout.rounds.map((round, index) => (
                            <View 
                              key={round.roundNumber} 
                              style={[
                                styles.roundItem,
                                index < workout.rounds.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant }
                              ]}
                            >
                              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                                Round {round.roundNumber}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.roundTime, { color: theme.colors.primary }]}>
                                {formatTimeWithMs(round.duration)}
                              </Text>
                            </View>
                          ))}
                        </View>
                        
                        <View style={styles.actionButtons}>
                          <Button
                            mode="outlined"
                            icon="share-variant"
                            onPress={() => handleShare(workout.id)}
                            style={styles.stravaButton}
                            compact
                            textColor={theme.colors.primary}
                          >
                            Share Workout
                          </Button>
                          <IconButton
                            icon="delete"
                            iconColor={theme.colors.error}
                            size={22}
                            onPress={() => handleDelete(workout.id)}
                            style={styles.deleteButton}
                          />
                        </View>
                      </View>
                    </>
                  )}
                </Card.Content>
              </TouchableOpacity>
            </Card>
          );
        })}
      </ScrollView>

      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this workout? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setDeleteDialogVisible(false)}
              buttonColor={theme.colors.primary}
              textColor="#FFFFFF"
              mode="contained"
            >
              Cancel
            </Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>Delete</Button>
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
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
  },
  workoutCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  workoutName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  totalTime: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  roundsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roundsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.md,
  },
  expandedContent: {
    marginTop: 0,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  exerciseTotal: {
    fontWeight: '600',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  roundTime: {
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  stravaButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  deleteButton: {
    margin: 0,
  },
});

export default LogbookScreen;