// ============================================================
// EMBEDDING-BASED ATS SCORING SERVICE
// ============================================================
// This service combines embedding similarity with keyword matching
// for comprehensive and fast ATS analysis

const logger = require('../../utils/logger');
const { generateResumeEmbedding } = require('./embeddingService');
const { getOrGenerateJobEmbedding } = require('./embeddingCacheService');
const { calculateSimilarity } = require('./similarityService');
const { extractSkillsWithAI } = require('../ats/aiSkillExtractor');
const { retryOpenAIOperation } = require('../../utils/retryWithBackoff');

// NEW: Intelligent matching services
const { extractSkills, matchAllSkills, getMissingSkills, getMatchedSkills, generateMatchExplanation } = require('../ats/skillMatcher');
const { detectSeniorityLevel, compareSeniority, detectDomain, matchDomain, detectKeywordStuffing } = require('../ats/contextAnalyzer');

// SMART KEYWORD EXTRACTION - Filters out generic words
const { extractSmartKeywords, calculateMissingSkills } = require('../ats/smartKeywordExtractor');

/**
 * Smart truncation for huge resumes
 * Keeps most important sections for skill extraction
 * @param {Object} resumeData - Resume data object
 * @param {number} maxChars - Maximum characters allowed (default: 30000)
 * @returns {string} Truncated resume JSON string
 */
function smartTruncateResume(resumeData, maxChars = 30000) {
  const fullResume = JSON.stringify(resumeData);
  
  // Check if truncation is needed
  if (fullResume.length <= maxChars) {
    logger.debug('Resume within limits, no truncation needed', {
      size: fullResume.length,
      limit: maxChars
    });
    return fullResume;
  }
  
  // Truncation needed
  logger.warn('Resume exceeds limit, applying smart truncation', {
    original: fullResume.length,
    limit: maxChars,
    reduction: fullResume.length - maxChars,
    reductionPercent: Math.round((1 - maxChars / fullResume.length) * 100)
  });
  
  // PRIORITY 1: CRITICAL - Always include
  const truncated = {
    summary: resumeData.summary || '',
    skills: resumeData.skills || {},
    experience: (resumeData.experience || [])
      .slice(0, 5)  // Top 5 most recent jobs
      .map(exp => ({
        company: exp.company,
        role: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate,
        location: exp.location,
        bullets: (exp.bullets || []).slice(0, 5)  // Top 5 bullets per job
      }))
  };
  
  let currentSize = JSON.stringify(truncated).length;
  
  // PRIORITY 2: IMPORTANT - Include if space allows
  if (currentSize < maxChars * 0.8) {
    truncated.projects = (resumeData.projects || [])
      .slice(0, 3)  // Top 3 projects
      .map(proj => ({
        title: proj.title,
        description: (proj.description || '').substring(0, 200),  // Truncate descriptions
        technologies: proj.technologies || [],
        date: proj.date,
        link: proj.link
      }));
    
    currentSize = JSON.stringify(truncated).length;
  }
  
  // PRIORITY 3: OPTIONAL - Include if still space
  if (currentSize < maxChars * 0.9) {
    truncated.certifications = resumeData.certifications || [];
    truncated.education = resumeData.education || [];
  }
  
  // Final safety truncation
  const result = JSON.stringify(truncated);
  const finalSize = Math.min(result.length, maxChars);
  
  logger.info('Resume truncation complete', {
    original: fullResume.length,
    truncated: finalSize,
    reduction: fullResume.length - finalSize,
    reductionPercent: Math.round((1 - finalSize / fullResume.length) * 100),
    sectionsKept: Object.keys(truncated)
  });
  
  return result.substring(0, maxChars);
}

/**
 * Extract keywords from text (simple approach)
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words

  // Remove duplicates
  return [...new Set(words)];
}

/**
 * Find matched and missing keywords using AI (WORLD-CLASS ACCURACY)
 * @param {Object} resumeData - Resume data
 * @param {string} jobDescription - Job description
 * @returns {Promise<Object>} Matched and missing keywords
 */
async function analyzeKeywordsWithAI(resumeData, jobDescription) {
  try {
    // Apply smart truncation for huge resumes
    const resumeText = smartTruncateResume(resumeData, 30000);
    
    // PRIMARY: AI-powered skill extraction
    logger.info('🤖 Using AI for skill extraction (unlimited coverage)');
    
    const [jobAnalysis, resumeAnalysis] = await Promise.all([
      extractSkillsWithAI(jobDescription),
      extractSkillsWithAI(resumeText)
    ]);
    
    // Combine all required and preferred skills from job
    const jobSkills = [
      ...jobAnalysis.required_skills,
      ...jobAnalysis.preferred_skills
    ];
    
    // Combine all skills from resume
    const resumeSkillsLower = [
      ...resumeAnalysis.required_skills,
      ...resumeAnalysis.preferred_skills,
      ...resumeAnalysis.implicit_skills
    ].map(s => s.toLowerCase());
    
    // Find matched skills
    const matched = jobSkills.filter(jobSkill => 
      resumeSkillsLower.some(rs => 
        rs === jobSkill.toLowerCase() ||
        rs.includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(rs)
      )
    );
    
    // Find missing skills
    const missing = jobSkills.filter(jobSkill => !matched.includes(jobSkill));
    
    logger.info('✅ AI Skill Analysis Complete', {
      jobSkills: jobSkills.length,
      resumeSkills: resumeSkillsLower.length,
      matched: matched.length,
      missing: missing.length
    });

    return {
      matched: [...new Set(matched)],
      missing: [...new Set(missing)],
      totalKeywords: jobSkills.length,
      aiPowered: true
    };

  } catch (error) {
    logger.warn('AI skill extraction failed, using pattern fallback', { 
      error: error.message 
    });
    
    // FALLBACK: Pattern-based extraction (if AI fails)
    return analyzeKeywordsWithPatterns(resumeData, jobDescription);
  }
}

/**
 * Pattern-based keyword analysis (FALLBACK ONLY)
 * @param {Object} resumeData - Resume data
 * @param {string} jobDescription - Job description
 * @returns {Object} Matched and missing keywords
 */
function analyzeKeywordsWithPatterns(resumeData, jobDescription) {
  try {
    // Apply smart truncation for huge resumes
    const resumeText = smartTruncateResume(resumeData, 30000);
    
    // Extract skills using patterns
    const jobSkills = extractSmartKeywords(jobDescription, 50);
    const resumeSkills = extractSmartKeywords(resumeText, 100);

    logger.info('📊 Pattern-based extraction (fallback)', {
      jobSkills: jobSkills.length,
      resumeSkills: resumeSkills.length
    });
    
    // Calculate missing skills
    const missing = calculateMissingSkills(jobSkills, resumeSkills);
    
    // Calculate matched skills
    const matched = jobSkills.filter(jobSkill => 
      !missing.includes(jobSkill)
    );

    return {
      matched: [...new Set(matched)],
      missing: [...new Set(missing)],
      totalKeywords: jobSkills.length,
      aiPowered: false
    };

  } catch (error) {
    logger.error('Pattern analysis failed', { error: error.message });
    return {
      matched: [],
      missing: [],
      totalKeywords: 0,
      aiPowered: false
    };
  }
}

/**
 * Score resume using embedding-based ATS
 * @param {Object} options - Scoring options
 * @param {Object} options.resumeData - Resume data object
 * @param {string} options.jobDescription - Job description text
 * @param {Array<number>} options.resumeEmbedding - Pre-generated resume embedding (optional)
 * @param {boolean} options.useAI - Use AI for skill extraction (default: false for speed)
 * @param {boolean} options.includeDetails - Include detailed analysis (default: true)
 * @returns {Promise<Object>} ATS analysis result
 */
async function scoreResumeWithEmbeddings(options) {
  const {
    resumeData,
    jobDescription,
    resumeEmbedding: providedResumeEmbedding,
    useAI = false,
    includeDetails = true
  } = options;

  const startTime = Date.now();

  try {
    logger.info('Starting embedding-based ATS scoring', {
      hasResumeData: !!resumeData,
      hasJobDescription: !!jobDescription,
      hasProvidedEmbedding: !!providedResumeEmbedding,
      useAI,
      includeDetails
    });

    // Validate inputs
    if (!resumeData) {
      throw new Error('Resume data is required');
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error('Job description is required');
    }

    // Step 1: Get or generate embeddings (with retry logic)
    logger.debug('Step 1: Generating embeddings');
    
    const [resumeEmbedding, jobEmbeddingResult] = await Promise.allSettled([
      providedResumeEmbedding 
        ? Promise.resolve(providedResumeEmbedding)
        : retryOpenAIOperation(
            async (attempt) => {
              logger.info(`[ATS] Generating resume embedding (attempt ${attempt})`);
              return await generateResumeEmbedding(resumeData);
            },
            {
              operationName: 'ATS Resume Embedding',
              maxAttempts: 2, // Fewer retries for embeddings (faster)
              initialDelay: 500
            }
          ),
      retryOpenAIOperation(
        async (attempt) => {
          logger.info(`[ATS] Generating job embedding (attempt ${attempt})`);
          return await getOrGenerateJobEmbedding(jobDescription);
        },
        {
          operationName: 'ATS Job Embedding',
          maxAttempts: 2,
          initialDelay: 500
        }
      )
    ]);

    // Check for embedding failures
    if (resumeEmbedding.status === 'rejected' && jobEmbeddingResult.status === 'rejected') {
      logger.error('[ATS] Both embeddings failed', {
        resumeError: resumeEmbedding.reason?.message,
        jobError: jobEmbeddingResult.reason?.message
      });
      throw new Error('Failed to generate embeddings for ATS analysis. Please try again.');
    }

    // Handle partial failures
    let embeddingsFailed = false;
    let jobEmbedding = null;
    let fromCache = false;
    let finalResumeEmbedding = null;

    if (resumeEmbedding.status === 'rejected') {
      logger.warn('[ATS] Resume embedding failed, will use keyword-only analysis', {
        error: resumeEmbedding.reason?.message
      });
      embeddingsFailed = true;
    } else {
      finalResumeEmbedding = resumeEmbedding.value;
    }

    if (jobEmbeddingResult.status === 'rejected') {
      logger.warn('[ATS] Job embedding failed, will use keyword-only analysis', {
        error: jobEmbeddingResult.reason?.message
      });
      embeddingsFailed = true;
    } else {
      jobEmbedding = jobEmbeddingResult.value.embedding;
      fromCache = jobEmbeddingResult.value.fromCache;
    }

    if (!embeddingsFailed) {
      logger.info('Embeddings ready', {
        resumeEmbeddingDimensions: finalResumeEmbedding?.length || 0,
        jobEmbeddingDimensions: jobEmbedding?.length || 0,
        jobFromCache: fromCache
      });
    }

    // Step 2: Calculate semantic similarity (if embeddings succeeded)
    let similarityResult = null;
    let semanticScore = 0;

    if (!embeddingsFailed && finalResumeEmbedding && jobEmbedding) {
      logger.debug('Step 2: Calculating similarity');
      
      similarityResult = calculateSimilarity(
        finalResumeEmbedding,
        jobEmbedding,
        { includeDetails }
      );
      semanticScore = similarityResult.atsScore;
    } else {
      logger.warn('[ATS] Skipping similarity calculation due to embedding failures');
    }

    // Step 3: AI-powered keyword analysis (unlimited skill coverage) with retry
    logger.debug('Step 3: Analyzing keywords with AI');
    
    let keywordAnalysis;
    try {
      keywordAnalysis = await retryOpenAIOperation(
        async (attempt) => {
          logger.info(`[ATS] Analyzing keywords (attempt ${attempt})`);
          return await analyzeKeywordsWithAI(resumeData, jobDescription);
        },
        {
          operationName: 'ATS Keyword Analysis',
          maxAttempts: 2,
          initialDelay: 500
        }
      );
    } catch (error) {
      logger.error('[ATS] Keyword analysis failed after retries', {
        error: error.message
      });
      
      // If embeddings also failed, we can't continue
      if (embeddingsFailed) {
        throw new Error('ATS analysis failed: Unable to analyze keywords or generate embeddings. Please try again.');
      }
      
      // Use empty keyword analysis if embeddings succeeded
      logger.warn('[ATS] Using empty keyword analysis, relying on embeddings only');
      keywordAnalysis = {
        matched: [],
        missing: [],
        totalKeywords: 0,
        aiPowered: false
      };
    }

    // Step 4: Combine scores
    // Adjust weights based on what succeeded
    const keywordMatchRate = keywordAnalysis.totalKeywords > 0
      ? (keywordAnalysis.matched.length / keywordAnalysis.totalKeywords * 100)
      : 0;

    let overall;
    let scoringMethod;

    if (!embeddingsFailed && keywordAnalysis.totalKeywords > 0) {
      // Both succeeded: 80% semantic, 20% keyword match
      overall = Math.round(semanticScore * 0.8 + keywordMatchRate * 0.2);
      scoringMethod = 'hybrid';
    } else if (!embeddingsFailed) {
      // Only embeddings succeeded: 100% semantic
      overall = Math.round(semanticScore);
      scoringMethod = 'semantic-only';
      logger.warn('[ATS] Using semantic-only scoring (keywords unavailable)');
    } else if (keywordAnalysis.totalKeywords > 0) {
      // Only keywords succeeded: 100% keyword match
      overall = Math.round(keywordMatchRate);
      scoringMethod = 'keyword-only';
      logger.warn('[ATS] Using keyword-only scoring (embeddings unavailable)');
    } else {
      // Both failed (shouldn't reach here due to earlier check)
      throw new Error('ATS analysis failed: No scoring method available');
    }

    const duration = Date.now() - startTime;

    logger.info('Embedding-based ATS scoring complete', {
      overall,
      semanticScore,
      keywordMatchRate: keywordMatchRate.toFixed(1),
      duration,
      fromCache,
      scoringMethod,
      aiSkillExtraction: keywordAnalysis.aiPowered ? 'AI (unlimited)' : 'Patterns (fallback)',
      partialFailure: embeddingsFailed || keywordAnalysis.totalKeywords === 0
    });

    // Build result
    const result = {
      overall,
      semanticScore,
      keywordMatchRate: Math.round(keywordMatchRate),
      similarity: similarityResult?.similarity || 0,
      matchedKeywords: keywordAnalysis.matched.slice(0, 20), // Top 20
      missingKeywords: keywordAnalysis.missing.slice(0, 20), // Top 20
      performance: {
        duration,
        fromCache,
        method: scoringMethod,
        aiPowered: keywordAnalysis.aiPowered || false, // AI skill extraction
        partialFailure: embeddingsFailed || keywordAnalysis.totalKeywords === 0
      }
    };

    // Add warning if partial failure occurred
    if (embeddingsFailed) {
      result.warning = 'Embeddings unavailable. Score based on keyword matching only. Results may be less accurate.';
    } else if (keywordAnalysis.totalKeywords === 0) {
      result.warning = 'Keyword analysis unavailable. Score based on semantic similarity only.';
    }

    // Add detailed analysis if requested
    if (includeDetails) {
      const weights = scoringMethod === 'hybrid' 
        ? { semantic: 0.8, keyword: 0.2 }
        : scoringMethod === 'semantic-only'
        ? { semantic: 1.0, keyword: 0.0 }
        : { semantic: 0.0, keyword: 1.0 };

      result.details = {
        ...(similarityResult?.details || {}),
        keywordAnalysis: {
          totalKeywords: keywordAnalysis.totalKeywords,
          matchedCount: keywordAnalysis.matched.length,
          missingCount: keywordAnalysis.missing.length,
          matchRate: keywordMatchRate
        },
        scoring: {
          method: scoringMethod,
          semanticWeight: weights.semantic,
          keywordWeight: weights.keyword,
          semanticContribution: Math.round(semanticScore * weights.semantic),
          keywordContribution: Math.round(keywordMatchRate * weights.keyword)
        }
      };
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Embedding-based ATS scoring failed', {
      error: error.message,
      duration,
      stack: error.stack
    });

    throw error;
  }
}

/**
 * Score resume with hybrid approach (embeddings + AI skill extraction)
 * More accurate but slower - use for detailed analysis
 * @param {Object} options - Scoring options
 * @returns {Promise<Object>} Enhanced ATS analysis result
 */
async function scoreResumeWithEnhancedATS(options) {
  const {
    resumeData,
    jobDescription,
    resumeEmbedding: providedResumeEmbedding
  } = options;

  const startTime = Date.now();

  try {
    logger.info('Starting enhanced ATS scoring (embeddings + AI skills)');

    // Run embedding scoring and AI skill extraction in parallel
    const [embeddingScore, jobAnalysis] = await Promise.all([
      scoreResumeWithEmbeddings({
        resumeData,
        jobDescription,
        resumeEmbedding: providedResumeEmbedding,
        useAI: false,
        includeDetails: true
      }),
      extractSkillsWithAI(jobDescription)
    ]);

    // Extract skills from resume
    const resumeText = JSON.stringify(resumeData);
    const resumeSkillsForAI = extractSmartKeywords(resumeText, 100);
    
    // Check which AI-extracted skills are in the resume (filter generic words)
    const aiMatchedSkills = jobAnalysis.skills.filter(skill => 
      resumeSkillsForAI.some(rSkill => 
        rSkill.toLowerCase() === skill.toLowerCase() ||
        rSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(rSkill.toLowerCase())
      )
    );

    const aiMissingSkills = calculateMissingSkills(jobAnalysis.skills, resumeSkillsForAI);

    // Calculate AI skill match rate
    const aiSkillMatchRate = jobAnalysis.skills.length > 0
      ? (aiMatchedSkills.length / jobAnalysis.skills.length * 100)
      : 0;

    // Enhanced score: 70% semantic, 20% AI skills, 10% keyword match
    const overall = Math.round(
      embeddingScore.semanticScore * 0.7 +
      aiSkillMatchRate * 0.2 +
      embeddingScore.keywordMatchRate * 0.1
    );

    const duration = Date.now() - startTime;

    logger.info('Enhanced ATS scoring complete', {
      overall,
      semanticScore: embeddingScore.semanticScore,
      aiSkillMatchRate: aiSkillMatchRate.toFixed(1),
      keywordMatchRate: embeddingScore.keywordMatchRate,
      duration
    });

    return {
      overall,
      semanticScore: embeddingScore.semanticScore,
      keywordMatchRate: embeddingScore.keywordMatchRate,
      aiSkillMatchRate: Math.round(aiSkillMatchRate),
      similarity: embeddingScore.similarity,
      matchedKeywords: embeddingScore.matchedKeywords,
      missingKeywords: embeddingScore.missingKeywords,
      matchedSkills: aiMatchedSkills.slice(0, 15),
      missingSkills: aiMissingSkills.slice(0, 15),
      performance: {
        duration,
        fromCache: embeddingScore.performance.fromCache,
        method: 'enhanced'
      },
      details: {
        ...embeddingScore.details,
        aiSkillAnalysis: {
          totalSkills: jobAnalysis.skills.length,
          matchedCount: aiMatchedSkills.length,
          missingCount: aiMissingSkills.length,
          matchRate: aiSkillMatchRate,
          extractionMethod: jobAnalysis.extraction_method
        },
        scoring: {
          semanticWeight: 0.7,
          aiSkillWeight: 0.2,
          keywordWeight: 0.1,
          semanticContribution: Math.round(embeddingScore.semanticScore * 0.7),
          aiSkillContribution: Math.round(aiSkillMatchRate * 0.2),
          keywordContribution: Math.round(embeddingScore.keywordMatchRate * 0.1)
        }
      }
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Enhanced ATS scoring failed', {
      error: error.message,
      duration
    });

    // Fallback to regular embedding scoring
    logger.warn('Falling back to regular embedding scoring');
    return scoreResumeWithEmbeddings(options);
  }
}

/**
 * Batch score multiple resumes against one job
 * @param {Array<Object>} resumes - Array of resume data objects
 * @param {string} jobDescription - Job description
 * @param {Object} options - Scoring options
 * @returns {Promise<Array<Object>>} Array of ATS results
 */
async function batchScoreResumes(resumes, jobDescription, options = {}) {
  const startTime = Date.now();

  try {
    logger.info('Starting batch ATS scoring', {
      totalResumes: resumes.length
    });

    // Pre-generate job embedding once (will be cached)
    const jobEmbeddingResult = await getOrGenerateJobEmbedding(jobDescription);

    // Score all resumes
    const results = await Promise.all(
      resumes.map(async (resumeData, index) => {
        try {
          const result = await scoreResumeWithEmbeddings({
            resumeData,
            jobDescription,
            ...options
          });

          return {
            index,
            success: true,
            ...result
          };

        } catch (error) {
          logger.warn(`Failed to score resume ${index}`, {
            error: error.message
          });

          return {
            index,
            success: false,
            error: error.message
          };
        }
      })
    );

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    logger.info('Batch ATS scoring complete', {
      total: resumes.length,
      successful: successCount,
      failed: resumes.length - successCount,
      duration,
      averagePerResume: Math.round(duration / resumes.length)
    });

    return results;

  } catch (error) {
    logger.error('Batch ATS scoring failed', {
      error: error.message
    });
    throw error;
  }
}

/**
 * INTELLIGENT ATS SCORING (World-Class Accuracy)
 * Combines embeddings + intelligent skill matching + context analysis
 * Recognizes synonyms, equivalent technologies, experience levels, and domains
 * @param {Object} options - Scoring options
 * @returns {Promise<Object>} Intelligent ATS analysis result
 */
async function scoreResumeWithIntelligentATS(options) {
  const {
    resumeData,
    jobDescription,
    resumeEmbedding: providedResumeEmbedding,
    includeDetails = true
  } = options;

  const startTime = Date.now();

  try {
    logger.info('Starting INTELLIGENT ATS scoring');

    // Validate inputs
    if (!resumeData) {
      throw new Error('Resume data is required');
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error('Job description is required');
    }

    // === STEP 1: Embedding Similarity (Semantic Understanding) ===
    const [resumeEmbedding, jobEmbeddingResult] = await Promise.all([
      providedResumeEmbedding 
        ? Promise.resolve(providedResumeEmbedding)
        : generateResumeEmbedding(resumeData),
      getOrGenerateJobEmbedding(jobDescription)
    ]);

    const similarityResult = calculateSimilarity(
      resumeEmbedding,
      jobEmbeddingResult.embedding,
      { includeDetails }
    );

    const baseSemanticScore = similarityResult.atsScore;

    // === STEP 2: Intelligent Skill Matching ===
    const requiredSkills = extractSkills(jobDescription);
    const resumeText = JSON.stringify(resumeData);
    
    const skillMatchResults = matchAllSkills(requiredSkills, resumeText);
    const matchedSkills = getMatchedSkills(skillMatchResults);
    const missingSkills = getMissingSkills(skillMatchResults);

    const intelligentSkillScore = skillMatchResults.scores.weighted;
    const skillQuality = skillMatchResults.statistics.qualityScore;

    // === STEP 3: Context Analysis ===
    
    // 3a. Experience Level Detection
    const resumeSeniority = detectSeniorityLevel(resumeData);
    const seniorityMatch = compareSeniority(resumeSeniority, jobDescription);
    
    // 3b. Domain Knowledge Detection
    const resumeDomains = detectDomain(resumeData);
    const domainMatch = matchDomain(resumeDomains, jobDescription);
    
    // 3c. Keyword Stuffing Detection
    const stuffingAnalysis = detectKeywordStuffing(resumeData);

    // === STEP 4: Context-Aware Score Calculation ===
    
    // Base weights
    let semanticWeight = 0.50;  // Embedding similarity
    let skillWeight = 0.35;     // Intelligent skill matching
    let contextWeight = 0.15;   // Seniority + domain

    // Adjust weights based on quality signals
    if (skillQuality > 80) {
      // High-quality exact matches - trust skills more
      skillWeight = 0.45;
      semanticWeight = 0.40;
    }

    // Calculate base score
    let baseScore = (
      baseSemanticScore * semanticWeight +
      intelligentSkillScore * skillWeight +
      ((seniorityMatch.score * 50 + domainMatch.score * 50) * contextWeight)
    );

    // === STEP 5: Apply Context Multipliers ===
    
    let finalScore = baseScore;
    const multipliers = [];

    // Seniority Multiplier
    if (seniorityMatch.gap < -1) {
      // Significantly over-qualified
      finalScore *= 0.95;
      multipliers.push({ type: 'over-qualified', factor: 0.95, reason: 'Over-qualified for role' });
    } else if (seniorityMatch.gap > 1) {
      // Significantly under-qualified
      finalScore *= 0.75;
      multipliers.push({ type: 'under-qualified', factor: 0.75, reason: 'Below required experience level' });
    } else if (seniorityMatch.gap === 0 && seniorityMatch.score >= 0.9) {
      // Perfect seniority match
      finalScore *= 1.05;
      multipliers.push({ type: 'perfect-seniority', factor: 1.05, reason: 'Perfect experience level match' });
    }

    // Domain Match Multiplier
    if (domainMatch.match && domainMatch.score >= 0.9) {
      finalScore *= 1.1;
      multipliers.push({ type: 'domain-expert', factor: 1.1, reason: 'Strong domain expertise' });
    } else if (!domainMatch.match && domainMatch.score < 0.6) {
      finalScore *= 0.85;
      multipliers.push({ type: 'wrong-domain', factor: 0.85, reason: 'Different domain experience' });
    }

    // Quality Penalty for Keyword Stuffing
    if (stuffingAnalysis.isStuffing) {
      finalScore *= 0.8;
      multipliers.push({ type: 'keyword-stuffing', factor: 0.8, reason: 'Many skills listed but limited depth' });
    }

    // Skill Quality Bonus
    if (skillQuality >= 90 && skillMatchResults.statistics.exactMatches >= 5) {
      finalScore *= 1.08;
      multipliers.push({ type: 'high-quality-match', factor: 1.08, reason: 'Exceptional skill match quality' });
    }

    // Cap final score at 100
    finalScore = Math.min(Math.round(finalScore), 100);

    const duration = Date.now() - startTime;

    logger.info('Intelligent ATS scoring complete', {
      finalScore,
      baseScore: Math.round(baseScore),
      semanticScore: baseSemanticScore,
      skillScore: Math.round(intelligentSkillScore),
      seniorityMatch: seniorityMatch.score,
      domainMatch: domainMatch.score,
      duration
    });

    // === Build Result ===
    const result = {
      overall: finalScore,
      
      // Component scores
      semanticScore: baseSemanticScore,
      skillMatchScore: Math.round(intelligentSkillScore),
      skillQualityScore: Math.round(skillQuality),
      seniorityScore: Math.round(seniorityMatch.score * 100),
      domainScore: Math.round(domainMatch.score * 100),
      
      // Similarity
      similarity: similarityResult.similarity,
      
      // Skills
      matchedSkills: matchedSkills.slice(0, 20).map(s => ({
        skill: s.skill,
        type: s.type,
        score: s.score
      })),
      missingSkills: missingSkills.slice(0, 20),
      
      // Context
      experienceLevel: {
        detected: resumeSeniority.level,
        yearsExperience: resumeSeniority.yearsExperience,
        matchesRequired: seniorityMatch.match,
        gap: seniorityMatch.gap
      },
      domain: {
        primary: resumeDomains.primary?.domain || 'general',
        matchesRequired: domainMatch.match,
        confidence: resumeDomains.primary?.confidence || 0
      },
      
      // Quality signals
      isKeywordStuffing: stuffingAnalysis.isStuffing,
      
      // Performance
      performance: {
        duration,
        fromCache: jobEmbeddingResult.fromCache,
        method: 'intelligent'
      }
    };

    // Add detailed analysis if requested
    if (includeDetails) {
      result.details = {
        scoring: {
          baseScore: Math.round(baseScore),
          finalScore,
          weights: {
            semantic: semanticWeight,
            skills: skillWeight,
            context: contextWeight
          },
          multipliers,
          components: {
            semantic: Math.round(baseSemanticScore * semanticWeight),
            skills: Math.round(intelligentSkillScore * skillWeight),
            context: Math.round((seniorityMatch.score * 50 + domainMatch.score * 50) * contextWeight)
          }
        },
        skillAnalysis: {
          total: skillMatchResults.statistics.total,
          matched: skillMatchResults.statistics.matched,
          exactMatches: skillMatchResults.statistics.exactMatches,
          synonymMatches: skillMatchResults.statistics.synonymMatches,
          equivalentMatches: skillMatchResults.statistics.equivalentMatches,
          relatedMatches: skillMatchResults.statistics.relatedMatches,
          qualityScore: skillQuality,
          explanation: generateMatchExplanation(skillMatchResults)
        },
        seniorityAnalysis: {
          ...seniorityMatch,
          detectedLevel: resumeSeniority.level,
          confidence: resumeSeniority.confidence
        },
        domainAnalysis: {
          ...domainMatch,
          detectedDomains: resumeDomains.all.slice(0, 3)
        },
        qualityFlags: {
          keywordStuffing: stuffingAnalysis.isStuffing,
          keywordStuffingConfidence: stuffingAnalysis.confidence
        }
      };
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Intelligent ATS scoring failed', {
      error: error.message,
      duration,
      stack: error.stack
    });

    // Fallback to regular embedding scoring
    logger.warn('Falling back to regular embedding scoring');
    return scoreResumeWithEmbeddings(options);
  }
}

module.exports = {
  scoreResumeWithEmbeddings,
  scoreResumeWithEnhancedATS,
  scoreResumeWithIntelligentATS,  // NEW: World-class intelligent scoring
  batchScoreResumes,
  extractKeywords,
  // Expose AI and fallback analyzers; maintain backward compat alias
  analyzeKeywordsWithAI,
  analyzeKeywordsWithPatterns,
  analyzeKeywords: analyzeKeywordsWithAI,
  // Export smart truncation for reuse in tailoring
  smartTruncateResume
};

