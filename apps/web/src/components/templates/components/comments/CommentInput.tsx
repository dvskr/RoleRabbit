/**
 * CommentInput Component
 * Input box for adding comments with mention autocomplete
 */

import React, { useState, useRef, useEffect } from 'react';

interface CommentInputProps {
  onSubmit: (content: string, mentions: string[]) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  autoFocus = false,
  initialValue = '',
  onCancel,
  submitLabel = 'Comment',
  loading = false,
  className = '',
}) => {
  const [content, setContent] = useState(initialValue);
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock users for mention autocomplete (replace with actual API call)
  const [suggestedUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  ]);

  const filteredUsers = suggestedUsers.filter((user) =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Handle input change and detect mentions
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Detect @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setShowMentions(true);
        setMentionQuery(textAfterAt);
        setMentionPosition(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const selectMention = (user: { id: string; name: string }) => {
    const beforeMention = content.substring(0, mentionPosition);
    const afterMention = content.substring(mentionPosition + mentionQuery.length + 1);
    const newContent = `${beforeMention}@${user.name} ${afterMention}`;

    setContent(newContent);
    setMentions([...mentions, user.id]);
    setShowMentions(false);

    // Focus back on textarea
    textareaRef.current?.focus();
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || submitting) return;

    setSubmitting(true);

    try {
      await onSubmit(content.trim(), mentions);
      setContent('');
      setMentions([]);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }

    // Close mention dropdown on Escape
    if (e.key === 'Escape' && showMentions) {
      e.preventDefault();
      setShowMentions(false);
    }
  };

  const isDisabled = !content.trim() || submitting || loading;

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
          maxLength={2000}
        />

        {/* Mention Autocomplete Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectMention(user)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character Count and Actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {content.length}/2000
          </span>
          <span className="text-gray-300">|</span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
              Ctrl
            </kbd>{' '}
            +{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
              Enter
            </kbd>{' '}
            to submit
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isDisabled}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting || loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
