import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Appbar, useTheme, Dialog, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useWorkoutStore } from '../../store/workoutStore';
import WorkoutCard from '../../components/WorkoutCard';
import { spacing } from '../../constants/theme';
import { Template } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabValue = 'custom' | 'benchmark';

const WorkoutListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { 
    workouts, 
    loadWorkouts, 
    isLoading, 
    restoreBenchmarks,
    getBenchmarkWorkouts,
    getCustomWorkouts 
  } = useWorkoutStore();
  
  const [activeTab, setActiveTab] = useState<TabValue>('custom');
  const [restoreDialogVisible, setRestoreDialogVisible] = useState(false);
  
  const customWorkouts = getCustomWorkouts();
  const benchmarkWorkouts = getBenchmarkWorkouts();
  const displayedWorkouts = activeTab === 'custom' ? customWorkouts : benchmarkWorkouts;

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

  const handleRestoreBenchmarks = async () => {
    try {
      await restoreBenchmarks();
      setRestoreDialogVisible(false);
    } catch (error) {
      console.error('Failed to restore benchmarks:', error);
    }
  };

  if (!isLoading && customWorkouts.length === 0 && activeTab === 'custom') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.Content title="LadFit" />
          <Appbar.Action icon="plus" onPress={handleCreateWorkout} />
        </Appbar.Header>
        <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            No workouts yet
          </Text>
          <Text variant="bodyLarge" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            Create your first workout to get started!
          </Text>
          <Button
            icon="plus"
            mode="contained"
            onPress={handleCreateWorkout}
            buttonColor={theme.colors.primary}
            textColor="#FFFFFF"
            style={styles.emptyButton}
          >
            Create Workout
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Workouts" />
        {activeTab === 'benchmark' && (
          <Appbar.Action 
            icon="restore" 
            onPress={() => setRestoreDialogVisible(true)} 
          />
        )}
        {activeTab === 'custom' && (
          <Appbar.Action icon="plus" onPress={handleCreateWorkout} />
        )}
      </Appbar.Header>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('custom')}
        >
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={24} 
            color={activeTab === 'custom' ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text 
            variant="labelLarge" 
            style={[
              styles.tabLabel,
              { color: activeTab === 'custom' ? theme.colors.primary : theme.colors.onSurfaceVariant }
            ]}
          >
            My Workouts
          </Text>
          {activeTab === 'custom' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setActiveTab('benchmark')}
        >
          <MaterialCommunityIcons 
            name="trophy" 
            size={24} 
            color={activeTab === 'benchmark' ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text 
            variant="labelLarge" 
            style={[
              styles.tabLabel,
              { color: activeTab === 'benchmark' ? theme.colors.primary : theme.colors.onSurfaceVariant }
            ]}
          >
            Benchmarks
          </Text>
          {activeTab === 'benchmark' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() => handleWorkoutPress(item.id)}
            onStart={() => handleStartWorkout(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text variant="bodyLarge" style={[styles.emptyListText, { color: theme.colors.onSurfaceVariant }]}>
              {activeTab === 'custom' 
                ? 'No custom workouts yet. Create one to get started!' 
                : 'No benchmark workouts available.'}
            </Text>
          </View>
        }
      />

      {/* Restore Dialog */}
      <Portal>
        <Dialog visible={restoreDialogVisible} onDismiss={() => setRestoreDialogVisible(false)}>
          <Dialog.Title>Restore Benchmark Workouts</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will restore all benchmark workouts to their original state and remove any modifications you made.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRestoreDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleRestoreBenchmarks}>Restore</Button>
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    position: 'relative',
  },
  tabLabel: {
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 30,
    height: 2,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyListContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
  },
});

export default WorkoutListScreen;