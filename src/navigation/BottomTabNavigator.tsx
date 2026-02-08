import React, { useEffect } from 'react';
import { BackHandler, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, IconButton, Badge } from 'react-native-paper';
import { HomeTabParamList } from '../types/navigation';
import WorkoutNavigator from './WorkoutNavigator';
import LogbookScreen from '../screens/logbook/LogBookScreen';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const theme = useTheme();
  
  // Handle Android back button on main tabs - exit app
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return false to allow default behavior (exit app)
      return false;
    });

    return () => backHandler.remove();
  }, []);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
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
        options={({ navigation }) => ({
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Workout History',
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;