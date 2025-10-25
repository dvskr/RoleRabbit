'use client';

import React from 'react';
import { Send, Save, X, Paperclip, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { EmailComposerProps } from '../types/email';

export default function EmailComposer({
  draft,
  onDraftChange,
  onSend,
  onSave,
  onCancel
}: EmailComposerProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        {/* Recipients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
            <input
              type="email"
              value={draft.to}
              onChange={(e) => onDraftChange({ to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="recipient@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CC</label>
            <input
              type="email"
              value={draft.cc}
              onChange={(e) => onDraftChange({ cc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="cc@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">BCC</label>
            <input
              type="email"
              value={draft.bcc}
              onChange={(e) => onDraftChange({ bcc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="bcc@example.com"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => onDraftChange({ subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email subject"
          />
        </div>

        {/* Rich Text Editor Toolbar */}
        <div className="border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 p-3 border-b border-gray-300 bg-gray-50">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Bold size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Italic size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Underline size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <AlignLeft size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <AlignCenter size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <AlignRight size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <List size={16} />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
              <Paperclip size={16} />
            </button>
          </div>

          {/* Content Editor */}
          <textarea
            value={draft.content}
            onChange={(e) => onDraftChange({ content: e.target.value })}
            rows={12}
            className="w-full px-3 py-3 border-0 focus:ring-0 resize-none"
            placeholder="Write your email content here..."
          />
        </div>

        {/* Attachments */}
        {draft.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments</label>
            <div className="flex flex-wrap gap-2">
              {draft.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700">{attachment}</span>
                  <button
                    onClick={() => onDraftChange({ 
                      attachments: draft.attachments.filter((_, i) => i !== index) 
                    })}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={16} className="inline mr-1" />
              Attach File
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={onSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
