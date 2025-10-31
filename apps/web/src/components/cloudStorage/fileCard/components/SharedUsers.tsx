/**
 * SharedUsers - Display shared users avatars
 */

import React from 'react';
import { Users } from 'lucide-react';

interface SharedUsersProps {
  sharedWith: Array<{ id: string; userName: string }>;
  colors: any;
  maxVisible?: number;
}

export const SharedUsers: React.FC<SharedUsersProps> = ({
  sharedWith,
  colors,
  maxVisible = 3,
}) => {
  if (sharedWith.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center space-x-1.5">
        <Users size={12} style={{ color: colors.tertiaryText }} />
        <div className="flex -space-x-2">
          {sharedWith.slice(0, maxVisible).map((share) => (
            <div 
              key={share.id} 
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                borderColor: colors.cardBackground,
              }}
            >
              <span className="text-xs text-white font-medium">
                {share.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {sharedWith.length > maxVisible && (
            <div 
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
              style={{
                background: colors.inputBackground,
                borderColor: colors.cardBackground,
              }}
            >
              <span 
                className="text-xs font-medium"
                style={{ color: colors.secondaryText }}
              >
                +{sharedWith.length - maxVisible}
              </span>
            </div>
          )}
        </div>
        <span 
          className="text-xs"
          style={{ color: colors.secondaryText }}
        >
          {sharedWith.length} shared
        </span>
      </div>
    </div>
  );
};

