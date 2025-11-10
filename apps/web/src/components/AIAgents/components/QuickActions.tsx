import React, { useState } from 'react';
import { FileText, Search, BookOpen, Mail } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { JobInputModal, JobInputData } from './JobInputModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        throw new Error('Failed to create task');
      }

      const result = await response.json();
      console.log('Task created:', result);

      // TODO: Show success notification and refresh active tasks
    } catch (error) {
      console.error('Error creating task:', error);
      // TODO: Show error notification
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
      </div>

      <JobInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskType={selectedTaskType}
        onSubmit={handleSubmitTask}
      />
    </>
  );
};

