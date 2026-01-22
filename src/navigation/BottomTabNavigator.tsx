import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeTabParamList } from '../types/navigation';
import WorkoutNavigator from './WorkoutNavigator';
import LogbookScreen from '../screens/logbook/LogBookScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Workouts"
        component={WorkoutNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Logbook"
        component={LogbookScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Workout History',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;