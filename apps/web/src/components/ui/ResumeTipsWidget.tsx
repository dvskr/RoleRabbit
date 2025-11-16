import React, { useState, useEffect } from 'react';
import { Lightbulb, X, ChevronRight } from 'lucide-react';

interface Tip {
  id: string;
  section: string;
  title: string;
  description: string;
  example?: string;
}

const resumeTips: Tip[] = [
  // Contact Section Tips
  {
    id: 'contact-1',
    section: 'contact',
    title: 'Professional Email',
    description: 'Use a professional email address (firstname.lastname@email.com). Avoid nicknames or unprofessional addresses.',
    example: 'john.doe@gmail.com ✓ | johnnyrocks123@yahoo.com ✗',
  },
  {
    id: 'contact-2',
    section: 'contact',
    title: 'LinkedIn Profile',
    description: 'Include your LinkedIn profile URL. Ensure your profile is complete and matches your resume.',
  },
  {
    id: 'contact-3',
    section: 'contact',
    title: 'Phone Format',
    description: 'Use a consistent phone format: (555) 123-4567 or +1-555-123-4567',
  },
  
  // Summary Section Tips
  {
    id: 'summary-1',
    section: 'summary',
    title: 'Keep It Concise',
    description: 'Your summary should be 2-4 sentences highlighting your key qualifications and career goals.',
    example: 'Experienced software engineer with 5+ years in full-stack development...',
  },
  {
    id: 'summary-2',
    section: 'summary',
    title: 'Quantify Achievements',
    description: 'Include specific numbers and metrics to demonstrate your impact.',
    example: 'Led team of 5 developers, improved performance by 40%',
  },
  {
    id: 'summary-3',
    section: 'summary',
    title: 'Tailor to Job',
    description: 'Customize your summary for each job application to match the job requirements.',
  },
  
  // Experience Section Tips
  {
    id: 'experience-1',
    section: 'experience',
    title: 'Use Action Verbs',
    description: 'Start each bullet point with strong action verbs: Led, Developed, Implemented, Improved, Managed.',
    example: 'Led development of... ✓ | Was responsible for... ✗',
  },
  {
    id: 'experience-2',
    section: 'experience',
    title: 'Quantify Results',
    description: 'Include numbers, percentages, and metrics to show your impact.',
    example: 'Improved application performance by 40%, reducing load time from 5s to 3s',
  },
  {
    id: 'experience-3',
    section: 'experience',
    title: 'STAR Method',
    description: 'Use the STAR method: Situation, Task, Action, Result to structure your accomplishments.',
  },
  {
    id: 'experience-4',
    section: 'experience',
    title: 'Recent First',
    description: 'List your work experience in reverse chronological order (most recent first).',
  },
  {
    id: 'experience-5',
    section: 'experience',
    title: '3-5 Bullet Points',
    description: 'Include 3-5 bullet points per role. Focus on achievements, not just responsibilities.',
  },
  
  // Education Section Tips
  {
    id: 'education-1',
    section: 'education',
    title: 'Include GPA',
    description: 'Include your GPA if it\'s 3.5 or higher. Otherwise, you can omit it.',
  },
  {
    id: 'education-2',
    section: 'education',
    title: 'Relevant Coursework',
    description: 'For recent graduates, include relevant coursework that matches the job requirements.',
  },
  {
    id: 'education-3',
    section: 'education',
    title: 'Honors & Awards',
    description: 'Include academic honors, scholarships, and awards (Dean\'s List, Cum Laude, etc.).',
  },
  
  // Skills Section Tips
  {
    id: 'skills-1',
    section: 'skills',
    title: 'Prioritize Relevant Skills',
    description: 'List skills most relevant to the job first. Match keywords from the job description.',
  },
  {
    id: 'skills-2',
    section: 'skills',
    title: 'Group by Category',
    description: 'Organize skills into categories: Technical Skills, Tools, Soft Skills.',
  },
  {
    id: 'skills-3',
    section: 'skills',
    title: 'Be Honest',
    description: 'Only list skills you\'re comfortable being interviewed about. Avoid exaggerating proficiency.',
  },
  {
    id: 'skills-4',
    section: 'skills',
    title: 'Include Proficiency',
    description: 'Consider adding proficiency levels: Expert, Advanced, Intermediate, Beginner.',
  },
  
  // Projects Section Tips
  {
    id: 'projects-1',
    section: 'projects',
    title: 'Include Links',
    description: 'Add links to GitHub repos, live demos, or portfolios. Make it easy for recruiters to see your work.',
  },
  {
    id: 'projects-2',
    section: 'projects',
    title: 'Highlight Technologies',
    description: 'List the technologies and tools you used. This helps with ATS keyword matching.',
  },
  {
    id: 'projects-3',
    section: 'projects',
    title: 'Show Impact',
    description: 'Describe the problem you solved and the results achieved.',
  },
  
  // General Tips
  {
    id: 'general-1',
    section: 'general',
    title: 'One Page Rule',
    description: 'For early-career professionals (<5 years), keep your resume to one page. Senior professionals can use two pages.',
  },
  {
    id: 'general-2',
    section: 'general',
    title: 'Consistent Formatting',
    description: 'Use consistent fonts, spacing, and bullet styles throughout your resume.',
  },
  {
    id: 'general-3',
    section: 'general',
    title: 'Proofread Carefully',
    description: 'Typos and grammatical errors can disqualify you. Use spell check and have someone review your resume.',
  },
  {
    id: 'general-4',
    section: 'general',
    title: 'ATS-Friendly',
    description: 'Use standard section headings, avoid tables and text boxes, and include keywords from the job description.',
  },
];

interface ResumeTipsWidgetProps {
  currentSection?: string;
  className?: string;
}

const ResumeTipsWidget: React.FC<ResumeTipsWidgetProps> = ({
  currentSection = 'general',
  className = '',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Filter tips based on current section
  const relevantTips = resumeTips.filter(
    (tip) => tip.section === currentSection || tip.section === 'general'
  );

  // Cycle through tips
  useEffect(() => {
    if (relevantTips.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % relevantTips.length);
    }, 15000); // Change tip every 15 seconds

    return () => clearInterval(interval);
  }, [relevantTips.length, currentSection]);

  const currentTip = relevantTips[currentTipIndex];

  if (!currentTip) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-4 right-4 p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all z-40 ${className}`}
        aria-label="Show resume tips"
      >
        <Lightbulb className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-xl z-40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Resume Tip
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-800/50 rounded transition-colors"
            aria-label="Minimize tips"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {currentTip.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {currentTip.description}
        </p>
        {currentTip.example && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {currentTip.example}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          {relevantTips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTipIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTipIndex
                  ? 'bg-yellow-500'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() =>
            setCurrentTipIndex((prev) => (prev + 1) % relevantTips.length)
          }
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Next Tip
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default ResumeTipsWidget;

