// Main components
export { default as ProfileHeader } from './ProfileHeader';
export { default as ProfileSidebar } from './ProfileSidebar';

// Tab components
export { default as ProfileTab } from './tabs/ProfileTab';
export { default as ProfessionalTab } from './tabs/ProfessionalTab';
export { default as SkillsTab } from './tabs/SkillsTab';
export { default as AnalyticsTab } from './tabs/AnalyticsTab';
export { default as PreferencesTab } from './tabs/PreferencesTab';
export { default as BillingTab } from './tabs/BillingTab';
export { default as SupportTab } from './tabs/SupportTab';

// Sub-components
export { default as FormField } from './components/FormField';
export { default as ProfilePicture } from './components/ProfilePicture';
export { default as BulletListEditor } from './components/BulletListEditor';

// Types
export type { UserData, ProfileTabConfig, ProfileHeaderProps, ProfileSidebarProps, FormFieldProps } from './types/profile';
