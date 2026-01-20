import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing } from '../../constants/theme';

const LogbookScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.text}>
        No workouts completed yet
      </Text>
      <Text variant="bodyLarge" style={styles.subtext}>
        Complete your first workout to see it here!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#f5f5f5',
  },
  text: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  subtext: {
    textAlign: 'center',
    color: '#666',
  },
});

export default LogbookScreen;