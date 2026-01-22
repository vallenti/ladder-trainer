import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, RadioButton, useTheme } from 'react-native-paper';
import { useThemeStore, ThemeMode } from '../store/themeStore';
import { spacing } from '../constants/theme';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();

  const themeOptions: { value: ThemeMode; label: string; }[] = [
    {
      value: 'light',
      label: 'Light',
    },
    {
      value: 'dark',
      label: 'Dark',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Appearance
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Choose theme for your app
            </Text>

            <RadioButton.Group onValueChange={(value) => setThemeMode(value as ThemeMode)} value={themeMode}>
              {themeOptions.map((option) => (
                <View key={option.value} style={styles.radioOption}>
                  <RadioButton.Item
                    label={option.label}
                    value={option.value}
                    labelVariant="bodyLarge"
                    labelStyle={{ textAlign: 'left' }}
                    position="leading"
                    style={styles.radioItem}
                  />
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    fontWeight: 'bold',
  },
  sectionDescription: {
    marginBottom: spacing.lg,
  },
  radioOption: {
    marginBottom: spacing.sm,
  },
  radioItem: {
    paddingLeft: 0,
  },
  optionDescription: {
    marginLeft: 36,
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
  },
});

export default SettingsScreen;
