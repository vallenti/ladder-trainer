import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Appbar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import WorkoutCard from '../../components/WorkoutCard';
import { spacing } from '../../constants/theme';
import { Template } from '../../types';

const WorkoutListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { workouts, loadWorkouts, isLoading } = useWorkoutStore();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleCreateWorkout = () => {
    // @ts-ignore - navigation types will be fixed when we add stack navigator
    navigation.navigate('CreateEditWorkout');
  };

  const handleWorkoutPress = (workoutId: string) => {
    // @ts-ignore
    navigation.navigate('WorkoutDetails', { workoutId });
  };

  const handleStartWorkout = (workout: Template) => {
    // @ts-ignore
    navigation.navigate('Countdown', { workoutId: workout.id });
  };

  if (!isLoading && workouts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.Content title="LadFit" />
        </Appbar.Header>
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            No workouts yet
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            Create your first workout to get started!
          </Text>
          <FAB
            icon="plus"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            color="#FFFFFF"
            onPress={handleCreateWorkout}
            label="Create Workout"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Workouts" />
      </Appbar.Header>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() => handleWorkoutPress(item.id)}
            onStart={() => handleStartWorkout(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#FFFFFF"
        onPress={handleCreateWorkout}
      />
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 30,
  },
});

export default WorkoutListScreen;