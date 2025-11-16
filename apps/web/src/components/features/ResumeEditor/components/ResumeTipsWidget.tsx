import React, { useMemo } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface ResumeTipsWidgetProps {
  activeSection?: string;
  colors: any;
  onClose?: () => void;
}

interface Tip {
  section: string;
  tips: string[];
}

const RESUME_TIPS: Tip[] = [
  {
    section: 'summary',
    tips: [
      'Keep it 2-4 sentences highlighting your key achievements',
      'Start with your years of experience and main expertise',
      'Include quantifiable achievements when possible',
      'Tailor it to match the job description keywords',
    ],
  },
  {
    section: 'experience',
    tips: [
      'Use action verbs: Led, Developed, Managed, Increased',
      'Quantify achievements: "Increased sales by 40%"',
      'Focus on results, not just responsibilities',
      'Keep bullet points to 1-2 lines each',
      'List experiences in reverse chronological order',
    ],
  },
  {
    section: 'skills',
    tips: [
      'List 8-12 relevant skills for the position',
      'Include both technical and soft skills',
      'Prioritize skills mentioned in the job description',
      'Group similar skills together',
    ],
  },
  {
    section: 'education',
    tips: [
      'Include degree, institution, and graduation year',
      'Add GPA if above 3.5 and recent graduate',
      'List relevant coursework for entry-level positions',
      'Include honors and awards',
    ],
  },
  {
    section: 'projects',
    tips: [
      'Highlight projects relevant to the target role',
      'Include technologies used',
      'Describe the impact or outcome',
      'Add links to live demos or GitHub repos',
    ],
  },
  {
    section: 'certifications',
    tips: [
      'List industry-recognized certifications',
      'Include expiration dates if applicable',
      'Prioritize recent and relevant certifications',
    ],
  },
  {
    section: 'default',
    tips: [
      'Keep your resume to 1-2 pages',
      'Use consistent formatting throughout',
      'Proofread for spelling and grammar errors',
      'Save as PDF to preserve formatting',
      'Update regularly with new achievements',
    ],
  },
];

export default function ResumeTipsWidget({
  activeSection = 'default',
  colors,
  onClose,
}: ResumeTipsWidgetProps) {
  const tips = useMemo(() => {
    const sectionTips = RESUME_TIPS.find((t) => t.section === activeSection);
    return sectionTips?.tips || RESUME_TIPS.find((t) => t.section === 'default')?.tips || [];
  }, [activeSection]);

  const sectionTitle = useMemo(() => {
    const titles: Record<string, string> = {
      summary: 'Summary Tips',
      experience: 'Experience Tips',
      skills: 'Skills Tips',
      education: 'Education Tips',
      projects: 'Projects Tips',
      certifications: 'Certifications Tips',
      default: 'Resume Tips',
    };
    return titles[activeSection] || 'Resume Tips';
  }, [activeSection]);

  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderColor: '#fbbf24',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} style={{ color: '#92400e' }} />
          <h4 className="text-sm font-semibold" style={{ color: '#92400e' }}>
            {sectionTitle}
          </h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            style={{ color: '#92400e' }}
            aria-label="Close tips"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tips List */}
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-xs"
            style={{ color: '#78350f' }}
          >
            <span className="flex-shrink-0 mt-1">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

