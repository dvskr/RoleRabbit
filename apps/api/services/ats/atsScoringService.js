const crypto = require('crypto');

const SECTION_WEIGHTS = Object.freeze({
  keywords: 0.35,
  experience: 0.3,
  content: 0.2,
  format: 0.15
});

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'your', 'will', 'into',
  'using', 'able', 'work', 'team', 'role', 'responsibilities', 'skills', 'requirements',
  'experience', 'must', 'should', 'strong', 'develop', 'maintain', 'across', 'within', 'other',
  'candidate', 'company', 'about', 'what', 'you', 'are', 'our', 'who', 'job', 'description',
  'responsible', 'including', 'per', 'preferred', 'years', 'plus', 'need', 'join', 'new'
]);

function hashJobDescription(jobDescription = '') {
  return crypto.createHash('sha1').update(jobDescription.trim().toLowerCase()).digest('hex');
}

function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter((token) => token && token.length > 2 && !STOP_WORDS.has(token));
}

function extractKeywords(jobDescription = '') {
  const tokens = tokenize(jobDescription);
  const frequency = new Map();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }
  const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 40).map(([token]) => token);
}

function collectResumeTokens(resumeData = {}) {
  const bucket = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: []
  };

  if (resumeData.summary) {
    bucket.summary.push(...tokenize(resumeData.summary));
  }

  const skills = resumeData.skills?.technical || resumeData.skills || [];
  if (Array.isArray(skills)) {
    for (const skill of skills) {
      bucket.skills.push(...tokenize(skill));
    }
  }

  if (Array.isArray(resumeData.experience)) {
    for (const exp of resumeData.experience) {
      bucket.experience.push(...tokenize(exp.company));
      bucket.experience.push(...tokenize(exp.role));
      if (Array.isArray(exp.bullets)) {
        for (const bullet of exp.bullets) {
          bucket.experience.push(...tokenize(bullet));
        }
      }
    }
  }

  if (Array.isArray(resumeData.education)) {
    for (const edu of resumeData.education) {
      bucket.education.push(...tokenize(edu.degree));
      bucket.education.push(...tokenize(edu.field));
      bucket.education.push(...tokenize(edu.school || edu.institution));
    }
  }

  if (Array.isArray(resumeData.projects)) {
    for (const proj of resumeData.projects) {
      bucket.projects.push(...tokenize(proj.name));
      bucket.projects.push(...tokenize(proj.summary || proj.description));
      if (Array.isArray(proj.technologies || proj.skills)) {
        for (const tech of proj.technologies || proj.skills) {
          bucket.projects.push(...tokenize(tech));
        }
      }
    }
  }

  return bucket;
}

function computeMatchScore(sectionTokens, jobKeywords) {
  if (!jobKeywords.length) return { score: 0, matched: [], missing: [] };
  const keywordSet = new Set(jobKeywords);
  const matched = new Set();

  for (const token of sectionTokens) {
    if (keywordSet.has(token)) {
      matched.add(token);
    }
  }

  const missing = jobKeywords.filter((keyword) => !matched.has(keyword));
  const score = Math.round((matched.size / jobKeywords.length) * 100);
  return {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
    matched: [...matched],
    missing
  };
}

function evaluateFormat(resumeData = {}) {
  let score = 100;
  const warnings = [];

  if (!resumeData.summary || resumeData.summary.length < 120) {
    score -= 10;
    warnings.push('Consider expanding the summary to highlight headline achievements.');
  }
  if (!Array.isArray(resumeData.experience) || resumeData.experience.length === 0) {
    score -= 25;
    warnings.push('Add at least one professional experience entry.');
  }
  if (!Array.isArray(resumeData.skills) && !resumeData.skills?.technical?.length) {
    score -= 20;
    warnings.push('Add a dedicated skills section with key technologies.');
  }
  if (Array.isArray(resumeData.experience)) {
    const bulletCounts = resumeData.experience.map((exp) => Array.isArray(exp.bullets) ? exp.bullets.length : 0);
    if (bulletCounts.some((count) => count < 2)) {
      score -= 10;
      warnings.push('Add more accomplishment bullets to each role.');
    }
  }

  return { score: Math.max(0, Math.min(100, score)), warnings };
}

function buildStrengths(matchedKeywords, resumeData) {
  const strengths = [];
  if (matchedKeywords.length >= 8) {
    strengths.push('Resume covers a broad range of the required keywords.');
  }
  if (Array.isArray(resumeData.experience) && resumeData.experience.length >= 3) {
    strengths.push('Multiple experience entries demonstrate strong work history.');
  }
  if (resumeData.summary && resumeData.summary.length > 200) {
    strengths.push('Summary provides detailed professional branding.');
  }
  return strengths;
}

function buildImprovements(missingKeywords, formatWarnings) {
  const improvements = [...formatWarnings];
  if (missingKeywords.length > 0) {
    improvements.push(`Incorporate these missing keywords: ${missingKeywords.slice(0, 8).join(', ')}`);
  }
  if (missingKeywords.length > 8) {
    improvements.push('Consider creating a tailored summary highlighting the most critical job requirements.');
  }
  return improvements;
}

function scoreResumeAgainstJob({ resumeData = {}, jobDescription }) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    throw new Error('jobDescription is required for ATS scoring');
  }

  const jobKeywords = extractKeywords(jobDescription);
  const resumeTokens = collectResumeTokens(resumeData);

  const experienceMatch = computeMatchScore(resumeTokens.experience, jobKeywords);
  const keywordMatch = computeMatchScore(
    [...resumeTokens.summary, ...resumeTokens.skills, ...resumeTokens.projects],
    jobKeywords
  );
  const contentMatch = computeMatchScore(
    [...resumeTokens.summary, ...resumeTokens.experience],
    jobKeywords
  );

  const { score: formatScore, warnings: formatWarnings } = evaluateFormat(resumeData);

  const weightedScore = (
    (keywordMatch.score * SECTION_WEIGHTS.keywords) +
    (experienceMatch.score * SECTION_WEIGHTS.experience) +
    (contentMatch.score * SECTION_WEIGHTS.content) +
    (formatScore * SECTION_WEIGHTS.format)
  );

  const overall = Math.round(Math.max(0, Math.min(100, weightedScore)));

  const matchedKeywords = [...new Set([...keywordMatch.matched, ...experienceMatch.matched])];
  const missingKeywords = jobKeywords.filter((keyword) => !matchedKeywords.includes(keyword));

  const strengths = buildStrengths(matchedKeywords, resumeData);
  const improvements = buildImprovements(missingKeywords, formatWarnings);

  return {
    overall,
    keywords: keywordMatch.score,
    experience: experienceMatch.score,
    content: contentMatch.score,
    format: formatScore,
    matchedKeywords,
    missingKeywords,
    strengths,
    improvements,
    jobDescriptionHash: hashJobDescription(jobDescription)
  };
}

module.exports = {
  hashJobDescription,
  extractKeywords,
  scoreResumeAgainstJob
};
