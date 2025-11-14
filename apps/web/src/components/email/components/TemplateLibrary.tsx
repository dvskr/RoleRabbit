'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, X, AlertTriangle } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { EmailTemplate, TemplateCategory } from '../types';
import { logger } from '../../../utils/logger';
import { useTheme } from '../../../contexts/ThemeContext';
import { emailStorage, formatBytes } from '../../../utils/storageManager';

// Default templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Follow-up on Application',
    category: 'Follow-up',
    subject: 'Follow-up on My Application for {{position}}',
    body: 'Dear {{name}},\n\nI wanted to follow up on my application for the {{position}} position at {{company}}.\n\nI am very interested in this opportunity and would appreciate any updates you might have.\n\nThank you for your time and consideration.\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'position', 'company', 'yourName'],
    isCustom: false,
    usageCount: 15,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Thank You After Interview',
    category: 'Thank You',
    subject: 'Thank You - Interview Discussion',
    body: 'Dear {{name}},\n\nThank you for taking the time to speak with me about the {{position}} position today.\n\nI enjoyed our conversation and was impressed by {{company}} and the team.\n\nI am very interested in this opportunity and look forward to hearing from you.\n\nThank you again for your time and consideration.\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'position', 'company', 'yourName'],
    isCustom: false,
    usageCount: 23,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Networking Introduction',
    category: 'Networking',
    subject: 'Introduction - {{name}}',
    body: 'Hi {{name}},\n\nI hope this email finds you well. I came across your profile and was impressed by your work at {{company}}.\n\nI would love to connect and learn more about your experience in {{field}}.\n\nWould you be available for a brief chat sometime next week?\n\nBest regards,\n{{yourName}}',
    variables: ['name', 'company', 'field', 'yourName'],
    isCustom: false,
    usageCount: 8,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

interface TemplateLibraryProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Custom' as TemplateCategory,
    subject: '',
    body: '',
    variables: [] as string[]
  });

  // Validate email template structure
  const isValidEmailTemplate = (template: any): template is EmailTemplate => {
    return (
      typeof template === 'object' &&
      template !== null &&
      typeof template.id === 'string' &&
      typeof template.name === 'string' &&
      typeof template.category === 'string' &&
      typeof template.subject === 'string' &&
      typeof template.body === 'string' &&
      Array.isArray(template.variables) &&
      typeof template.isCustom === 'boolean'
    );
  };

  // Load templates from managed storage with validation
  useEffect(() => {
    try {
      const saved = emailStorage.getItem<EmailTemplate[]>('templates');
      if (saved && Array.isArray(saved)) {
        const validTemplates = saved.filter(isValidEmailTemplate);

        if (validTemplates.length > 0) {
          setTemplates(validTemplates);
          logger.debug(`Loaded ${validTemplates.length} valid email templates from storage`);

          // If some templates were invalid, save only the valid ones
          if (validTemplates.length < saved.length) {
            logger.warn(`Filtered out ${saved.length - validTemplates.length} invalid email templates`);
            emailStorage.setItem('templates', validTemplates);
          }
        } else {
          logger.warn('No valid email templates found in storage, using defaults');
        }
      }

      // Check storage usage
      const usage = emailStorage.getUsageStats();
      if (usage.usagePercent > 80) {
        setStorageWarning(
          `Storage is ${usage.usagePercent.toFixed(0)}% full (${formatBytes(usage.usedBytes)} of ${formatBytes(usage.maxBytes)}). Consider deleting old templates.`
        );
      }
    } catch (error) {
      logger.error('Error loading email templates from storage:', error);
      // Don't crash the app, just use default templates
    }
  }, []);

  // Save templates to managed storage with quota handling
  const saveTemplates = (templatesToSave: EmailTemplate[]) => {
    setTemplates(templatesToSave);

    const success = emailStorage.setItem('templates', templatesToSave);

    if (success) {
      logger.debug(`Saved ${templatesToSave.length} email templates to storage`);

      // Check storage usage after save
      const usage = emailStorage.getUsageStats();
      if (usage.usagePercent > 80) {
        setStorageWarning(
          `Storage is ${usage.usagePercent.toFixed(0)}% full (${formatBytes(usage.usedBytes)} of ${formatBytes(usage.maxBytes)}). Consider deleting old templates.`
        );
      } else {
        setStorageWarning(null); // Clear warning if usage is ok
      }
    } else {
      // Storage quota exceeded
      const usage = emailStorage.getUsageStats();
      setStorageWarning(
        `Cannot save template: Storage limit reached (${formatBytes(usage.maxBytes)}). Please delete some templates.`
      );
      logger.error('Storage quota exceeded, could not save templates');
    }
  };

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.body) {
      const template: EmailTemplate = {
        id: `template_${Date.now()}`,
        name: newTemplate.name,
        category: newTemplate.category,
        subject: newTemplate.subject,
        body: newTemplate.body,
        variables: newTemplate.variables,
        isCustom: true,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveTemplates([...templates, template]);
      setShowCreateModal(false);
      setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables
    });
    setShowCreateModal(true);
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && newTemplate.name && newTemplate.subject && newTemplate.body) {
      const updated = templates.map(t => 
        t.id === editingTemplate.id 
          ? {
              ...t,
              name: newTemplate.name,
              category: newTemplate.category,
              subject: newTemplate.subject,
              body: newTemplate.body,
              variables: newTemplate.variables,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      
      saveTemplates(updated);
      setShowCreateModal(false);
      setEditingTemplate(null);
      setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const filtered = templates.filter(t => t.id !== templateId);
      saveTemplates(filtered);
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (categoryFilter !== 'All' && template.category !== categoryFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return template.name.toLowerCase().includes(searchLower) ||
             template.subject.toLowerCase().includes(searchLower) ||
             template.body.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Storage Warning Banner */}
      {storageWarning && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200 flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Storage Warning</p>
            <p className="text-sm text-yellow-700">{storageWarning}</p>
          </div>
          <button
            onClick={() => setStorageWarning(null)}
            className="text-yellow-600 hover:text-yellow-800"
            aria-label="Dismiss warning"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.tertiaryText }} />
            <input
              type="text"
              placeholder="Search templates..."
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

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'All')}
            className="px-3 py-2 rounded-lg"
            style={{
              background: colors.inputBackground,
              border: `1px solid ${colors.border}`,
              color: colors.primaryText,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
          >
            <option value="All">All Categories</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Thank You">Thank You</option>
            <option value="Introduction">Introduction</option>
            <option value="Networking">Networking</option>
            <option value="Application">Application</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Add Template */}
        <button 
          onClick={() => {
            setEditingTemplate(null);
            setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
            setShowCreateModal(true);
          }}
          className="px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
          style={{ background: colors.primaryBlue }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
        >
          <Plus size={16} />
          <span className="font-medium">Create Template</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: colors.background }}>
        {filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
              <p style={{ color: colors.secondaryText }}>No templates found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={onSelectTemplate}
                onEdit={handleEditTemplate}
                onDelete={() => handleDeleteTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <React.Fragment>
        <button 
          type="button"
          className="fixed inset-0 z-50 border-0 p-0 focus:outline-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
            setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setShowCreateModal(false);
              setEditingTemplate(null);
              setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
            }
          }}
          aria-label="Close template modal"
        >
          <span className="sr-only">Close template modal</span>
        </button>
        <div 
          className="fixed inset-0 z-[51] flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="template-library-modal-title"
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ background: colors.cardBackground }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: colors.badgeInfoBg }}>
                  <FileText size={24} style={{ color: colors.badgeInfoText }} />
                </div>
                <div>
                  <h3 id="template-library-modal-title" className="text-xl font-semibold" style={{ color: colors.primaryText }}>
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </h3>
                  <p className="text-sm" style={{ color: colors.secondaryText }}>
                    {editingTemplate ? 'Update your email template' : 'Build your custom email template'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
                }}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.tertiaryText;
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="template-name-input" className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Template Name <span style={{ color: colors.errorRed }}>*</span>
                </label>
                <input
                  id="template-name-input"
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Follow-up Email"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div>
                <label htmlFor="template-category-select" className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Category <span style={{ color: colors.errorRed }}>*</span>
                </label>
                <select
                  id="template-category-select"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as TemplateCategory })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                >
                  <option value="Follow-up">Follow-up</option>
                  <option value="Thank You">Thank You</option>
                  <option value="Introduction">Introduction</option>
                  <option value="Networking">Networking</option>
                  <option value="Application">Application</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label htmlFor="template-subject-input" className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Subject Line <span style={{ color: colors.errorRed }}>*</span>
                  <span className="text-xs ml-2" style={{ color: colors.tertiaryText }}>Use {"{{variable}}"} for dynamic values</span>
                </label>
                <input
                  id="template-subject-input"
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g., Follow-up on My Application for {{position}}"
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div>
                <label htmlFor="template-body-textarea" className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Email Body <span style={{ color: colors.errorRed }}>*</span>
                  <span className="text-xs ml-2" style={{ color: colors.tertiaryText }}>Use {"{{variable}}"} for dynamic values</span>
                </label>
                <textarea
                  id="template-body-textarea"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  placeholder="Dear {{name}},\n\nI wanted to follow up..."
                  rows={10}
                  className="w-full px-3 py-2 rounded-lg resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                />
              </div>

              <div className="rounded-lg p-4" style={{ background: colors.badgeInfoBg, border: `1px solid ${colors.badgeInfoBorder}` }}>
                <p className="text-sm font-medium mb-2" style={{ color: colors.badgeInfoText }}>💡 Pro Tip</p>
                <p className="text-sm" style={{ color: colors.badgeInfoText }}>
                  Use {"{{variableName}}"} in your template and RoleReady will prompt you to fill in values when using the template.
                  Common variables: {"{{name}}"}, {"{{company}}"}, {"{{position}}"}, {"{{yourName}}"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', category: 'Custom', subject: '', body: '', variables: [] });
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body}
                className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: (!newTemplate.name || !newTemplate.subject || !newTemplate.body) 
                    ? colors.inputBackground 
                    : colors.primaryBlue,
                  color: (!newTemplate.name || !newTemplate.subject || !newTemplate.body) 
                    ? colors.tertiaryText 
                    : 'white',
                }}
                onMouseEnter={(e) => {
                  if (newTemplate.name && newTemplate.subject && newTemplate.body) {
                    e.currentTarget.style.background = colors.primaryBlueHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (newTemplate.name && newTemplate.subject && newTemplate.body) {
                    e.currentTarget.style.background = colors.primaryBlue;
                  }
                }}
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
        </React.Fragment>
      )}
    </div>
  );
}

