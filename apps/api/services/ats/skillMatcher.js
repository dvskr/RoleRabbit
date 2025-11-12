// INTELLIGENT SKILL MATCHER
// Uses technology taxonomy for semantic skill matching

// Use comprehensive taxonomy with 950+ technologies (and growing to 1600+)
const { ALL_TECHNOLOGIES: TECHNOLOGY_TAXONOMY, CATEGORY_CONCEPTS } = require('./allTaxonomies');

/**
 * Match Types and their scoring weights
 */
const MATCH_TYPES = {
  EXACT: { score: 1.0, label: 'Exact Match' },
  SYNONYM: { score: 0.95, label: 'Synonym' },
  EQUIVALENT: { score: 0.85, label: 'Equivalent Technology' },
  IMPLEMENTATION: { score: 0.9, label: 'Implementation' },  // e.g., Kubernetes implements "container orchestration"
  RELATED: { score: 0.7, label: 'Related Technology' },
  CATEGORY: { score: 0.5, label: 'Same Category' },
  PARTIAL: { score: 0.3, label: 'Partial Match' }
};

/**
 * Normalize text for matching
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')  // Keep +, #, . for tech names (C++, C#, Node.js)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract skill keywords from text
 * Returns array of normalized skill terms
 */
function extractSkills(text) {
  const normalized = normalizeText(text);
  const skills = new Set();
  
  // Extract from taxonomy (technologies)
  Object.keys(TECHNOLOGY_TAXONOMY).forEach(tech => {
    const techData = TECHNOLOGY_TAXONOMY[tech];
    
    // Check canonical name
    if (normalized.includes(tech)) {
      skills.add(tech);
    }
    
    // Check synonyms
    techData.synonyms?.forEach(syn => {
      if (normalized.includes(syn.toLowerCase())) {
        skills.add(tech);  // Add canonical name
      }
    });
  });
  
  // Extract multi-word technologies (e.g., "machine learning", "cloud computing")
  const multiWordPatterns = [
    /machine\s+learning/i,
    /deep\s+learning/i,
    /artificial\s+intelligence/i,
    /data\s+science/i,
    /cloud\s+computing/i,
    /container\s+orchestration/i,
    /infrastructure\s+as\s+code/i,
    /continuous\s+integration/i,
    /continuous\s+deployment/i
  ];
  
  multiWordPatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      skills.add(normalizeText(match[0]));
    }
  });
  
  return Array.from(skills);
}

/**
 * Find how a skill in resume matches a required skill
 * Returns: { matched: boolean, type: string, score: number, details: {} }
 */
function matchSkill(requiredSkill, resumeText) {
  const normalizedRequired = normalizeText(requiredSkill);
  const normalizedResume = normalizeText(resumeText);
  
  // 1. EXACT MATCH
  if (normalizedResume.includes(normalizedRequired)) {
    return {
      matched: true,
      type: 'EXACT',
      score: MATCH_TYPES.EXACT.score,
      label: MATCH_TYPES.EXACT.label,
      details: { requiredSkill, foundIn: 'text' }
    };
  }
  
  // 2. Look up in taxonomy
  const techData = TECHNOLOGY_TAXONOMY[normalizedRequired];
  
  if (techData) {
    // 2a. SYNONYM MATCH
    for (const syn of techData.synonyms || []) {
      if (normalizedResume.includes(syn.toLowerCase())) {
        return {
          matched: true,
          type: 'SYNONYM',
          score: MATCH_TYPES.SYNONYM.score,
          label: MATCH_TYPES.SYNONYM.label,
          details: { requiredSkill, synonym: syn, foundIn: 'text' }
        };
      }
    }
    
    // 2b. EQUIVALENT MATCH (e.g., Vue for React)
    for (const equiv of techData.equivalents || []) {
      if (normalizedResume.includes(equiv)) {
        return {
          matched: true,
          type: 'EQUIVALENT',
          score: MATCH_TYPES.EQUIVALENT.score,
          label: MATCH_TYPES.EQUIVALENT.label,
          details: { requiredSkill, equivalent: equiv, foundIn: 'text' }
        };
      }
    }
    
    // 2c. RELATED MATCH (lower score)
    for (const related of techData.related || []) {
      if (normalizedResume.includes(related.toLowerCase())) {
        return {
          matched: true,
          type: 'RELATED',
          score: MATCH_TYPES.RELATED.score,
          label: MATCH_TYPES.RELATED.label,
          details: { requiredSkill, related, foundIn: 'text' }
        };
      }
    }
    
    // 2d. CATEGORY MATCH (weakest)
    const category = techData.category;
    const categoryConcepts = CATEGORY_CONCEPTS[category] || [];
    for (const concept of categoryConcepts) {
      if (normalizedResume.includes(concept)) {
        return {
          matched: true,
          type: 'CATEGORY',
          score: MATCH_TYPES.CATEGORY.score,
          label: MATCH_TYPES.CATEGORY.label,
          details: { requiredSkill, category, concept, foundIn: 'text' }
        };
      }
    }
  }
  
  // 3. Check if required skill is a CONCEPT (e.g., "container orchestration")
  // and resume has an IMPLEMENTATION (e.g., "Kubernetes")
  Object.entries(TECHNOLOGY_TAXONOMY).forEach(([tech, data]) => {
    if (data.implementations && data.implementations.length > 0) {
      // This tech is a concept
      if (normalizeText(tech) === normalizedRequired || 
          data.synonyms?.some(syn => normalizeText(syn) === normalizedRequired)) {
        // Check if resume has any implementations
        for (const impl of data.implementations) {
          if (normalizedResume.includes(impl)) {
            return {
              matched: true,
              type: 'IMPLEMENTATION',
              score: MATCH_TYPES.IMPLEMENTATION.score,
              label: MATCH_TYPES.IMPLEMENTATION.label,
              details: { requiredConcept: requiredSkill, implementation: impl }
            };
          }
        }
      }
    }
  });
  
  // 4. PARTIAL MATCH (substring)
  const words = normalizedRequired.split(' ');
  if (words.length > 1) {
    const matchedWords = words.filter(word => 
      word.length > 2 && normalizedResume.includes(word)
    );
    if (matchedWords.length > 0) {
      const partialScore = (matchedWords.length / words.length) * MATCH_TYPES.PARTIAL.score;
      return {
        matched: true,
        type: 'PARTIAL',
        score: partialScore,
        label: MATCH_TYPES.PARTIAL.label,
        details: { requiredSkill, matchedWords: matchedWords.length, totalWords: words.length }
      };
    }
  }
  
  // 5. NO MATCH
  return {
    matched: false,
    type: 'NONE',
    score: 0,
    label: 'Not Found',
    details: { requiredSkill }
  };
}

/**
 * Match all required skills against resume
 * Returns comprehensive matching analysis
 */
function matchAllSkills(requiredSkills, resumeText) {
  const matches = [];
  let totalScore = 0;
  let maxPossibleScore = requiredSkills.length;
  
  requiredSkills.forEach(skill => {
    const match = matchSkill(skill, resumeText);
    matches.push(match);
    totalScore += match.score;
  });
  
  // Calculate statistics
  const exactMatches = matches.filter(m => m.type === 'EXACT').length;
  const synonymMatches = matches.filter(m => m.type === 'SYNONYM').length;
  const equivalentMatches = matches.filter(m => m.type === 'EQUIVALENT').length;
  const implementationMatches = matches.filter(m => m.type === 'IMPLEMENTATION').length;
  const relatedMatches = matches.filter(m => m.type === 'RELATED').length;
  const categoryMatches = matches.filter(m => m.type === 'CATEGORY').length;
  const partialMatches = matches.filter(m => m.type === 'PARTIAL').length;
  const noMatches = matches.filter(m => !m.matched).length;
  
  // Overall match percentage (weighted)
  const matchPercentage = maxPossibleScore > 0 
    ? (totalScore / maxPossibleScore) * 100 
    : 0;
  
  // Quality score (exact and synonym matches are highest quality)
  const qualityScore = maxPossibleScore > 0
    ? ((exactMatches + synonymMatches * 0.95 + equivalentMatches * 0.85) / maxPossibleScore) * 100
    : 0;
  
  return {
    matches,
    statistics: {
      total: requiredSkills.length,
      matched: matches.filter(m => m.matched).length,
      exactMatches,
      synonymMatches,
      equivalentMatches,
      implementationMatches,
      relatedMatches,
      categoryMatches,
      partialMatches,
      noMatches,
      matchPercentage: Math.round(matchPercentage * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10
    },
    scores: {
      total: totalScore,
      maxPossible: maxPossibleScore,
      weighted: matchPercentage
    }
  };
}

/**
 * Get missing skills (not found or weakly matched)
 */
function getMissingSkills(matchResults) {
  return matchResults.matches
    .filter(m => !m.matched || m.score < 0.5)
    .map(m => m.details.requiredSkill);
}

/**
 * Get matched skills (all types)
 */
function getMatchedSkills(matchResults) {
  return matchResults.matches
    .filter(m => m.matched)
    .map(m => ({
      skill: m.details.requiredSkill,
      type: m.label,
      score: m.score,
      details: m.details
    }));
}

/**
 * Generate human-readable explanation
 */
function generateMatchExplanation(matchResults) {
  const stats = matchResults.statistics;
  const explanations = [];
  
  if (stats.exactMatches > 0) {
    explanations.push(`${stats.exactMatches} exact skill match${stats.exactMatches > 1 ? 'es' : ''}`);
  }
  if (stats.synonymMatches > 0) {
    explanations.push(`${stats.synonymMatches} synonym match${stats.synonymMatches > 1 ? 'es' : ''}`);
  }
  if (stats.equivalentMatches > 0) {
    explanations.push(`${stats.equivalentMatches} equivalent technolog${stats.equivalentMatches > 1 ? 'ies' : 'y'}`);
  }
  if (stats.implementationMatches > 0) {
    explanations.push(`${stats.implementationMatches} implementation${stats.implementationMatches > 1 ? 's' : ''} of required concepts`);
  }
  if (stats.relatedMatches > 0) {
    explanations.push(`${stats.relatedMatches} related skill${stats.relatedMatches > 1 ? 's' : ''}`);
  }
  if (stats.noMatches > 0) {
    explanations.push(`${stats.noMatches} skill${stats.noMatches > 1 ? 's' : ''} not found`);
  }
  
  return explanations.join(', ');
}

module.exports = {
  extractSkills,
  matchSkill,
  matchAllSkills,
  getMissingSkills,
  getMatchedSkills,
  generateMatchExplanation,
  MATCH_TYPES,
  normalizeText
};

