/**
 * Custom hook for managing dashboard template state
 */

import { useState } from 'react';
import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_ADDED_TEMPLATES,
} from '../constants/dashboard.constants';

// Maximum number of templates that can be added
const MAX_ADDED_TEMPLATES = 10;

export interface UseDashboardTemplatesReturn {
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
  addedTemplates: string[];
  setAddedTemplates: (templates: string[]) => void;
  addTemplate: (templateId: string) => boolean;
  removeTemplate: (templateId: string) => void;
  maxTemplates: number;
}

/**
 * Hook for managing template selection and added templates
 */
export function useDashboardTemplates(): UseDashboardTemplatesReturn {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(DEFAULT_TEMPLATE_ID);
  const [addedTemplates, setAddedTemplates] = useState<string[]>([...DEFAULT_ADDED_TEMPLATES]);

  const addTemplate = (templateId: string): boolean => {
    // Check if template is already added
    if (addedTemplates.includes(templateId)) {
      return false;
    }

    // Check if we've reached the maximum limit
    if (addedTemplates.length >= MAX_ADDED_TEMPLATES) {
      console.warn(`Cannot add template: maximum limit of ${MAX_ADDED_TEMPLATES} templates reached`);
      return false;
    }

    // Add the template
    setAddedTemplates(prev => [...prev, templateId]);
    return true;
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
    maxTemplates: MAX_ADDED_TEMPLATES,
  };
}

