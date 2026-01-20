import { create } from 'zustand';
import { Template } from '../types';
import { loadTemplates, saveTemplates } from '../utils/storage';

interface TemplateStore {
  templates: Template[];
  isLoading: boolean;
  loadTemplates: () => Promise<void>;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => Template | undefined;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  isLoading: false,

  loadTemplates: async () => {
    set({ isLoading: true });
    const templates = await loadTemplates();
    set({ templates, isLoading: false });
  },

  addTemplate: async (templateData) => {
    const newTemplate: Template = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const templates = [...get().templates, newTemplate];
    await saveTemplates(templates);
    set({ templates });
  },

  updateTemplate: async (id, updates) => {
    const templates = get().templates.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    await saveTemplates(templates);
    set({ templates });
  },

  deleteTemplate: async (id) => {
    const templates = get().templates.filter(t => t.id !== id);
    await saveTemplates(templates);
    set({ templates });
  },

  getTemplate: (id) => {
    return get().templates.find(t => t.id === id);
  },
}));