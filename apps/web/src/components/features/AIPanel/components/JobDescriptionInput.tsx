import React from 'react';
import { Shield } from 'lucide-react';

interface PanelColors {
  primaryText: string;
  inputBackground: string;
  border: string;
  badgePurpleText: string;
  tertiaryText: string;
}

interface JobDescriptionInputProps {
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  colors: PanelColors;
  showApplyButton: boolean;
  isApplied: boolean;
  isApplying: boolean;
  isAnalyzing: boolean;
  resumeData: unknown;
  onATSAnalysis: () => Promise<any | null> | void;
  onApplyImprovements: () => Promise<any | null> | void;
}

export default function JobDescriptionInput({
  jobDescription,
  setJobDescription,
  colors,
  showApplyButton,
  isApplied,
  isApplying,
  isAnalyzing,
  resumeData,
  onATSAnalysis,
  onApplyImprovements
}: JobDescriptionInputProps) {
  return (
    <div>
      <label htmlFor="job-description-input" className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
        Job Description
      </label>
      <textarea
        id="job-description-input"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full h-56 md:h-72 px-3 py-2 border rounded-lg transition-all resize-y text-sm"
        style={{
          background: colors.inputBackground,
          border: `1px solid ${colors.border}`,
          color: colors.primaryText,
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.badgePurpleText;
          e.target.style.outline = `2px solid ${colors.badgePurpleText}40`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border;
          e.target.style.outline = 'none';
        }}
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs" style={{ color: colors.tertiaryText }}>
          {jobDescription.length} characters
        </span>
        <button
          onClick={showApplyButton && !isApplied ? onApplyImprovements : onATSAnalysis}
          disabled={(!jobDescription.trim() || isAnalyzing || !resumeData || isApplying) && !isApplied}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
            isApplied 
              ? 'bg-green-600 text-white cursor-default' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <Shield size={14} />
          {isApplied ? 'Applied' : isApplying ? 'Applying...' : isAnalyzing ? 'Analyzing...' : showApplyButton ? 'Apply Improvements' : 'Run ATS Check'}
        </button>
      </div>
    </div>
  );
}

