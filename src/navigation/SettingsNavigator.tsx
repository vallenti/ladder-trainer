import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsStackParamList } from '../types/navigation';
import SettingsScreen from '../screens/SettingsScreen';
import ManageExercisesScreen from '../screens/ManageExercisesScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="ManageExercises" component={ManageExercisesScreen} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
