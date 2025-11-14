/**
 * Calculate realistic maximum ATS score based on resume-job match
 * Not all resumes can reach 95 - some have fundamental mismatches
 */

const logger = require('./logger');

/**
 * Calculate the realistic ceiling for ATS score improvements
 * @param {Object} resume - Resume data
 * @param {Object} job - Job analysis data
 * @param {Object} atsAnalysis - Current ATS analysis results
 * @returns {number} - Realistic maximum score (60-95)
 */
function calculateRealisticCeiling(resume, job, atsAnalysis) {
  let ceiling = 95; // Start optimistic
  
  const reasons = [];

  // 1. Experience Level Mismatch (-10 to -20 points)
  const resumeYears = atsAnalysis?.seniority?.years_experience || 0;
  const requiredYears = getSeniorityYears(job.seniority_level);
  const yearsGap = Math.abs(resumeYears - requiredYears);

  if (yearsGap > 2 && resumeYears < requiredYears) {
    const penalty = Math.min(20, yearsGap * 3);
    ceiling -= penalty;
    reasons.push(`Experience gap: ${resumeYears}y vs ${requiredYears}y required (-${penalty})`);
  }

  // 2. Skills Match Rate (-10 to -20 points)
  const requiredSkills = job.required_skills || [];
  const preferredSkills = job.preferred_skills || [];
  const totalJobSkills = requiredSkills.length + preferredSkills.length;
  const matchedSkills = atsAnalysis?.matchedKeywords?.length || 0;
  const skillMatchRate = totalJobSkills > 0 ? matchedSkills / totalJobSkills : 1;

  if (skillMatchRate < 0.3) {
    // Less than 30% match - significant mismatch
    ceiling -= 20;
    reasons.push(`Low skill match: ${Math.round(skillMatchRate * 100)}% (-20)`);
  } else if (skillMatchRate < 0.5) {
    // Less than 50% match - moderate mismatch
    ceiling -= 10;
    reasons.push(`Moderate skill match: ${Math.round(skillMatchRate * 100)}% (-10)`);
  }

  // 3. Industry Mismatch (if detectable) (-5 to -15 points)
  // This is a future enhancement - would need to detect industry from resume

  // 4. Format Quality (already good resumes don't have much room)
  if (atsAnalysis?.format && atsAnalysis.format >= 85) {
    // Resume is already well-formatted
    ceiling = Math.min(ceiling, 92); // Cap at 92 if already good
    reasons.push('Resume already well-formatted (capped at 92)');
  }

  // 5. Ensure minimum ceiling
  ceiling = Math.max(70, ceiling); // Never go below 70

  logger.info('Calculated realistic ceiling', {
    ceiling,
    reasons: reasons.length > 0 ? reasons : ['No major limitations'],
    currentScore: atsAnalysis?.overall || 0,
    potentialGain: ceiling - (atsAnalysis?.overall || 0)
  });

  return Math.round(ceiling);
}

/**
 * Get typical years of experience for seniority level
 */
function getSeniorityYears(level) {
  const levelMap = {
    entry: 0,
    junior: 1,
    mid: 3,
    senior: 5,
    lead: 7,
    principal: 10,
    staff: 10
  };
  
  const normalized = (level || 'mid').toLowerCase();
  return levelMap[normalized] || 3;
}

/**
 * Calculate target score based on mode and realistic ceiling
 * @param {string} mode - PARTIAL or FULL
 * @param {number} currentScore - Current ATS score
 * @param {number} ceiling - Realistic ceiling
 * @returns {number} - Target score to aim for
 */
function calculateTargetScore(mode, currentScore, ceiling) {
  const upperBound = Math.max(60, Math.min(95, ceiling)); // safety clamp

  if (String(mode).toUpperCase() === 'FULL') {
    // 🎯 DATA-DRIVEN TARGET: 85+ ATS score
    // Aim for 85+ or strong improvement (typical FULL gain +25~45)
    const baseTarget = Math.max(85, currentScore + 25);
    return Math.min(upperBound, baseTarget);
  }

  // 🎯 DATA-DRIVEN TARGET: 80+ ATS score (upgraded from 75+)
  // Aim for 80+ or meaningful improvement (typical PARTIAL gain +15~30)
  const baseTarget = Math.max(80, currentScore + 15);
  return Math.min(upperBound, baseTarget);
}

module.exports = {
  calculateRealisticCeiling,
  calculateTargetScore,
  getSeniorityYears
};

