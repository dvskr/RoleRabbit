import React from 'react';

interface EmptyStateIconProps {
  variant?: 'document' | 'search' | 'inbox' | 'folder';
}

const icons = {
  document: '📄',
  search: '🔍',
  inbox: '📥',
  folder: '📁'
};

export function EmptyStateIcon({ variant = 'document' }: EmptyStateIconProps) {
  return (
    <div className="text-6xl mb-4">
      {icons[variant]}
    </div>
  );
}

