import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Download,
  Eye,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { PreviewModal } from './PreviewModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
}

interface TaskDetail {
  id: string;
  type: string;
  status: string;
  progress: number;
  currentStep: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  resultData: any;
  atsScore: number;
  atsBreakdown: any;
  errorMessage: string;
  createdAt: string;
  completedAt: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskId,
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'details'>('overview');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewType, setPreviewType] = useState<'resume' | 'cover-letter' | 'research' | 'interview-prep'>('resume');

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;

    setIsLoading(true);
    setTask(null); // Clear previous task before fetching new one
    try {
      const response = await fetch(`/api/ai-agent/tasks/${taskId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTask(data.task);
        }
      } else {
        // Explicitly clear task on fetch failure (404, etc.)
        setTask(null);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setTask(null); // Clear task on error
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId, fetchTaskDetails]);

  if (!isOpen || !colors) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={20} style={{ color: colors.badgeGreenText }} />;
      case 'FAILED':
        return <AlertCircle size={20} style={{ color: colors.badgeRedText }} />;
      case 'IN_PROGRESS':
      case 'QUEUED':
        return <Clock size={20} style={{ color: colors.badgeYellowText }} />;
      default:
        return <Clock size={20} style={{ color: colors.secondaryText }} />;
    }
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return colors.badgeGreenText;
    if (score >= 60) return colors.badgeYellowText;
    return colors.badgeRedText;
  };

  const handleDownload = () => {
    if (!task?.resultData) return;

    const blob = new Blob([JSON.stringify(task.resultData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.company}-${task.jobTitle}-results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!task?.id) return;

    try {
      // Show loading state (could be added with useState)
      const url = `/api/ai-agent/tasks/${task.id}/export/${format}`;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${task.company || 'resume'}_${task.jobTitle || 'untitled'}.${format}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      // Could show error toast here
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
            {task && getStatusIcon(task.status)}
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                {task?.jobTitle || 'Loading...'}
              </h2>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                {task?.company}
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

        {/* Tabs */}
        <div
          className="flex gap-1 px-6 py-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          {(['overview', 'results', 'details'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background:
                  activeTab === tab ? colors.badgePurpleBg : 'transparent',
                color:
                  activeTab === tab ? colors.badgePurpleText : colors.secondaryText,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: colors.secondaryText }}>Loading task details...</p>
            </div>
          ) : !task ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: colors.secondaryText }}>Task not found</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* ATS Score Card */}
                  {task.atsScore !== null && task.atsScore !== undefined && (
                    <div
                      className="p-6 rounded-xl"
                      style={{
                        background: colors.background,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Award size={20} style={{ color: colors.badgePurpleText }} />
                          <h3
                            className="text-lg font-semibold"
                            style={{ color: colors.primaryText }}
                          >
                            ATS Score
                          </h3>
                        </div>
                        <div
                          className="text-4xl font-bold"
                          style={{ color: getATSScoreColor(task.atsScore) }}
                        >
                          {task.atsScore}
                        </div>
                      </div>

                      {task.atsBreakdown && (
                        <div className="space-y-3">
                          {Object.entries(task.atsBreakdown).map(
                            ([key, value]: [string, any]) => {
                              if (key === 'overall' || key === 'weights') return null;
                              return (
                                <div key={key}>
                                  <div className="flex justify-between mb-1">
                                    <span
                                      className="text-sm capitalize"
                                      style={{ color: colors.secondaryText }}
                                    >
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span
                                      className="text-sm font-medium"
                                      style={{ color: colors.primaryText }}
                                    >
                                      {value}%
                                    </span>
                                  </div>
                                  <div
                                    className="h-2 rounded-full overflow-hidden"
                                    style={{ background: colors.inputBackground }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${value}%`,
                                        background: getATSScoreColor(value),
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  <div
                    className="p-6 rounded-xl"
                    style={{
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={20} style={{ color: colors.badgePurpleText }} />
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors.primaryText }}
                      >
                        Progress
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span style={{ color: colors.secondaryText }}>
                          {task.currentStep || 'Processing...'}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {task.progress}%
                        </span>
                      </div>
                      <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ background: colors.inputBackground }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${task.progress}%`,
                            background: colors.badgePurpleText,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {task.errorMessage && (
                    <div
                      className="p-4 rounded-xl flex items-start gap-3"
                      style={{
                        background: colors.badgeRedBg,
                        border: `1px solid ${colors.badgeRedText}`,
                      }}
                    >
                      <AlertCircle size={20} style={{ color: colors.badgeRedText }} />
                      <div className="flex-1">
                        <p
                          className="font-medium mb-1"
                          style={{ color: colors.badgeRedText }}
                        >
                          Error
                        </p>
                        <p className="text-sm" style={{ color: colors.badgeRedText }}>
                          {task.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="space-y-4">
                  {task.resultData ? (
                    <>
                      <div className="space-y-3 mb-4">
                        {/* Preview Button */}
                        <button
                          onClick={() => {
                            const type = task.type.includes('RESUME') ? 'resume' :
                                       task.type.includes('COVER_LETTER') ? 'cover-letter' :
                                       task.type.includes('RESEARCH') ? 'research' : 'interview-prep';
                            setPreviewType(type);
                            setPreviewData(task.resultData.data || task.resultData);
                            setIsPreviewOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all w-full"
                          style={{
                            background: colors.badgePurpleBg,
                            color: colors.badgePurpleText,
                            border: `1px solid ${colors.badgePurpleText}`,
                          }}
                        >
                          <Eye size={16} />
                          Preview
                        </button>

                        {/* Export Buttons */}
                        <div
                          className="p-4 rounded-lg"
                          style={{
                            background: colors.background,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          <h4
                            className="text-sm font-semibold mb-3"
                            style={{ color: colors.primaryText }}
                          >
                            Export Resume
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleExport('pdf')}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                              style={{
                                background: colors.badgeRedBg,
                                color: colors.badgeRedText,
                                border: `1px solid ${colors.badgeRedText}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeRedText;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = colors.badgeRedBg;
                                e.currentTarget.style.color = colors.badgeRedText;
                              }}
                            >
                              <Download size={14} />
                              PDF
                            </button>

                            <button
                              onClick={() => handleExport('docx')}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                              style={{
                                background: colors.badgeBlueBg,
                                color: colors.badgeBlueText,
                                border: `1px solid ${colors.badgeBlueText}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeBlueText;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = colors.badgeBlueBg;
                                e.currentTarget.style.color = colors.badgeBlueText;
                              }}
                            >
                              <Download size={14} />
                              DOCX
                            </button>

                            <button
                              onClick={() => handleExport('txt')}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                              style={{
                                background: colors.badgeGreenBg,
                                color: colors.badgeGreenText,
                                border: `1px solid ${colors.badgeGreenText}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.badgeGreenText;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = colors.badgeGreenBg;
                                e.currentTarget.style.color = colors.badgeGreenText;
                              }}
                            >
                              <Download size={14} />
                              TXT
                            </button>

                            <button
                              onClick={handleDownload}
                              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm"
                              style={{
                                background: colors.inputBackground,
                                color: colors.secondaryText,
                                border: `1px solid ${colors.border}`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = colors.border;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = colors.inputBackground;
                              }}
                            >
                              <Download size={14} />
                              JSON
                            </button>
                          </div>
                          <p
                            className="text-xs mt-2"
                            style={{ color: colors.secondaryText }}
                          >
                            PDF and DOCX are ready for job applications
                          </p>
                        </div>
                      </div>

                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: colors.background,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        <pre
                          className="text-sm overflow-x-auto"
                          style={{ color: colors.secondaryText }}
                        >
                          {JSON.stringify(task.resultData, null, 2)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: colors.secondaryText }}>
                      No results available yet
                    </p>
                  )}
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <h4
                      className="font-semibold mb-3"
                      style={{ color: colors.primaryText }}
                    >
                      Task Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: colors.secondaryText }}>Type:</span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {task.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.secondaryText }}>Status:</span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: colors.secondaryText }}>Created:</span>
                        <span
                          className="font-medium"
                          style={{ color: colors.primaryText }}
                        >
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {task.completedAt && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.secondaryText }}>
                            Completed:
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: colors.primaryText }}
                          >
                            {new Date(task.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: colors.background,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <h4
                      className="font-semibold mb-3"
                      style={{ color: colors.primaryText }}
                    >
                      Job Description
                    </h4>
                    <p
                      className="text-sm whitespace-pre-wrap"
                      style={{ color: colors.secondaryText }}
                    >
                      {task.jobDescription || 'Not provided'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={previewData}
        title={task?.jobTitle || 'Preview'}
        type={previewType}
      />
    </div>
  );
};
