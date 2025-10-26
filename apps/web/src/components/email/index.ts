/**
 * Email Hub - Central Export File
 */

export { default as EmailHub } from './EmailHub';

// Tabs
export { default as ContactsTab } from './tabs/ContactsTab';
export { default as ComposerTab } from './tabs/ComposerTab';
export { default as InboxTab } from './tabs/InboxTab';
export { default as TemplatesTab } from './tabs/TemplatesTab';
export { default as SettingsTab } from './tabs/SettingsTab';
export { default as AnalyticsTab } from './tabs/AnalyticsTab';

// Components
export { default as ContactList } from './components/ContactList';
export { default as ContactCard } from './components/ContactCard';
export { default as AddContactModal } from './components/AddContactModal';
export { default as ContactDetailsModal } from './components/ContactDetailsModal';

// Types
export * from './types';

// Types for EmailHubTab
export type { EmailHubTab } from './EmailHub';
