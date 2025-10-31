/**
 * Custom hook for managing dashboard template state
 */

import { useState } from 'react';
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_ADDED_TEMPLATES,
} from '../constants/dashboard.constants';

export interface UseDashboardTemplatesReturn {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  addedTemplates: string[];
  setAddedTemplates: (templates: string[]) => void;
  addTemplate: (templateId: string) => void;
  removeTemplate: (templateId: string) => void;
}

/**
 * Hook for managing template selection and added templates
 */
export function useDashboardTemplates(): UseDashboardTemplatesReturn {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(DEFAULT_TEMPLATE_ID);
  const [addedTemplates, setAddedTemplates] = useState<string[]>([...DEFAULT_ADDED_TEMPLATES]);

  const addTemplate = (templateId: string) => {
    if (!addedTemplates.includes(templateId)) {
      setAddedTemplates(prev => [...prev, templateId]);
    }
  };

  const removeTemplate = (templateId: string) => {
    setAddedTemplates(prev => prev.filter(id => id !== templateId));
  };

  return {
    selectedTemplateId,
    setSelectedTemplateId,
    addedTemplates,
    setAddedTemplates,
    addTemplate,
    removeTemplate,
  };
}

