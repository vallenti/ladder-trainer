import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { Template } from '../types';
import { spacing } from '../constants/theme';

interface WorkoutCardProps {
  workout: Template;
  onPress: () => void;
  onDelete: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress, onDelete }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          {workout.name}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
          {workout.restPeriodSeconds > 0 && ` • ${workout.restPeriodSeconds}s rest`}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          Created {format(workout.createdAt, 'MMM d, yyyy')}
        </Text>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="delete"
          size={20}
          onPress={onDelete}
        />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: spacing.xs,
    color: '#666',
  },
  date: {
    marginTop: spacing.xs,
    color: '#999',
  },
});

export default WorkoutCard;