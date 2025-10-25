'use client';

import React, { useState, useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Type, CheckSquare } from 'lucide-react';
import { CoverLetterEditorProps } from '../types/coverletter';

export default function CoverLetterEditor({
  content,
  onContentChange,
  wordCount,
  onWordCountChange,
  placeholder = "Write your cover letter here..."
}: CoverLetterEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const count = content.trim() === '' ? 0 : words.length;
    onWordCountChange(count);
  }, [content, onWordCountChange]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const applyFormatting = (command: string, value?: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      document.execCommand(command, false, value);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-300 bg-gray-50">
        <button 
          onClick={() => applyFormatting('bold')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          onClick={() => applyFormatting('italic')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button 
          onClick={() => applyFormatting('underline')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button 
          onClick={() => applyFormatting('justifyLeft')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          onClick={() => applyFormatting('justifyCenter')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          onClick={() => applyFormatting('justifyRight')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button 
          onClick={() => applyFormatting('insertUnorderedList')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button 
          onClick={() => applyFormatting('insertOrderedList')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          <CheckSquare size={16} />
        </button>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Type size={14} />
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={20}
          className={`w-full px-4 py-4 border-0 focus:ring-0 resize-none text-gray-900 leading-relaxed ${
            isFocused ? 'bg-white' : 'bg-gray-50'
          } transition-colors`}
          style={{ minHeight: '500px' }}
        />
        
      </div>
    </div>
  );
}
