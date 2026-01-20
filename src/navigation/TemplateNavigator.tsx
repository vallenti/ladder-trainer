import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TemplateStackParamList } from '../types/navigation';
import TemplateListScreen from '../screens/templates/TemplateListScreen';
import CreateEditTemplateScreen from '../screens/templates/CreateEditTemplateScreen';
import TemplateDetailsScreen from '../screens/templates/TemplateDetailsScreen';

const Stack = createStackNavigator<TemplateStackParamList>();

const TemplateNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TemplateList" component={TemplateListScreen} />
      <Stack.Screen name="CreateEditTemplate" component={CreateEditTemplateScreen} />
      <Stack.Screen name="TemplateDetails" component={TemplateDetailsScreen} />
    </Stack.Navigator>
  );
};

export default TemplateNavigator;