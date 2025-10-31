import React from 'react';
import { X, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface AddFieldModalProps {
  showAddFieldModal: boolean;
  setShowAddFieldModal: (show: boolean) => void;
  newFieldName: string;
  setNewFieldName: (name: string) => void;
  newFieldIcon: string;
  setNewFieldIcon: (icon: string) => void;
  onAddField: () => void;
}

export default function AddFieldModal({
  showAddFieldModal,
  setShowAddFieldModal,
  newFieldName,
  setNewFieldName,
  newFieldIcon,
  setNewFieldIcon,
  onAddField
}: AddFieldModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!showAddFieldModal) return null;

  const iconOptions = [
    { value: 'link', label: 'Link' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'map-pin', label: 'Location' },
    { value: 'phone', label: 'Phone' },
    { value: 'mail', label: 'Email' },
    { value: 'briefcase', label: 'Briefcase' },
    { value: 'award', label: 'Award' },
    { value: 'star', label: 'Star' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="rounded-2xl p-8 w-full max-w-lg shadow-2xl pointer-events-auto transition-all" 
        style={{ 
          background: theme.mode === 'light' ? '#ffffff' : colors.badgePurpleBg,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            : '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: colors.primaryText }}
          >
            Add Custom Field
          </h2>
          <button
            onClick={() => setShowAddFieldModal(false)}
            className="p-2 rounded-xl transition-all duration-200 group"
            aria-label="Close modal"
            style={{ 
              color: colors.tertiaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
          >
            <X size={20} className="transition-colors" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: colors.secondaryText }}
            >
              Field Name
            </label>
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="e.g., Portfolio URL, GitHub Profile"
              className="w-full rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.secondaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primaryBlue}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Field Name"
            />
          </div>
          
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: colors.secondaryText }}
            >
              Icon
            </label>
            <select
              value={newFieldIcon}
              onChange={(e) => setNewFieldIcon(e.target.value)}
              className="w-full rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
              aria-label="Icon"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.secondaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primaryBlue}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {iconOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  style={{
                    background: theme.mode === 'dark' ? '#1a1625' : '#ffffff',
                    color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b',
                  }}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4 pt-2">
            <button
              onClick={onAddField}
              className="flex-1 text-white py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
              style={{
                background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.primaryBlue})`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 16px ${colors.primaryBlue}40`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={18} />
              Add Field
            </button>
            <button
              onClick={() => setShowAddFieldModal(false)}
              className="flex-1 py-3 px-6 rounded-xl transition-all duration-200 font-semibold"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
