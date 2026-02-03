import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, PanResponder, Platform } from 'react-native';
import { Text, Button, Card, useTheme, Portal, Dialog, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useActiveWorkoutStore } from '../../store/activeWorkoutStore';
import { formatTime } from '../../utils/calculations';
import { getLadderStrategy } from '../../utils/ladderStrategies';
import { spacing } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RouteParams = {
  WorkoutComplete: {
    workoutId: string;
    showPartialRoundInput?: boolean;
  };
};

const formatTimeWithMs = (totalSeconds: number): { main: string; ms: string } => {
  const seconds = Math.floor(totalSeconds);
  const ms = Math.floor((totalSeconds - seconds) * 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return {
      main: `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      ms: `.${ms.toString().padStart(3, '0')}`
    };
  }
  return {
    main: `${minutes}:${secs.toString().padStart(2, '0')}`,
    ms: `.${ms.toString().padStart(3, '0')}`
  };
};

const WorkoutCompleteScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'WorkoutComplete'>>();
  const { workoutHistory, savePartialRoundReps } = useActiveWorkoutStore();
  const [activeTab, setActiveTab] = useState<'exercises' | 'rounds'>('exercises');
  const [showPartialDialog, setShowPartialDialog] = useState(route.params?.showPartialRoundInput || false);
  const [partialReps, setPartialReps] = useState<Record<number, string>>({});

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

  const handlePartialRepsConfirm = async () => {
    if (!completedWorkout) return;
    
    // Update exercises with partial reps
    const updatedExercises = completedWorkout.exercises.map(ex => ({
      ...ex,
      partialReps: parseInt(partialReps[ex.position] || '0', 10),
    }));
    
    await savePartialRoundReps(completedWorkout.id, updatedExercises);
    setShowPartialDialog(false);
  };

  const handlePartialRepsSkip = () => {
    setShowPartialDialog(false);
  };

  if (!completedWorkout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>No workout data</Text>
        <Button onPress={handleDone}>Go Home</Button>
      </View>
    );
  }

  // Calculate exercise totals using ladder strategy
  const ladderStrategy = getLadderStrategy(completedWorkout.ladderType, completedWorkout.stepSize || 1, completedWorkout.maxRounds, completedWorkout.startingReps);
  const exerciseTotals = completedWorkout.exercises.map(exercise => {
    const totalAmount = ladderStrategy.calculateTotalReps(exercise, completedWorkout.rounds.length);
    
    return {
      ...exercise,
      totalAmount
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="check-circle" size={60} color={theme.colors.tertiary} />
          <Text variant="headlineMedium" style={styles.title}>
            Workout Complete!
          </Text>
          <View style={styles.totalTimeContainer}>
            <Text variant="displaySmall" style={[styles.totalTime, { color: theme.colors.primary }]}>
              {formatTimeWithMs(completedWorkout.totalTime).main}
            </Text>
            <Text variant="headlineSmall" style={[styles.totalTimeMs, { color: theme.colors.primary }]}>
              {formatTimeWithMs(completedWorkout.totalTime).ms}
            </Text>
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content>

            <View style={[styles.tabContainer, { borderBottomColor: theme.colors.outline }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'exercises' && [styles.activeTab, { borderBottomColor: theme.colors.primary }]
                ]}
                onPress={() => setActiveTab('exercises')}
              >
                <Text
                  variant="titleSmall"
                  style={[
                    styles.tabText,
                    { color: theme.colors.onSurfaceVariant },
                    activeTab === 'exercises' && [styles.activeTabText, { color: theme.colors.primary }]
                  ]}
                >
                  Exercise Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'rounds' && [styles.activeTab, { borderBottomColor: theme.colors.primary }]
                ]}
                onPress={() => setActiveTab('rounds')}
              >
                <Text
                  variant="titleSmall"
                  style={[
                    styles.tabText,
                    { color: theme.colors.onSurfaceVariant },
                    activeTab === 'rounds' && [styles.activeTabText, { color: theme.colors.primary }]
                  ]}
                >
                  Round Times
                </Text>
              </TouchableOpacity>
            </View>

            <View {...panResponder.panHandlers} style={styles.swipeContainer}>
              {activeTab === 'exercises' ? (
                <View style={styles.tabContent}>
                  {exerciseTotals.map((exercise) => (
                    <View key={exercise.position} style={[styles.exerciseSummaryItem, { borderBottomColor: theme.colors.outline }]}>
                      <Text variant="bodyLarge">{exercise.name}</Text>
                      <Text variant="bodyLarge" style={[styles.exerciseTotalText, { color: theme.colors.tertiary }]}>
                        {exercise.totalAmount} {(exercise.unit || 'reps').toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.tabContent}>
                  {completedWorkout.rounds.map((round) => (
                    <View key={round.roundNumber} style={[styles.roundItem, { borderBottomColor: theme.colors.outline }]}>
                      <Text variant="bodyLarge">Round {round.roundNumber}</Text>
                      <Text variant="bodyLarge" style={[styles.roundTime, { color: theme.colors.primary }]}>
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
        textColor='#fff'
      >
        Done
      </Button>

      {/* Partial Round Input Dialog for AMRAP */}
      <Portal>
        <Dialog visible={showPartialDialog} onDismiss={handlePartialRepsSkip}>
          <Dialog.Title>Partial Round Reps</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: spacing.md }}>
              Enter the reps you completed in the last (incomplete) round:
            </Text>
            {completedWorkout?.exercises.map((exercise) => (
              <TextInput
                key={exercise.position}
                mode="outlined"
                label={exercise.name}
                value={partialReps[exercise.position] || ''}
                onChangeText={(value) => setPartialReps({ ...partialReps, [exercise.position]: value })}
                keyboardType="numeric"
                style={{ marginBottom: spacing.sm }}
                right={<TextInput.Affix text={exercise.unit || 'reps'} />}
              />
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handlePartialRepsSkip}>Skip</Button>
            <Button onPress={handlePartialRepsConfirm}>Confirm</Button>
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
  },
  totalTimeMs: {
    fontWeight: 'bold',
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
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
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
  },
  exerciseTotalText: {
    fontWeight: 'bold',
  },
  roundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  roundTime: {
    fontWeight: 'bold',
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