import { useEffect } from 'react';

/**
 * Hook to handle template application when selectedTemplateId changes
 * @param selectedTemplateId - The currently selected template ID
 * @param onTemplateApply - Callback function to apply the template
 */
export const useTemplateApplication = (
  selectedTemplateId: string | null | undefined,
  onTemplateApply?: (templateId: string) => void
) => {
  useEffect(() => {
    if (selectedTemplateId && onTemplateApply) {
      // Template applied silently without popup
      onTemplateApply(selectedTemplateId);
    }
  }, [selectedTemplateId, onTemplateApply]);
};

