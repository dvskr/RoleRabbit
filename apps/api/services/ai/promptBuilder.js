const TONE_PRESETS = {
  professional: 'professional and confident',
  technical: 'technical and detail-oriented',
  creative: 'creative and engaging',
  executive: 'executive-level and strategic',
  casual: 'friendly yet professional'
};

const LENGTH_PRESETS = {
  brief: 'Provide concise output with 2-3 sentences or bullets.',
  thorough: 'Provide detailed output with 3-4 sentences or bullets.',
  complete: 'Provide comprehensive output with 4-6 sentences or bullets including metrics where possible.'
};

const MAX_JSON_CONTEXT_LENGTH = 20000;
const TRUNCATION_SENTINEL = '\n[TRUNCATED FOR LENGTH — prioritize the most relevant recent content]\n';

// Prompt compression
const { compressPrompt, compressTailorPrompt, compressGeneratePrompt } = require('./promptCompression');
const ENABLE_COMPRESSION = process.env.ENABLE_PROMPT_COMPRESSION !== 'false'; // Enabled by default

// Smart truncation for huge resumes (reuse from ATS service)
const { smartTruncateResume } = require('../embeddings/embeddingATSService');

function normalizeJson(value, maxLength = MAX_JSON_CONTEXT_LENGTH) {
  try {
    const jsonString = JSON.stringify(value ?? '', null, 0);
    if (typeof jsonString !== 'string') {
      return String(jsonString ?? '');
    }
    if (jsonString.length <= maxLength) {
      return jsonString;
    }

    const headLength = Math.floor(maxLength * 0.6);
    const tailLength = maxLength - headLength;
    const head = jsonString.slice(0, headLength);
    const tail = jsonString.slice(-tailLength);

    return `${head}${TRUNCATION_SENTINEL}${tail}`;
  } catch (error) {
    return String(value ?? '');
  }
}

function buildGenerateContentPrompt({
  sectionType,
  sectionPath,
  currentContent,
  resumeSnapshot,
  jobContext,
  tone = 'professional',
  length = 'thorough',
  instructions
}) {
  // Use compressed prompt if compression is enabled
  if (ENABLE_COMPRESSION) {
    try {
      const compressed = compressGeneratePrompt({
        sectionType,
        sectionPath,
        currentContent,
        resumeSnapshot,
        jobContext,
        tone,
        length,
        instructions
      });
      if (compressed) return compressed;
    } catch (error) {
      // Fall through to original prompt on error
      console.error('Compression failed, using original prompt:', error.message);
    }
  }

  // Original verbose prompt (fallback)
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;
  const lengthPrompt = LENGTH_PRESETS[length?.toLowerCase()] || LENGTH_PRESETS.thorough;

  return `You are an expert resume writing assistant. Revise the provided resume section while preserving factual accuracy.
Return ONLY valid JSON with the schema:
{
  "rewrittenContent": string | string[],
  "keyPointsAdded": string[],
  "confidence": number (0-1),
  "warnings": string[]
}

Rules:
- Do not invent companies, dates, tools, or achievements.
- Rewrite using ${toneDescription} tone.
- ${lengthPrompt}
- Preserve critical accomplishments and metrics already present.
- If you are unsure about any fact, leave the content unchanged and add an explanatory warning.
- Use action verbs, quantifiable metrics, and skill keywords where relevant.

Section Type: ${sectionType}
Section Path: ${sectionPath}
Current Content: ${normalizeJson(currentContent)}
Full Resume Snapshot (for context only): ${smartTruncateResume(resumeSnapshot, 30000)}
${jobContext ? `Job Context:
${normalizeJson(jobContext, 8000)}` : ''}
${instructions ? `Additional User Instructions:
${instructions}` : ''}`;
}

function buildTailorResumePrompt({
  resumeSnapshot,
  jobDescription,
  mode = 'PARTIAL',
  tone = 'professional',
  length = 'thorough',
  atsAnalysis = null,
  targetScore = null,
  // NEW: allow caller to provide prioritized missing keywords and/or limit
  missingKeywords = null,
  missingKeywordsLimit = null
}) {
  // Use compressed prompt if compression is enabled
  if (ENABLE_COMPRESSION) {
    try {
      const compressed = compressTailorPrompt({
        resumeSnapshot,
        jobDescription,
        mode,
        tone,
        length,
        atsAnalysis,
        targetScore,
        missingKeywords,
        missingKeywordsLimit
      });
      if (compressed) return compressed;
    } catch (error) {
      // Fall through to original prompt on error
      console.error('Compression failed, using original prompt:', error.message);
    }
  }

  // Original verbose prompt (fallback)
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;
  const lengthPrompt = LENGTH_PRESETS[length?.toLowerCase()] || LENGTH_PRESETS.thorough;

  // Build performance target guidance if ATS data provided
  let targetGuidance = '';
  if (atsAnalysis && targetScore) {
    const currentScore = atsAnalysis.overall || 0;
    const improvement = targetScore - currentScore;
    // Determine which gaps to show:
    // 1) Use provided prioritized list when available
    // 2) Fallback to ATS analysis missing list
    const defaultLimit = String(mode).toUpperCase() === 'FULL' ? 25 : 15;
    const limit = Number.isFinite(missingKeywordsLimit) && missingKeywordsLimit > 0
      ? missingKeywordsLimit
      : (parseInt(process.env.ATS_TAILOR_MISSING_MAX, 10) || defaultLimit);
    const gapsSource = Array.isArray(missingKeywords) && missingKeywords.length
      ? missingKeywords
      : (atsAnalysis.missingKeywords || []);
    const gaps = gapsSource;  // Use ALL provided keywords (already prioritized)
    const recommendedCount = limit;  // This is the intelligent recommendation
    
    targetGuidance = `
🎯 PERFORMANCE TARGET:
- Current ATS Score: ${currentScore}/100
- Target Score: ${targetScore}/100
- Required Improvement: +${improvement} points

📋 AVAILABLE KEYWORDS (${gaps.length} total, prioritized by importance):
${gaps.map((kw, idx) => `${idx + 1}. ${kw}${idx < recommendedCount ? ' ⭐' : ''}`).join('\n')}

💡 KEYWORD INTEGRATION GUIDANCE:
- ⭐ Starred keywords (top ${recommendedCount}): HIGH PRIORITY - strongly recommended
- Remaining keywords: Use if they fit naturally and add value
- Recommended integration: ~${recommendedCount} keywords for optimal balance
- Use your judgment: integrate more if resume has space, fewer if it feels forced
- QUALITY OVER QUANTITY: Natural integration is more important than hitting a specific count

📊 SCORING BREAKDOWN TARGETS:
- Technical Skills Match: ${atsAnalysis.keywords || 0}/100 → Target: 85+ points
- Experience Relevance: ${atsAnalysis.experience || 0}/100 → Target: 90+ points
- Content Quality: ${atsAnalysis.content || 0}/100 → Target: 85+ points
- Format/ATS Compatibility: ${atsAnalysis.format || 0}/100 → Target: 95+ points

${mode === 'FULL' ? `
🚀 FULL MODE - AGGRESSIVE OPTIMIZATION:
- Completely rewrite sections to maximize ATS alignment and keyword density
- Add quantifiable achievements with specific metrics (e.g., "Increased revenue by 35%")
- Match job seniority level exactly with appropriate language and scope
- Ensure target score of ${targetScore}+ is achieved through comprehensive optimization
- Use power action verbs: architected, spearheaded, optimized, transformed, delivered
- Add technical depth where missing (frameworks, tools, methodologies)
- Expand responsibilities to show full scope of impact
` : `
⚡ PARTIAL MODE - STRATEGIC ENHANCEMENT:
- Add missing keywords naturally without complete section rewrites
- Improve phrasing and structure while keeping original voice and facts
- Target +30-40 point improvement minimum through high-impact changes
- Focus on skill additions, keyword optimization, and metric highlights
- Maintain factual accuracy - enhance, don't invent
`}

🎯 INSTRUCTIONS FOR ACHIEVING TARGET SCORE:
1. Systematically address each missing keyword from the list above
2. Quantify achievements wherever possible (percentages, dollar amounts, time savings)
3. Use industry-standard terminology that matches the job description
4. Ensure technical skills section is comprehensive and well-organized
5. Make experience bullets action-oriented and results-focused
6. Verify all critical job requirements are explicitly addressed
`;
  }

  return `You are an elite resume strategist responsible for tailoring resumes to a provided job description.

${targetGuidance}

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
- The resume JSON must follow the structure of the provided base resume (summary, skills.technical, experience[], education[], projects[], certifications[]).
- Never fabricate companies, dates, achievements, titles, or technologies.
- Only adjust content that improves alignment with the job description while remaining truthful.
- ${lengthPrompt}
- Use ${toneDescription} tone across updated sections.
- Highlight metrics wherever possible, but only when already present or inferable from context.
- Diff entries must list JSONPath style paths (e.g. "summary", "experience[1].bullets[0]").
${targetScore ? `- CRITICAL: Aim to achieve or exceed target score of ${targetScore}/100 through strategic optimizations.` : ''}
${(() => {
  const defaultLimitInline = 10;
  const providedList = Array.isArray(missingKeywords) && missingKeywords.length ? missingKeywords : (atsAnalysis?.missingKeywords || []);
  const inlineLimit = Math.min(
    defaultLimitInline,
    (Number.isFinite(missingKeywordsLimit) && missingKeywordsLimit > 0) ? missingKeywordsLimit : defaultLimitInline
  );
  const inlineGaps = providedList.slice(0, inlineLimit);
  return inlineGaps.length > 0
    ? `- PRIORITY: Integrate these missing keywords naturally: ${inlineGaps.join(', ')}`
    : '';
})()}

Base Resume (JSON, intelligently truncated for huge resumes): ${smartTruncateResume(resumeSnapshot, 30000)}
Job Description (truncated if extremely long): ${normalizeJson(jobDescription, 8000)}
Requested Tailoring Mode: ${mode}`;
}

function buildApplyRecommendationsPrompt({
  resumeSnapshot,
  jobDescription,
  focusAreas = [],
  tone = 'professional'
}) {
  const focusList = Array.isArray(focusAreas) && focusAreas.length
    ? focusAreas.join(', ')
    : 'summary, experience, skills';
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;

  return `You are enhancing a resume to improve ATS alignment and clarity.
Return ONLY valid JSON with the schema:
{
  "updatedResume": <ResumeJson>,
  "appliedRecommendations": string[],
  "warnings": string[],
  "confidence": number (0-1)
}

Rules:
- Preserve factual accuracy and never invent new employers, dates, or outcomes.
- Focus improvements on: ${focusList}.
- Maintain ${toneDescription} tone.
- Only update sections when a concrete improvement is possible; otherwise keep them identical.
- Add high-impact action verbs and quantifiable outcomes only when already implied.

Base Resume: ${smartTruncateResume(resumeSnapshot, 30000)}
Job Description: ${normalizeJson(jobDescription, 8000)}`;
}

function buildCoverLetterPrompt({
  resumeSnapshot,
  jobDescription,
  jobTitle,
  company,
  tone = 'professional'
}) {
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;

  return `You are writing a tailored cover letter.
Return ONLY valid JSON with the schema:
{
  "subject": string,
  "greeting": string,
  "bodyParagraphs": string[],
  "closing": string,
  "signature": string
}

Rules:
- Tone must be ${toneDescription} and concise (approx 250-300 words maximum).
- Reference the candidate's genuine experience only.
- Emphasize alignment with the job description and company values.
- Include a clear call-to-action in the closing paragraph.

Job Title: ${jobTitle || 'Unknown Title'}
Company: ${company || 'Company'}
Job Description: ${normalizeJson(jobDescription, 8000)}
Resume Snapshot: ${smartTruncateResume(resumeSnapshot, 30000)}`;
}

function buildPortfolioPrompt({
  resumeSnapshot,
  tone = 'professional'
}) {
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;

  return `You are drafting content for a personal portfolio/website derived from the resume data.
Return ONLY valid JSON with the schema:
{
  "headline": string,
  "tagline": string,
  "about": string,
  "highlights": string[],
  "selectedProjects": Array<{ "name": string, "summary": string, "technologies": string[] }>
}

Rules:
- Tone must be ${toneDescription} and first-person singular.
- Summaries must remain truthful to the resume data.
- Highlight measurable achievements and leadership moments.
- Limit highlights to 5 items and projects to 3 entries.

Resume Snapshot: ${smartTruncateResume(resumeSnapshot, 30000)}`;
}

module.exports = {
  buildGenerateContentPrompt,
  buildTailorResumePrompt,
  buildApplyRecommendationsPrompt,
  buildCoverLetterPrompt,
  buildPortfolioPrompt
};
