/**
 * Context-Aware Prompt Builder
 * Generates prompts adapted to industry, experience level, and role type
 */

const { analyzeContext } = require('./contextAnalyzer');
const logger = require('../../utils/logger');

/**
 * Build context-aware tailoring prompt
 */
function buildContextAwareTailoringPrompt({
  resumeSnapshot,
  jobDescription,
  mode,
  tone,
  length,
  atsAnalysis,
  targetScore
}) {
  // Analyze context
  const context = analyzeContext(jobDescription, resumeSnapshot);
  
  // Build base prompt sections
  const sections = [];
  
  // 1. Role definition with context
  sections.push(buildRoleSection(context));
  
  // 2. Context-specific instructions
  sections.push(buildContextInstructions(context, mode));
  
  // 3. Task description
  sections.push(buildTaskSection(mode, targetScore, atsAnalysis));
  
  // 4. Industry-specific guidelines
  sections.push(buildIndustryGuidelines(context));
  
  // 5. Experience-level guidance
  sections.push(buildExperienceGuidance(context));
  
  // 6. Output format
  sections.push(buildOutputFormat());
  
  // 7. Quality rules
  sections.push(buildQualityRules(context));
  
  const prompt = sections.filter(s => s).join('\n\n');
  
  logger.info('Built context-aware prompt', {
    industry: context.industry.industry,
    roleType: context.roleType.type,
    experienceLevel: context.experience.level,
    promptLength: prompt.length
  });
  
  return prompt;
}

function buildRoleSection(context) {
  const roleDescriptions = {
    TECHNICAL: 'Elite technical resume strategist specializing in software engineering and technical roles',
    MANAGERIAL: 'Executive resume consultant specializing in leadership and management positions',
    CREATIVE: 'Creative portfolio expert specializing in design and creative roles',
    GENERAL: 'Professional resume strategist with cross-industry expertise'
  };
  
  const role = roleDescriptions[context.roleType.type] || roleDescriptions.GENERAL;
  
  return `You are a ${role}.

CONTEXT:
- Industry: ${context.industry.industry}
- Role Type: ${context.roleType.type}
- Experience Level: ${context.experience.level} (${context.experience.years} years)
- Job Seniority: ${context.jobSeniority.level}`;
}

function buildContextInstructions(context, mode) {
  const instructions = [];
  
  // Industry-specific
  if (context.industry.industry === 'SOFTWARE') {
    instructions.push('TECHNICAL FOCUS:');
    instructions.push('- Lead with technical stack and programming languages');
    instructions.push('- Include GitHub/portfolio links if available');
    instructions.push('- Quantify performance improvements, scalability, code quality');
    instructions.push('- Use technical terminology accurately');
  } else if (context.industry.industry === 'HEALTHCARE') {
    instructions.push('HEALTHCARE FOCUS:');
    instructions.push('- Emphasize patient care, clinical outcomes, compliance');
    instructions.push('- Include relevant certifications and licenses prominently');
    instructions.push('- Highlight adherence to healthcare standards (HIPAA, etc.)');
  } else if (context.industry.industry === 'FINANCE') {
    instructions.push('FINANCE FOCUS:');
    instructions.push('- Quantify financial impact ($, %, ROI)');
    instructions.push('- Highlight regulatory compliance, risk management');
    instructions.push('- Include relevant certifications (CFA, CPA, etc.)');
  }
  
  // Experience level adjustments
  if (context.experience.level === 'ENTRY') {
    instructions.push('\nENTRY-LEVEL STRATEGY:');
    instructions.push('- Emphasize education, projects, internships');
    instructions.push('- Highlight transferable skills and quick learning');
    instructions.push('- Focus on potential and enthusiasm');
  } else if (context.experience.level === 'SENIOR') {
    instructions.push('\nSENIOR-LEVEL STRATEGY:');
    instructions.push('- Lead with strategic impact and leadership');
    instructions.push('- Quantify business outcomes and team growth');
    instructions.push('- Demonstrate thought leadership and mentorship');
  }
  
  // Role type adjustments
  if (context.roleType.type === 'MANAGERIAL') {
    instructions.push('\nLEADERSHIP EMPHASIS:');
    instructions.push('- Highlight team size, budget management, stakeholder engagement');
    instructions.push('- Quantify org-level impact');
    instructions.push('- Showcase people development and strategic planning');
  }
  
  return instructions.length > 0 ? instructions.join('\n') : null;
}

function buildTaskSection(mode, targetScore, atsAnalysis) {
  const currentScore = atsAnalysis?.overall || 0;
  const gap = targetScore - currentScore;
  
  return `TASK: ${mode === 'FULL' ? 'Comprehensive Resume Rewrite' : 'Strategic Resume Enhancement'}

TARGET: Improve ATS score from ${currentScore}/100 to ${targetScore}/100 (+${gap} points)

${mode === 'FULL' ? 
`FULL REWRITE APPROACH:
- Restructure for maximum impact
- Rewrite all bullet points with power verbs and metrics
- Expand scope to match job requirements
- Add missing skills and keywords naturally` :
`PARTIAL ENHANCEMENT APPROACH:
- Add missing keywords in context
- Improve weak bullet points
- Highlight relevant skills
- Quick wins for ATS scoring`}`;
}

function buildIndustryGuidelines(context) {
  const industryGuidelines = {
    SOFTWARE: `TECHNICAL BEST PRACTICES:
- Use standard tech terminology (not buzzwords)
- Include tech stack: languages, frameworks, tools
- Quantify: performance (ms, %), scale (users, requests/sec), quality (test coverage)
- Show impact: "Reduced API latency by 40% serving 1M+ daily users"
- Include: GitHub profile, technical blog, open source contributions`,

    HEALTHCARE: `HEALTHCARE BEST PRACTICES:
- Patient-first language: "improved patient outcomes by X%"
- Include: licenses, certifications, specializations
- Compliance keywords: HIPAA, EMR/EHR, clinical protocols
- Quantify: patient volume, satisfaction scores, efficiency gains
- Professional tone: clinical, precise, evidence-based`,

    FINANCE: `FINANCE BEST PRACTICES:
- Lead with financial impact: revenue, cost savings, ROI
- Include: certifications (CFA, CPA, CFP, etc.)
- Risk & compliance: regulatory frameworks, audit experience
- Quantify: portfolio performance, deal value, P&L responsibility
- Professional tone: precise, data-driven, strategic`,

    MARKETING: `MARKETING BEST PRACTICES:
- ROI focus: CAC, LTV, conversion rates, engagement metrics
- Channel expertise: SEO, SEM, social, email, content
- Campaign results: reach, impressions, conversions, revenue
- Tools & platforms: Google Analytics, HubSpot, Salesforce, etc.
- Creative + analytical balance`,

    SALES: `SALES BEST PRACTICES:
- Numbers-driven: quota attainment (%), revenue generated, deals closed
- Pipeline metrics: conversion rates, cycle time, deal size
- Territory/account management scope
- CRM proficiency: Salesforce, HubSpot, etc.
- Client success stories and retention rates`
  };
  
  return industryGuidelines[context.industry.industry] || null;
}

function buildExperienceGuidance(context) {
  const expGuidance = {
    ENTRY: `ENTRY-LEVEL GUIDANCE:
- Education section prominent (GPA if > 3.5, relevant coursework)
- Projects section: personal, academic, or open source
- Internships and volunteer work detailed
- Skills section comprehensive
- Enthusiasm and growth mindset language`,

    JUNIOR: `JUNIOR-LEVEL GUIDANCE:
- Recent experience detailed, earlier experience summarized
- Focus on growth trajectory and expanding responsibilities
- Highlight quick wins and independent contributions
- Skills development and continuous learning`,

    MID: `MID-LEVEL GUIDANCE:
- Lead with impact and ownership
- Balance technical/functional with leadership
- Demonstrate cross-functional collaboration
- Progression and increasing scope evident
- Industry knowledge and best practices`,

    SENIOR: `SENIOR-LEVEL GUIDANCE:
- Strategic impact first, technical details secondary
- Leadership, mentorship, and organizational influence
- Business outcomes over technical implementation
- Thought leadership and industry recognition
- Executive summary or profile recommended`
  };
  
  return expGuidance[context.experience.level] || null;
}

function buildOutputFormat() {
  return `OUTPUT FORMAT (JSON):
{
  "mode": "PARTIAL" | "FULL",
  "tailoredResume": { /* complete resume JSON */ },
  "diff": [
    {
      "path": "experience[0].description[2]",
      "before": "original text",
      "after": "improved text",
      "reason": "Added quantified impact and keywords",
      "confidence": 0.9
    }
  ],
  "recommendedKeywords": ["keyword1", "keyword2"],
  "warnings": ["any concerns"],
  "confidence": 0.85,
  "estimatedScoreImprovement": 15
}`;
}

function buildQualityRules(context) {
  const baseRules = [
    '❌ NO FABRICATION - Only enhance what exists',
    '✅ QUANTIFY - Add metrics where possible (%, $, #)',
    '✅ POWER VERBS - Led, Built, Drove, Achieved, etc.',
    '✅ KEYWORDS - Natural integration from job description',
    '✅ CLARITY - Concise, scannable, impactful'
  ];
  
  // Add context-specific rules
  if (context.roleType.type === 'TECHNICAL') {
    baseRules.push('✅ TECHNICAL ACCURACY - Correct terminology and version numbers');
  }
  
  if (context.experience.level === 'SENIOR') {
    baseRules.push('✅ BUSINESS IMPACT - Connect work to business outcomes');
  }
  
  return 'QUALITY RULES:\n' + baseRules.join('\n');
}

module.exports = {
  buildContextAwareTailoringPrompt
};

