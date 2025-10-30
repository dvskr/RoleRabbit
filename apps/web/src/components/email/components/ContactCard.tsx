'use client';

import React from 'react';
import { Contact } from '../types';
import { Mail, Building, Briefcase, Calendar, MessageSquare, PhoneCall } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

const ContactCard = React.memo(function ContactCard({ contact, onClick }: ContactCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  const fullName = `${contact.firstName} ${contact.lastName}`;

  const getGroupColors = (group: string) => {
    switch (group) {
      case 'Recruiters':
        return { bg: `${colors.primaryBlue}20`, text: colors.activeBlueText, border: colors.primaryBlue };
      case 'Hiring Managers':
        return { bg: `${colors.successGreen}20`, text: colors.successGreen, border: colors.successGreen };
      case 'Network':
        return { bg: `${colors.badgePurpleText}20`, text: colors.badgePurpleText, border: colors.badgePurpleText };
      default:
        return { bg: colors.inputBackground, text: colors.tertiaryText, border: colors.border };
    }
  };

  const groupColors = getGroupColors(contact.group);

  return (
    <div
      onClick={onClick}
      className="rounded-lg p-4 transition-all cursor-pointer"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 6px rgba(0, 0, 0, 0.1)`;
        e.currentTarget.style.borderColor = colors.borderFocused;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          style={{ background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}
        >
          {contact.avatar ? (
            <img src={contact.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Name & Role */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate" style={{ color: colors.primaryText }}>{fullName}</h3>
          <p className="text-sm truncate" style={{ color: colors.secondaryText }}>{contact.role}</p>
        </div>
      </div>

      {/* Company */}
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: colors.secondaryText }}>
        <Building size={14} />
        <span className="truncate">{contact.company}</span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: colors.secondaryText }}>
        <Mail size={14} />
        <span className="truncate">{contact.email}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-4 text-xs" style={{ color: colors.tertiaryText }}>
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            <span>{contact.emailCount}</span>
          </div>
          {contact.phone && (
            <div className="flex items-center gap-1">
              <PhoneCall size={12} />
              <span>{contact.phoneCount}</span>
            </div>
          )}
        </div>

        {/* Group Badge */}
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            background: groupColors.bg,
            color: groupColors.text,
            border: `1px solid ${groupColors.border}40`,
          }}
        >
          {contact.group}
        </span>
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {contact.tags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 rounded text-xs"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
              }}
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs" style={{ color: colors.tertiaryText }}>+{contact.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.contact.id === nextProps.contact.id &&
         prevProps.onClick === nextProps.onClick;
});

export default ContactCard;

