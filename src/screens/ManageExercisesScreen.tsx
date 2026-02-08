import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  Appbar, 
  Text, 
  useTheme, 
  Searchbar, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  List,
  Divider,
  IconButton,
  Chip
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useExerciseStore } from '../store/exerciseStore';
import { ExerciseCatalogItem } from '../constants/defaultExercises';
import { spacing } from '../constants/theme';

const ManageExercisesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { 
    exercises, 
    searchExercises, 
    addExercise, 
    updateExercise, 
    deleteExercise, 
    restoreDefaults,
    getDefaultExercises,
    getCustomExercises 
  } = useExerciseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<ExerciseCatalogItem[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseCatalogItem | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseUnit, setExerciseUnit] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'default' | 'custom'>('all');

  useEffect(() => {
    updateFilteredList();
  }, [searchQuery, exercises, filterMode]);

  const updateFilteredList = () => {
    let list = searchExercises(searchQuery);
    
    if (filterMode === 'default') {
      list = list.filter((ex: ExerciseCatalogItem) => !ex.isCustom);
    } else if (filterMode === 'custom') {
      list = list.filter((ex: ExerciseCatalogItem) => ex.isCustom);
    }
    
    setFilteredExercises(list);
  };

  const handleAddExercise = () => {
    setDialogMode('add');
    setExerciseName('');
    setExerciseUnit('');
    setSelectedExercise(null);
    setShowDialog(true);
  };

  const handleEditExercise = (exercise: ExerciseCatalogItem) => {
    setDialogMode('edit');
    setExerciseName(exercise.name);
    setExerciseUnit(exercise.suggestedUnit || '');
    setSelectedExercise(exercise);
    setShowDialog(true);
  };

  const handleDeleteExercise = async (exercise: ExerciseCatalogItem) => {
    try {
      await deleteExercise(exercise.id);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveExercise = async () => {
    if (!exerciseName.trim()) {
      alert('Exercise name is required');
      return;
    }

    try {
      if (dialogMode === 'add') {
        await addExercise(exerciseName, exerciseUnit || undefined);
      } else if (selectedExercise) {
        await updateExercise(selectedExercise.id, {
          name: exerciseName,
          suggestedUnit: exerciseUnit || undefined,
        });
      }
      setShowDialog(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRestoreDefaults = async () => {
    await restoreDefaults();
    setShowRestoreDialog(false);
  };

  const renderExerciseItem = (exercise: ExerciseCatalogItem) => (
    <List.Item
      key={exercise.id}
      title={exercise.name}
      description={exercise.suggestedUnit ? `Unit: ${exercise.suggestedUnit}` : 'No suggested unit'}
      left={(props) => (
        <List.Icon 
          {...props} 
          icon={exercise.isCustom ? 'star' : 'lightning-bolt'}
          color={exercise.isCustom ? theme.colors.primary : theme.colors.tertiary}
        />
      )}      right={(props) => (
        <View style={styles.actionsContainer}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEditExercise(exercise)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleDeleteExercise(exercise)}
          />
        </View>
      )}
      style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
    />
  );

  const defaultCount = getDefaultExercises().length;
  const customCount = getCustomExercises().length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Manage Exercises" />
        <Appbar.Action 
          icon="restore" 
          onPress={() => setShowRestoreDialog(true)}
        />
        <Appbar.Action icon="plus" onPress={handleAddExercise} />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <Chip
            selected={filterMode === 'all'}
            onPress={() => setFilterMode('all')}
            style={styles.filterChip}
            compact
          >
            All
          </Chip>
          <Chip
            selected={filterMode === 'default'}
            onPress={() => setFilterMode('default')}
            style={styles.filterChip}
            icon="lightning-bolt"
            compact
          >
            Default
          </Chip>
          <Chip
            selected={filterMode === 'custom'}
            onPress={() => setFilterMode('custom')}
            style={styles.filterChip}
            icon="star"
            compact
          >
            Custom
          </Chip>
        </View>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          renderItem={({ item }) => renderExerciseItem(item)}
          keyExtractor={(item) => item.id}
          style={styles.scrollView}
          contentContainerStyle={filteredExercises.length === 0 ? styles.emptyContainer : styles.listContentContainer}
          ListEmptyComponent={
            <View>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {searchQuery ? 'No exercises found' : 'No exercises yet'}
              </Text>
              {!searchQuery && filterMode === 'custom' && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}>
                  Add custom exercises by tapping the + button
                </Text>
              )}
            </View>
          }
        />
      </View>

      {/* Add/Edit Dialog */}
      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>
            {dialogMode === 'add' ? 'Add Exercise' : 'Edit Exercise'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Exercise Name"
              value={exerciseName}
              onChangeText={setExerciseName}
              mode="outlined"
              style={styles.dialogInput}
              maxLength={100}
            />
            <TextInput
              label="Suggested Unit (optional)"
              value={exerciseUnit}
              onChangeText={setExerciseUnit}
              mode="outlined"
              style={styles.dialogInput}
              placeholder="reps, calories, meters, etc."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={handleSaveExercise}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Restore Defaults Dialog */}
        <Dialog visible={showRestoreDialog} onDismiss={() => setShowRestoreDialog(false)}>
          <Dialog.Title>Restore Default Exercises?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will restore all default exercises to their original state. Your custom exercises will not be affected.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRestoreDialog(false)}>Cancel</Button>
            <Button onPress={handleRestoreDefaults}>Restore</Button>
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
  content: {
    flex: 1,
    padding: spacing.md,
  },
  searchBar: {
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: spacing.md,
  },
  listItem: {
    marginBottom: spacing.xs,
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  dialogInput: {
    marginBottom: spacing.md,
  },
});

export default ManageExercisesScreen;
