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
  GraduationCap,
  MessageSquare,
  Cloud
} from 'lucide-react';

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
  Learning: GraduationCap,
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor,
  actions = [],
  breadcrumbs
}: PageHeaderProps) {
  // Determine icon background gradient based on icon type
  const getIconGradient = () => {
    if (iconBgColor) return iconBgColor;
    if (Icon === FolderOpen || Icon === Cloud) return 'bg-gradient-to-br from-blue-50 to-cyan-50';
    if (Icon === MessageSquare) return 'bg-gradient-to-br from-indigo-50 to-violet-50';
    if (Icon === Users) return 'bg-gradient-to-br from-teal-50 to-cyan-50';
    if (Icon === Mail) return 'bg-gradient-to-br from-purple-50 to-pink-50';
    if (Icon === Briefcase) return 'bg-gradient-to-br from-green-50 to-emerald-50';
    if (Icon === Mail) return 'bg-gradient-to-br from-purple-50 to-pink-50';
    if (Icon === FileText) return 'bg-gradient-to-br from-orange-50 to-amber-50';
    if (Icon === MessageSquare) return 'bg-gradient-to-br from-indigo-50 to-violet-50';
    if (Icon === Users) return 'bg-gradient-to-br from-teal-50 to-cyan-50';
    if (Icon === Globe) return 'bg-gradient-to-br from-rose-50 to-pink-50';
    if (Icon === LayoutTemplate) return 'bg-gradient-to-br from-violet-50 to-purple-50';
    if (Icon === User) return 'bg-gradient-to-br from-slate-50 to-gray-50';
    if (Icon === Sparkles) return 'bg-gradient-to-br from-purple-50 to-indigo-50';
    if (Icon === GraduationCap) return 'bg-gradient-to-br from-blue-50 to-sky-50';
    return 'bg-gradient-to-br from-blue-50 to-indigo-50';
  };

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                <a 
                  href={crumb.href || '#'} 
                  className="hover:text-blue-600 transition-colors font-medium"
                >
                  {crumb.label}
                </a>
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-xl ${getIconGradient()} shadow-sm border border-white/50`}>
                <Icon size={22} className={iconColor} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-0.5 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => {
                const { label, icon: ActionIcon, onClick, variant = 'secondary', disabled } = action;
                
                const variantClasses = {
                  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-lg',
                  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
                  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-lg',
                  success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-lg'
                };

                return (
                  <button
                    key={index}
                    onClick={onClick}
                    disabled={disabled}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      flex items-center gap-1.5 transition-all duration-200
                      ${variantClasses[variant]}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <ActionIcon size={14} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
