import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Appbar, Portal, Dialog, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import { spacing } from '../../constants/theme';

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
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.label}>
                Exercises ({workout.exercises.length})
              </Text>
              {workout.exercises.map((exercise) => (
                <View key={exercise.position} style={styles.exerciseRow}>
                  <View style={[styles.positionBadge, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.positionText}>{exercise.position}</Text>
                  </View>
                  <Text variant="bodyLarge" style={styles.exerciseText}>
                    {exercise.unit && `${exercise.unit} `}{exercise.name}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.label}>
                Rest Period
              </Text>
              <Text variant="bodyLarge">
                {workout.restPeriodSeconds === 0
                  ? 'No rest'
                  : `${workout.restPeriodSeconds} seconds`}
              </Text>
            </Card.Content>
          </Card>
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
        >
          Start Workout
        </Button>
      </View>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{workout.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
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
  card: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  positionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  exerciseText: {
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
});

export default WorkoutDetailsScreen;