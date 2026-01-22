import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, IconButton, useTheme, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import { Template } from '../types';
import { spacing } from '../constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface WorkoutCardProps {
  workout: Template;
  onPress: () => void;
  onDelete: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress, onDelete }) => {
  const theme = useTheme();
  
  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.title}>
              {workout.name}
            </Text>
            <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {format(workout.createdAt, 'MMM d, yyyy')}
            </Text>
          </View>
          <IconButton
            icon="delete"
            size={24}
            iconColor={theme.colors.error}
            onPress={onDelete}
            style={styles.deleteButton}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <MaterialCommunityIcons 
              name="dumbbell" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.statIcon}
            />
            <Text variant="bodyMedium" style={[styles.statText, { color: theme.colors.onSurface }]}>
              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {workout.restPeriodSeconds > 0 && (
            <View style={styles.stat}>
              <MaterialCommunityIcons 
                name="timer-outline" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.statIcon}
              />
              <Text variant="bodyMedium" style={[styles.statText, { color: theme.colors.onSurface }]}>
                {workout.restPeriodSeconds}s rest
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: 12,
  },
  deleteButton: {
    margin: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: spacing.xs,
  },
  statText: {
    fontWeight: '500',
  },
});

export default WorkoutCard;