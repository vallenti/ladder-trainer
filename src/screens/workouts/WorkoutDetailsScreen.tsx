import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Appbar, Portal, Dialog, useTheme, Chip, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import { spacing } from '../../constants/theme';
import { Exercise } from '../../types';

type RouteParams = {
  WorkoutDetails: {
    workoutId: string;
  };
};

const WorkoutDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'WorkoutDetails'>>();
  const { getWorkout, deleteWorkout } = useWorkoutStore();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const workout = getWorkout(route.params.workoutId);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Workout Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text>Workout not found</Text>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    // @ts-ignore
    navigation.navigate('CreateEditWorkout', { workoutId: workout.id });
  };

  const handleDelete = async () => {
    await deleteWorkout(workout.id);
    setDeleteDialogVisible(false);
    navigation.goBack();
  };

  const handleStartWorkout = () => {
    // @ts-ignore
    navigation.navigate('Countdown', { workoutId: workout.id });
  };

  // Get ladder type display name
  const getLadderTypeDisplay = (): string => {
    switch (workout.ladderType) {
      case 'ascending':
        return 'Ascending Ladder';
      case 'descending':
        return 'Descending Ladder';
      case 'pyramid':
        return 'Pyramid Ladder';
      case 'christmas':
        return 'Christmas Ladder';
      case 'flexible':
        return 'Flexible Ladder';
      case 'chipper':
        return 'Chipper';
      case 'amrap':
        return 'AMRAP';
      case 'forreps':
        return 'For Reps';
      default:
        return workout.ladderType;
    }
  };

  // Get progression icon for an exercise
  const getExerciseProgression = (exercise: Exercise): string => {
    if (workout.ladderType === 'flexible') {
      if (exercise.direction === 'ascending') return '↑';
      if (exercise.direction === 'descending') return '↓';
      return '→';
    }
    if (workout.ladderType === 'ascending') return '↑';
    if (workout.ladderType === 'descending') return '↓';
    if (workout.ladderType === 'pyramid') return '↕';
    if (workout.ladderType === 'chipper' || workout.ladderType === 'forreps') return '→';
    if (workout.ladderType === 'amrap') {
      const step = exercise.stepSize || 0;
      return step > 0 ? '↑' : '→';
    }
    return '';
  };

  // Get exercise display text with reps info
  const getExerciseDisplay = (exercise: Exercise): string => {
    let repsInfo = '';
    
    if (workout.ladderType === 'flexible') {
      // For flexible, don't show start/step in name - it's in the progression container
      if (exercise.direction === 'constant') {
        repsInfo = `${exercise.startingReps || 1} `;
      }
    } else if (workout.ladderType === 'chipper') {
      repsInfo = `${exercise.fixedReps || 0} `;
    } else if (workout.ladderType === 'forreps') {
      repsInfo = `${exercise.repsPerRound || 0} `;
    } else if (workout.ladderType === 'amrap') {
      // For AMRAP, don't show start/step in name - it's in the progression container
      const step = exercise.stepSize || 0;
      if (step === 0) {
        repsInfo = `${exercise.startingReps || 1} `;
      }
    }
    
    return `${repsInfo}${exercise.unit ? exercise.unit + ' ' : ''}${exercise.name}`;
  };

  // Generate detailed round preview
  const generateDetailedRoundPreview = (): React.ReactNode[] => {
    const rounds = workout.maxRounds || 0;
    const maxPreviewRounds = 10; // Show first 10
    const previewRounds: React.ReactNode[] = [];

    if (workout.ladderType === 'christmas') {
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        const exercisesInRound = workout.exercises
          .filter(ex => ex.position <= r)
          .sort((a, b) => b.position - a.position);
        
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            {exercisesInRound.map((ex, idx) => (
              <Text key={idx} variant="bodyMedium" style={styles.exerciseLineItem}>
                {ex.position}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
              </Text>
            ))}
          </View>
        );
      }
    } else if (workout.ladderType === 'ascending' || workout.ladderType === 'descending' || workout.ladderType === 'pyramid') {
      const step = workout.stepSize || 1;
      const starting = workout.startingReps || 1;
      
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        let reps = 0;
        if (workout.ladderType === 'ascending') {
          reps = starting + (r - 1) * step;
        } else if (workout.ladderType === 'descending') {
          reps = starting - (r - 1) * step;
        } else { // pyramid
          const peak = Math.ceil(rounds / 2);
          reps = r <= peak ? r * step : (rounds - r + 1) * step;
        }
        
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            {workout.exercises.map((ex, idx) => (
              <Text key={idx} variant="bodyMedium" style={styles.exerciseLineItem}>
                {reps}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
              </Text>
            ))}
          </View>
        );
      }
    } else if (workout.ladderType === 'flexible') {
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            {workout.exercises.map((ex, idx) => {
              const start = ex.startingReps || 1;
              const step = ex.stepSize || 1;
              let reps = start;
              
              if (ex.direction === 'ascending') {
                reps = start + (r - 1) * step;
              } else if (ex.direction === 'descending') {
                reps = start - (r - 1) * step;
              }
              
              return (
                <Text key={idx} variant="bodyMedium" style={styles.exerciseLineItem}>
                  {reps}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
                </Text>
              );
            })}
          </View>
        );
      }
    } else if (workout.ladderType === 'chipper') {
      // Chipper: Each round has one exercise, cycling through the exercises
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        const exerciseIndex = (r - 1) % workout.exercises.length;
        const ex = workout.exercises[exerciseIndex];
        const reps = ex.fixedReps;
        
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            <Text variant="bodyMedium" style={styles.exerciseLineItem}>
              {reps || 0}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
            </Text>
          </View>
        );
      }
    } else if (workout.ladderType === 'forreps') {
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            {workout.exercises.map((ex, idx) => {
              const reps = ex.repsPerRound;
              return (
                <Text key={idx} variant="bodyMedium" style={styles.exerciseLineItem}>
                  {reps || 0}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
                </Text>
              );
            })}
          </View>
        );
      }
    } else if (workout.ladderType === 'amrap') {
      for (let r = 1; r <= Math.min(rounds, maxPreviewRounds); r++) {
        previewRounds.push(
          <View key={r} style={styles.roundPreviewItem}>
            <Text variant="labelMedium" style={styles.roundNumber}>Round {r}</Text>
            {workout.exercises.map((ex, idx) => {
              const start = ex.startingReps || 1;
              const step = ex.stepSize || 0;
              const reps = step === 0 ? start : start + (r - 1) * step;
              return (
                <Text key={idx} variant="bodyMedium" style={styles.exerciseLineItem}>
                  {reps}{ex.unit ? ' ' + ex.unit : ''} {ex.name}
                </Text>
              );
            })}
          </View>
        );
      }
    }

    if (workout.ladderType !== 'amrap') {
      if (rounds > maxPreviewRounds) {
            previewRounds.push(
              <Text key="more" variant="bodySmall" style={styles.moreRounds}>
                ... and {rounds - maxPreviewRounds} more round{rounds - maxPreviewRounds > 1 ? 's' : ''}
              </Text>
            );
          }
    }
    
    return previewRounds;
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={workout.name} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={() => setDeleteDialogVisible(true)} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header Info Card */}
          <Card style={[styles.headerCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <Text variant="headlineSmall" style={[styles.workoutTypeTitle, { color: theme.colors.primary }]}>
                {getLadderTypeDisplay()}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>ROUNDS</Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {workout.ladderType === 'amrap' ? 'Max' : workout.maxRounds}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>EXERCISES</Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {workout.exercises.length}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>REST</Text>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {workout.restPeriodSeconds === 0 ? 'None' : `${workout.restPeriodSeconds}s`}
                  </Text>
                </View>
                {workout.ladderType === 'amrap' && workout.timeCap && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>TIME CAP</Text>
                      <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                        {Math.floor(workout.timeCap / 60)}:{(workout.timeCap % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Exercises Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Exercises
              </Text>

              {/* Buy In Exercise */}
              {workout.hasBuyInOut && workout.buyInOutExercise && (
                <>
                  <View style={[styles.buyInOutBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      BUY IN
                    </Text>
                  </View>
                  <View style={styles.exerciseRow}>
                    <View style={[styles.exerciseNumberBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.exerciseNumber, { color: '#FFFFFF' }]}>B</Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text variant="bodyLarge" style={styles.exerciseName}>
                        {workout.buyInOutExercise.repsPerRound ? workout.buyInOutExercise.repsPerRound + ' ' : ''}
                        {workout.buyInOutExercise.unit ? workout.buyInOutExercise.unit + ' ' : ''}{workout.buyInOutExercise.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Complete before starting main workout
                      </Text>
                    </View>
                  </View>
                  {workout.buyInOutRestSeconds && workout.buyInOutRestSeconds > 0 && (
                    <View style={[styles.restIndicator, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        ⏱️ Rest {workout.buyInOutRestSeconds}s
                      </Text>
                    </View>
                  )}
                  <Divider style={styles.buyInOutDivider} />
                </>
              )}

              {workout.exercises.map((exercise, index) => {
                const progression = getExerciseProgression(exercise);
                return (
                  <View key={exercise.position} style={styles.exerciseRow}>
                    <View style={[styles.exerciseNumberBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.exerciseNumber, { color: '#FFFFFF' }]}>
                        {workout.ladderType === 'christmas' ? exercise.position : '⬤'}
                      </Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text variant="bodyLarge" style={styles.exerciseName}>
                        {getExerciseDisplay(exercise)}
                      </Text>
                      {progression && (
                        <View style={styles.progressionContainer}>
                          <Text style={[styles.progressionIcon, { color: theme.colors.primary }]}>
                            {progression}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {workout.ladderType === 'flexible' 
                              ? exercise.direction === 'constant' ? 'Fixed' : 
                                exercise.direction === 'ascending' ? 'Ascending' : 'Descending'
                              : workout.ladderType === 'ascending' ? 'Ascending' :
                                workout.ladderType === 'descending' ? 'Descending' :
                                workout.ladderType === 'pyramid' ? 'Pyramid' :
                                workout.ladderType === 'amrap' ? ((exercise.stepSize || 0) > 0 ? 'Increasing' : 'Fixed') :
                                'Fixed'}
                            {workout.ladderType === 'flexible' && exercise.direction !== 'constant' && (
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {' • Start: '}{exercise.startingReps || 1}{', Step: '}{exercise.stepSize || 1}
                              </Text>
                            )}
                            {workout.ladderType === 'amrap' && (exercise.stepSize || 0) > 0 && (
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {' • Start: '}{exercise.startingReps || 1}{', Step: '}{exercise.stepSize}
                              </Text>
                            )}
                            {(workout.ladderType === 'ascending' || workout.ladderType === 'descending' || workout.ladderType === 'pyramid') && (
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {' • Start: '}{workout.startingReps || 1}{', Step: '}{workout.stepSize || 1}
                              </Text>
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Buy Out Exercise */}
              {workout.hasBuyInOut && workout.buyInOutExercise && (
                <>
                  <Divider style={styles.buyInOutDivider} />
                  {workout.buyInOutRestSeconds && workout.buyInOutRestSeconds > 0 && (
                    <View style={[styles.restIndicator, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        ⏱️ Rest {workout.buyInOutRestSeconds}s
                      </Text>
                    </View>
                  )}
                  <View style={[styles.buyInOutBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      BUY OUT
                    </Text>
                  </View>
                  <View style={styles.exerciseRow}>
                    <View style={[styles.exerciseNumberBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.exerciseNumber, { color: '#FFFFFF' }]}>B</Text>
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text variant="bodyLarge" style={styles.exerciseName}>
                        {workout.buyInOutExercise.repsPerRound ? workout.buyInOutExercise.repsPerRound + ' ' : ''}
                        {workout.buyInOutExercise.unit ? workout.buyInOutExercise.unit + ' ' : ''}{workout.buyInOutExercise.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Complete after finishing main workout
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card.Content>
          </Card>

          {/* Round Preview Card */}
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Round-by-Round Preview
              </Text>
              <Text variant="bodySmall" style={[styles.previewSubtext, { color: theme.colors.onSurfaceVariant }]}>
                What you'll do in each round
              </Text>
              <Divider style={styles.previewDivider} />
              {generateDetailedRoundPreview()}
            </Card.Content>
          </Card>

          {/* Workout Configuration Card - hidden for ascending/descending/pyramid as info is shown per exercise */}
          {(workout.stepSize || workout.startingReps) && workout.ladderType !== 'flexible' && 
           workout.ladderType !== 'chipper' && workout.ladderType !== 'forreps' &&
           workout.ladderType !== 'ascending' && workout.ladderType !== 'descending' && workout.ladderType !== 'pyramid' && (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Configuration
                </Text>
                <View style={styles.configRow}>
                  {workout.startingReps && (
                    <View style={styles.configItem}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Starting Reps
                      </Text>
                      <Text variant="bodyLarge">{workout.startingReps}</Text>
                    </View>
                  )}
                  {workout.stepSize && workout.ladderType !== 'amrap' && (
                    <View style={styles.configItem}>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Step Size
                      </Text>
                      <Text variant="bodyLarge">{workout.stepSize}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }]}>
        <Button
          mode="contained"
          onPress={handleStartWorkout}
          icon="play"
          style={styles.startButton}
          contentStyle={styles.startButtonContent}
          buttonColor={theme.colors.primary}
          textColor="#FFFFFF"
        >
          Start Workout
        </Button>
      </View>

      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{workout.name}"? This action cannot be undone.
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
            <Button onPress={handleDelete} textColor={theme.colors.error}>Delete</Button>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  headerCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  workoutTypeTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#00000020',
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
  },
  exerciseNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseNumber: {
    fontWeight: 'bold',
    fontSize: 14
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  progressionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  progressionIcon: {
    fontSize: 16,
    marginRight: 6,
    fontWeight: 'bold',
  },
  previewSubtext: {
    marginBottom: spacing.sm,
  },
  previewDivider: {
    marginBottom: spacing.md,
  },
  roundPreviewItem: {
    marginBottom: spacing.md,
    paddingLeft: spacing.sm,
  },
  roundNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseLineItem: {
    marginLeft: spacing.md,
    marginBottom: 2,
  },
  moreRounds: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  configRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  configItem: {
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  startButton: {
    marginTop: 0,
  },
  startButtonContent: {
    paddingVertical: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyInOutBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  buyInOutDivider: {
    marginVertical: spacing.md,
  },
  restIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
});

export default WorkoutDetailsScreen;