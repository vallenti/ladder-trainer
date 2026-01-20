import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { Template } from '../types';
import { spacing } from '../constants/theme';

interface TemplateCardProps {
  template: Template;
  onPress: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPress, onDelete }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          {template.name}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
          {template.restPeriodSeconds > 0 && ` • ${template.restPeriodSeconds}s rest`}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          Created {format(template.createdAt, 'MMM d, yyyy')}
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

export default TemplateCard;