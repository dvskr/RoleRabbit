'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { EmailHeaderProps } from '../types/email';

export default function EmailHeader({ onCompose, onSync }: EmailHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">Send professional emails with AI assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onSync}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Sync
          </button>
          <button
            onClick={onCompose}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-sm"
          >
            <Plus size={14} className="inline mr-1" />
            Compose
          </button>
        </div>
      </div>
    </div>
  );
}
