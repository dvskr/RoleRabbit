/**
 * useDashboardTemplates v2 - Backward-compatible wrapper using TemplateContext
 *
 * This version delegates to the centralized TemplateContext for state management.
 * All template state is now managed in one place with automatic localStorage persistence.
 *
 * MIGRATION NOTE: This hook now requires TemplateProvider in the component tree.
 * New code should use useAddedTemplates() from TemplateContext for better clarity.
 */

import { useCallback } from 'react';
import { useTemplateContext } from '../../../contexts/TemplateContext';

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
 * Backward-compatible hook that delegates to TemplateContext
 * @deprecated Use useAddedTemplates() or useTemplateContext() for new code
 */
export function useDashboardTemplates(): UseDashboardTemplatesReturn {
  const context = useTemplateContext();

  // Provide setAddedTemplates for backward compatibility
  // Note: This bypasses the context's add/remove logic, so use with caution
  const setAddedTemplates = useCallback((templates: string[]) => {
    // This is a workaround for backward compatibility
    // Ideally, components should use addTemplate/removeTemplate instead
    templates.forEach(id => {
      if (!context.addedTemplates.includes(id)) {
        context.addTemplate(id);
      }
    });

    // Remove templates that are no longer in the new list
    context.addedTemplates.forEach(id => {
      if (!templates.includes(id)) {
        context.removeTemplate(id);
      }
    });
  }, [context]);

  return {
    selectedTemplateId: context.selectedTemplateId,
    setSelectedTemplateId: context.selectTemplate,
    addedTemplates: context.addedTemplates,
    setAddedTemplates,
    addTemplate: context.addTemplate,
    removeTemplate: context.removeTemplate,
    maxTemplates: context.maxAddedTemplates,
  };
}
