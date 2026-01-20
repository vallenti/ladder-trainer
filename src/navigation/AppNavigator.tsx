import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;