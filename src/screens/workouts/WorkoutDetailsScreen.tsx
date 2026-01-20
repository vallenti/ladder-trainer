import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Appbar, Portal, Dialog } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import { spacing } from '../../constants/theme';

type RouteParams = {
  WorkoutDetails: {
    workoutId: string;
  };
};

const WorkoutDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'WorkoutDetails'>>();
  const { getWorkout, deleteWorkout } = useWorkoutStore();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const workout = getWorkout(route.params.workoutId);

  if (!workout) {
    return (
      <View style={styles.container}>
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
    // TODO: Navigate to workout flow in Phase 2
    console.log('Start workout:', workout.id);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={workout.name} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={() => setDeleteDialogVisible(true)} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.label}>
                Exercises ({workout.exercises.length})
              </Text>
              {workout.exercises.map((exercise) => (
                <View key={exercise.position} style={styles.exerciseRow}>
                  <View style={styles.positionBadge}>
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

          <Button
            mode="contained"
            onPress={handleStartWorkout}
            icon="play"
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
          >
            Start Workout
          </Button>
        </View>
      </ScrollView>

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
            <Button onPress={handleDelete} textColor="#c62828">Delete</Button>
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
  scrollView: {
    flex: 1,
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
    backgroundColor: '#6200ee',
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
  startButton: {
    marginTop: spacing.lg,
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