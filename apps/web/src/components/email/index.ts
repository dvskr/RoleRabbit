// Main components
export { default as EmailHeader } from './EmailHeader';
export { default as EmailTabs } from './EmailTabs';

// Tab components
export { default as InboxTab } from './tabs/InboxTab';
export { default as ComposeTab } from './tabs/ComposeTab';
export { default as TemplatesTab } from './tabs/TemplatesTab';
export { default as CampaignsTab } from './tabs/CampaignsTab';
export { default as AnalyticsTab } from './tabs/AnalyticsTab';

// Sub-components
export { default as EmailComposer } from './components/EmailComposer';
export { default as TemplateCard } from './components/TemplateCard';
export { default as CampaignCard } from './components/CampaignCard';
export { default as AIGenerator } from './components/AIGenerator';

// Types
export type {
  EmailTemplate,
  EmailDraft,
  EmailCampaign,
  AIContext,
  EmailHeaderProps,
  EmailTabsProps,
  EmailComposerProps,
  TemplateCardProps,
  CampaignCardProps,
  AIGeneratorProps
} from './types/email';
