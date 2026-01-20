import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Portal, Dialog, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTemplateStore } from '../../store/templateStore';
import TemplateCard from '../../components/TemplateCard';
import { spacing } from '../../constants/theme';
import { Template } from '../../types';

const TemplateListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { templates, loadTemplates, deleteTemplate, isLoading } = useTemplateStore();
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreateTemplate = () => {
    // @ts-ignore - navigation types will be fixed when we add stack navigator
    navigation.navigate('CreateEditTemplate');
  };

  const handleTemplatePress = (templateId: string) => {
    // @ts-ignore
    navigation.navigate('TemplateDetails', { templateId });
  };

  const handleDeletePress = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setDeleteDialogVisible(false);
      setTemplateToDelete(null);
    }
  };

  if (!isLoading && templates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyText}>
          No templates yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptySubtext}>
          Create your first workout template to get started!
        </Text>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateTemplate}
          label="Create Template"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            onPress={() => handleTemplatePress(item.id)}
            onDelete={() => handleDeletePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTemplate}
      />
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Template</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{templateToDelete?.name}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleConfirmDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    marginBottom: spacing.sm,
    fontWeight: 'bold',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
    marginBottom: spacing.xl,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});

export default TemplateListScreen;