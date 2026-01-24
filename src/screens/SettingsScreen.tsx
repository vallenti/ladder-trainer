import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Linking, KeyboardAvoidingView } from 'react-native';
import { Text, Card, RadioButton, useTheme, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { useThemeStore, ThemeMode } from '../store/themeStore';
import { spacing } from '../constants/theme';
import { SUPPORT_EMAIL, APP_VERSION } from '../constants/config';
import Constants from 'expo-constants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type FeedbackType = 'bug' | 'feature' | null;

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeStore();
  const [feedbackDialogVisible, setFeedbackDialogVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackText, setFeedbackText] = useState('');

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

  const openFeedbackDialog = (type: 'bug' | 'feature') => {
    setFeedbackType(type);
    setFeedbackText('');
    setFeedbackDialogVisible(true);
  };

  const closeFeedbackDialog = () => {
    setFeedbackDialogVisible(false);
    setFeedbackType(null);
    setFeedbackText('');
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) {
      return;
    }

    // Gather device information
    const deviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version,
      deviceModel: Constants.deviceName || 'Unknown',
      appVersion: APP_VERSION,
      theme: themeMode,
    };

    const subject = feedbackType === 'bug' 
      ? 'Ladder Trainer - Bug Report' 
      : 'Ladder Trainer - Feature Suggestion';

    const body = `
${feedbackType === 'bug' ? 'Bug Description:' : 'Feature Suggestion:'}
${feedbackText}

---
Device Information:
- Platform: ${deviceInfo.platform}
- OS Version: ${deviceInfo.osVersion}
- Device: ${deviceInfo.deviceModel}
- App Version: ${deviceInfo.appVersion}
- Theme: ${deviceInfo.theme}
    `.trim();

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        closeFeedbackDialog();
      } else {
        console.error('Email client not available');
      }
    } catch (error) {
      console.error('Error opening email client:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Feedback
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionDescription, { color: theme.colors.onSurfaceVariant }]}>
              Help us improve Ladder Trainer
            </Text>

            <View style={styles.feedbackButtons}>
              <Button
                mode="outlined"
                icon={() => <MaterialCommunityIcons name="bug" size={20} color={theme.colors.error} />}
                onPress={() => openFeedbackDialog('bug')}
                style={styles.feedbackButton}
                contentStyle={styles.feedbackButtonContent}
                textColor={theme.colors.onSurface}
              >
                Report a Bug
              </Button>

              <Button
                mode="outlined"
                icon={() => <MaterialCommunityIcons name="lightbulb-outline" size={20} color={theme.colors.primary} />}
                onPress={() => openFeedbackDialog('feature')}
                style={styles.feedbackButton}
                contentStyle={styles.feedbackButtonContent}
                textColor={theme.colors.onSurface}
              >
                Suggest a Feature
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
            Version {APP_VERSION}
          </Text>
        </View>
      </View>

      <Portal>
        <Dialog 
          visible={feedbackDialogVisible} 
          onDismiss={closeFeedbackDialog}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title>
            {feedbackType === 'bug' ? 'Report a Bug' : 'Suggest a Feature'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogDescription}>
              {feedbackType === 'bug' 
                ? 'Please describe the bug you encountered. Include steps to reproduce if possible.'
                : 'Share your idea for a new feature or improvement.'}
            </Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={8}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder={feedbackType === 'bug' 
                ? 'Describe what happened...' 
                : 'Describe your feature idea...'}
              style={styles.textInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeFeedbackDialog}>Cancel</Button>
            <Button 
              onPress={sendFeedback} 
              disabled={!feedbackText.trim()}
              buttonColor={theme.colors.primary}
              textColor="#FFFFFF"
            >
              Send
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  feedbackButtons: {
    gap: spacing.sm,
  },
  feedbackButton: {
    marginBottom: spacing.sm,
  },
  feedbackButtonContent: {
    paddingVertical: spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  versionText: {
    fontSize: 12,
  },
  dialogDescription: {
    marginBottom: spacing.md,
  },
  textInput: {
    marginTop: spacing.sm,
    minHeight: 120,
  },
});

export default SettingsScreen;
