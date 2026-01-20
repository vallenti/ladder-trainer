import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { theme } from './constants/theme';

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;