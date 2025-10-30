'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface AddJobModalProps {
  onClose: () => void;
  onAdd: (job: any) => void;
  initialStatus?: 'applied' | 'interview' | 'offer' | 'rejected';
}

export default function AddJobModal({ onClose, onAdd, initialStatus }: AddJobModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    url: '',
    description: '',
    appliedDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: `job-${Date.now()}`,
      status: initialStatus || 'applied'
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl" 
        style={{ 
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-4 flex items-center justify-between"
          style={{ 
            background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
            borderBottom: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: colors.primaryText }}>Add New Job Application</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter job title"
                title="Job title"
                aria-label="Job title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Company *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter company name"
                title="Company name"
                aria-label="Company name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter job location"
                title="Job location"
                aria-label="Job location"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Salary</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="e.g., $120,000"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Job URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Date Applied</label>
            <input
              type="date"
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Date applied"
              aria-label="Date applied"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: colors.primaryText }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all resize-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="Job description or notes..."
            />
          </div>

          <div 
            className="flex gap-3 pt-4"
            style={{ borderTop: `1px solid ${colors.border}` }}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
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
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg transition-colors"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

