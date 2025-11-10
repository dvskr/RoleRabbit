import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, Mail, Briefcase, Users } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface JobInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: 'resume' | 'cover-letter' | 'company-research' | 'interview-prep';
  onSubmit: (data: JobInputData) => Promise<void>;
}

export interface JobInputData {
  taskType: string;
  jobTitle: string;
  company: string;
  jobUrl?: string;
  jobDescription: string;
  baseResumeId?: string;
  tone?: string;
  length?: string;
}

const taskTypeConfig = {
  resume: {
    title: 'Generate Tailored Resume',
    icon: FileText,
    description: 'AI will analyze the job description and tailor your resume to match',
    showToneLength: true,
  },
  'cover-letter': {
    title: 'Generate Cover Letter',
    icon: Mail,
    description: 'Create a personalized cover letter based on your experience',
    showToneLength: true,
  },
  'company-research': {
    title: 'Research Company',
    icon: Briefcase,
    description: 'Get comprehensive insights about the company',
    showToneLength: false,
  },
  'interview-prep': {
    title: 'Prepare for Interview',
    icon: Users,
    description: 'Generate custom interview questions and answers',
    showToneLength: false,
  },
};

export const JobInputModal: React.FC<JobInputModalProps> = ({
  isOpen,
  onClose,
  taskType,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;

  // Memoize default form data based on taskType
  const defaultFormData = useMemo(
    () => ({
      taskType: taskType.toUpperCase().replace('-', '_'),
      jobTitle: '',
      company: '',
      jobUrl: '',
      jobDescription: '',
      tone: 'professional',
      length: 'medium',
    }),
    [taskType]
  );

  const [formData, setFormData] = useState<JobInputData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const config = taskTypeConfig[taskType];
  const Icon = config.icon;

  // Reset form when modal opens or taskType changes
  useEffect(() => {
    if (isOpen) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [isOpen, defaultFormData]);

  if (!isOpen || !colors) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (taskType !== 'company-research' && !formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (taskType !== 'company-research' && !formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form to default
      setFormData(defaultFormData);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: colors.background,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgePurpleBg }}
            >
              <Icon size={20} style={{ color: colors.badgePurpleText }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                {config.title}
              </h2>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                {config.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.inputBackground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Company Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.primaryText }}
            >
              Company Name <span style={{ color: colors.badgeRedText }}>*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="e.g., Google, Microsoft, Startup Inc."
              className="w-full px-4 py-3 rounded-lg outline-none transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${errors.company ? colors.badgeRedText : colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.badgePurpleText;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.company
                  ? colors.badgeRedText
                  : colors.border;
              }}
            />
            {errors.company && (
              <p className="text-sm mt-1" style={{ color: colors.badgeRedText }}>
                {errors.company}
              </p>
            )}
          </div>

          {/* Job Title */}
          {taskType !== 'company-research' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Job Title <span style={{ color: colors.badgeRedText }}>*</span>
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${errors.jobTitle ? colors.badgeRedText : colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.badgePurpleText;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.jobTitle
                    ? colors.badgeRedText
                    : colors.border;
                }}
              />
              {errors.jobTitle && (
                <p className="text-sm mt-1" style={{ color: colors.badgeRedText }}>
                  {errors.jobTitle}
                </p>
              )}
            </div>
          )}

          {/* Job URL */}
          {taskType !== 'company-research' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Job URL <span className="text-xs">(Optional)</span>
              </label>
              <input
                type="url"
                value={formData.jobUrl}
                onChange={(e) =>
                  setFormData({ ...formData, jobUrl: e.target.value })
                }
                placeholder="https://company.com/careers/job-123"
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.badgePurpleText;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              />
            </div>
          )}

          {/* Job Description */}
          {taskType !== 'company-research' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Job Description{' '}
                <span style={{ color: colors.badgeRedText }}>*</span>
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({ ...formData, jobDescription: e.target.value })
                }
                placeholder="Paste the complete job description here..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-none"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${errors.jobDescription ? colors.badgeRedText : colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.badgePurpleText;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.jobDescription
                    ? colors.badgeRedText
                    : colors.border;
                }}
              />
              {errors.jobDescription && (
                <p className="text-sm mt-1" style={{ color: colors.badgeRedText }}>
                  {errors.jobDescription}
                </p>
              )}
            </div>
          )}

          {/* Tone and Length (for resume/cover letter) */}
          {config.showToneLength && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.primaryText }}
                >
                  Length
                </label>
                <select
                  value={formData.length}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg outline-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                >
                  <option value="concise">Concise</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.secondaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.badgePurpleText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all"
              style={{
                background: isSubmitting
                  ? colors.inputBackground
                  : colors.badgePurpleBg,
                color: isSubmitting ? colors.secondaryText : colors.badgePurpleText,
                border: `1px solid ${colors.badgePurpleText}`,
              }}
            >
              {isSubmitting ? 'Creating Task...' : 'Start AI Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
