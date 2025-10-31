'use client';

import React, { useState, useMemo } from 'react';
import { Contact } from '../types';
import ContactCard from './ContactCard';
import { useTheme } from '../../../contexts/ThemeContext';

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    role: 'Senior Recruiter',
    tags: ['recruiter', 'tech'],
    group: 'Recruiters',
    emailCount: 5,
    phoneCount: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    lastContactDate: '2024-01-20'
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@startupco.io',
    phone: '+1 (555) 234-5678',
    company: 'Startup Co',
    role: 'Hiring Manager',
    tags: ['hiring', 'startup'],
    group: 'Hiring Managers',
    emailCount: 3,
    phoneCount: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    lastContactDate: '2024-01-18'
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@globale.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Inc',
    role: 'Engineering Manager',
    tags: ['hiring', 'engineering'],
    group: 'Hiring Managers',
    emailCount: 2,
    phoneCount: 0,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    lastContactDate: '2024-01-15'
  },
];

interface ContactListProps {
  viewMode: 'list' | 'grid';
  searchTerm: string;
  onContactClick: (contact: Contact) => void;
}

export default function ContactList({ viewMode, searchTerm, onContactClick }: ContactListProps) {
  const [contacts] = useState<Contact[]>(mockContacts);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(lowerSearchTerm) ||
      contact.lastName.toLowerCase().includes(lowerSearchTerm) ||
      contact.email.toLowerCase().includes(lowerSearchTerm) ||
      contact.company.toLowerCase().includes(lowerSearchTerm) ||
      contact.role.toLowerCase().includes(lowerSearchTerm)
    );
  }, [contacts, searchTerm]);

  const { theme } = useTheme();
  const colors = theme.colors;

  if (filteredContacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg" style={{ color: colors.secondaryText }}>No contacts found</p>
          <p className="text-sm mt-2" style={{ color: colors.tertiaryText }}>
            {searchTerm ? 'Try adjusting your search' : 'Add your first contact to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onContactClick(contact)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onContactClick(contact)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

