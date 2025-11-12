/**
 * Context Analyzer
 * Analyzes resume and job to provide context for better AI prompts
 */

const logger = require('../../utils/logger');

/**
 * Detect experience level from resume
 */
function detectExperienceLevel(resumeData) {
  const experience = resumeData.experience || [];
  
  if (!Array.isArray(experience) || experience.length === 0) {
    return { level: 'ENTRY', years: 0, confidence: 0.9 };
  }

  // Calculate total years
  let totalYears = 0;
  experience.forEach(exp => {
    const years = calculateYearsFromDuration(exp.duration);
    totalYears += years;
  });

  // Classify
  let level = 'ENTRY';
  if (totalYears >= 10) level = 'SENIOR';
  else if (totalYears >= 5) level = 'MID';
  else if (totalYears >= 2) level = 'JUNIOR';

  return {
    level,
    years: totalYears,
    confidence: 0.85,
    jobCount: experience.length
  };
}

/**
 * Detect industry from job description and resume
 */
function detectIndustry(jobDescription, resumeData) {
  const text = `${jobDescription} ${JSON.stringify(resumeData)}`.toLowerCase();
  
  const industries = [
    { name: 'SOFTWARE', keywords: ['software', 'developer', 'engineer', 'programming', 'coding', 'javascript', 'python', 'react', 'node'] },
    { name: 'HEALTHCARE', keywords: ['healthcare', 'medical', 'hospital', 'clinical', 'patient', 'nurse', 'doctor', 'health'] },
    { name: 'FINANCE', keywords: ['finance', 'banking', 'investment', 'trading', 'financial', 'accountant', 'analyst'] },
    { name: 'MARKETING', keywords: ['marketing', 'advertising', 'brand', 'campaign', 'social media', 'seo', 'content'] },
    { name: 'SALES', keywords: ['sales', 'business development', 'account executive', 'customer success', 'revenue'] },
    { name: 'EDUCATION', keywords: ['education', 'teacher', 'instructor', 'professor', 'training', 'curriculum'] },
    { name: 'CONSTRUCTION', keywords: ['construction', 'building', 'contractor', 'engineer', 'architect', 'site'] },
    { name: 'RETAIL', keywords: ['retail', 'store', 'customer service', 'merchandise', 'sales associate'] },
    { name: 'MANUFACTURING', keywords: ['manufacturing', 'production', 'assembly', 'quality control', 'operations'] },
    { name: 'CONSULTING', keywords: ['consultant', 'consulting', 'advisory', 'strategy', 'transformation'] }
  ];

  const scores = industries.map(industry => {
    const matches = industry.keywords.filter(kw => text.includes(kw)).length;
    return { name: industry.name, score: matches, keywords: industry.keywords };
  });

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score === 0) {
    return { industry: 'GENERAL', confidence: 0.5, keywords: [] };
  }

  return {
    industry: scores[0].name,
    confidence: Math.min(scores[0].score / 3, 1),
    alternates: scores.slice(1, 3).map(s => s.name),
    keywords: scores[0].keywords.slice(0, 5)
  };
}

/**
 * Detect role type (technical vs non-technical)
 */
function detectRoleType(jobDescription, resumeData) {
  const text = `${jobDescription} ${JSON.stringify(resumeData)}`.toLowerCase();
  
  const technicalKeywords = [
    'developer', 'engineer', 'programmer', 'architect', 'devops',
    'code', 'coding', 'programming', 'software', 'technical',
    'api', 'database', 'cloud', 'aws', 'azure', 'kubernetes',
    'javascript', 'python', 'java', 'react', 'node'
  ];

  const managerialKeywords = [
    'manager', 'director', 'lead', 'head', 'chief', 'vp',
    'managing', 'leadership', 'team lead', 'supervisor'
  ];

  const creativeKeywords = [
    'designer', 'design', 'creative', 'ux', 'ui', 'graphic',
    'visual', 'brand', 'art', 'illustrator'
  ];

  const technicalScore = technicalKeywords.filter(kw => text.includes(kw)).length;
  const managerialScore = managerialKeywords.filter(kw => text.includes(kw)).length;
  const creativeScore = creativeKeywords.filter(kw => text.includes(kw)).length;

  let type = 'GENERAL';
  let confidence = 0.5;

  if (technicalScore >= managerialScore && technicalScore >= creativeScore && technicalScore > 0) {
    type = 'TECHNICAL';
    confidence = Math.min(technicalScore / 3, 0.95);
  } else if (managerialScore > technicalScore && managerialScore > 0) {
    type = 'MANAGERIAL';
    confidence = Math.min(managerialScore / 2, 0.9);
  } else if (creativeScore > 0) {
    type = 'CREATIVE';
    confidence = Math.min(creativeScore / 2, 0.9);
  }

  return { type, confidence, scores: { technical: technicalScore, managerial: managerialScore, creative: creativeScore } };
}

/**
 * Detect seniority level from job description
 */
function detectSeniorityFromJob(jobDescription) {
  const text = jobDescription.toLowerCase();
  
  const seniorityIndicators = [
    { level: 'EXECUTIVE', keywords: ['ceo', 'cto', 'cfo', 'vp', 'vice president', 'chief', 'executive'] },
    { level: 'SENIOR', keywords: ['senior', 'principal', 'staff', 'lead', 'architect', 'expert'] },
    { level: 'MID', keywords: ['mid-level', 'intermediate', 'experienced', 'ii', 'iii'] },
    { level: 'JUNIOR', keywords: ['junior', 'associate', 'entry', 'i '] },
    { level: 'INTERN', keywords: ['intern', 'internship', 'trainee', 'apprentice'] }
  ];

  for (const indicator of seniorityIndicators) {
    for (const keyword of indicator.keywords) {
      if (text.includes(keyword)) {
        return { level: indicator.level, confidence: 0.8, keyword };
      }
    }
  }

  return { level: 'MID', confidence: 0.5, keyword: null };
}

/**
 * Comprehensive context analysis
 */
function analyzeContext(jobDescription, resumeData) {
  const experienceLevel = detectExperienceLevel(resumeData);
  const industry = detectIndustry(jobDescription, resumeData);
  const roleType = detectRoleType(jobDescription, resumeData);
  const jobSeniority = detectSeniorityFromJob(jobDescription);

  logger.info('Context analysis complete', {
    experienceLevel: experienceLevel.level,
    experienceYears: experienceLevel.years,
    industry: industry.industry,
    roleType: roleType.type,
    jobSeniority: jobSeniority.level
  });

  return {
    experience: experienceLevel,
    industry,
    roleType,
    jobSeniority,
    recommendations: generateRecommendations(experienceLevel, industry, roleType, jobSeniority)
  };
}

/**
 * Generate context-based recommendations
 */
function generateRecommendations(experience, industry, roleType, jobSeniority) {
  const recommendations = [];

  // Experience mismatch
  const expYears = experience.years;
  if (jobSeniority.level === 'SENIOR' && expYears < 5) {
    recommendations.push({
      type: 'EXPERIENCE_GAP',
      severity: 'HIGH',
      message: 'Job requires senior experience, but resume shows less than 5 years. Emphasize impact and leadership.',
      action: 'Highlight achievements, leadership, and advanced skills'
    });
  } else if (jobSeniority.level === 'JUNIOR' && expYears > 7) {
    recommendations.push({
      type: 'OVERQUALIFIED',
      severity: 'MEDIUM',
      message: 'Resume shows senior experience for a junior role. Focus on enthusiasm and fit.',
      action: 'Emphasize adaptability and willingness to contribute'
    });
  }

  // Technical role recommendations
  if (roleType.type === 'TECHNICAL') {
    recommendations.push({
      type: 'TECHNICAL_FOCUS',
      severity: 'INFO',
      message: 'Technical role detected. Prioritize technical skills, projects, and metrics.',
      action: 'Lead with technical stack, GitHub/portfolio, quantified achievements'
    });
  }

  // Industry-specific recommendations
  if (industry.confidence > 0.7) {
    recommendations.push({
      type: 'INDUSTRY_ALIGNMENT',
      severity: 'INFO',
      message: `${industry.industry} industry detected. Use industry-specific terminology.`,
      action: `Incorporate ${industry.industry.toLowerCase()} keywords and standards`
    });
  }

  return recommendations;
}

/**
 * Helper: Calculate years from duration string
 */
function calculateYearsFromDuration(duration) {
  if (!duration) return 0;
  
  const text = duration.toLowerCase();
  
  // Extract years
  const yearMatch = text.match(/(\d+)\s*(?:year|yr)/i);
  const monthMatch = text.match(/(\d+)\s*(?:month|mo)/i);
  
  let years = yearMatch ? parseInt(yearMatch[1]) : 0;
  const months = monthMatch ? parseInt(monthMatch[1]) : 0;
  
  years += months / 12;
  
  // If no match, try to parse date range
  if (years === 0) {
    const dates = text.match(/(\d{4})/g);
    if (dates && dates.length >= 2) {
      years = parseInt(dates[dates.length - 1]) - parseInt(dates[0]);
    }
  }
  
  return Math.max(years, 0);
}

module.exports = {
  analyzeContext,
  detectExperienceLevel,
  detectIndustry,
  detectRoleType,
  detectSeniorityFromJob
};

