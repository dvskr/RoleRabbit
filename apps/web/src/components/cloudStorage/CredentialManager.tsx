'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { CredentialInfo, CredentialReminder } from '../../types/cloudStorage';
import { useTheme } from '../../contexts/ThemeContext';
import { CredentialManagerProps } from './CredentialManager/types';
import { REMINDERS_SECTION } from './CredentialManager/constants';
import { useCredentialModals } from './CredentialManager/hooks/useCredentialModals';
import { CredentialHeader } from './CredentialManager/components/CredentialHeader';
import { ReminderCard } from './CredentialManager/components/ReminderCard';
import { CredentialCard } from './CredentialManager/components/CredentialCard';
import { EmptyState } from './CredentialManager/components/EmptyState';
import { AddCredentialModal } from './CredentialManager/components/AddCredentialModal';
import { ViewCredentialModal } from './CredentialManager/components/ViewCredentialModal';

export default function CredentialManager({
  credentials,
  reminders,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  onGenerateQRCode
}: CredentialManagerProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const {
    showAddModal,
    selectedCredential,
    openAddModal,
    closeAddModal,
    openViewModal,
    closeViewModal,
  } = useCredentialModals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <CredentialHeader colors={colors} onAddClick={openAddModal} />

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <div 
          className="rounded-lg p-4"
          style={{
            background: colors.badgeWarningBg,
            border: `1px solid ${colors.badgeWarningBorder}`,
          }}
        >
          <div className="flex items-start gap-3">
            <Clock style={{ color: colors.badgeWarningText }} className="mt-0.5" size={20} />
            <div className="flex-1">
              <h3 
                className="font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                {REMINDERS_SECTION.title}
              </h3>
              <div className="space-y-2">
                {reminders.map((reminder: CredentialReminder) => (
                  <ReminderCard 
                    key={reminder.id}
                    reminder={reminder} 
                    colors={colors} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((credential: CredentialInfo) => (
            <CredentialCard
              key={credential.credentialId}
              credential={credential}
              colors={colors}
              onCardClick={openViewModal}
              onGenerateQRCode={onGenerateQRCode}
            />
          ))}
        </div>
      ) : (
        <EmptyState colors={colors} onAddClick={openAddModal} />
      )}

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        onAddCredential={onAddCredential}
        colors={colors}
        theme={theme}
      />

      {/* View Credential Modal */}
      <ViewCredentialModal
        credential={selectedCredential}
        onClose={closeViewModal}
        colors={colors}
      />
    </div>
  );
}

