import { ATSAnalysisResult } from '../types/AIPanel.types';
import { COMMON_KEYWORDS, REQUIRED_SECTIONS } from '../constants';

export const extractKeywords = (jobDesc: string): string[] => {
  const text = jobDesc.toLowerCase();
  return COMMON_KEYWORDS.filter(keyword => text.includes(keyword));
};

export const extractMissingKeywords = (jobDesc: string, data: any): string[] => {
  const keywords = extractKeywords(jobDesc);
  const resumeText = JSON.stringify(data).toLowerCase();
  return keywords.filter(keyword => !resumeText.includes(keyword.toLowerCase())).slice(0, 5);
};

export const generateStrengths = (data: any): string[] => {
  const strengths = [];
  if (data.summary) strengths.push('Professional summary present');
  if (data.experience?.length > 0) strengths.push('Experience section well-documented');
  if (data.skills?.length > 0) strengths.push('Technical skills listed');
  if (data.education?.length > 0) strengths.push('Education credentials included');
  return strengths;
};

export const generateImprovements = (data: any, keywords: string[]): string[] => {
  const improvements = [];
  improvements.push('Add more industry-specific keywords from job description');
  improvements.push('Include more quantifiable achievements with numbers');
  improvements.push('Expand technical skills section');
  improvements.push('Add metrics to experience descriptions');
  return improvements;
};

export const calculateATSScore = (data: any, jobDesc: string): ATSAnalysisResult => {
  let score = 0;
  let totalChecks = 0;

  // Check keywords
  const keywords = extractKeywords(jobDesc);
  const resumeText = JSON.stringify(data).toLowerCase();
  const matchedKeywords = keywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / Math.max(keywords.length, 1)) * 30;
  score += keywordScore;
  totalChecks += 30;

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
  totalChecks += 25;

  // Check content quality (quantifiable achievements)
  const hasQuantifiableAchievements = data.experience?.some((exp: any) => 
    exp.description?.match(/\d+%|\d+\+|\$\d+|saved|increased|decreased|managed/i)
  ) || false;
  const contentScore = hasQuantifiableAchievements ? 25 : 15;
  score += contentScore;
  totalChecks += 25;

  // Check experience depth
  const hasExperience = data.experience && data.experience.length > 0;
  const expScore = hasExperience ? 20 : 10;
  score += expScore;
  totalChecks += 20;

  return {
    overall: Math.round(score),
    keywords: Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100),
    format: Math.round((presentSections.length / REQUIRED_SECTIONS.length) * 100),
    content: Math.round((hasQuantifiableAchievements ? 100 : 60)),
    experience: Math.round(hasExperience ? 100 : 50),
    strengths: generateStrengths(data),
    improvements: generateImprovements(data, keywords),
    missingKeywords: extractMissingKeywords(jobDesc, data)
  };
};

