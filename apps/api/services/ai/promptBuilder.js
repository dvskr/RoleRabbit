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

function normalizeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
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
Full Resume Snapshot (for context only): ${normalizeJson(resumeSnapshot)}
${jobContext ? `Job Context:
${normalizeJson(jobContext)}` : ''}
${instructions ? `Additional User Instructions:
${instructions}` : ''}`;
}

function buildTailorResumePrompt({
  resumeSnapshot,
  jobDescription,
  mode = 'PARTIAL',
  tone = 'professional',
  length = 'thorough'
}) {
  const toneDescription = TONE_PRESETS[tone?.toLowerCase()] || TONE_PRESETS.professional;
  const lengthPrompt = LENGTH_PRESETS[length?.toLowerCase()] || LENGTH_PRESETS.thorough;

  return `You are an elite resume strategist responsible for tailoring resumes to a provided job description.
Return ONLY valid JSON with the schema:
{
  "mode": "PARTIAL" | "FULL",
  "tailoredResume": <ResumeJson>,
  "diff": Array<{ "path": string, "before": any, "after": any, "confidence": number }>,
  "recommendedKeywords": string[],
  "warnings": string[],
  "confidence": number (0-1)
}

Rules:
- The resume JSON must follow the structure of the provided base resume (summary, skills.technical, experience[], education[], projects[], certifications[]).
- Never fabricate companies, dates, achievements, titles, or technologies.
- Only adjust content that improves alignment with the job description while remaining truthful.
- ${lengthPrompt}
- Use ${toneDescription} tone across updated sections.
- Highlight metrics wherever possible, but only when already present or inferable from context.
- Diff entries must list JSONPath style paths (e.g. "summary", "experience[1].bullets[0]").

Base Resume: ${normalizeJson(resumeSnapshot)}
Job Description: ${normalizeJson(jobDescription)}
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

Base Resume: ${normalizeJson(resumeSnapshot)}
Job Description: ${normalizeJson(jobDescription)}`;
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
Job Description: ${normalizeJson(jobDescription)}
Resume Snapshot: ${normalizeJson(resumeSnapshot)}`;
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

Resume Snapshot: ${normalizeJson(resumeSnapshot)}`;
}

module.exports = {
  buildGenerateContentPrompt,
  buildTailorResumePrompt,
  buildApplyRecommendationsPrompt,
  buildCoverLetterPrompt,
  buildPortfolioPrompt
};
