import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Energetic Orange - Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35',
    secondary: '#4ECDC4',
    tertiary: '#F59E0B',
    error: '#E74C3C',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F3F5',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#6C757D',
    onBackground: '#1A1A1A',
    outline: '#DEE2E6',
    success: '#2ECC71',
  },
};

// Energetic Orange - Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B35',
    secondary: '#6EDDD6',
    tertiary: '#FFE066',
    error: '#FF5252',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B0B0B0',
    onBackground: '#FFFFFF',
    outline: '#3C3C3C',
    success: '#3DDC84',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
};