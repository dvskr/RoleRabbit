import { ThemeColors } from '../../../../contexts/ThemeContext';

// Profile visibility options
export type ProfileVisibility = 'public' | 'recruiters' | 'private';

// Password data interface
export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
}

// Login session interface
export interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Security section props (base)
export interface SecuritySectionProps {
  colors: ThemeColors;
}

// Password management section props
export interface PasswordManagementSectionProps extends SecuritySectionProps {
  onOpenPasswordModal: () => void;
  twoFAEnabled: boolean;
  onToggle2FA: () => void;
}

// Login activity section props
export interface LoginActivitySectionProps extends SecuritySectionProps {
  sessions?: LoginSession[];
  onLogoutSession?: (sessionId: string) => void;
}

// Privacy settings section props
export interface PrivacySettingsSectionProps extends SecuritySectionProps {
  profileVisibility: ProfileVisibility;
  onProfileVisibilityChange: (visibility: ProfileVisibility) => void;
  showContactInfo: boolean;
  onContactInfoChange: (show: boolean) => void;
}

// Security header props
export interface SecurityHeaderProps extends SecuritySectionProps {
  title?: string;
  description?: string;
}

// Password modal props
export interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
  colors: ThemeColors;
}

// 2FA modal props
export interface TwoFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  colors: ThemeColors;
}

// Password input props
export interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  placeholder?: string;
  colors: ThemeColors;
}

// Security card props (wrapper)
export interface SecurityCardProps {
  children: React.ReactNode;
  colors: ThemeColors;
  title?: string;
}

