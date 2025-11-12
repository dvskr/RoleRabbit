/**
 * Prompt Compression Service
 * Reduces token usage while preserving semantic meaning
 * Target: 30-50% reduction in prompt tokens
 */

const logger = require('../../utils/logger');

// Token-efficient instruction templates
const COMPRESSED_INSTRUCTIONS = {
  TAILOR_RULES: `Rules: No fabrication. Preserve facts. Enhance truthfully. ${tone => `Use ${tone} tone.`} Metrics when present. JSONPath diffs.`,
  
  GENERATE_RULES: `Rules: No invention. Rewrite factually. ${tone => `${tone} tone.`} Keep accomplishments. Warn if uncertain. Action verbs + metrics.`,
  
  JSON_SCHEMA_TAILOR: `Return JSON: {mode,tailoredResume,diff:[{path,before,after,confidence}],recommendedKeywords,warnings,confidence,estimatedScoreImprovement}`,
  
  JSON_SCHEMA_GENERATE: `Return JSON: {rewrittenContent,keyPointsAdded,confidence,warnings}`,
};

/**
 * Compress whitespace and newlines intelligently
 * Preserves structure but removes excess spacing
 */
function compressWhitespace(text) {
  return text
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    // Remove spaces around newlines
    .replace(/ *\n */g, '\n')
    // Reduce multiple newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing/leading whitespace per line
    .split('\n').map(line => line.trim()).join('\n')
    .trim();
}

/**
 * Compress JSON by removing unnecessary whitespace
 * While keeping it parseable
 */
function compressJSON(jsonString) {
  try {
    const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    return JSON.stringify(obj); // Compact form, no pretty-printing
  } catch (error) {
    // If not valid JSON, just compress whitespace
    return compressWhitespace(jsonString);
  }
}

/**
 * Abbreviate common resume terms to save tokens
 */
function abbreviateResumeTerms(text) {
  const abbreviations = {
    'experience': 'exp',
    'Experience': 'Exp',
    'responsibilities': 'resp',
    'Responsibilities': 'Resp',
    'achievements': 'achv',
    'Achievements': 'Achv',
    'professional': 'prof',
    'Professional': 'Prof',
    'technical skills': 'tech',
    'Technical Skills': 'Tech',
    'education': 'edu',
    'Education': 'Edu',
    'certifications': 'certs',
    'Certifications': 'Certs',
    'projects': 'projs',
    'Projects': 'Projs',
  };

  let compressed = text;
  for (const [full, abbr] of Object.entries(abbreviations)) {
    // Only abbreviate in metadata/labels, not in actual content
    compressed = compressed.replace(new RegExp(`\\b${full}\\b(?=:)`, 'g'), abbr);
  }
  return compressed;
}

/**
 * Compress ATS target guidance section
 * Reduces verbose formatting while keeping key info
 */
function compressATSGuidance({ atsAnalysis, targetScore, mode, currentScore, improvement, missingKeywords }) {
  if (!atsAnalysis || !targetScore) return '';

  const keywords = (missingKeywords || []).slice(0, 10).join(', ');
  
  if (mode === 'FULL') {
    return `Target: ${currentScore}→${targetScore} (+${improvement}pts). Missing: ${keywords}. Full rewrite: max ATS alignment, add metrics, power verbs, expand scope.`;
  } else {
    return `Target: ${currentScore}→${targetScore} (+${improvement}pts). Missing: ${keywords}. Partial: add keywords naturally, improve phrasing, +30-40pts min.`;
  }
}

/**
 * Compress verbose rule lists into concise bullet points
 */
function compressRules(rules) {
  return rules
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.replace(/^-\s*/, ''))
    .join('; ')
    .replace(/\.\s*;/g, ';')
    .replace(/;$/, '.');
}

/**
 * Compress tailoring prompt while preserving all critical information
 */
function compressTailorPrompt({
  resumeSnapshot,
  jobDescription,
  mode = 'PARTIAL',
  tone = 'professional',
  length = 'thorough',
  atsAnalysis = null,
  targetScore = null
}) {
  const currentScore = atsAnalysis?.overall || 0;
  const improvement = targetScore ? targetScore - currentScore : 0;
  const missingKeywords = atsAnalysis?.missingKeywords || [];

  // Compress ATS guidance
  const guidance = atsAnalysis && targetScore
    ? compressATSGuidance({
        atsAnalysis,
        targetScore,
        mode,
        currentScore,
        improvement,
        missingKeywords
      })
    : '';

  // Compress resume and job description
  const compressedResume = typeof resumeSnapshot === 'string' 
    ? compressJSON(resumeSnapshot)
    : JSON.stringify(resumeSnapshot);
  
  const compressedJD = typeof jobDescription === 'string'
    ? compressWhitespace(jobDescription.substring(0, 6000)) // Reduced from 8000
    : JSON.stringify(jobDescription).substring(0, 6000);

  // Build compressed prompt
  const prompt = `Elite resume strategist. Tailor resume to job.

${guidance ? `🎯 ${guidance}\n` : ''}
Schema: {mode:"PARTIAL"|"FULL",tailoredResume:<JSON>,diff:[{path,before,after,confidence}],recommendedKeywords,warnings,confidence,estimatedScoreImprovement}

Rules: No fabrication. Preserve structure. ${tone} tone. ${length} length. Metrics when present. JSONPath diffs.${targetScore ? ` Target: ${targetScore}/100.` : ''}${missingKeywords.length > 0 ? ` Keywords: ${missingKeywords.slice(0, 8).join(', ')}.` : ''}

Resume: ${compressedResume}
Job: ${compressedJD}
Mode: ${mode}`;

  return compressWhitespace(prompt);
}

/**
 * Compress generate content prompt
 */
function compressGeneratePrompt({
  sectionType,
  sectionPath,
  currentContent,
  resumeSnapshot,
  jobContext,
  tone = 'professional',
  length = 'thorough',
  instructions
}) {
  const compressedCurrent = typeof currentContent === 'string'
    ? compressWhitespace(currentContent)
    : JSON.stringify(currentContent);
  
  const compressedResume = typeof resumeSnapshot === 'string'
    ? compressJSON(resumeSnapshot)
    : JSON.stringify(resumeSnapshot);

  const compressedJob = jobContext
    ? (typeof jobContext === 'string' ? compressWhitespace(jobContext) : JSON.stringify(jobContext))
    : '';

  const prompt = `Expert resume writer. Revise section factually.

Schema: {rewrittenContent,keyPointsAdded,confidence,warnings}

Rules: No invention. ${tone} tone. ${length} length. Keep accomplishments. Warn if uncertain. Action verbs + metrics.

Type: ${sectionType}
Path: ${sectionPath}
Current: ${compressedCurrent}
Resume: ${compressedResume}${compressedJob ? `\nJob: ${compressedJob}` : ''}${instructions ? `\nNotes: ${compressWhitespace(instructions)}` : ''}`;

  return compressWhitespace(prompt);
}

/**
 * Estimate token count (rough approximation)
 * ~4 characters per token on average
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate compression ratio and savings
 */
function calculateCompressionStats(original, compressed) {
  const originalTokens = estimateTokens(original);
  const compressedTokens = estimateTokens(compressed);
  const savedTokens = originalTokens - compressedTokens;
  const compressionRatio = ((savedTokens / originalTokens) * 100).toFixed(1);

  return {
    originalLength: original.length,
    compressedLength: compressed.length,
    originalTokens,
    compressedTokens,
    savedTokens,
    compressionRatio: `${compressionRatio}%`,
    costSavings: calculateCostSavings(savedTokens)
  };
}

/**
 * Calculate cost savings based on token reduction
 * gpt-4o-mini: $0.150 per 1M input tokens
 * gpt-4o: $2.50 per 1M input tokens
 */
function calculateCostSavings(savedTokens, model = 'gpt-4o-mini') {
  const rates = {
    'gpt-4o-mini': 0.00000015,
    'gpt-4o': 0.0000025
  };
  
  const rate = rates[model] || rates['gpt-4o-mini'];
  const savings = savedTokens * rate;
  
  return {
    perRequest: savings,
    per1000Requests: savings * 1000,
    per100kRequests: savings * 100000,
    perMonth: savings * 50000, // Assuming 50k requests/month
    perYear: savings * 600000  // Assuming 600k requests/year
  };
}

/**
 * Main compression function with logging
 */
function compressPrompt(type, params, options = {}) {
  const { enableCompression = true, logStats = false } = options;

  if (!enableCompression) {
    // Return original prompt builder logic
    return null; // Caller should use original
  }

  let original, compressed;

  try {
    switch (type) {
      case 'tailor':
        // Build original for comparison
        if (logStats) {
          original = buildOriginalTailorPrompt(params);
        }
        compressed = compressTailorPrompt(params);
        break;

      case 'generate':
        if (logStats) {
          original = buildOriginalGeneratePrompt(params);
        }
        compressed = compressGeneratePrompt(params);
        break;

      default:
        throw new Error(`Unknown prompt type: ${type}`);
    }

    if (logStats && original) {
      const stats = calculateCompressionStats(original, compressed);
      logger.info('Prompt compression stats', {
        type,
        ...stats
      });
    }

    return compressed;
  } catch (error) {
    logger.error('Prompt compression failed, using original', { type, error: error.message });
    return null; // Caller should use original
  }
}

// Helper functions to build original prompts (for comparison)
function buildOriginalTailorPrompt(params) {
  const { resumeSnapshot, jobDescription, mode, tone, length, atsAnalysis, targetScore } = params;
  
  // Simplified version of original verbose prompt
  return `You are an elite resume strategist responsible for tailoring resumes to a provided job description.

${atsAnalysis && targetScore ? buildVerboseATSGuidance(params) : ''}

Return ONLY valid JSON with the schema:
{
  "mode": "PARTIAL" | "FULL",
  "tailoredResume": <ResumeJson>,
  "diff": Array<{ "path": string, "before": any, "after": any, "confidence": number }>,
  "recommendedKeywords": string[],
  "warnings": string[],
  "confidence": number (0-1),
  "estimatedScoreImprovement": number
}

Rules:
- The resume JSON must follow the structure of the provided base resume
- Never fabricate companies, dates, achievements, titles, or technologies
- Only adjust content that improves alignment with the job description
- Use ${tone} tone across updated sections
- Highlight metrics wherever possible
- Diff entries must list JSONPath style paths

Base Resume: ${JSON.stringify(resumeSnapshot)}
Job Description: ${jobDescription}
Mode: ${mode}`;
}

function buildOriginalGeneratePrompt(params) {
  const { sectionType, sectionPath, currentContent, resumeSnapshot, jobContext, tone, length, instructions } = params;
  
  return `You are an expert resume writing assistant. Revise the provided resume section while preserving factual accuracy.

Return ONLY valid JSON with the schema:
{
  "rewrittenContent": string | string[],
  "keyPointsAdded": string[],
  "confidence": number (0-1),
  "warnings": string[]
}

Rules:
- Do not invent companies, dates, tools, or achievements
- Rewrite using ${tone} tone
- ${length} content
- Preserve critical accomplishments and metrics
- If unsure, leave unchanged and warn
- Use action verbs and metrics

Section Type: ${sectionType}
Section Path: ${sectionPath}
Current Content: ${JSON.stringify(currentContent)}
Full Resume: ${JSON.stringify(resumeSnapshot)}${jobContext ? `\nJob Context: ${jobContext}` : ''}${instructions ? `\nInstructions: ${instructions}` : ''}`;
}

function buildVerboseATSGuidance(params) {
  const { atsAnalysis, targetScore, mode } = params;
  const currentScore = atsAnalysis.overall || 0;
  const improvement = targetScore - currentScore;
  const keywords = (atsAnalysis.missingKeywords || []).slice(0, 10);

  return `
🎯 PERFORMANCE TARGET:
- Current ATS Score: ${currentScore}/100
- Target Score: ${targetScore}/100
- Required Improvement: +${improvement} points

❗ CRITICAL GAPS TO ADDRESS:
${keywords.map(kw => `- Integrate "${kw}" naturally into relevant sections`).join('\n')}

${mode === 'FULL' ? `🚀 FULL MODE - AGGRESSIVE OPTIMIZATION:
- Completely rewrite sections to maximize ATS alignment
- Add quantifiable achievements with metrics
- Match job seniority level exactly
- Ensure target score of ${targetScore}+ is achieved
- Use power action verbs
- Add technical depth where missing` : `⚡ PARTIAL MODE - STRATEGIC ENHANCEMENT:
- Add missing keywords naturally
- Improve phrasing while keeping original voice
- Target +30-40 point improvement
- Focus on skill additions and keyword optimization
- Maintain factual accuracy`}
`;
}

module.exports = {
  compressPrompt,
  compressTailorPrompt,
  compressGeneratePrompt,
  compressWhitespace,
  compressJSON,
  estimateTokens,
  calculateCompressionStats,
  calculateCostSavings
};

