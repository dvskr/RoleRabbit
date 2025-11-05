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
  
  // Handle skills - can be array of strings or array of objects with 'name' property
  let skills = [];
  if (user.skills) {
    const parsed = parseJsonField(user.skills);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If it's an array of objects with 'name' property, extract names
      if (typeof parsed[0] === 'object' && parsed[0].name) {
        skills = parsed.map(s => s.name).filter(Boolean);
      } else {
        // If it's already an array of strings
        skills = parsed.filter(s => s && typeof s === 'string');
      }
    }
  }
  
  const education = parseJsonField(user.education);
  const workExperiences = parseJsonField(user.workExperiences);
  
  // Basic Info (30% - increased from 20% to compensate for removed Professional Info section)
  let basicScore = 0;
  if (user.name) basicScore += 5;
  if (user.email) basicScore += 5;
  if (user.phone) basicScore += 4;
  if (user.location) basicScore += 4;
  const hasProfessionalBio = Boolean(
    (user.profile && user.profile.professionalBio) ||
    user.professionalBio
  );
  if (hasProfessionalBio) basicScore += 7;
  // Note: profilePicture is now in user_profiles table, check user.profile?.profilePicture if needed
  if (user.profilePicture || (user.profile && user.profile.profilePicture)) basicScore += 5;
  breakdown.basicInfo = {
    score: basicScore,
    maxScore: 30,
    percentage: Math.round((basicScore / 30) * 100)
  };
  score += basicScore;
  
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
  
  // Work Experience (20% - 1+ experience gets full points)
  let experienceScore = 0;
  if (workExperiences.length >= 1) {
    experienceScore = 20;
  }
  breakdown.workExperience = {
    score: experienceScore,
    maxScore: 20,
    percentage: workExperiences.length >= 1 ? 100 : 0,
    count: workExperiences.length
  };
  score += experienceScore;
  
  // Social Links (20% - LinkedIn, GitHub, Portfolio, Website)
  let socialScore = 0;
  const hasLinkedIn = Boolean(
    (user.profile && user.profile.linkedin) ||
    user.linkedin
  );
  const hasGitHub = Boolean(
    (user.profile && user.profile.github) ||
    user.github
  );
  const hasPortfolio = Boolean(
    (user.profile && user.profile.portfolio) ||
    user.portfolio
  );
  const hasWebsite = Boolean(
    (user.profile && user.profile.website) ||
    user.website
  );
  
  if (hasLinkedIn) socialScore += 5;
  if (hasGitHub) socialScore += 5;
  if (hasPortfolio) socialScore += 5;
  if (hasWebsite) socialScore += 5;
  
  breakdown.socialLinks = {
    score: socialScore,
    maxScore: 20,
    percentage: Math.round((socialScore / 20) * 100),
    count: [hasLinkedIn, hasGitHub, hasPortfolio, hasWebsite].filter(Boolean).length
  };
  score += socialScore;
  
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


