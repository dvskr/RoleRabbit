// CONTEXT ANALYZER
// Analyzes experience level, domain knowledge, and skill depth

const { normalizeText } = require('./skillMatcher');

// ==============================================================================
// EXPERIENCE LEVEL DETECTION
// ==============================================================================

const SENIORITY_INDICATORS = {
  entry: {
    titles: ['junior', 'entry level', 'intern', 'trainee', 'graduate', 'associate'],
    keywords: ['learning', 'recent graduate', 'first job', 'entry position'],
    yearsRange: [0, 2],
    score: 1
  },
  junior: {
    titles: ['junior', 'jr', 'jr.', 'associate'],
    keywords: ['developing skills', 'gaining experience', 'supporting'],
    yearsRange: [0, 3],
    score: 2
  },
  mid: {
    titles: ['developer', 'engineer', 'analyst', 'specialist', 'consultant'],
    keywords: ['implemented', 'developed', 'built', 'designed', 'managed'],
    yearsRange: [2, 5],
    score: 3
  },
  senior: {
    titles: ['senior', 'sr', 'sr.', 'lead', 'principal', 'staff'],
    keywords: ['led', 'architected', 'mentored', 'guided', 'designed systems', 'optimized'],
    yearsRange: [5, 10],
    score: 4
  },
  lead: {
    titles: ['lead', 'principal', 'staff', 'architect', 'engineering manager', 'tech lead'],
    keywords: ['leadership', 'team management', 'architecture', 'strategy', 'mentoring', 'established'],
    yearsRange: [7, 15],
    score: 5
  },
  executive: {
    titles: ['director', 'vp', 'vice president', 'cto', 'chief', 'head of'],
    keywords: ['strategic', 'organization-wide', 'executive', 'leadership team'],
    yearsRange: [10, 99],
    score: 6
  }
};

/**
 * Extract years of experience from resume
 */
function extractYearsOfExperience(resume) {
  let totalYears = 0;
  
  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience.forEach(exp => {
      if (exp.duration) {
        const years = parseYearsFromDuration(exp.duration);
        totalYears += years;
      }
    });
  }
  
  // Also check for explicit mentions in summary
  const summaryText = resume.summary || '';
  const yearMatches = summaryText.match(/(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp)/i);
  if (yearMatches) {
    const mentionedYears = parseInt(yearMatches[1]);
    totalYears = Math.max(totalYears, mentionedYears);
  }
  
  return totalYears;
}

/**
 * Parse years from duration string (e.g., "2020-Present", "2018-2020")
 */
function parseYearsFromDuration(duration) {
  const normalized = duration.toLowerCase();
  
  // Handle "X years" format
  const yearMatch = normalized.match(/(\d+)\s*(years?|yrs?)/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  // Handle date range format
  const dateRange = normalized.match(/(\d{4})\s*[-–—to]+\s*(\d{4}|present|current)/);
  if (dateRange) {
    const startYear = parseInt(dateRange[1]);
    const endYear = dateRange[2].match(/\d{4}/) 
      ? parseInt(dateRange[2]) 
      : new Date().getFullYear();
    return Math.max(0, endYear - startYear);
  }
  
  return 0;
}

/**
 * Detect seniority level from resume
 */
function detectSeniorityLevel(resume) {
  const scores = {
    entry: 0,
    junior: 0,
    mid: 0,
    senior: 0,
    lead: 0,
    executive: 0
  };
  
  const resumeText = normalizeText(JSON.stringify(resume));
  const totalYears = extractYearsOfExperience(resume);
  
  // Analyze each seniority level
  Object.entries(SENIORITY_INDICATORS).forEach(([level, indicators]) => {
    let score = 0;
    
    // Check titles
    indicators.titles.forEach(title => {
      if (resumeText.includes(title)) {
        score += 2;
      }
    });
    
    // Check keywords
    indicators.keywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        score += 0.5;
      }
    });
    
    // Check years of experience
    const [minYears, maxYears] = indicators.yearsRange;
    if (totalYears >= minYears && totalYears <= maxYears) {
      score += 3;
    } else if (totalYears >= minYears) {
      score += 1; // Partial credit if over minimum
    }
    
    scores[level] = score;
  });
  
  // Find highest scoring level
  const detectedLevel = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    level: detectedLevel[0],
    confidence: Math.min(detectedLevel[1] / 10, 1), // Normalize to 0-1
    yearsExperience: totalYears,
    scores,
    numericScore: SENIORITY_INDICATORS[detectedLevel[0]].score
  };
}

/**
 * Compare resume seniority with required seniority
 */
function compareSeniority(resumeSeniority, requiredText) {
  const requiredNormalized = normalizeText(requiredText);
  
  // Detect required level
  let requiredLevel = 'mid'; // default
  let requiredYears = 3; // default
  
  Object.entries(SENIORITY_INDICATORS).forEach(([level, indicators]) => {
    indicators.titles.forEach(title => {
      if (requiredNormalized.includes(title)) {
        requiredLevel = level;
        requiredYears = indicators.yearsRange[0];
      }
    });
  });
  
  // Extract required years from text
  const yearMatch = requiredText.match(/(\d+)\+?\s*(years?|yrs?)/i);
  if (yearMatch) {
    requiredYears = parseInt(yearMatch[1]);
  }
  
  const resumeLevel = resumeSeniority.numericScore;
  const requiredScore = SENIORITY_INDICATORS[requiredLevel].score;
  
  // Calculate match
  const levelMatch = resumeLevel >= requiredScore;
  const yearsMatch = resumeSeniority.yearsExperience >= requiredYears;
  
  let matchScore = 0;
  if (levelMatch && yearsMatch) {
    matchScore = 1.0; // Perfect match
  } else if (resumeLevel === requiredScore - 1 && resumeSeniority.yearsExperience >= requiredYears * 0.75) {
    matchScore = 0.8; // Close match (one level below)
  } else if (resumeLevel < requiredScore - 1) {
    matchScore = 0.3; // Significantly under-qualified
  } else if (resumeLevel > requiredScore + 1) {
    matchScore = 0.9; // Over-qualified (slightly penalized)
  }
  
  return {
    match: matchScore >= 0.7,
    score: matchScore,
    resumeLevel: resumeSeniority.level,
    requiredLevel,
    resumeYears: resumeSeniority.yearsExperience,
    requiredYears,
    gap: requiredScore - resumeLevel
  };
}

// ==============================================================================
// DOMAIN KNOWLEDGE DETECTION
// ==============================================================================

const DOMAIN_INDICATORS = {
  healthcare: {
    keywords: ['hipaa', 'ehr', 'electronic health records', 'medical', 'patient', 'healthcare', 
               'clinical', 'hospital', 'pharmacy', 'health insurance', 'medical devices',
               'telemedicine', 'healthcare it', 'health tech', 'fhir', 'hl7'],
    strongIndicators: ['hipaa compliance', 'ehr system', 'patient data', 'clinical workflow'],
    score: 1
  },
  fintech: {
    keywords: ['payment', 'banking', 'financial', 'trading', 'pci dss', 'pci compliance',
               'transaction', 'cryptocurrency', 'blockchain', 'wallet', 'stripe', 'paypal',
               'payment gateway', 'financial services', 'investment', 'lending', 'insurance'],
    strongIndicators: ['pci compliance', 'payment processing', 'financial transactions', 'trading platform'],
    score: 1
  },
  ecommerce: {
    keywords: ['ecommerce', 'e-commerce', 'online store', 'shopping cart', 'checkout',
               'product catalog', 'inventory', 'order management', 'shopify', 'magento',
               'woocommerce', 'retail', 'marketplace'],
    strongIndicators: ['shopping cart', 'order fulfillment', 'product catalog', 'payment integration'],
    score: 1
  },
  gaming: {
    keywords: ['game', 'gaming', 'unity', 'unreal', 'game engine', 'multiplayer',
               'game design', 'game development', '3d', 'graphics', 'rendering',
               'gameplay', 'game mechanics'],
    strongIndicators: ['game development', 'unity', 'unreal engine', 'game mechanics'],
    score: 1
  },
  edtech: {
    keywords: ['education', 'learning', 'lms', 'learning management system', 'course',
               'student', 'teacher', 'classroom', 'training', 'elearning', 'e-learning',
               'educational', 'academic'],
    strongIndicators: ['lms', 'educational platform', 'learning management', 'course management'],
    score: 1
  },
  iot: {
    keywords: ['iot', 'internet of things', 'embedded', 'sensors', 'devices', 'mqtt',
               'edge computing', 'firmware', 'hardware', 'raspberry pi', 'arduino',
               'smart devices', 'connected devices'],
    strongIndicators: ['iot platform', 'embedded systems', 'sensor data', 'device management'],
    score: 1
  },
  saas: {
    keywords: ['saas', 'software as a service', 'b2b', 'b2c', 'multi-tenant',
               'subscription', 'cloud platform', 'api platform'],
    strongIndicators: ['saas platform', 'multi-tenant', 'subscription model'],
    score: 1
  },
  enterprise: {
    keywords: ['enterprise', 'erp', 'crm', 'enterprise software', 'salesforce',
               'sap', 'oracle', 'large scale', 'corporate'],
    strongIndicators: ['enterprise software', 'erp system', 'crm platform'],
    score: 1
  }
};

/**
 * Detect domain knowledge from resume
 */
function detectDomain(resume) {
  const resumeText = normalizeText(JSON.stringify(resume));
  const domains = {};
  
  Object.entries(DOMAIN_INDICATORS).forEach(([domain, indicators]) => {
    let score = 0;
    let matchedKeywords = [];
    let strongMatches = [];
    
    // Check keywords
    indicators.keywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    });
    
    // Check strong indicators (worth more)
    indicators.strongIndicators.forEach(indicator => {
      if (resumeText.includes(indicator.toLowerCase())) {
        score += 3;
        strongMatches.push(indicator);
      }
    });
    
    if (score > 0) {
      domains[domain] = {
        score,
        confidence: Math.min(score / 10, 1),
        matchedKeywords,
        strongMatches
      };
    }
  });
  
  // Sort by score
  const sortedDomains = Object.entries(domains)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([domain, data]) => ({ domain, ...data }));
  
  return {
    primary: sortedDomains[0] || null,
    all: sortedDomains,
    hasDomainExperience: sortedDomains.length > 0
  };
}

/**
 * Check if resume domain matches required domain
 */
function matchDomain(resumeDomains, requiredText) {
  const requiredNormalized = normalizeText(requiredText);
  
  // Check if any domains are explicitly mentioned in requirements
  const requiredDomains = [];
  Object.keys(DOMAIN_INDICATORS).forEach(domain => {
    if (requiredNormalized.includes(domain)) {
      requiredDomains.push(domain);
    }
  });
  
  if (requiredDomains.length === 0) {
    return { match: true, score: 1.0, reason: 'No specific domain required' };
  }
  
  // Check if resume has any of the required domains
  const resumeDomainNames = resumeDomains.all.map(d => d.domain);
  const matchedDomains = requiredDomains.filter(rd => 
    resumeDomainNames.includes(rd)
  );
  
  if (matchedDomains.length > 0) {
    const matchScore = matchedDomains.length / requiredDomains.length;
    return {
      match: true,
      score: matchScore,
      matchedDomains,
      reason: `Matched ${matchedDomains.length} of ${requiredDomains.length} required domains`
    };
  }
  
  return {
    match: false,
    score: 0.5, // Partial credit for having ANY domain experience
    reason: 'Different domain experience',
    required: requiredDomains,
    has: resumeDomainNames
  };
}

// ==============================================================================
// SKILL DEPTH ANALYSIS
// ==============================================================================

/**
 * Analyze depth of experience with a specific skill
 */
function analyzeSkillDepth(resume, skill) {
  const resumeText = normalizeText(JSON.stringify(resume));
  const skillNorm = normalizeText(skill);
  
  // Count mentions
  const mentions = (resumeText.match(new RegExp(skillNorm, 'g')) || []).length;
  
  // Analyze context quality (are they using it in meaningful ways?)
  const qualityIndicators = {
    strong: ['built', 'developed', 'architected', 'designed', 'led', 'implemented', 'optimized', 'scaled'],
    medium: ['worked with', 'used', 'utilized', 'familiar with'],
    weak: ['exposure', 'basic knowledge', 'learning', 'studied']
  };
  
  let contextScore = 0;
  const experience = resume.experience || [];
  
  experience.forEach(exp => {
    const expText = normalizeText(exp.description || '');
    if (expText.includes(skillNorm)) {
      // Check for strong indicators
      qualityIndicators.strong.forEach(indicator => {
        if (expText.includes(indicator)) {
          contextScore += 3;
        }
      });
      
      // Check for medium indicators
      qualityIndicators.medium.forEach(indicator => {
        if (expText.includes(indicator)) {
          contextScore += 1.5;
        }
      });
      
      // Check for weak indicators (negative signal)
      qualityIndicators.weak.forEach(indicator => {
        if (expText.includes(indicator)) {
          contextScore += 0.5;
        }
      });
    }
  });
  
  // Count projects/experiences using the skill
  const projectCount = experience.filter(exp => {
    const expText = normalizeText(exp.description || '');
    return expText.includes(skillNorm);
  }).length;
  
  // Classify depth
  let depth = 'superficial';
  let depthScore = 0;
  
  if (mentions >= 10 && contextScore >= 8 && projectCount >= 3) {
    depth = 'expert';
    depthScore = 1.0;
  } else if (mentions >= 5 && contextScore >= 4 && projectCount >= 2) {
    depth = 'experienced';
    depthScore = 0.8;
  } else if (mentions >= 2 && contextScore >= 1.5) {
    depth = 'basic';
    depthScore = 0.5;
  } else {
    depth = 'superficial';
    depthScore = 0.2;
  }
  
  return {
    skill,
    depth,
    depthScore,
    mentions,
    contextScore,
    projectCount,
    isKeywordStuffing: mentions >= 5 && contextScore < 2 // Many mentions, weak context
  };
}

/**
 * Detect keyword stuffing (many skills listed but little evidence of use)
 */
function detectKeywordStuffing(resume) {
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  
  if (skills.length === 0) {
    return { isStuffing: false, confidence: 0 };
  }
  
  // Analyze each skill
  const depthAnalyses = skills.slice(0, 15).map(skill => analyzeSkillDepth(resume, skill)); // Sample first 15
  
  // Count superficial skills
  const superficialCount = depthAnalyses.filter(a => a.depth === 'superficial').length;
  const totalAnalyzed = depthAnalyses.length;
  
  // If > 70% of skills are superficial, likely keyword stuffing
  const stuffingRatio = superficialCount / totalAnalyzed;
  
  return {
    isStuffing: stuffingRatio > 0.7,
    confidence: stuffingRatio,
    superficialSkills: superficialCount,
    totalSkills: skills.length,
    analyzed: depthAnalyses
  };
}

module.exports = {
  detectSeniorityLevel,
  compareSeniority,
  extractYearsOfExperience,
  detectDomain,
  matchDomain,
  analyzeSkillDepth,
  detectKeywordStuffing,
  SENIORITY_INDICATORS,
  DOMAIN_INDICATORS
};

