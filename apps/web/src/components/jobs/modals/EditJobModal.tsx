'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Job } from '../../../types/job';
import { useTheme } from '../../../contexts/ThemeContext';

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onUpdate: (job: Job) => void;
}

export default function EditJobModal({ job, onClose, onUpdate }: EditJobModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [formData, setFormData] = useState({
    title: job.title,
    company: job.company,
    location: job.location || '',
    salary: job.salary || '',
    url: job.url || '',
    description: job.description || '',
    appliedDate: job.appliedDate
  });

  useEffect(() => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location || '',
      salary: job.salary || '',
      url: job.url || '',
      description: job.description || '',
      appliedDate: job.appliedDate
    });
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...job,
      ...formData
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
    >
      <div 
        className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
        style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-3 flex items-center justify-between"
          style={{
            background: colors.headerBackground,
            borderBottom: `1px solid ${colors.border}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors.primaryText }}
          >
            Edit Job Application
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-all"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="text-sm font-medium mb-1 block"
                style={{ color: colors.secondaryText }}
              >
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                required
              />
            </div>
            <div>
              <label 
                className="text-sm font-medium mb-1 block"
                style={{ color: colors.secondaryText }}
              >
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="text-sm font-medium mb-1 block"
                style={{ color: colors.secondaryText }}
              >
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
            </div>
            <div>
              <label 
                className="text-sm font-medium mb-1 block"
                style={{ color: colors.secondaryText }}
              >
                Salary
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                placeholder="e.g., $120,000"
              />
            </div>
          </div>

          <div>
            <label 
              className="text-sm font-medium mb-1 block"
              style={{ color: colors.secondaryText }}
            >
              Job URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
              placeholder="https://..."
            />
          </div>

          <div>
            <label 
              className="text-sm font-medium mb-1 block"
              style={{ color: colors.secondaryText }}
            >
              Date Applied
            </label>
            <input
              type="date"
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
              required
            />
          </div>

          <div>
            <label 
              className="text-sm font-medium mb-1 block"
              style={{ color: colors.secondaryText }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg transition-all resize-none"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
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
              className="flex-1 px-4 py-2 rounded-lg transition-all"
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
              className="flex-1 px-4 py-2 rounded-lg transition-all"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primaryBlueHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.primaryBlue;
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

