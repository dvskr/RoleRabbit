/**
 * Hallucination Prevention System
 * Prevents AI from fabricating facts and ensures accuracy
 */

const logger = require('../../utils/logger');

/**
 * Verify AI-generated content against source resume
 */
function verifyAgainstSource(tailoredResume, originalResume) {
  const issues = [];
  const warnings = [];
  
  // 1. Verify job titles haven't been fabricated
  const originalTitles = extractJobTitles(originalResume);
  const tailoredTitles = extractJobTitles(tailoredResume);
  
  tailoredTitles.forEach(title => {
    if (!originalTitles.includes(title) && !isSimilarTitle(title, originalTitles)) {
      issues.push({
        type: 'FABRICATED_TITLE',
        severity: 'HIGH',
        value: title,
        message: `Job title "${title}" not found in original resume`
      });
    }
  });
  
  // 2. Verify company names haven't been fabricated
  const originalCompanies = extractCompanies(originalResume);
  const tailoredCompanies = extractCompanies(tailoredResume);
  
  tailoredCompanies.forEach(company => {
    if (!originalCompanies.includes(company)) {
      issues.push({
        type: 'FABRICATED_COMPANY',
        severity: 'CRITICAL',
        value: company,
        message: `Company "${company}" not found in original resume`
      });
    }
  });
  
  // 3. Verify education hasn't been fabricated
  const originalDegrees = extractDegrees(originalResume);
  const tailoredDegrees = extractDegrees(tailoredResume);
  
  tailoredDegrees.forEach(degree => {
    if (!originalDegrees.some(orig => degree.toLowerCase().includes(orig.toLowerCase()))) {
      issues.push({
        type: 'FABRICATED_DEGREE',
        severity: 'CRITICAL',
        value: degree,
        message: `Degree "${degree}" not found in original resume`
      });
    }
  });
  
  // 4. Check for suspiciously specific numbers that weren't in original
  const originalNumbers = extractNumbers(JSON.stringify(originalResume));
  const tailoredNumbers = extractNumbers(JSON.stringify(tailoredResume));
  
  const newNumbers = tailoredNumbers.filter(n => !originalNumbers.includes(n));
  if (newNumbers.length > 5) {
    warnings.push({
      type: 'MANY_NEW_METRICS',
      severity: 'MEDIUM',
      count: newNumbers.length,
      message: `${newNumbers.length} new numeric metrics added - verify accuracy`
    });
  }
  
  // 5. Verify skills are reasonable additions
  const originalSkills = extractSkills(originalResume);
  const tailoredSkills = extractSkills(tailoredResume);
  const newSkills = tailoredSkills.filter(s => !originalSkills.includes(s));
  
  if (newSkills.length > 10) {
    warnings.push({
      type: 'MANY_NEW_SKILLS',
      severity: 'LOW',
      skills: newSkills.slice(0, 5),
      count: newSkills.length,
      message: `${newSkills.length} new skills added - ensure they're mentioned in experience`
    });
  }
  
  return {
    verified: issues.length === 0,
    issues,
    warnings,
    confidence: calculateConfidence(issues, warnings)
  };
}

/**
 * Check AI output for common hallucination patterns
 */
function detectHallucinationPatterns(text) {
  const patterns = [];
  
  // 1. Too-perfect metrics (exactly round numbers)
  const perfectMetrics = text.match(/\b(100|200|500|1000)%\b/g);
  if (perfectMetrics && perfectMetrics.length > 2) {
    patterns.push({
      pattern: 'PERFECT_METRICS',
      severity: 'MEDIUM',
      message: 'Multiple exact round-number metrics may be fabricated',
      matches: perfectMetrics
    });
  }
  
  // 2. Suspicious phrases
  const suspiciousPhrases = [
    'world-class', 'industry-leading', 'best-in-class',
    'revolutionized', 'transformed the industry',
    'single-handedly', 'solely responsible'
  ];
  
  suspiciousPhrases.forEach(phrase => {
    if (text.toLowerCase().includes(phrase)) {
      patterns.push({
        pattern: 'EXAGGERATED_CLAIM',
        severity: 'LOW',
        phrase,
        message: `Phrase "${phrase}" may be exaggerated`
      });
    }
  });
  
  // 3. Vague quantification
  const vagueMetrics = text.match(/\b(significantly|substantially|dramatically|vastly)\s+(improved|increased|reduced|enhanced)\b/gi);
  if (vagueMetrics && vagueMetrics.length > 3) {
    patterns.push({
      pattern: 'VAGUE_QUANTIFICATION',
      severity: 'LOW',
      message: 'Multiple vague quantifications - prefer specific numbers',
      count: vagueMetrics.length
    });
  }
  
  return patterns;
}

/**
 * Score confidence in AI output accuracy
 */
function scoreConfidence(tailoredResume, originalResume, verification) {
  let score = 1.0;
  
  // Deduct for critical issues
  verification.issues.forEach(issue => {
    if (issue.severity === 'CRITICAL') score -= 0.3;
    else if (issue.severity === 'HIGH') score -= 0.15;
    else if (issue.severity === 'MEDIUM') score -= 0.05;
  });
  
  // Deduct for warnings
  verification.warnings.forEach(warning => {
    if (warning.severity === 'MEDIUM') score -= 0.05;
    else if (warning.severity === 'LOW') score -= 0.02;
  });
  
  // Bonus for minimal changes
  const changeRate = calculateChangeRate(tailoredResume, originalResume);
  if (changeRate < 0.2) score += 0.05; // Small, focused changes are good
  if (changeRate > 0.8) score -= 0.1;  // Too many changes is suspicious
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Generate fact-check recommendations
 */
function generateFactCheckRecommendations(verification, patterns) {
  const recommendations = [];
  
  // Critical issues require immediate attention
  const criticalIssues = verification.issues.filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'REJECT',
      message: `Found ${criticalIssues.length} critical fabrications. Reject this output.`,
      issues: criticalIssues
    });
  }
  
  // High severity issues need review
  const highIssues = verification.issues.filter(i => i.severity === 'HIGH');
  if (highIssues.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'REVIEW',
      message: `Found ${highIssues.length} potential fabrications. Manual review required.`,
      issues: highIssues
    });
  }
  
  // Pattern warnings
  if (patterns.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'VERIFY_METRICS',
      message: 'Detected suspicious patterns in metrics/claims. Verify accuracy.',
      patterns
    });
  }
  
  // All good
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'INFO',
      action: 'APPROVED',
      message: 'No significant issues detected. Output appears accurate.'
    });
  }
  
  return recommendations;
}

// Helper functions

function extractJobTitles(resume) {
  const titles = [];
  const experience = resume.experience || [];
  experience.forEach(exp => {
    if (exp.title) titles.push(exp.title.trim());
    if (exp.position) titles.push(exp.position.trim());
  });
  return [...new Set(titles)];
}

function extractCompanies(resume) {
  const companies = [];
  const experience = resume.experience || [];
  experience.forEach(exp => {
    if (exp.company) companies.push(exp.company.trim());
  });
  return [...new Set(companies)];
}

function extractDegrees(resume) {
  const degrees = [];
  const education = resume.education || [];
  education.forEach(edu => {
    if (edu.degree) degrees.push(edu.degree.trim());
  });
  return [...new Set(degrees)];
}

function extractNumbers(text) {
  const matches = text.match(/\d+(?:\.\d+)?%?/g) || [];
  return matches;
}

function extractSkills(resume) {
  if (Array.isArray(resume.skills)) return resume.skills;
  if (resume.skills && typeof resume.skills === 'object') {
    return Object.values(resume.skills).flat();
  }
  return [];
}

function isSimilarTitle(title, titles) {
  const normalized = title.toLowerCase();
  return titles.some(t => {
    const n = t.toLowerCase();
    return normalized.includes(n) || n.includes(normalized);
  });
}

function calculateChangeRate(tailored, original) {
  const originalStr = JSON.stringify(original);
  const tailoredStr = JSON.stringify(tailored);
  
  let changes = 0;
  const minLen = Math.min(originalStr.length, tailoredStr.length);
  
  for (let i = 0; i < minLen; i++) {
    if (originalStr[i] !== tailoredStr[i]) changes++;
  }
  
  changes += Math.abs(originalStr.length - tailoredStr.length);
  
  return changes / Math.max(originalStr.length, tailoredStr.length);
}

function calculateConfidence(issues, warnings) {
  if (issues.length === 0 && warnings.length === 0) return 0.95;
  if (issues.some(i => i.severity === 'CRITICAL')) return 0.3;
  if (issues.some(i => i.severity === 'HIGH')) return 0.6;
  if (warnings.length > 3) return 0.75;
  return 0.85;
}

module.exports = {
  verifyAgainstSource,
  detectHallucinationPatterns,
  scoreConfidence,
  generateFactCheckRecommendations
};

