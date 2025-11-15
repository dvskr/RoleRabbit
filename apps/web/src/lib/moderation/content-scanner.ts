/**
 * Content Moderation Scanner - Section 6.4
 *
 * Automated content moderation for portfolios
 * Scans for prohibited terms, hate speech, violence, illegal content
 */

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  violations: ModerationViolation[];
  score: number; // 0-100, lower is safer
  requiresReview: boolean;
}

export interface ModerationViolation {
  category: ViolationCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matchedTerms: string[];
  context?: string; // Text snippet where violation was found
}

export enum ViolationCategory {
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  ADULT_CONTENT = 'adult_content',
  ILLEGAL_CONTENT = 'illegal_content',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  MISINFORMATION = 'misinformation',
  COPYRIGHT = 'copyright',
  PROFANITY = 'profanity',
}

/**
 * Prohibited terms database
 * In production, load from database or external service
 */
const PROHIBITED_TERMS: Record<ViolationCategory, { terms: string[]; severity: 'low' | 'medium' | 'high' | 'critical' }> = {
  [ViolationCategory.HATE_SPEECH]: {
    severity: 'critical',
    terms: [
      // Placeholder - in production, use comprehensive list
      'hate',
      'racist',
      'bigot',
    ],
  },
  [ViolationCategory.VIOLENCE]: {
    severity: 'high',
    terms: [
      'kill',
      'murder',
      'attack',
      'bomb',
      'weapon',
    ],
  },
  [ViolationCategory.ADULT_CONTENT]: {
    severity: 'high',
    terms: [
      // Placeholder - in production, use comprehensive list
    ],
  },
  [ViolationCategory.ILLEGAL_CONTENT]: {
    severity: 'critical',
    terms: [
      'drugs',
      'cocaine',
      'heroin',
      'counterfeit',
    ],
  },
  [ViolationCategory.SPAM]: {
    severity: 'medium',
    terms: [
      'click here now',
      'buy now',
      'limited time offer',
      'guaranteed income',
    ],
  },
  [ViolationCategory.HARASSMENT]: {
    severity: 'high',
    terms: [
      'stalk',
      'threaten',
      'harass',
    ],
  },
  [ViolationCategory.MISINFORMATION]: {
    severity: 'medium',
    terms: [],
  },
  [ViolationCategory.COPYRIGHT]: {
    severity: 'medium',
    terms: [],
  },
  [ViolationCategory.PROFANITY]: {
    severity: 'low',
    terms: [
      // Placeholder - in production, use comprehensive list
    ],
  },
};

/**
 * Scan text content for prohibited terms
 */
export function scanTextContent(content: string): ModerationResult {
  const violations: ModerationViolation[] = [];
  const contentLower = content.toLowerCase();

  // Scan for each category of prohibited terms
  for (const [category, config] of Object.entries(PROHIBITED_TERMS)) {
    const matchedTerms: string[] = [];

    for (const term of config.terms) {
      if (contentLower.includes(term.toLowerCase())) {
        matchedTerms.push(term);
      }
    }

    if (matchedTerms.length > 0) {
      // Extract context (surrounding text)
      const firstMatch = matchedTerms[0];
      const index = contentLower.indexOf(firstMatch.toLowerCase());
      const context = content.substring(
        Math.max(0, index - 50),
        Math.min(content.length, index + firstMatch.length + 50)
      );

      violations.push({
        category: category as ViolationCategory,
        severity: config.severity,
        matchedTerms,
        context: `...${context}...`,
      });
    }
  }

  // Calculate moderation score (0-100, lower is safer)
  let score = 0;
  for (const violation of violations) {
    switch (violation.severity) {
      case 'critical':
        score += 50;
        break;
      case 'high':
        score += 30;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 5;
        break;
    }
  }
  score = Math.min(100, score);

  // Determine if content is safe
  const safe = violations.length === 0;
  const flagged = score >= 30; // Flag if score >= 30
  const requiresReview = score >= 50 || violations.some(v => v.severity === 'critical');

  return {
    safe,
    flagged,
    violations,
    score,
    requiresReview,
  };
}

/**
 * Scan portfolio content before publishing
 */
export async function scanPortfolioContent(portfolio: {
  title: string;
  subtitle?: string;
  description?: string;
  sections?: Array<{ content?: string; title?: string }>;
}): Promise<ModerationResult> {
  // Combine all text content
  const textParts: string[] = [
    portfolio.title,
    portfolio.subtitle || '',
    portfolio.description || '',
  ];

  if (portfolio.sections) {
    for (const section of portfolio.sections) {
      if (section.title) textParts.push(section.title);
      if (section.content) textParts.push(section.content);
    }
  }

  const combinedText = textParts.join(' ');

  return scanTextContent(combinedText);
}

/**
 * Scan for spam patterns
 */
export function scanForSpam(content: string): boolean {
  const spamPatterns = [
    /click\s+here\s+now/i,
    /buy\s+now/i,
    /limited\s+time\s+offer/i,
    /guaranteed\s+(income|money)/i,
    /\$\d+\s+(per|\/)\s+(day|hour|week)/i,
    /(make|earn)\s+\$\d+/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }

  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 10) {
    return true;
  }

  // Check for excessive capitalization
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.5 && content.length > 50) {
    return true;
  }

  return false;
}

/**
 * Check if content contains personal information (PII)
 * Warn users before publishing
 */
export function checkForPII(content: string): {
  containsPII: boolean;
  types: string[];
} {
  const piiPatterns: Record<string, RegExp> = {
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /\b(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/,
    ipAddress: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
  };

  const types: string[] = [];

  for (const [type, pattern] of Object.entries(piiPatterns)) {
    if (pattern.test(content)) {
      types.push(type);
    }
  }

  return {
    containsPII: types.length > 0,
    types,
  };
}

/**
 * Machine learning-based content classification
 * Placeholder - integrate with OpenAI Moderation API or similar
 */
export async function scanWithML(content: string): Promise<{
  flagged: boolean;
  categories: string[];
  confidence: number;
}> {
  // Placeholder for ML-based moderation
  // In production, integrate with:
  // - OpenAI Moderation API
  // - Google Cloud Natural Language API
  // - AWS Comprehend
  // - Azure Content Moderator

  // Example integration with OpenAI Moderation API:
  /*
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: content }),
  });

  const data = await response.json();
  const result = data.results[0];

  return {
    flagged: result.flagged,
    categories: Object.keys(result.categories).filter(cat => result.categories[cat]),
    confidence: Math.max(...Object.values(result.category_scores)),
  };
  */

  return {
    flagged: false,
    categories: [],
    confidence: 0,
  };
}

/**
 * Get moderation severity level
 */
export function getSeverityLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score === 0) return 'safe';
  if (score < 20) return 'low';
  if (score < 40) return 'medium';
  if (score < 70) return 'high';
  return 'critical';
}

/**
 * Get recommended action based on moderation result
 */
export function getRecommendedAction(result: ModerationResult): {
  action: 'allow' | 'warn' | 'review' | 'block';
  message: string;
} {
  if (result.safe) {
    return {
      action: 'allow',
      message: 'Content passed moderation checks',
    };
  }

  if (result.requiresReview) {
    return {
      action: 'review',
      message: 'Content requires manual review before publishing',
    };
  }

  if (result.score >= 70) {
    return {
      action: 'block',
      message: 'Content violates community guidelines and cannot be published',
    };
  }

  if (result.flagged) {
    return {
      action: 'warn',
      message: 'Content may violate guidelines. Please review before publishing.',
    };
  }

  return {
    action: 'allow',
    message: 'Content passed moderation checks',
  };
}
