import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, useTheme, SegmentedButtons, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../constants/theme';
import { PRIVACY_POLICY, TERMS_OF_SERVICE, ABOUT_TEXT } from '../constants/legal';
import { APP_VERSION } from '../constants/config';

type LegalSection = 'about' | 'privacy' | 'terms';

const LegalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState<LegalSection>('about');

  const renderContent = () => {
    switch (selectedSection) {
      case 'about':
        return (
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                About LadFit
              </Text>
              <Text variant="bodyMedium" style={styles.content}>
                {ABOUT_TEXT}
              </Text>
              <View style={styles.versionContainer}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Version {APP_VERSION}
                </Text>
              </View>
            </Card.Content>
          </Card>
        );
      case 'privacy':
        return (
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.legalText}>
                {PRIVACY_POLICY}
              </Text>
            </Card.Content>
          </Card>
        );
      case 'terms':
        return (
          <Card style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.legalText}>
                {TERMS_OF_SERVICE}
              </Text>
            </Card.Content>
          </Card>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Legal & About" />
      </Appbar.Header>

      <View style={styles.segmentedButtonContainer}>
        <SegmentedButtons
          value={selectedSection}
          onValueChange={(value) => setSelectedSection(value as LegalSection)}
          buttons={[
            { value: 'about', label: 'About' },
            { value: 'privacy', label: 'Privacy' },
            { value: 'terms', label: 'Terms' },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedButtonContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legalText: {
    lineHeight: 22,
    textAlign: 'left',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default LegalScreen;
