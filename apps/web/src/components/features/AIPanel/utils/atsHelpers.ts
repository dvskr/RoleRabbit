import { ATSAnalysisResult } from '../types/AIPanel.types';
import { COMMON_KEYWORDS, REQUIRED_SECTIONS } from '../constants';
import type { ResumeData, ExperienceItem } from '../../../types/resume';

export const extractKeywords = (jobDesc: string): string[] => {
  const text = jobDesc.toLowerCase();
  return COMMON_KEYWORDS.filter(keyword => text.includes(keyword));
};

export const extractMissingKeywords = (jobDesc: string, data: ResumeData): string[] => {
  const keywords = extractKeywords(jobDesc);
  const resumeText = JSON.stringify(data).toLowerCase();
  return keywords.filter(keyword => !resumeText.includes(keyword.toLowerCase())).slice(0, 5);
};

export const generateStrengths = (data: ResumeData): string[] => {
  const strengths = [];
  if (data.summary) strengths.push('Professional summary present');
  if (data.experience?.length > 0) strengths.push('Experience section well-documented');
  if (data.skills?.length > 0) strengths.push('Technical skills listed');
  if (data.education?.length > 0) strengths.push('Education credentials included');
  return strengths;
};

export const generateImprovements = (_data: ResumeData, _keywords: string[]): string[] => {
  const improvements = [];
  improvements.push('Add more industry-specific keywords from job description');
  improvements.push('Include more quantifiable achievements with numbers');
  improvements.push('Expand technical skills section');
  improvements.push('Add metrics to experience descriptions');
  return improvements;
};

const hasQuantifiableAchievements = (experience: ExperienceItem[] = []): boolean =>
  experience.some((exp) =>
    exp.bullets.some((bullet) => /(?:\d+%|\d+\+|\$\d+|saved|increased|decreased|managed)/i.test(bullet))
  );

export const calculateATSScore = (data: ResumeData, jobDesc: string): ATSAnalysisResult => {
  let score = 0;

  // Check keywords
  const keywords = extractKeywords(jobDesc);
  const resumeText = JSON.stringify(data).toLowerCase();
  const matchedKeywords = keywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / Math.max(keywords.length, 1)) * 30;
  score += keywordScore;

  // Check format (sections present)
  const presentSections = REQUIRED_SECTIONS.filter(section => {
    if (section === 'summary' && data.summary) return true;
    if (section === 'experience' && data.experience?.length > 0) return true;
    if (section === 'education' && data.education?.length > 0) return true;
    if (section === 'skills' && data.skills?.length > 0) return true;
    return false;
  });
  const formatScore = (presentSections.length / REQUIRED_SECTIONS.length) * 25;
  score += formatScore;

  // Check content quality (quantifiable achievements)
  const quantifiable = hasQuantifiableAchievements(data.experience);
  const contentScore = quantifiable ? 25 : 15;
  score += contentScore;

  // Check experience depth
  const hasExperience = data.experience && data.experience.length > 0;
  const expScore = hasExperience ? 20 : 10;
  score += expScore;

  return {
    overall: Math.round(score),
    keywords: Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100),
    format: Math.round((presentSections.length / REQUIRED_SECTIONS.length) * 100),
    content: Math.round((quantifiable ? 100 : 60)),
    experience: Math.round(hasExperience ? 100 : 50),
    strengths: generateStrengths(data),
    improvements: generateImprovements(data, keywords),
    missingKeywords: extractMissingKeywords(jobDesc, data)
  };
};

