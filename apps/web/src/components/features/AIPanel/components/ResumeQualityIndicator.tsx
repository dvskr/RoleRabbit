import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ResumeQualityIndicatorProps {
  resumeData: any;
  colors: {
    text: string;
    textSecondary: string;
    border: string;
    hoverBackground: string;
  };
}

/**
 * Calculates resume quality score based on completeness
 */
function calculateResumeQuality(resumeData: any) {
  if (!resumeData) {
    return {
      score: 0,
      issues: ['No resume loaded'],
      suggestions: ['Please load or create a resume first'],
      level: 'critical' as const
    };
  }

  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check summary/objective
  if (!resumeData.summary && !resumeData.objective) {
    issues.push('Missing professional summary');
    suggestions.push('Add a professional summary or objective');
    score -= 20;
  }

  // Check experience
  if (!resumeData.experience || !Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
    issues.push('Missing work experience');
    suggestions.push('Add your work experience');
    score -= 30;
  } else {
    const hasDetailedExperience = resumeData.experience.some((exp: any) => {
      const hasBullets = Array.isArray(exp.bullets) && exp.bullets.length > 0;
      const hasDescription = exp.description && exp.description.length > 50;
      return hasBullets || hasDescription;
    });

    if (!hasDetailedExperience) {
      issues.push('Experience lacks detail');
      suggestions.push('Add bullet points to your experience');
      score -= 15;
    }
  }

  // Check skills
  const hasSkills = resumeData.skills && (
    (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) ||
    (typeof resumeData.skills === 'object' && Object.keys(resumeData.skills).length > 0)
  );

  if (!hasSkills) {
    issues.push('Missing skills section');
    suggestions.push('Add your skills for better keyword matching');
    score -= 20;
  }

  // Check education
  if (!resumeData.education || resumeData.education.length === 0) {
    issues.push('Missing education');
    suggestions.push('Add your education background');
    score -= 15;
  }

  // Determine level
  let level: 'good' | 'warning' | 'critical';
  if (score >= 80) {
    level = 'good';
  } else if (score >= 50) {
    level = 'warning';
  } else {
    level = 'critical';
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    level
  };
}

export default function ResumeQualityIndicator({ resumeData, colors }: ResumeQualityIndicatorProps) {
  const quality = calculateResumeQuality(resumeData);

  const getIcon = () => {
    switch (quality.level) {
      case 'good':
        return <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />;
      case 'critical':
        return <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />;
    }
  };

  const getColor = () => {
    switch (quality.level) {
      case 'good':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' };
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
    }
  };

  const colorScheme = getColor();

  // Don't show if quality is perfect
  if (quality.level === 'good' && quality.issues.length === 0) {
    return null;
  }

  return (
    <div
      className="p-3 rounded-lg text-xs space-y-2"
      style={{
        background: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`
      }}
    >
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="font-medium" style={{ color: colorScheme.text }}>
          Resume Quality: {quality.score}/100
        </span>
      </div>

      {quality.issues.length > 0 && (
        <div className="space-y-1" style={{ color: colorScheme.text }}>
          <div className="font-medium">Issues:</div>
          {quality.issues.map((issue, idx) => (
            <div key={idx} className="pl-2">• {issue}</div>
          ))}
        </div>
      )}

      {quality.suggestions.length > 0 && quality.level !== 'good' && (
        <div className="space-y-1" style={{ color: colors.textSecondary }}>
          <div className="font-medium">💡 Suggestions:</div>
          {quality.suggestions.slice(0, 2).map((suggestion, idx) => (
            <div key={idx} className="pl-2">• {suggestion}</div>
          ))}
        </div>
      )}

      {quality.level === 'critical' && (
        <div className="text-xs pt-1" style={{ color: colorScheme.text }}>
          ⚠️ Complete these sections for effective tailoring
        </div>
      )}
    </div>
  );
}

