import React, { useState } from 'react';
import { X, Upload, FileText, Trash2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAIAgentsContext } from '../index';

interface BulkProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JobEntry {
  id: string;
  company: string;
  jobTitle: string;
  jobDescription: string;
  jobUrl?: string;
}

export const BulkProcessingModal: React.FC<BulkProcessingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const { showSuccess, showError, refreshActiveTasks } = useAIAgentsContext();

  const [jobs, setJobs] = useState<JobEntry[]>([
    { id: '1', company: '', jobTitle: '', jobDescription: '', jobUrl: '' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');

  if (!isOpen || !colors) return null;

  const addJob = () => {
    const newId = (Math.max(...jobs.map(j => parseInt(j.id))) + 1).toString();
    setJobs([...jobs, { id: newId, company: '', jobTitle: '', jobDescription: '', jobUrl: '' }]);
  };

  const removeJob = (id: string) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  };

  const updateJob = (id: string, field: keyof JobEntry, value: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, [field]: value } : j));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          const newJobs = parsed.map((job, index) => ({
            id: (jobs.length + index + 1).toString(),
            company: job.company || '',
            jobTitle: job.jobTitle || job.title || '',
            jobDescription: job.jobDescription || job.description || '',
            jobUrl: job.jobUrl || job.url || ''
          }));
          setJobs([...jobs, ...newJobs]);
          showSuccess(`Loaded ${newJobs.length} jobs from file`);
        }
      } catch {
        // If not JSON, treat as plain text with one job per separator
        const sections = text.split(/---+|\n\n\n+/);
        const newJobs = sections.map((section, index) => ({
          id: (jobs.length + index + 1).toString(),
          company: '',
          jobTitle: '',
          jobDescription: section.trim(),
          jobUrl: ''
        }));
        setJobs([...jobs, ...newJobs.filter(j => j.jobDescription)]);
        showSuccess(`Loaded ${newJobs.length} jobs from file`);
      }
    } catch (error) {
      showError('Failed to parse file');
    }
  };

  const validateJobs = () => {
    return jobs.every(job =>
      job.company.trim() &&
      job.jobTitle.trim() &&
      job.jobDescription.trim()
    );
  };

  const handleSubmit = async () => {
    if (!validateJobs()) {
      showError('Please fill in all required fields for each job');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai-agent/tasks/bulk-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jobs: jobs.map(j => ({
            company: j.company,
            jobTitle: j.jobTitle,
            jobDescription: j.jobDescription,
            jobUrl: j.jobUrl,
          })),
          tone,
          length,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start bulk processing');
      }

      const result = await response.json();
      showSuccess(`Started bulk processing ${jobs.length} jobs! Track progress in Active Tasks.`);
      await refreshActiveTasks();
      onClose();

      // Reset form
      setJobs([{ id: '1', company: '', jobTitle: '', jobDescription: '', jobUrl: '' }]);
    } catch (error) {
      console.error('Error starting bulk processing:', error);
      showError(error instanceof Error ? error.message : 'Failed to start bulk processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const filledJobs = jobs.filter(j => j.company || j.jobTitle || j.jobDescription).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
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
              <Upload size={20} style={{ color: colors.badgePurpleText }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Bulk Resume Generation
              </h2>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Process multiple job descriptions at once
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

        {/* Options */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: colors.secondaryText }}>
                Tone:
              </span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="px-3 py-1 rounded-lg text-sm outline-none"
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

            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: colors.secondaryText }}>
                Length:
              </span>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="px-3 py-1 rounded-lg text-sm outline-none"
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

          <div className="flex gap-2">
            <label
              className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
            >
              <Upload size={16} />
              Import File
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={addJob}
              className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                background: colors.badgePurpleBg,
                color: colors.badgePurpleText,
                border: `1px solid ${colors.badgePurpleText}`,
              }}
            >
              <Plus size={16} />
              Add Job
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className="p-4 rounded-xl"
                style={{
                  background: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: colors.badgePurpleBg,
                        color: colors.badgePurpleText,
                      }}
                    >
                      {index + 1}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      Job {index + 1}
                    </span>
                  </div>
                  {jobs.length > 1 && (
                    <button
                      onClick={() => removeJob(job.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: colors.badgeRedText }}
                      title="Remove job"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Company Name *"
                    value={job.company}
                    onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Job Title *"
                    value={job.jobTitle}
                    onChange={(e) => updateJob(job.id, 'jobTitle', e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                  />
                </div>

                <input
                  type="url"
                  placeholder="Job URL (optional)"
                  value={job.jobUrl}
                  onChange={(e) => updateJob(job.id, 'jobUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                />

                <textarea
                  placeholder="Job Description *"
                  value={job.jobDescription}
                  onChange={(e) => updateJob(job.id, 'jobDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            background: colors.background,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: colors.secondaryText }} />
            <span className="text-sm" style={{ color: colors.secondaryText }}>
              {filledJobs} of {jobs.length} jobs filled
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.secondaryText,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !validateJobs()}
              className="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                background: isProcessing || !validateJobs()
                  ? colors.inputBackground
                  : colors.badgePurpleBg,
                color: isProcessing || !validateJobs()
                  ? colors.secondaryText
                  : colors.badgePurpleText,
                border: `1px solid ${colors.badgePurpleText}`,
                opacity: isProcessing || !validateJobs() ? 0.5 : 1,
                cursor: isProcessing || !validateJobs() ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Process {filledJobs} Jobs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
