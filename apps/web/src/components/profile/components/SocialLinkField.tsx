'use client';

import React from 'react';
import { ExternalLink, LucideIcon } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';
import FormField from './FormField';
import { normalizeUrl } from '../../../utils/urlHelpers';

interface SocialLinkFieldProps {
  label: string;
  icon: LucideIcon;
  value: string | null | undefined;
  isEditing: boolean;
  colors: ThemeColors;
  onChange: (value: string) => void;
  placeholder: string;
  fieldId: string;
  fieldName: string;
  emptyMessage?: string;
}

export const SocialLinkField: React.FC<SocialLinkFieldProps> = ({
  label,
  icon: Icon,
  value,
  isEditing,
  colors,
  onChange,
  placeholder,
  fieldId,
  fieldName,
  emptyMessage = `No ${label} URL provided`,
}) => {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2 flex items-center gap-2"
        style={{ color: colors.primaryText }}
      >
        <Icon size={16} style={{ color: colors.secondaryText }} />
        {label}
      </label>
      {isEditing ? (
        <FormField
          id={fieldId}
          name={fieldName}
          label=""
          type="url"
          value={value || ''}
          onChange={onChange}
          disabled={false}
          placeholder={placeholder}
        />
      ) : value ? (
        <a
          href={normalizeUrl(value) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.primaryBlue,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primaryBlue;
            e.currentTarget.style.background = colors.badgeInfoBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = colors.inputBackground;
          }}
        >
          <span className="flex-1 truncate">{value}</span>
          <ExternalLink size={14} />
        </a>
      ) : (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{
            background: colors.inputBackground,
            border: `1px solid ${colors.border}`,
            color: colors.tertiaryText,
          }}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
};
