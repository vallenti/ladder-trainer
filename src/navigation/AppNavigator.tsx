import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import BottomTabNavigator from './BottomTabNavigator';
import CountdownScreen from '../screens/workouts/CountdownScreen';
import ActiveWorkoutScreen from '../screens/workouts/ActiveWorkoutScreen';
import RestScreen from '../screens/workouts/RestScreen';
import WorkoutCompleteScreen from '../screens/workouts/WorkoutCompleteScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Countdown" component={CountdownScreen} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="Rest" component={RestScreen} />
        <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default AppNavigator;