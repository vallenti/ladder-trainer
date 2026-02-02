import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Energetic Orange - Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35',
    primaryContainer: '#FFEEE8',
    secondary: '#4ECDC4',
    secondaryContainer: '#E0F7F6',
    tertiary: '#F59E0B',
    error: '#E74C3C',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F3F5',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#8B3419',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1A6662',
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#6C757D',
    onBackground: '#1A1A1A',
    outline: '#DEE2E6',
    success: '#2ECC71',
    shadow: '#000000',
    errorContainer: '#FFEBEE',
  },
};

// Energetic Orange - Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B35',
    primaryContainer: '#663016',
    secondary: '#6EDDD6',
    secondaryContainer: '#1A4D4A',
    tertiary: '#FFE066',
    error: '#FF5252',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onPrimary: '#000000',
    onPrimaryContainer: '#FFD4C5',
    onSecondary: '#000000',
    onSecondaryContainer: '#B8F0EC',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B0B0B0',
    onBackground: '#FFFFFF',
    outline: '#3C3C3C',
    success: '#3DDC84',
    shadow: '#000000',
    errorContainer: '#3D1F1F',
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