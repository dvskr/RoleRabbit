/**
 * SMART KEYWORD EXTRACTOR
 * Extracts ONLY actual skills, technologies, and qualifications
 * NOT generic words like "required", "qualifications", etc.
 */

const logger = require('../../utils/logger');

// Comprehensive stop words - ALL generic words to exclude
const COMPREHENSIVE_STOP_WORDS = new Set([
  // Articles & Pronouns
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
  'you', 'your', 'we', 'our', 'their', 'his', 'her', 'its', 'who', 'what', 'where', 'when', 'why', 'how',
  
  // Common Verbs
  'have', 'has', 'had', 'having', 'will', 'would', 'should', 'could', 'can', 'may', 'might',
  'must', 'able', 'work', 'working', 'worked', 'develop', 'developing', 'developed',
  'maintain', 'maintaining', 'maintained', 'create', 'creating', 'created', 'design', 'designing', 'designed',
  'build', 'building', 'built', 'implement', 'implementing', 'implemented', 'manage', 'managing', 'managed',
  'lead', 'leading', 'collaborate', 'collaborating', 'collaborate', 'ensure', 'ensuring', 'support', 'supporting',
  
  // Job-related generic terms
  'job', 'role', 'position', 'career', 'opportunity', 'candidate', 'applicant', 'employee',
  'team', 'company', 'organization', 'department', 'office', 'workplace',
  'responsibilities', 'responsibility', 'duties', 'duty', 'tasks', 'task',
  
  // Qualification-related generic terms
  'required', 'requirement', 'requirements', 'qualifications', 'qualification', 'qualified',
  'skills', 'skill', 'ability', 'abilities', 'knowledge', 'experience', 'experienced',
  'preferred', 'desired', 'nice', 'plus', 'bonus', 'must', 'need', 'needs', 'needed',
  'strong', 'excellent', 'good', 'solid', 'proven', 'demonstrated', 'proficient', 'proficiency',
  'expertise', 'expert', 'understanding', 'background', 'familiarity', 'familiar',
  
  // Description words
  'description', 'about', 'including', 'such', 'like', 'related', 'relevant', 'appropriate',
  'various', 'multiple', 'several', 'many', 'all', 'any', 'some', 'each', 'every', 'both',
  'within', 'across', 'between', 'among', 'through', 'during', 'before', 'after',
  
  // Time/Quantity
  'years', 'year', 'months', 'month', 'weeks', 'week', 'days', 'day',
  'per', 'more', 'less', 'least', 'most', 'minimum', 'maximum',
  
  // Degree-related (unless part of actual degree name)
  'degree', 'bachelor', 'bachelors', 'master', 'masters', 'phd', 'doctorate',
  'education', 'educational', 'graduate', 'undergraduate',
  
  // Field-related generic
  'field', 'fields', 'area', 'areas', 'domain', 'domains', 'industry', 'industries',
  'sector', 'sectors', 'discipline', 'disciplines',
  
  // Action/Process words
  'process', 'processes', 'approach', 'approaches', 'method', 'methods', 'methodology',
  'practice', 'practices', 'procedure', 'procedures', 'standard', 'standards',
  
  // Communication/Collaboration
  'communication', 'communications', 'communicate', 'communicating',
  'collaboration', 'collaborative', 'coordination', 'coordinate', 'coordinating',
  
  // Generic attributes
  'new', 'old', 'current', 'future', 'past', 'present', 'modern', 'traditional',
  'large', 'small', 'big', 'little', 'high', 'low', 'best', 'better', 'worse',
  
  // Organizational
  'join', 'joining', 'joined', 'become', 'becoming', 'report', 'reporting', 'reports',
  
  // Common connectors
  'into', 'onto', 'upon', 'over', 'under', 'above', 'below', 'near', 'far',
  
  // Miscellaneous common words
  'other', 'others', 'another', 'different', 'same', 'similar', 'equivalent',
  'level', 'levels', 'type', 'types', 'kind', 'kinds', 'way', 'ways',
  'thing', 'things', 'part', 'parts', 'piece', 'pieces', 'item', 'items',
  'information', 'data', 'details', 'detail', 'summary', 'overview',
  
  // Action words that aren't skills
  'using', 'use', 'used', 'apply', 'applying', 'applied', 'provide', 'providing', 'provided',
  'take', 'taking', 'took', 'make', 'making', 'made', 'get', 'getting', 'got',
  'give', 'giving', 'gave', 'find', 'finding', 'found', 'help', 'helping', 'helped',
  
  // HCI-specific generic terms (since "HCI" appeared as missing skill in screenshot)
  'human', 'computer', 'interaction', 'interface', 'user', 'users',
  
  // Common acronym expansions that aren't skills
  'etc', 'etcetera', 'ie', 'eg', 'vs', 'versus'
]);

// Known skill categories - ONLY extract if matches these patterns
const SKILL_PATTERNS = {
  // Programming Languages
  languages: /\b(javascript|typescript|python|java|c\+\+|csharp|c#|ruby|php|go|golang|rust|swift|kotlin|scala|r|matlab|perl|shell|bash|powershell)\b/gi,
  
  // Frameworks & Libraries
  frameworks: /\b(react|angular|vue|svelte|next\.?js|nuxt|express|fastify|django|flask|spring|laravel|rails|\.net|asp\.net|node\.?js|deno|jquery|bootstrap|tailwind|material.?ui|ant.?design)\b/gi,
  
  // Databases
  databases: /\b(sql|mysql|postgresql|postgres|mongodb|redis|cassandra|dynamodb|elasticsearch|oracle|mssql|sqlite|mariadb|neo4j|couchdb|firebase)\b/gi,
  
  // Cloud & Infrastructure
  cloud: /\b(aws|azure|gcp|google.?cloud|kubernetes|k8s|docker|terraform|ansible|jenkins|gitlab|github.?actions|circleci|heroku|vercel|netlify|cloudflare)\b/gi,
  
  // DevOps & Tools
  devops: /\b(git|github|gitlab|bitbucket|jira|confluence|slack|ci\/cd|cicd|continuous.?integration|continuous.?delivery|agile|scrum|kanban)\b/gi,
  
  // Design & UX Tools
  design: /\b(figma|sketch|adobe.?xd|photoshop|illustrator|invision|zeplin|framer|principle|axure|balsamiq|miro|figjam)\b/gi,
  
  // Testing & Quality
  testing: /\b(jest|mocha|chai|cypress|selenium|puppeteer|playwright|junit|pytest|rspec|testng|cucumber|postman|swagger)\b/gi,
  
  // Data & Analytics
  data: /\b(spark|hadoop|kafka|airflow|tableau|power.?bi|looker|metabase|pandas|numpy|scipy|tensorflow|pytorch|keras|scikit.?learn)\b/gi,
  
  // Healthcare-specific
  healthcare: /\b(epic|cerner|meditech|allscripts|hl7|fhir|hipaa|ehr|emr|phr|icd.?10|snomed|loinc|dicom)\b/gi,
  
  // Construction-specific
  construction: /\b(autocad|revit|bim|primavera|p6|ms.?project|procore|bluebeam|navisworks|civil.?3d|sketchup)\b/gi,
  
  // Finance-specific
  finance: /\b(bloomberg|reuters|factset|sap|oracle.?financials|quickbooks|xero|alteryx|sas|stata)\b/gi,
  
  // Certifications (actual certifications, not the word "certification")
  certifications: /\b(aws.?certified|azure.?certified|gcp.?certified|cpa|cfa|cfp|pmp|cissp|cism|ceh|ccna|ccnp|mcse|rhce|ckad|cka|scrum.?master|csm|pmi|itil)\b/gi,
  
  // Methodologies (actual named methodologies)
  methodologies: /\b(agile|scrum|kanban|waterfall|lean|six.?sigma|devops|sre|tdd|bdd|ddd|microservices|monolith|serverless)\b/gi,
  
  // Soft skills that are ACTUAL skills (not generic words)
  softSkills: /\b(leadership|mentoring|mentorship|public.?speaking|presentation.?skills|conflict.?resolution|negotiation|stakeholder.?management|change.?management|problem.?solving)\b/gi,
  
  // Domain expertise (ACTUAL disciplines, not generic words)
  domains: /\b(ui\s+design|ux\s+design|user\s+experience|user\s+interface|graphic\s+design|web\s+design|mobile\s+design|product\s+design|interaction\s+design|visual\s+design|service\s+design|data\s+engineering|data\s+science|machine\s+learning|deep\s+learning|computer\s+vision|natural\s+language\s+processing|nlp|ai|artificial\s+intelligence|frontend\s+development|backend\s+development|full\s+stack|devops\s+engineering|site\s+reliability|sre|cloud\s+architecture|software\s+architecture|system\s+design|database\s+design|api\s+design|microservices\s+architecture|responsive\s+design|mobile.?first\s+design|accessibility|wcag|cross.?browser\s+compatibility|rest\s+api|graphql|websocket)\b/gi,
  
  // Technical skills/concepts
  technical: /\b(responsive|mobile.?first|accessibility|wcag|rest|graphql|api|microservices|serverless|containerization|orchestration|version\s+control|source\s+control|continuous\s+integration|continuous\s+deployment|test.?driven\s+development|behavior.?driven\s+development|pair\s+programming|code\s+review)\b/gi,
  
  // Specific tools/software by category
  collaboration: /\b(slack|teams|zoom|notion|confluence|asana|trello|monday|basecamp|linear|height)\b/gi,
  
  // More design tools
  designTools: /\b(after\s+effects|premiere|xd|indesign|canva|procreate|affinity|corel)\b/gi
};

// Extract technologies and skills from text
function extractActualSkills(text) {
  const skills = new Set();
  
  // Apply all skill patterns
  for (const [category, pattern] of Object.entries(SKILL_PATTERNS)) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const skill = match[0].toLowerCase().replace(/\s+/g, ' ').trim();
      if (skill.length > 1) {
        skills.add(skill);
      }
    }
  }
  
  return Array.from(skills);
}

// Extract keywords INTELLIGENTLY (ONLY actual skills via pattern matching)
function extractSmartKeywords(text, maxKeywords = 30) {
  // PRIMARY METHOD: Pattern-based skill extraction
  const actualSkills = extractActualSkills(text);
  
  logger.info(`✅ Smart Keyword Extractor: Found ${actualSkills.length} pattern-matched skills`);
  
  // ALWAYS use pattern-matched skills only
  // Do NOT fallback to word frequency - that's how we got generic words!
  return actualSkills.slice(0, maxKeywords);
}

// Calculate missing skills (only show actual missing skills)
function calculateMissingSkills(jobSkills, resumeSkills) {
  const missing = [];
  
  for (const jobSkill of jobSkills) {
    const jobSkillLower = jobSkill.toLowerCase();
    
    // FIRST: Check if it's in our stop words (generic words)
    if (COMPREHENSIVE_STOP_WORDS.has(jobSkillLower)) {
      continue; // Skip generic words
    }
    
    // SECOND: Check if it's a single generic word (even if not in stop list)
    if (isGenericWord(jobSkillLower)) {
      continue; // Skip
    }
    
    // THIRD: Check if ANY resume skill matches
    const found = resumeSkills.some(rs => {
      const rsLower = rs.toLowerCase();
      return (
        rsLower.includes(jobSkillLower) ||
        jobSkillLower.includes(rsLower) ||
        areSimilarSkills(jobSkillLower, rsLower)
      );
    });
    
    if (!found) {
      missing.push(jobSkill);
    }
  }
  
  return missing;
}

// Helper: Check if a word is generic (even if not in stop list)
function isGenericWord(word) {
  // Single-word check against common patterns
  const genericPatterns = [
    /^(required|preferred|desired|needed|must|should)$/i,
    /^(qualification|requirement|skill|ability|knowledge|experience)s?$/i,
    /^(field|area|domain|industry|sector|discipline)s?$/i,
    /^(degree|bachelor|master|phd|education)s?$/i,
    /^(related|relevant|appropriate|equivalent|similar)$/i,
    /^(professional|strong|excellent|good|solid|proven)$/i,
    /^(minimum|maximum|years|months|level)s?$/i,
    /^(candidate|applicant|employee|team|company)s?$/i,
    /^(work|working|experience|background)$/i
  ];
  
  return genericPatterns.some(pattern => pattern.test(word));
}

// Check if two skills are similar (handles variations)
function areSimilarSkills(skill1, skill2) {
  // Remove common variations
  const normalize = (s) => s
    .replace(/\.js$/i, '')
    .replace(/\.net$/i, 'dotnet')
    .replace(/\s+/g, '')
    .replace(/[-.]/g, '');
  
  const s1 = normalize(skill1);
  const s2 = normalize(skill2);
  
  return s1 === s2 || s1.includes(s2) || s2.includes(s1);
}

module.exports = {
  extractSmartKeywords,
  extractActualSkills,
  calculateMissingSkills,
  COMPREHENSIVE_STOP_WORDS
};

