'use client';

import React from 'react';
import { 
  LucideIcon, 
  FolderOpen, 
  Briefcase, 
  Users, 
  Mail, 
  FileText, 
  Globe, 
  LayoutTemplate,
  User,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  actions?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    disabled?: boolean;
  }[];
  breadcrumbs?: { label: string; href?: string }[];
}

// Export icon mapping for easy use
export const PageHeaderIcons = {
  Storage: FolderOpen,
  Tracker: Briefcase,
  Community: Users,
  Discussion: MessageSquare,
  Email: Mail,
  CoverLetter: FileText,
  Portfolio: Globe,
  Templates: LayoutTemplate,
  Profile: User,
  Agents: Sparkles,
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  actions = [],
  breadcrumbs
}: PageHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Determine icon color based on theme if not provided
  const iconColorValue = iconColor || colors.primaryBlue;

  return (
    <div 
      className="px-6 py-4 sm:py-5 border-b flex items-center gap-4 flex-shrink-0"
      style={{
        background: colors.headerBackground,
        borderBottom: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Icon */}
      {Icon && (
        <div 
          className="p-1.5 rounded-lg flex items-center justify-center"
          style={{
            background: iconBgColor || colors.badgeInfoBg,
            color: iconColorValue,
          }}
        >
          <Icon size={18} />
        </div>
      )}

      {/* Title */}
      <div>
        <h1 
          className="text-lg"
          style={{ color: colors.primaryText, fontWeight: 600 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className="text-xs"
            style={{ color: colors.secondaryText }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs" style={{ color: colors.tertiaryText }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span style={{ color: colors.tertiaryText }}>/</span>}
              <a 
                href={crumb.href || '#'} 
                className="transition-colors font-medium"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryBlue;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.secondaryText;
                }}
              >
                {crumb.label}
              </a>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const { label, icon: ActionIcon, onClick, variant = 'secondary', disabled } = action;
            
            const variantStyles = {
              primary: {
                background: colors.primaryBlue,
                color: 'white',
                border: `1px solid ${colors.primaryBlue}`,
                hoverBg: colors.primaryBlueHover,
              },
              secondary: {
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
                hoverBg: colors.hoverBackgroundStrong,
              },
              danger: {
                background: colors.badgeErrorBg,
                color: colors.errorRed,
                border: `1px solid ${colors.badgeErrorBorder}`,
                hoverBg: colors.badgeErrorBg,
              },
              success: {
                background: colors.badgeSuccessBg,
                color: colors.successGreen,
                border: `1px solid ${colors.badgeSuccessBorder}`,
                hoverBg: colors.badgeSuccessBg,
              },
            };

            const style = variantStyles[variant] || variantStyles.secondary;

            return (
              <button
                key={index}
                onClick={onClick}
                disabled={disabled}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: disabled ? colors.inputBackground : style.background,
                  color: disabled ? colors.tertiaryText : style.color,
                  border: `1px solid ${disabled ? colors.border : style.border}`,
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = style.hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = style.background;
                  }
                }}
              >
                <ActionIcon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
