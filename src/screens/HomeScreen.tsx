import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ExampleComponent from '../components/ExampleComponent';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen</Text>
      <ExampleComponent />
      {/* Additional CRUD functionality will be implemented here in Phase 2 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;