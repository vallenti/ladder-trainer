import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { lightTheme, darkTheme } from './constants/theme';
import { useThemeStore } from './store/themeStore';

const App = () => {
  const { themeMode, loadThemePreference } = useThemeStore();

  useEffect(() => {
    // Load saved theme preference on app start
    loadThemePreference();
  }, []);

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
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;