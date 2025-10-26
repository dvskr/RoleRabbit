'use client';

import React from 'react';
import { X, Mail, Phone, Building, Briefcase, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Contact } from '../types';

interface ContactDetailsModalProps {
  contact: Contact;
  onClose: () => void;
}

export default function ContactDetailsModal({ contact, onClose }: ContactDetailsModalProps) {
  const fullName = `${contact.firstName} ${contact.lastName}`;
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {contact.avatar ? (
                <img src={contact.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-600">{contact.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{contact.email}</p>
            </div>
          </div>

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{contact.phone}</p>
              </div>
            </div>
          )}

          {/* Company */}
          <div className="flex items-center gap-3">
            <Building size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-gray-900">{contact.company}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-900">{contact.role}</p>
            </div>
          </div>

          {/* Last Contact */}
          {contact.lastContactDate && (
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Contact</p>
                <p className="text-gray-900">
                  {new Date(contact.lastContactDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Communication Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Emails</p>
                <p className="text-lg font-semibold text-gray-900">{contact.emailCount}</p>
              </div>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Calls</p>
                  <p className="text-lg font-semibold text-gray-900">{contact.phoneCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Tags</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

