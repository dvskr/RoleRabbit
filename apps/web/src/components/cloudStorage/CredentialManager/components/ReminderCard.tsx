import React from 'react';
import { CredentialReminder } from '../../../../types/cloudStorage';
import { getReminderPriorityColor } from '../utils';

interface ReminderCardProps {
  reminder: CredentialReminder;
  colors: {
    errorRed: string;
    badgeWarningText: string;
    badgeWarningBg: string;
    badgeErrorBg: string;
    primaryBlue: string;
    badgeInfoBg: string;
    badgeInfoText: string;
    border: string;
    inputBackground: string;
    primaryText: string;
    secondaryText: string;
  };
}

export function ReminderCard({ reminder, colors }: ReminderCardProps) {
  const priorityColorStyle = getReminderPriorityColor(reminder.priority, colors);

  return (
    <div
      className="border rounded-lg p-3"
      style={{
        borderColor: priorityColorStyle.border,
        background: priorityColorStyle.bg,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p 
            className="font-medium"
            style={{ color: colors.primaryText }}
          >
            {reminder.credentialName}
          </p>
          <p 
            className="text-sm mt-1"
            style={{ color: colors.secondaryText }}
          >
            Expires: {new Date(reminder.expirationDate).toLocaleDateString()}
          </p>
        </div>
        <span 
          className="px-2 py-1 text-xs font-medium rounded"
          style={{
            background: reminder.priority === 'high' ? colors.badgeErrorBg :
                        reminder.priority === 'medium' ? colors.badgeWarningBg :
                        colors.badgeInfoBg,
            color: reminder.priority === 'high' ? colors.errorRed :
                   reminder.priority === 'medium' ? colors.badgeWarningText :
                   colors.badgeInfoText,
          }}
        >
          {reminder.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

