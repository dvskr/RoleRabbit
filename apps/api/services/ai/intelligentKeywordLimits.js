/**
 * INTELLIGENT KEYWORD LIMIT CALCULATION
 * 
 * Data-driven approach to determine optimal number of missing keywords
 * to address during resume tailoring.
 * 
 * Goals:
 * - PARTIAL mode: Target 80+ ATS score
 * - FULL mode: Target 85+ ATS score
 * 
 * Factors considered:
 * 1. Resume capacity (how much content space available)
 * 2. Score gap (how many keywords needed to reach target)
 * 3. Total missing keywords (upper bound)
 */

const logger = require('../../utils/logger');

/**
 * Calculate optimal keyword limit based on resume characteristics and goals
 * 
 * @param {Object} params
 * @param {string} params.mode - 'PARTIAL' or 'FULL'
 * @param {number} params.atsScore - Current ATS score (0-100)
 * @param {number} params.totalMissing - Total number of missing keywords
 * @param {Object} params.resumeData - Resume data object
 * @returns {Object} { limit: number, reason: Object }
 */
function calculateOptimalKeywordLimit({ 
  mode, 
  atsScore, 
  totalMissing, 
  resumeData 
}) {
  // ============================================================
  // STEP 1: Calculate Resume Capacity
  // ============================================================
  // How many keywords can be naturally integrated based on resume size
  
  const experienceCount = (resumeData.experience || []).length;
  const totalBullets = (resumeData.experience || [])
    .reduce((sum, exp) => sum + (exp.bullets || []).length, 0);
  const projectCount = (resumeData.projects || []).length;
  
  // Average bullets per job (density indicator)
  const avgBulletsPerJob = experienceCount > 0 
    ? totalBullets / experienceCount 
    : 3;
  
  // Calculate capacity based on resume density
  let capacity;
  let capacityReason;
  
  if (avgBulletsPerJob >= 6 && experienceCount >= 5) {
    // Dense, long resume (4+ pages)
    capacity = 30;
    capacityReason = 'Dense resume with extensive experience';
  } else if (avgBulletsPerJob >= 5 && experienceCount >= 4) {
    // Above-average resume (3 pages)
    capacity = 25;
    capacityReason = 'Above-average resume length';
  } else if (avgBulletsPerJob >= 4 && experienceCount >= 3) {
    // Standard resume (2 pages)
    capacity = 20;
    capacityReason = 'Standard 2-page resume';
  } else if (avgBulletsPerJob >= 3 && experienceCount >= 2) {
    // Compact resume (1-2 pages)
    capacity = 15;
    capacityReason = 'Compact resume';
  } else {
    // Sparse resume (1 page or less)
    capacity = 10;
    capacityReason = 'Sparse or entry-level resume';
  }
  
  // Boost capacity if resume has many projects (additional integration points)
  if (projectCount >= 5) {
    capacity += 5;
    capacityReason += ' + many projects';
  } else if (projectCount >= 3) {
    capacity += 3;
    capacityReason += ' + several projects';
  }
  
  // ============================================================
  // STEP 2: Calculate Keyword Need (Data-Driven)
  // ============================================================
  // How many keywords needed to reach target score
  
  let need;
  let needReason;
  
  if (mode === 'FULL') {
    // FULL MODE: Target 85+ ATS score
    if (atsScore >= 80) {
      // Very close to target (80-84)
      need = 8;
      needReason = 'Close to 85+ target (minor optimization)';
    } else if (atsScore >= 70) {
      // Close to target (70-79)
      need = 15;
      needReason = 'Moderate gap to 85+ target';
    } else if (atsScore >= 60) {
      // Medium gap (60-69)
      need = 25;
      needReason = 'Significant gap to 85+ target';
    } else if (atsScore >= 50) {
      // Large gap (50-59)
      need = 30;
      needReason = 'Large gap to 85+ target';
    } else {
      // Very large gap (<50)
      need = 35;
      needReason = 'Very large gap to 85+ target (maximum effort)';
    }
  } else {
    // PARTIAL MODE: Target 80+ ATS score
    if (atsScore >= 75) {
      // Very close to target (75-79)
      need = 6;
      needReason = 'Close to 80+ target (minor enhancement)';
    } else if (atsScore >= 65) {
      // Close to target (65-74)
      need = 12;
      needReason = 'Moderate gap to 80+ target';
    } else if (atsScore >= 55) {
      // Medium gap (55-64)
      need = 18;
      needReason = 'Significant gap to 80+ target';
    } else if (atsScore >= 45) {
      // Large gap (45-54)
      need = 22;
      needReason = 'Large gap to 80+ target';
    } else {
      // Very large gap (<45)
      need = 25;
      needReason = 'Very large gap to 80+ target (maximum for PARTIAL)';
    }
  }
  
  // ============================================================
  // STEP 3: Calculate Final Limit
  // ============================================================
  // Take minimum of capacity, need, and total available
  
  const optimal = Math.min(capacity, need, totalMissing);
  
  // Determine limiting factor
  let limitingFactor;
  if (optimal === totalMissing) {
    limitingFactor = 'total_missing';
  } else if (optimal === capacity) {
    limitingFactor = 'resume_capacity';
  } else {
    limitingFactor = 'target_need';
  }
  
  // ============================================================
  // STEP 4: Log Decision for Analytics
  // ============================================================
  
  logger.info('Calculated intelligent keyword limit', {
    mode,
    atsScore,
    totalMissing,
    experienceCount,
    totalBullets,
    avgBulletsPerJob,
    projectCount,
    calculated: {
      capacity,
      capacityReason,
      need,
      needReason,
      optimal,
      limitingFactor
    }
  });
  
  return {
    limit: optimal,
    reason: {
      capacity,
      capacityReason,
      need,
      needReason,
      totalMissing,
      chosen: optimal,
      limitingFactor,
      target: mode === 'FULL' ? 85 : 80
    }
  };
}

/**
 * Estimate resume page count (for UI display)
 */
function estimateResumePages(resumeData) {
  const experienceCount = (resumeData.experience || []).length;
  const totalBullets = (resumeData.experience || [])
    .reduce((sum, exp) => sum + (exp.bullets || []).length, 0);
  const projectCount = (resumeData.projects || []).length;
  const certCount = (resumeData.certifications || []).length;
  
  // Rough estimation
  const contentScore = 
    (experienceCount * 2) + 
    (totalBullets * 0.5) + 
    (projectCount * 1) + 
    (certCount * 0.3);
  
  if (contentScore >= 40) return 4;
  if (contentScore >= 25) return 3;
  if (contentScore >= 15) return 2;
  return 1;
}

module.exports = {
  calculateOptimalKeywordLimit,
  estimateResumePages
};

