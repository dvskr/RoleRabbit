const { generateText } = require('../../utils/openAI');
const logger = require('../../utils/logger');

/**
 * AI-POWERED SKILL EXTRACTION
 * 
 * Uses GPT-4 to extract ALL skills from job descriptions:
 * - Explicit skills (mentioned directly)
 * - Implicit skills (implied by context)
 * - Related technologies (commonly used together)
 * - Experience requirements (years, proficiency level)
 * 
 * This is what makes us WORLD-CLASS!
 */

/**
 * Extract comprehensive skills from job description using AI
 * @param {string} jobDescription - The job posting text
 * @returns {Promise<Object>} Extracted skills and requirements
 */
async function extractSkillsWithAI(jobDescription) {
  logger.info('🤖 AI Skill Extraction: Starting');
  
  const prompt = `You are an expert technical recruiter and ATS system. Analyze this job description and extract ALL skills, technologies, and requirements.

Job Description:
"""
${jobDescription}
"""

Extract and return a JSON object with:
1. **required_skills**: Skills explicitly marked as required/must-have (array of strings)
2. **preferred_skills**: Nice-to-have skills (array of strings)
3. **implicit_skills**: Skills not mentioned but commonly needed for this role (array of strings)
4. **experience_requirements**: For key skills, extract years and proficiency level
5. **role_type**: The primary role category (e.g., "Data Engineer", "Frontend Developer", "Full Stack")
6. **seniority_level**: junior, mid, senior, or staff
7. **industry_context**: Any industry-specific requirements

Rules:
- Include variations and related technologies (e.g., if "React" mentioned, include "JavaScript", "HTML", "CSS")
- Recognize acronyms and expand them (e.g., "ML" → "Machine Learning")
- For data roles, include ETL, databases, cloud platforms even if not explicitly mentioned
- For frontend roles, include responsive design, cross-browser compatibility
- For backend roles, include APIs, databases, security
- Extract numeric requirements (years of experience, team size, scale metrics)
- If a skill family is mentioned (e.g., "cloud platforms"), list specific ones (AWS, Azure, GCP)

Return ONLY valid JSON, no markdown formatting:
{
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill3", "skill4"],
  "implicit_skills": ["skill5", "skill6"],
  "experience_requirements": {
    "skill1": { "years": 5, "level": "expert" },
    "skill2": { "years": 3, "level": "intermediate" }
  },
  "role_type": "Data Engineer",
  "seniority_level": "senior",
  "industry_context": "Financial services, real-time data processing"
}`;

  try {
    const result = await generateText(prompt, {
      model: 'gpt-4o-mini', // Use gpt-4o-mini for cost efficiency
      temperature: 0.1, // Low temperature for consistent, factual extraction
      max_tokens: 2000,
      timeout: 90000 // 90 seconds for skill extraction (handles long job descriptions)
    });
    
    const response = result.text;

    // Parse JSON response
    let extracted;
    try {
      // Remove markdown code blocks if present
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch (parseError) {
      logger.error('❌ AI Skill Extraction: JSON parse failed', { 
        error: parseError.message,
        response: response.substring(0, 500)
      });
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!extracted.required_skills || !Array.isArray(extracted.required_skills)) {
      logger.warn('⚠️  AI Skill Extraction: Invalid structure, using defaults');
      extracted.required_skills = [];
    }

    logger.info('✅ AI Skill Extraction: Success', {
      required_count: extracted.required_skills.length,
      preferred_count: extracted.preferred_skills?.length || 0,
      implicit_count: extracted.implicit_skills?.length || 0,
      role_type: extracted.role_type
    });

    return {
      required_skills: extracted.required_skills || [],
      preferred_skills: extracted.preferred_skills || [],
      implicit_skills: extracted.implicit_skills || [],
      experience_requirements: extracted.experience_requirements || {},
      role_type: extracted.role_type || 'Unknown',
      seniority_level: extracted.seniority_level || 'mid',
      industry_context: extracted.industry_context || '',
      extraction_method: 'ai',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('❌ AI Skill Extraction: Failed', { error: error.message });
    
    // Fallback to basic extraction if AI fails
    logger.info('🔄 Falling back to basic extraction');
    return fallbackSkillExtraction(jobDescription);
  }
}

/**
 * Fallback skill extraction using patterns (if AI fails)
 * @param {string} jobDescription 
 * @returns {Object}
 */
function fallbackSkillExtraction(jobDescription) {
  const text = jobDescription.toLowerCase();
  
  // Common skill patterns
  const commonSkills = [
    'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
    'node.js', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
    'spark', 'kafka', 'airflow', 'terraform', 'jenkins', 'git'
  ];
  
  const found = commonSkills.filter(skill => text.includes(skill));
  
  return {
    required_skills: found,
    preferred_skills: [],
    implicit_skills: [],
    experience_requirements: {},
    role_type: 'Unknown',
    seniority_level: 'mid',
    industry_context: '',
    extraction_method: 'fallback',
    timestamp: new Date().toISOString()
  };
}

/**
 * Semantic skill matching using AI
 * @param {Array<string>} jobSkills - Skills from job description
 * @param {Array<string>} resumeSkills - Skills from resume
 * @param {string} resumeContext - Full resume text for context analysis
 * @returns {Promise<Object>} Matching results with confidence scores
 */
async function semanticSkillMatching(jobSkills, resumeSkills, resumeContext) {
  logger.info('🧠 Semantic Matching: Starting', {
    job_skills: jobSkills.length,
    resume_skills: resumeSkills.length
  });

  const prompt = `You are an expert ATS system that understands technical skills semantically.

Job Requirements:
${JSON.stringify(jobSkills, null, 2)}

Resume Skills:
${JSON.stringify(resumeSkills, null, 2)}

Resume Context (for proficiency analysis):
"""
${resumeContext.substring(0, 3000)}
"""

For each job requirement, determine:
1. **match**: Does the resume have this skill? (true/false)
2. **confidence**: How confident are you? (0.0 to 1.0)
3. **matched_as**: What did it match to in the resume? (if matched)
4. **proficiency**: Analyze context to determine proficiency level (beginner/intermediate/expert)
5. **evidence**: Quote from resume showing the skill (max 100 chars)
6. **reasoning**: Why did you make this decision?

Important matching rules:
- Acronyms match full names (ML = Machine Learning, AWS = Amazon Web Services)
- Related technologies match (PySpark matches Spark, ReactJS matches React)
- Context matters: "Built production system with X" is stronger than "Familiar with X"
- Implied skills count (Frontend Developer → knows HTML/CSS even if not listed)
- Consider recency and scale ("5 years Python" > "1 year Python")

Return ONLY valid JSON:
{
  "matches": [
    {
      "job_skill": "Python",
      "match": true,
      "confidence": 0.98,
      "matched_as": "Python",
      "proficiency": "expert",
      "evidence": "Led team building Python microservices handling 1M requests/day",
      "reasoning": "Explicit mention with production experience and leadership"
    },
    {
      "job_skill": "RAG",
      "match": true,
      "confidence": 0.95,
      "matched_as": "Retrieval Augmented Generation",
      "proficiency": "intermediate",
      "evidence": "Built retrieval augmented generation system for document search",
      "reasoning": "Full form of RAG acronym used, shows implementation experience"
    }
  ],
  "overall_skill_match_rate": 0.85,
  "quality_score": 0.90
}`;

  try {
    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.2, // Slightly higher for nuanced analysis
      max_tokens: 3000,
      timeout: 180000 // 3 minutes for complex semantic matching with large skill lists
    });

    const text = response.text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    logger.info('✅ Semantic Matching: Success', {
      total_matches: result.matches?.filter(m => m.match).length || 0,
      match_rate: result.overall_skill_match_rate
    });

    return result;

  } catch (error) {
    logger.error('❌ Semantic Matching: Failed', { error: error.message });
    
    // Fallback to simple matching
    return fallbackSemanticMatching(jobSkills, resumeSkills);
  }
}

/**
 * Fallback matching if AI fails
 */
function fallbackSemanticMatching(jobSkills, resumeSkills) {
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  
  const matches = jobSkills.map(jobSkill => {
    const jobSkillLower = jobSkill.toLowerCase();
    const match = resumeSkillsLower.some(rs => 
      rs.includes(jobSkillLower) || jobSkillLower.includes(rs)
    );
    
    return {
      job_skill: jobSkill,
      match,
      confidence: match ? 0.7 : 0.0,
      matched_as: match ? jobSkill : null,
      proficiency: 'intermediate',
      evidence: match ? `Resume contains ${jobSkill}` : '',
      reasoning: 'Fallback string matching'
    };
  });
  
  const matchCount = matches.filter(m => m.match).length;
  
  return {
    matches,
    overall_skill_match_rate: jobSkills.length > 0 ? matchCount / jobSkills.length : 0,
    quality_score: 0.7,
    fallback: true
  };
}

/**
 * Analyze skill quality and context
 * @param {string} skill - The skill to analyze
 * @param {string} resumeText - Full resume text
 * @returns {Promise<Object>} Quality analysis
 */
async function analyzeSkillQuality(skill, resumeText) {
  logger.info('📊 Analyzing skill quality', { skill });

  const prompt = `Analyze how "${skill}" is demonstrated in this resume:

Resume:
"""
${resumeText.substring(0, 2000)}
"""

Evaluate:
1. **proficiency_level**: beginner, intermediate, expert, or not_found
2. **years_of_experience**: Estimated years (number or null)
3. **depth_score**: 0-100 based on context quality
4. **evidence_quotes**: Array of relevant quotes (max 3)
5. **context_quality**: Rate the quality of mentions (weak/moderate/strong)
6. **reasoning**: Explain your assessment

Scoring guide:
- "Familiar with X" / "Learning X" → beginner (depth: 20-40)
- "Used X in projects" / "Developed with X" → intermediate (depth: 50-70)
- "Expert in X" / "Led team using X" / "Production scale X" → expert (depth: 80-100)
- Quantified results boost score (e.g., "Optimized X reducing latency by 50%")

Return ONLY valid JSON:
{
  "proficiency_level": "expert",
  "years_of_experience": 5,
  "depth_score": 95,
  "evidence_quotes": [
    "Led team of 5 engineers building Python microservices",
    "Optimized Python data pipeline processing 10TB daily"
  ],
  "context_quality": "strong",
  "reasoning": "Multiple strong indicators: leadership, production scale, quantified impact"
}`;

  try {
    const response = await generateText(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 800,
      timeout: 60000 // 60 seconds for skill quality analysis
    });

    const text = response.text;
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    logger.info('✅ Skill quality analyzed', { 
      skill, 
      proficiency: result.proficiency_level,
      depth: result.depth_score 
    });

    return result;

  } catch (error) {
    // Log as warning instead of error since we have a fallback
    logger.warn('⚠️ Skill quality analysis using fallback', { 
      skill,
      reason: error.message?.includes('timeout') ? 'timeout' : 'api_error'
    });
    
    // Fallback
    return {
      proficiency_level: 'intermediate',
      years_of_experience: null,
      depth_score: 50,
      evidence_quotes: [],
      context_quality: 'moderate',
      reasoning: 'Fallback analysis due to API limitations',
      fallback: true
    };
  }
}

module.exports = {
  extractSkillsWithAI,
  semanticSkillMatching,
  analyzeSkillQuality,
  fallbackSkillExtraction,
  fallbackSemanticMatching
};

