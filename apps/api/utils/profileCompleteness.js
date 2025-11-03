/**
 * Profile Completeness Calculator
 * Calculates profile completeness score based on filled fields
 */

/**
 * Calculate profile completeness score (0-100)
 * @param {Object} user - User object with profile fields
 * @returns {Object} Completeness score and breakdown
 */
function calculateProfileCompleteness(user) {
  let score = 0;
  const breakdown = {};
  
  // Parse JSON fields if they're strings
  const parseJsonField = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(field) ? field : [];
  };
  
  const skills = parseJsonField(user.skills);
  const education = parseJsonField(user.education);
  const workExperiences = parseJsonField(user.workExperiences);
  const careerGoals = parseJsonField(user.careerGoals);
  const targetRoles = parseJsonField(user.targetRoles);
  const targetCompanies = parseJsonField(user.targetCompanies);
  
  // Basic Info (20%)
  let basicScore = 0;
  if (user.name) basicScore += 3;
  if (user.email) basicScore += 3;
  if (user.phone) basicScore += 2;
  if (user.location) basicScore += 2;
  if (user.bio) basicScore += 5;
  if (user.profilePicture) basicScore += 5;
  breakdown.basicInfo = {
    score: basicScore,
    maxScore: 20,
    percentage: Math.round((basicScore / 20) * 100)
  };
  score += basicScore;
  
  // Professional Info (25%)
  let professionalScore = 0;
  if (user.currentRole) professionalScore += 5;
  if (user.currentCompany) professionalScore += 5;
  if (user.experience) professionalScore += 5;
  if (user.industry) professionalScore += 5;
  if (user.jobLevel) professionalScore += 5;
  breakdown.professionalInfo = {
    score: professionalScore,
    maxScore: 25,
    percentage: Math.round((professionalScore / 25) * 100)
  };
  score += professionalScore;
  
  // Skills (15%)
  let skillsScore = 0;
  if (skills.length >= 5) {
    skillsScore = 15;
  } else if (skills.length > 0) {
    skillsScore = Math.round((skills.length / 5) * 15);
  }
  breakdown.skills = {
    score: skillsScore,
    maxScore: 15,
    percentage: Math.round((skillsScore / 15) * 100),
    count: skills.length
  };
  score += skillsScore;
  
  // Education (15%)
  let educationScore = 0;
  if (education.length > 0) {
    educationScore = 15;
  }
  breakdown.education = {
    score: educationScore,
    maxScore: 15,
    percentage: education.length > 0 ? 100 : 0,
    count: education.length
  };
  score += educationScore;
  
  // Work Experience (15%)
  let experienceScore = 0;
  if (workExperiences.length > 0) {
    experienceScore = 15;
  }
  breakdown.workExperience = {
    score: experienceScore,
    maxScore: 15,
    percentage: workExperiences.length > 0 ? 100 : 0,
    count: workExperiences.length
  };
  score += experienceScore;
  
  // Career Goals (10%)
  let careerScore = 0;
  if (careerGoals.length > 0) careerScore += 5;
  if (targetRoles.length > 0) careerScore += 3;
  if (targetCompanies.length > 0) careerScore += 2;
  breakdown.careerGoals = {
    score: careerScore,
    maxScore: 10,
    percentage: Math.round((careerScore / 10) * 100),
    careerGoals: careerGoals.length,
    targetRoles: targetRoles.length,
    targetCompanies: targetCompanies.length
  };
  score += careerScore;
  
  // Ensure score is between 0 and 100
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  return {
    score,
    breakdown,
    level: getCompletenessLevel(score)
  };
}

/**
 * Get completeness level based on score
 */
function getCompletenessLevel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Basic';
  return 'Incomplete';
}

module.exports = {
  calculateProfileCompleteness,
  getCompletenessLevel
};


