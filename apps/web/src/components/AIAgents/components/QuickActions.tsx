import React, { useState } from 'react';
import { FileText, Search, BookOpen, Mail, Upload } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { JobInputModal, JobInputData } from './JobInputModal';
import { BulkProcessingModal } from './BulkProcessingModal';
import { useAIAgentsContext } from '../index';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ size: number }>;
  title: string;
  ariaLabel: string;
  taskType: 'resume' | 'cover-letter' | 'company-research' | 'interview-prep';
}

const quickActions: QuickAction[] = [
  {
    label: 'Generate Resume',
    icon: FileText,
    title: 'Generate Tailored Resume',
    ariaLabel: 'Generate Resume',
    taskType: 'resume'
  },
  {
    label: 'Cover Letter',
    icon: Mail,
    title: 'Generate Cover Letter',
    ariaLabel: 'Generate Cover Letter',
    taskType: 'cover-letter'
  },
  {
    label: 'Company Research',
    icon: Search,
    title: 'Research Company',
    ariaLabel: 'Company Research',
    taskType: 'company-research'
  },
  {
    label: 'Interview Prep',
    icon: BookOpen,
    title: 'Prepare for Interview',
    ariaLabel: 'Interview Prep',
    taskType: 'interview-prep'
  }
];

export const QuickActions: React.FC = () => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const { showSuccess, showError, refreshActiveTasks } = useAIAgentsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<QuickAction['taskType']>('resume');

  if (!colors) return null;

  const handleActionClick = (taskType: QuickAction['taskType']) => {
    setSelectedTaskType(taskType);
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (data: JobInputData) => {
    try {
      // Map taskType to API endpoint
      const endpointMap: Record<string, string> = {
        RESUME_GENERATION: '/api/ai-agent/tasks/resume-generation',
        COVER_LETTER_GENERATION: '/api/ai-agent/tasks/cover-letter',
        COMPANY_RESEARCH: '/api/ai-agent/tasks/company-research',
        INTERVIEW_PREP: '/api/ai-agent/tasks/interview-prep',
      };

      const endpoint = endpointMap[data.taskType];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || 'Failed to create task';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Task created:', result);

      // Show success and refresh tasks
      const humanReadableTask = data.taskType.toLowerCase().replace(/_/g, ' ');
      showSuccess(`Task created successfully! Your ${humanReadableTask} is being processed.`);
      await refreshActiveTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      showError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
      throw error; // Re-throw so modal stays open on failure
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleActionClick(action.taskType)}
              className="px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.badgePurpleText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
              title={action.title}
              aria-label={action.ariaLabel}
            >
              <Icon size={14} />
              {action.label}
            </button>
          );
        })}

        {/* Bulk Processing Button */}
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          style={{
            background: colors.badgeYellowBg,
            border: `1px solid ${colors.badgeYellowText}`,
            color: colors.badgeYellowText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Process multiple jobs at once"
          aria-label="Bulk Processing"
        >
          <Upload size={14} />
          Bulk Process
        </button>
      </div>

      <JobInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskType={selectedTaskType}
        onSubmit={handleSubmitTask}
      />

      <BulkProcessingModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </>
  );
};

