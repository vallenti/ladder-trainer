import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Workout } from '../types';
import { formatTime } from '../utils/calculations';
import { getLadderStrategy } from '../utils/ladderStrategies';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ShareableWorkoutCardProps {
  workout: Workout;
  showBranding?: boolean;
}

export const ShareableWorkoutCard: React.FC<ShareableWorkoutCardProps> = ({ 
  workout, 
  showBranding = true 
}) => {
  const theme = useTheme();
  
  const ladderStrategy = getLadderStrategy(
    workout.ladderType, 
    workout.stepSize || 1, 
    workout.maxRounds, 
    workout.startingReps
  );
  
  const exerciseTotals = workout.exercises.map(exercise => ({
    ...exercise,
    totalAmount: ladderStrategy.calculateTotalReps(exercise, workout.rounds.length)
  }));

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
        return 'Workout';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
          name="check-circle" 
          size={80} 
          color={theme.colors.tertiary} 
        />
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {workout.templateName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {formatDate(workout.endTime || workout.startTime)}
        </Text>
      </View>

      {/* Main Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.mainStat}>
          <Text style={[styles.mainStatLabel, { color: theme.colors.onPrimaryContainer }]}>
            Total Time
          </Text>
          <Text style={[styles.mainStatValue, { color: theme.colors.primary }]}>
            {formatTime(workout.totalTime)}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
              Rounds
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.onPrimaryContainer }]}>
              {workout.ladderType === 'amrap' ? `${workout.rounds.length - 1}+` : workout.rounds.length}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.colors.onPrimaryContainer }]}>
              Type
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.onPrimaryContainer }]}>
              {getLadderTypeName()}
            </Text>
          </View>
        </View>
      </View>

      {/* Exercise Summary */}
      <View style={styles.exercisesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Exercise Summary
        </Text>
        {exerciseTotals.map((ex) => (
          <View 
            key={ex.position} 
            style={[styles.exerciseRow, { borderBottomColor: theme.colors.outlineVariant }]}
          >
            <Text style={[styles.exerciseName, { color: theme.colors.onSurface }]}>
              {ex.name}
            </Text>
            <Text style={[styles.exerciseTotal, { color: theme.colors.tertiary }]}>
              {ex.totalAmount} {(ex.unit || 'reps').toLowerCase()}
            </Text>
          </View>
        ))}
      </View>

      {/* Round Breakdown */}
      {workout.rounds.length <= 6 && (
        <View style={styles.roundsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Round Times
          </Text>
          <View style={styles.roundsGrid}>
            {workout.rounds.map((round) => (
              <View key={round.roundNumber} style={styles.roundBadge}>
                <Text style={[styles.roundNumber, { color: theme.colors.onSurfaceVariant }]}>
                  R{round.roundNumber}
                </Text>
                <Text style={[styles.roundTime, { color: theme.colors.primary }]}>
                  {formatTime(round.duration)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Branding */}
      {showBranding && (
        <View style={styles.footer}>
          <MaterialCommunityIcons 
            name="ladder" 
            size={32} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.appName, { color: theme.colors.onSurfaceVariant }]}>
            LadFit
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 1080,  // Instagram optimized size
    padding: 60,
    borderRadius: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 40,
    padding: 40,
    borderRadius: 20,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainStatLabel: {
    fontSize: 24,
    marginBottom: 8,
  },
  mainStatValue: {
    fontSize: 84,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  exercisesContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  exerciseName: {
    fontSize: 26,
  },
  exerciseTotal: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  roundsContainer: {
    marginBottom: 30,
  },
  roundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  roundBadge: {
    alignItems: 'center',
    minWidth: 140,
  },
  roundNumber: {
    fontSize: 18,
    marginBottom: 4,
  },
  roundTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
  },
});
