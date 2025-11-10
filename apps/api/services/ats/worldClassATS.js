const crypto = require('crypto');
const logger = require('../../utils/logger');
const { extractSkillsWithAI, semanticSkillMatching, analyzeSkillQuality } = require('./aiSkillExtractor');
const { withCache } = require('./atsCache');
const { 
  extractTechnicalSkills, 
  analyzeResume: legacyAnalyzeResume,
  analyzeJobDescription: legacyAnalyzeJobDescription,
  ALL_TECHNICAL_SKILLS 
} = require('./atsScoringService');

/**
 * ============================================================================
 * WORLD-CLASS ATS SCORING ENGINE
 * ============================================================================
 * 
 * This is the ULTIMATE ATS system that combines:
 * 1. Dictionary-based matching (fast, accurate for known skills)
 * 2. AI-powered semantic matching (handles ANY skill, even new ones)
 * 3. Context-aware quality scoring (not just keyword counting)
 * 4. Intelligent caching (fast & cost-effective)
 * 5. Explainable AI (tells user WHY and HOW to improve)
 * 
 * This beats EVERY competitor: Lever, Greenhouse, Workday, LinkedIn, Indeed
 */

// Enhanced scoring weights (optimized for technical roles)
const SCORING_WEIGHTS = {
  technicalSkills: 0.50,      // PRIMARY factor (50%)
  experience: 0.25,            // Years and relevance (25%)
  skillQuality: 0.15,          // How WELL skills are demonstrated (15%)
  education: 0.05,             // Formal education (5%)
  format: 0.05                 // Resume structure (5%)
};

/**
 * Main world-class ATS scoring function
 * @param {Object} params
 * @param {Object} params.resumeData - Resume data object
 * @param {string} params.jobDescription - Job description text
 * @param {boolean} params.useAI - Whether to use AI (default: true)
 * @returns {Promise<Object>} Comprehensive ATS analysis
 */
async function scoreResumeWorldClass({ resumeData = {}, jobDescription, useAI = true }) {
  const startTime = Date.now();
  
  logger.info('🌟 WORLD-CLASS ATS: Starting analysis', {
    use_ai: useAI,
    resume_has_data: !!resumeData
  });

  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription is required for ATS scoring');
  }

  // =========================================================================
  // TIER 1: AI-POWERED JOB ANALYSIS (with caching)
  // =========================================================================
  
  let jobAnalysis;
  
  if (useAI) {
    try {
      jobAnalysis = await withCache(
        'AI Job Analysis',
        jobDescription,
        () => extractSkillsWithAI(jobDescription)
      );
      
      logger.info('✅ AI Job Analysis complete', {
        required: jobAnalysis.required_skills?.length || 0,
        preferred: jobAnalysis.preferred_skills?.length || 0,
        implicit: jobAnalysis.implicit_skills?.length || 0,
        from_cache: jobAnalysis.from_cache
      });
    } catch (error) {
      logger.warn('⚠️  AI Job Analysis failed, using dictionary fallback', { error: error.message });
      jobAnalysis = legacyAnalyzeJobDescription(jobDescription);
      jobAnalysis.extraction_method = 'dictionary_fallback';
    }
  } else {
    // Use dictionary-only approach (faster, no AI cost)
    jobAnalysis = legacyAnalyzeJobDescription(jobDescription);
    jobAnalysis.extraction_method = 'dictionary_only';
  }

  // =========================================================================
  // TIER 2: RESUME ANALYSIS (Dictionary-based, always fast)
  // =========================================================================
  
  const resumeAnalysis = legacyAnalyzeResume(resumeData);
  const resumeText = buildResumeText(resumeData);
  
  logger.info('📄 Resume Analysis complete', {
    technical_skills: resumeAnalysis.technical?.length || 0,
    soft_skills: resumeAnalysis.soft?.length || 0,
    years_experience: resumeAnalysis.yearsOfExperience
  });

  // =========================================================================
  // TIER 3: SEMANTIC SKILL MATCHING (AI-powered)
  // =========================================================================
  
  let semanticResults;
  let skillQualityScores = {};
  
  if (useAI && jobAnalysis.extraction_method !== 'dictionary_fallback') {
    try {
      // Combine all job skills
      const allJobSkills = [
        ...(jobAnalysis.required_skills || []),
        ...(jobAnalysis.preferred_skills || []),
        ...(jobAnalysis.implicit_skills || [])
      ];
      
      const allResumeSkills = (resumeAnalysis.technical || []).map(s => s.skill);
      
      // Semantic matching with AI
      semanticResults = await semanticSkillMatching(
        allJobSkills,
        allResumeSkills,
        resumeText
      );
      
      logger.info('🧠 Semantic Matching complete', {
        match_rate: semanticResults.overall_skill_match_rate,
        quality: semanticResults.quality_score
      });
      
      // Analyze quality of TOP matched skills (top 5 to save costs)
      const topMatches = semanticResults.matches
        .filter(m => m.match && m.confidence > 0.7)
        .slice(0, 5);
      
      // Process quality analysis with rate limiting to avoid OpenAI API issues
      const qualityPromises = topMatches.map((match, index) => 
        new Promise(async (resolve) => {
          // Add delay between API calls to avoid rate limits
          await new Promise(r => setTimeout(r, index * 500));
          
          try {
            const quality = await analyzeSkillQuality(match.job_skill, resumeText);
            skillQualityScores[match.job_skill] = quality;
          } catch (error) {
            logger.warn(`⚠️  Quality analysis failed for ${match.job_skill}`, { error: error.message });
          }
          resolve();
        })
      );
      
      // Wait for all quality analyses to complete
      await Promise.all(qualityPromises);
      
    } catch (error) {
      logger.warn('⚠️  Semantic matching failed, using dictionary fallback', { error: error.message });
      semanticResults = null;
    }
  }

  // =========================================================================
  // TIER 4: INTELLIGENT SCORING
  // =========================================================================
  
  let scores;
  try {
    scores = calculateWorldClassScores({
      jobAnalysis,
      resumeAnalysis,
      semanticResults,
      skillQualityScores,
      resumeData
    });
  } catch (error) {
    logger.error({
      msg: '🌟 WORLD-CLASS ATS: FATAL ERROR',
      error: error.message,
      stack: error.stack,
      job_analysis_keys: jobAnalysis ? Object.keys(jobAnalysis) : null,
      resume_skill_counts: {
        technical: resumeAnalysis?.technical?.length || 0,
        soft: resumeAnalysis?.soft?.length || 0
      },
      semantic_match_summary: semanticResults
        ? {
            total_matches: Array.isArray(semanticResults.matches) ? semanticResults.matches.length : null,
            overall_match_rate: semanticResults.overall_skill_match_rate
          }
        : null
    });
    throw error;
  }

  // =========================================================================
  // TIER 5: EXPLAINABLE AI - RECOMMENDATIONS
  // =========================================================================
  
  const recommendations = generateRecommendations({
    scores,
    jobAnalysis,
    resumeAnalysis,
    semanticResults,
    skillQualityScores
  });

  // =========================================================================
  // FINAL RESULT
  // =========================================================================
  
  const duration = Date.now() - startTime;
  
  const result = {
    overall: scores.overall,
    breakdown: {
      technicalSkills: {
        score: scores.technicalScore,
        weight: SCORING_WEIGHTS.technicalSkills,
        contribution: Math.round(scores.technicalScore * SCORING_WEIGHTS.technicalSkills),
        requiredMatched: scores.requiredMatched?.length || 0,
        requiredTotal: scores.requiredTotal || 0,
        preferredMatched: scores.preferredMatched?.length || 0,
        preferredTotal: scores.preferredTotal || 0,
        matched: scores.matchedSkills || [],
        missing: scores.missingSkills || []
      },
      experience: {
        score: scores.experienceScore,
        weight: SCORING_WEIGHTS.experience,
        contribution: Math.round(scores.experienceScore * SCORING_WEIGHTS.experience),
        years: resumeAnalysis.yearsOfExperience,
        required: jobAnalysis.seniority_level === 'senior' ? 5 : jobAnalysis.seniority_level === 'mid' ? 3 : 1
      },
      skillQuality: {
        score: scores.qualityScore,
        weight: SCORING_WEIGHTS.skillQuality,
        contribution: Math.round(scores.qualityScore * SCORING_WEIGHTS.skillQuality),
        analysis: skillQualityScores
      },
      education: {
        score: scores.educationScore,
        weight: SCORING_WEIGHTS.education,
        contribution: Math.round(scores.educationScore * SCORING_WEIGHTS.education)
      },
      format: {
        score: scores.formatScore,
        weight: SCORING_WEIGHTS.format,
        contribution: Math.round(scores.formatScore * SCORING_WEIGHTS.format)
      }
    },
    strengths: recommendations.strengths,
    improvements: recommendations.improvements,
    actionable_tips: recommendations.actionableTips,
    estimated_score_if_improved: recommendations.estimatedImprovedScore,
    seniority: {
      detected: jobAnalysis.seniority_level,
      aligned: checkSeniorityAlignment(resumeAnalysis.yearsOfExperience, jobAnalysis.seniority_level)
    },
    meta: {
      analysis_method: useAI ? 'ai_powered' : 'dictionary_only',
      job_extraction_method: jobAnalysis.extraction_method,
      used_semantic_matching: !!semanticResults,
      duration_ms: duration,
      cost: jobAnalysis.cost || '$0.00',
      from_cache: jobAnalysis.from_cache || false,
      timestamp: new Date().toISOString()
    },
    // Legacy compatibility
    keywords: scores.technicalScore,
    experience: scores.experienceScore,
    content: scores.qualityScore,
    format: scores.formatScore,
    matchedKeywords: scores.matchedSkills || [],
    missingKeywords: scores.missingSkills || [],
    jobDescriptionHash: hashJobDescription(jobDescription)
  };

  logger.info('🏆 WORLD-CLASS ATS: Analysis complete', {
    overall_score: result.overall,
    duration_ms: duration,
    method: result.meta.analysis_method
  });

  return result;
}

/**
 * Calculate world-class scores
 */
function calculateWorldClassScores({ jobAnalysis, resumeAnalysis, semanticResults, skillQualityScores, resumeData }) {
  let technicalScore = 0;
  let matchedSkills = [];
  let missingSkills = [];
  let requiredMatched = [];
  let preferredMatched = [];
  
  // Use semantic results if available, otherwise fallback to dictionary
  if (semanticResults && semanticResults.matches) {
    // AI-POWERED SCORING
    const requiredSkills = jobAnalysis.required_skills || [];
    const preferredSkills = jobAnalysis.preferred_skills || [];
    
    for (const match of semanticResults.matches) {
      const isRequired = requiredSkills.includes(match.job_skill);
      const isPreferred = preferredSkills.includes(match.job_skill);
      
      if (match.match && match.confidence > 0.6) {
        matchedSkills.push(match.job_skill);
        
        if (isRequired) {
          requiredMatched.push(match.job_skill);
        } else if (isPreferred) {
          preferredMatched.push(match.job_skill);
        }
      } else {
        missingSkills.push(match.job_skill);
      }
    }
    
    // Calculate score: 85% required, 15% preferred
    const requiredScore = requiredSkills.length > 0 
      ? (requiredMatched.length / requiredSkills.length) * 85 
      : 85;
    const preferredScore = preferredSkills.length > 0 
      ? (preferredMatched.length / preferredSkills.length) * 15 
      : 15;
    
    technicalScore = Math.round(requiredScore + preferredScore);
    
  } else {
    // DICTIONARY FALLBACK (legacy scoring)
    const resumeSkills = new Set((resumeAnalysis.technical || []).map(s => s.skill.toLowerCase()));
    const requiredSkills = (jobAnalysis.required_skills || jobAnalysis.technical?.required || []).map(s => s.skill || s);
    const preferredSkills = (jobAnalysis.preferred_skills || jobAnalysis.technical?.preferred || []).map(s => s.skill || s);
    
    requiredMatched = requiredSkills.filter(skill => 
      [...resumeSkills].some(rs => rs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rs))
    );
    
    preferredMatched = preferredSkills.filter(skill => 
      [...resumeSkills].some(rs => rs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rs))
    );
    
    matchedSkills = [...requiredMatched, ...preferredMatched];
    missingSkills = [
      ...requiredSkills.filter(s => !requiredMatched.includes(s)),
      ...preferredSkills.filter(s => !preferredMatched.includes(s))
    ];
    
    const requiredScore = requiredSkills.length > 0 
      ? (requiredMatched.length / requiredSkills.length) * 85 
      : 85;
    const preferredScore = preferredSkills.length > 0 
      ? (preferredMatched.length / preferredSkills.length) * 15 
      : 15;
    
    technicalScore = Math.round(requiredScore + preferredScore);
  }
  
  // Experience score
  const requiredYears = jobAnalysis.seniority_level === 'senior' ? 5 : 
                        jobAnalysis.seniority_level === 'mid' ? 3 : 1;
  const resumeYears = resumeAnalysis.yearsOfExperience || 0;
  
  let experienceScore = 100;
  if (resumeYears < requiredYears * 0.5) {
    experienceScore = 40;
  } else if (resumeYears < requiredYears) {
    experienceScore = 70;
  } else if (resumeYears >= requiredYears && resumeYears <= requiredYears * 2) {
    experienceScore = 100;
  } else {
    experienceScore = 90; // Slightly over-qualified
  }
  
  // Quality score (from AI analysis)
  let qualityScore = 70; // Default
  if (Object.keys(skillQualityScores).length > 0) {
    const qualityScores = Object.values(skillQualityScores).map(q => q.depth_score || 50);
    qualityScore = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length);
  }
  
  // Education score (relaxed)
  const educationEntries = Array.isArray(resumeData.education)
    ? resumeData.education
    : resumeData.education && typeof resumeData.education === 'object'
      ? Object.values(resumeData.education).filter(Boolean)
      : [];
  const educationText = educationEntries.map(e => 
    `${e.degree || ''} ${e.field || ''} ${e.institution || ''}`.toLowerCase()
  ).join(' ');
  
  let educationScore = 50; // Base
  if (educationText.includes('bachelor') || educationText.includes('master') || educationText.includes('phd')) {
    educationScore += 30;
  }
  if (educationText.includes('computer') || educationText.includes('engineering') || educationText.includes('science')) {
    educationScore += 20;
  }
  educationScore = Math.min(100, educationScore);
  
  // Format score (basic checks)
  let formatScore = 100;
  if (!resumeData.summary) formatScore -= 15;
  const experienceEntries = Array.isArray(resumeData.experience)
    ? resumeData.experience
    : resumeData.experience && typeof resumeData.experience === 'object'
      ? Object.values(resumeData.experience).filter(Boolean)
      : [];
  if (experienceEntries.length === 0) formatScore -= 20;
  const hasSkills = (() => {
    if (!resumeData.skills) return false;
    if (Array.isArray(resumeData.skills)) return resumeData.skills.length > 0;
    if (typeof resumeData.skills === 'object') {
      const groups = ['technical', 'tools', 'soft', 'languages'];
      return groups.some((group) => {
        const value = resumeData.skills[group];
        if (!value) return false;
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === 'object') {
          return Object.keys(value).length > 0;
        }
        return typeof value === 'string' && value.trim().length > 0;
      });
    }
    return false;
  })();
  if (!hasSkills) formatScore -= 15;
  formatScore = Math.max(0, formatScore);
  
  // Calculate overall
  const overall = Math.round(
    (technicalScore * SCORING_WEIGHTS.technicalSkills) +
    (experienceScore * SCORING_WEIGHTS.experience) +
    (qualityScore * SCORING_WEIGHTS.skillQuality) +
    (educationScore * SCORING_WEIGHTS.education) +
    (formatScore * SCORING_WEIGHTS.format)
  );
  
  return {
    overall,
    technicalScore,
    experienceScore,
    qualityScore,
    educationScore,
    formatScore,
    matchedSkills,
    missingSkills,
    requiredMatched,
    preferredMatched,
    requiredTotal: (jobAnalysis.required_skills || jobAnalysis.technical?.required || []).length,
    preferredTotal: (jobAnalysis.preferred_skills || jobAnalysis.technical?.preferred || []).length
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations({ scores, jobAnalysis, resumeAnalysis, semanticResults, skillQualityScores }) {
  const strengths = [];
  const improvements = [];
  const actionableTips = [];
  
  // Strengths
  if (scores.requiredMatched?.length >= scores.requiredTotal * 0.8) {
    strengths.push(`✓ Strong technical match: ${scores.requiredMatched.length}/${scores.requiredTotal} required skills`);
  }
  
  if (scores.experienceScore >= 90) {
    strengths.push(`✓ Experience well-aligned: ${resumeAnalysis.yearsOfExperience} years`);
  }
  
  if (scores.qualityScore >= 80) {
    strengths.push('✓ High-quality skill demonstrations with strong evidence');
  }
  
  // Improvements
  const criticalMissing = (scores.missingSkills || []).slice(0, 5);
  if (criticalMissing.length > 0) {
    improvements.push(`⚠ Add critical skills: ${criticalMissing.join(', ')}`);
    actionableTips.push({
      type: 'add_skills',
      priority: 'high',
      skills: criticalMissing,
      impact: '+15 to +25 points',
      action: `Add these skills to your resume if you have experience: ${criticalMissing.slice(0, 3).join(', ')}`
    });
  }
  
  // Quality improvements
  for (const [skill, quality] of Object.entries(skillQualityScores)) {
    if (quality.depth_score < 60) {
      actionableTips.push({
        type: 'improve_quality',
        priority: 'medium',
        skill,
        impact: '+5 to +10 points',
        action: `Strengthen ${skill} by adding: years of experience, project scale, quantified results (e.g., "Optimized ${skill} reducing X by 50%")`
      });
    }
  }
  
  // Format improvements
  if (scores.formatScore < 80) {
    actionableTips.push({
      type: 'fix_format',
      priority: 'low',
      impact: '+3 to +5 points',
      action: 'Quick fixes: Add professional summary, ensure all sections are present, use consistent formatting'
    });
  }
  
  // Estimate improved score
  let estimatedImprovement = 0;
  if (criticalMissing.length > 0) estimatedImprovement += 15;
  if (scores.qualityScore < 70) estimatedImprovement += 8;
  if (scores.formatScore < 80) estimatedImprovement += 4;
  
  const estimatedImprovedScore = Math.min(100, scores.overall + estimatedImprovement);
  
  return {
    strengths,
    improvements,
    actionableTips,
    estimatedImprovedScore
  };
}

/**
 * Helper functions
 */

function buildResumeText(resumeData) {
  const parts = [];
  
  if (resumeData.summary) parts.push(resumeData.summary);
  
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      parts.push(`${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`);
      if (exp.bullets && Array.isArray(exp.bullets)) {
        parts.push(...exp.bullets);
      }
    });
  }
  
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(proj => {
      parts.push(`${proj.name || ''} ${proj.description || ''}`);
    });
  }
  
  return parts.join(' ').substring(0, 5000); // Limit for API costs
}

function checkSeniorityAlignment(years, level) {
  if (level === 'junior') return years <= 2;
  if (level === 'mid') return years >= 2 && years <= 5;
  if (level === 'senior') return years > 5;
  return true;
}

function hashJobDescription(jobDescription) {
  return crypto
    .createHash('md5')
    .update(jobDescription.trim())
    .digest('hex');
}

function normalizeArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'object') {
    return Object.keys(value)
      .filter((key) => Object.prototype.hasOwnProperty.call(value, key))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => value[key])
      .filter(Boolean);
  }
  return [];
}

module.exports = {
  scoreResumeWorldClass,
  SCORING_WEIGHTS
};

