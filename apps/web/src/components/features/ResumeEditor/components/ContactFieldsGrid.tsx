'use client';

import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Plus } from 'lucide-react';
import { ThemeColors } from '../../../contexts/ThemeContext';
import { STANDARD_CONTACT_FIELDS } from '../constants';
import { getFieldIcon } from '../utils/iconHelpers';

interface ContactFieldsGridProps {
  resumeData: any;
  setResumeData: (data: any) => void;
  customFields: Array<{ id: string; name: string; icon?: string; value?: string }>;
  setCustomFields: (fields: Array<{ id: string; name: string; icon?: string; value?: string }>) => void;
  setShowAddFieldModal: (show: boolean) => void;
  colors: ThemeColors;
}

const CONTACT_FIELD_ICONS = [
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
];

export default function ContactFieldsGrid({
  resumeData,
  setResumeData,
  customFields,
  setCustomFields,
  setShowAddFieldModal,
  colors,
}: ContactFieldsGridProps) {
  // Use accentCyan for icons that should have the accent color
  const getIconColor = (index: number) => {
    // Email, Location use gray (tertiaryText)
    if (index === 0 || index === 2) return colors.tertiaryText;
    // Phone, LinkedIn, Github, Website use accent color
    return colors.accentCyan;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 text-sm mb-6 lg:mb-10">
      {/* Standard Contact Fields */}
      {STANDARD_CONTACT_FIELDS.map((field, idx) => {
        const IconComponent = CONTACT_FIELD_ICONS[idx];
        return (
          <div key={field} className="flex items-center gap-2 group">
            {IconComponent && <IconComponent size={16} style={{ color: getIconColor(idx) }} />}
            <input 
              className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
              style={{
                background: colors.inputBackground,
                border: `2px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              value={resumeData[field] || ''} 
              onChange={(e) => setResumeData((prev: any) => ({...prev, [field]: e.target.value}))}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accentCyan;
                e.target.style.outline = `2px solid ${colors.accentCyan}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.outline = 'none';
              }}
            />
          </div>
        );
      })}
      
      {/* Custom Fields */}
      {customFields.map((field) => (
        <div key={field.id} className="flex items-center gap-2 group">
          {getFieldIcon(field.icon || 'default', colors.accentCyan)}
          <input 
            className="flex-1 border-2 outline-none rounded-lg px-2 sm:px-3 py-2 min-w-0 max-w-full break-words overflow-wrap-anywhere text-sm transition-all" 
            style={{
              background: colors.inputBackground,
              border: `2px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            value={field.value || ''} 
            onChange={(e) => {
              const updatedFields = customFields.map(f => 
                f.id === field.id ? { ...f, value: e.target.value } : f
              );
              setCustomFields(updatedFields);
            }}
            placeholder={field.name}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accentCyan;
              e.target.style.outline = `2px solid ${colors.accentCyan}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.outline = 'none';
            }}
          />
        </div>
      ))}
      
      {/* Add Custom Field Button */}
      <div className="flex items-center gap-2 group">
        <Plus size={16} style={{ color: colors.tertiaryText }} />
        <button
          onClick={() => setShowAddFieldModal(true)}
          className="flex-1 border-2 border-dashed rounded-lg px-2 sm:px-3 py-2 text-left min-w-0 max-w-full transition-all"
          style={{
            border: `2px dashed ${colors.border}`,
            background: 'transparent',
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accentCyan;
            e.currentTarget.style.background = `${colors.accentCyan}10`;
            e.currentTarget.style.color = colors.accentCyan;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = colors.secondaryText;
          }}
        >
          <span className="text-xs sm:text-sm font-medium break-words overflow-wrap-anywhere">Add Field</span>
        </button>
      </div>
    </div>
  );
}

