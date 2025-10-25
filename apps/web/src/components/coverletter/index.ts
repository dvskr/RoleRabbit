// Main components
export { default as CoverLetterHeader } from './CoverLetterHeader';
export { default as CoverLetterTabs } from './CoverLetterTabs';

// Tab components
export { default as TemplatesTab } from './tabs/TemplatesTab';
export { default as AITab } from './tabs/AITab';
export { default as CustomTab } from './tabs/CustomTab';
export { default as PreviewTab } from './tabs/PreviewTab';

// Sub-components
export { default as CoverLetterEditor } from './components/CoverLetterEditor';
export { default as TemplateCard } from './components/TemplateCard';
export { default as AIContextForm } from './components/AIContextForm';
export { default as PreviewPanel } from './components/PreviewPanel';

// Types
export type {
  CoverLetterTemplate,
  CoverLetterDraft,
  AIContext,
  CoverLetterHeaderProps,
  CoverLetterTabsProps,
  CoverLetterEditorProps,
  TemplateCardProps,
  AIContextFormProps,
  PreviewPanelProps
} from './types/coverletter';
