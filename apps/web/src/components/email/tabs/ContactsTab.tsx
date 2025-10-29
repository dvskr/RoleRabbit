'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, List, Grid, UserPlus } from 'lucide-react';
import ContactList from '../components/ContactList';
import AddContactModal from '../components/AddContactModal';
import ContactDetailsModal from '../components/ContactDetailsModal';
import { Contact } from '../types';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ContactsTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.tertiaryText }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          {/* Filter */}
          <button 
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg p-0.5" style={{ border: `1px solid ${colors.border}`, background: colors.inputBackground }}>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded transition-colors"
              style={{
                background: viewMode === 'list' ? colors.badgeInfoBg : 'transparent',
                color: viewMode === 'list' ? colors.activeBlueText : colors.tertiaryText,
              }}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 rounded transition-colors"
              style={{
                background: viewMode === 'grid' ? colors.badgeInfoBg : 'transparent',
                color: viewMode === 'grid' ? colors.activeBlueText : colors.tertiaryText,
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          {/* Add Contact */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
            style={{ background: colors.primaryBlue }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
          >
            <UserPlus size={16} />
            <span className="font-medium">Add Contact</span>
          </button>
        </div>
      </div>

      {/* Contact List/Grid */}
      <div className="flex-1 overflow-y-auto" style={{ background: colors.background }}>
        <ContactList
          viewMode={viewMode}
          searchTerm={searchTerm}
          onContactClick={setSelectedContact}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdd={(contact) => {
            console.log('Adding contact:', contact);
            setShowAddModal(false);
          }}
        />
      )}

      {selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}

