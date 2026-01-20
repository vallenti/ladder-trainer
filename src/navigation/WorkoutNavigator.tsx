import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutStackParamList } from '../types/navigation';
import WorkoutListScreen from '../screens/workouts/WorkoutListScreen';
import CreateEditWorkoutScreen from '../screens/workouts/CreateEditWorkoutScreen';
import WorkoutDetailsScreen from '../screens/workouts/WorkoutDetailsScreen';

const Stack = createStackNavigator<WorkoutStackParamList>();

const WorkoutNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <Stack.Screen name="CreateEditWorkout" component={CreateEditWorkoutScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
    </Stack.Navigator>
  );
};

export default WorkoutNavigator;