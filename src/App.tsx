import React, { useEffect, useRef } from 'react';
import { StatusBar, AppState } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { lightTheme, darkTheme } from './constants/theme';
import { useThemeStore } from './store/themeStore';
import { useActiveWorkoutStore } from './store/activeWorkoutStore';
import { useWorkoutHistoryStore } from './store/workoutHistoryStore';
import { useExerciseStore } from './store/exerciseStore';

const App = () => {
  const { themeMode, loadThemePreference } = useThemeStore();
  const { activeWorkout, isPaused, pauseWorkout, elapsedTime, totalPausedTime, loadPausedWorkout } = useActiveWorkoutStore();
  const { loadHistory } = useWorkoutHistoryStore();
  const { loadExercises } = useExerciseStore();
  const appState = useRef(AppState.currentState);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // Load saved theme preference on app start
    loadThemePreference();
    
    // Load workout history
    loadHistory();
    
    // Load exercise catalog
    loadExercises();
    
    // Load paused workout if exists and navigate to it
    const initializePausedWorkout = async () => {
      const hasPausedWorkout = await loadPausedWorkout();
      if (hasPausedWorkout && navigationRef.current) {
        // Wait a bit for navigation to be ready
        setTimeout(() => {
          navigationRef.current?.navigate('ActiveWorkout');
        }, 100);
      }
    };
    
    initializePausedWorkout();
  }, []);

  useEffect(() => {
    // Listen to app state changes (background/foreground)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background - pause active workout
        if (activeWorkout && !isPaused) {
          pauseWorkout(elapsedTime, totalPausedTime);
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [activeWorkout, isPaused, elapsedTime, totalPausedTime]);

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  // Create navigation theme based on theme mode
  const navigationTheme = themeMode === 'dark' 
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: darkTheme.colors.primary,
          background: darkTheme.colors.background,
          card: darkTheme.colors.surface,
          text: darkTheme.colors.onSurface,
          border: darkTheme.colors.outline,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: lightTheme.colors.primary,
          background: lightTheme.colors.background,
          card: lightTheme.colors.surface,
          text: lightTheme.colors.onSurface,
          border: lightTheme.colors.outline,
        },
      };

  return (
    <PaperProvider theme={currentTheme}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.surface}
      />
      <NavigationContainer theme={navigationTheme} ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;