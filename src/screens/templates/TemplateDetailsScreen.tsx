import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, Appbar, Portal, Dialog } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTemplateStore } from '../../store/templateStore';
import { spacing } from '../../constants/theme';

type RouteParams = {
  TemplateDetails: {
    templateId: string;
  };
};

const TemplateDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'TemplateDetails'>>();
  const { getTemplate, deleteTemplate } = useTemplateStore();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const template = getTemplate(route.params.templateId);

  if (!template) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Template Not Found" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text>Template not found</Text>
        </View>
      </View>
    );
  }

  const handleEdit = () => {
    // @ts-ignore
    navigation.navigate('CreateEditTemplate', { templateId: template.id });
  };

  const handleDelete = async () => {
    await deleteTemplate(template.id);
    setDeleteDialogVisible(false);
    navigation.goBack();
  };

  const handleStartWorkout = () => {
    // TODO: Navigate to workout flow in Phase 2
    console.log('Start workout:', template.id);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={template.name} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={() => setDeleteDialogVisible(true)} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.label}>
                Exercises ({template.exercises.length})
              </Text>
              {template.exercises.map((exercise) => (
                <View key={exercise.position} style={styles.exerciseRow}>
                  <View style={styles.positionBadge}>
                    <Text style={styles.positionText}>{exercise.position}</Text>
                  </View>
                  <Text variant="bodyLarge" style={styles.exerciseText}>
                    {exercise.unit} {exercise.name}
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
                {template.restPeriodSeconds === 0
                  ? 'No rest'
                  : `${template.restPeriodSeconds} seconds`}
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
          <Dialog.Title>Delete Template</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  positionBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
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
});

export default TemplateDetailsScreen;