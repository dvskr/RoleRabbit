import { useState, useEffect } from 'react';
import type { EmailTemplate } from '../types/EmailComposerAI.types';
import { STORAGE_KEYS } from '../utils/emailComposerAI.constants';

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAIL_TEMPLATES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
        }
      } catch (e) {
        console.error('Error loading templates:', e);
      }
    }
  }, []);

  return { templates, setTemplates };
}

