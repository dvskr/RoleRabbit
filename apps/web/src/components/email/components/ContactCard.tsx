'use client';

import React from 'react';
import { Contact } from '../types';
import { Mail, Phone, Building, Briefcase, Calendar, MessageSquare, PhoneCall } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

export default function ContactCard({ contact, onClick }: ContactCardProps) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {contact.avatar ? (
            <img src={contact.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Name & Role */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
          <p className="text-sm text-gray-600 truncate">{contact.role}</p>
        </div>
      </div>

      {/* Company */}
      <div className="flex items-center gap-2 text-gray-600 mb-3 text-sm">
        <Building size={14} />
        <span className="truncate">{contact.company}</span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-gray-600 mb-3 text-sm">
        <Mail size={14} />
        <span className="truncate">{contact.email}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          contact.group === 'Recruiters' ? 'bg-blue-100 text-blue-700' :
          contact.group === 'Hiring Managers' ? 'bg-green-100 text-green-700' :
          contact.group === 'Network' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {contact.group}
        </span>
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {contact.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">+{contact.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

