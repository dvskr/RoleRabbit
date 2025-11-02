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
  ipAddress?: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
  userAgent?: string;
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
  isTwoFAStatusLoading?: boolean;
  isTwoFAProcessing?: boolean;
}

// Login activity section props
export interface LoginActivitySectionProps extends SecuritySectionProps {
  sessions?: LoginSession[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onLogoutSession?: (sessionId: string) => void;
  onLogoutAllSessions?: () => void;
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
  isSubmitting?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
}

// 2FA modal props
export interface TwoFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  colors: ThemeColors;
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  isVerifying?: boolean;
  errorMessage?: string | null;
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

