import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, IconButton, Text, useTheme } from 'react-native-paper';
import { EmomInterval, Exercise } from '../types';
import { spacing } from '../constants/theme';
import FixedRepsExerciseInput from './FixedRepsExerciseInput';

interface Props {
  interval: EmomInterval;
  onChangeExercise: (exercise: Exercise) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const EmomIntervalInput: React.FC<Props> = ({ interval, onChangeExercise, onDelete, onDuplicate, onMoveUp, onMoveDown, canDelete, canMoveUp, canMoveDown }) => {
  const theme = useTheme();
  if (interval.type === 'work') {
    const exercise = interval.exercises[0];
    return (
      <View>
        <View style={styles.actions}>
          <Text variant="labelLarge">Interval {interval.position}</Text>
          <IconButton icon="arrow-up" disabled={!canMoveUp} onPress={onMoveUp} accessibilityLabel="Move interval up" />
          <IconButton icon="arrow-down" disabled={!canMoveDown} onPress={onMoveDown} accessibilityLabel="Move interval down" />
          <IconButton icon="content-copy" onPress={onDuplicate} accessibilityLabel="Duplicate interval" />
        </View>
        <FixedRepsExerciseInput
          exercise={exercise}
          onChange={onChangeExercise}
          onDelete={onDelete}
          canDelete={canDelete}
          repsProperty="repsPerRound"
          repsLabel="Amount"
        />
      </View>
    );
  }

  return (
    <Card style={[styles.restCard, { backgroundColor: theme.colors.secondaryContainer }]}>
      <Card.Content style={styles.restContent}>
        <View>
          <Text variant="titleMedium">Interval {interval.position} · REST</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Recovery for the full interval</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="arrow-up" disabled={!canMoveUp} onPress={onMoveUp} accessibilityLabel="Move interval up" />
          <IconButton icon="arrow-down" disabled={!canMoveDown} onPress={onMoveDown} accessibilityLabel="Move interval down" />
          <IconButton icon="content-copy" onPress={onDuplicate} accessibilityLabel="Duplicate interval" />
          <IconButton icon="close" disabled={!canDelete} onPress={onDelete} accessibilityLabel="Delete rest interval" />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  restCard: { marginBottom: spacing.md },
  restContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

export default EmomIntervalInput;
