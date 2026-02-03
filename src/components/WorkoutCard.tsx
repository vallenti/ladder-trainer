import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, useTheme, Surface } from 'react-native-paper';
import { Template } from '../types';
import { spacing } from '../constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface WorkoutCardProps {
  workout: Template;
  onPress: () => void;
  onStart: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress, onStart }) => {
  const theme = useTheme();
  
  const getLadderTypeName = () => {
    switch (workout.ladderType) {
      case 'christmas':
        return 'Christmas';
      case 'ascending':
        return 'Ascending';
      case 'descending':
        return 'Descending';
      case 'pyramid':
        return 'Pyramid';
      case 'flexible':
        return 'Flexible';
      case 'chipper':
        return 'Chipper';
      case 'amrap':
        return 'AMRAP';
      case 'forreps':
        return 'For Reps';
      default:
        return 'Christmas';
    }
  };
  
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated" onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.mainContent}>
          <View style={styles.leftSection}>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
              {workout.name}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBadge}>
                <MaterialCommunityIcons 
                  name="ladder" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                  {getLadderTypeName()}
                </Text>
              </View>
              
              <View style={styles.statBadge}>
                <MaterialCommunityIcons 
                  name="dumbbell" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                  {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                </Text>
              </View>
              
              {workout.ladderType === 'amrap' && workout.timeCap && (
                <View style={styles.statBadge}>
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                    {Math.floor(workout.timeCap / 60)}:{(workout.timeCap % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
              
              {workout.restPeriodSeconds > 0 && (
                <View style={styles.statBadge}>
                  <MaterialCommunityIcons 
                    name="timer-outline" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                  <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                    {workout.restPeriodSeconds}s
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={onStart}
            style={[
              styles.playButton, 
              { 
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.shadow 
              }
            ]}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="play" 
              size={24} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    elevation: 1,
  },
  cardContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});

export default WorkoutCard;