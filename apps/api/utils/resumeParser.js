/**
 * Resume Parser Utility
 * Extracts text from PDF/DOCX and parses it using AI or regex
 */

const OpenAI = require('openai');
const logger = require('./logger');

// Initialize OpenAI client if API key is available
let openai = null;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({ apiKey });
    logger.info('OpenAI client initialized for resume parsing');
  } else {
    logger.warn('OpenAI API key not configured, will use regex parsing');
  }
} catch (error) {
  logger.warn('OpenAI not available, will use regex parsing:', error.message);
}

/**
 * Parse resume text and extract structured information
 * @param {string} text - Resume text content
 * @returns {Promise<Object>} Parsed resume data
 */
async function parseResumeText(text) {
  try {
    // Try AI-powered parsing first
    if (openai) {
      return await parseWithAI(text);
    }
    
    // Fallback to regex parsing
    return parseWithRegex(text);
  } catch (error) {
    logger.error('Error parsing resume with AI, falling back to regex:', error);
    return parseWithRegex(text);
  }
}

/**
 * Parse resume using OpenAI
 */
async function parseWithAI(text) {
const prompt = `Extract the following information from this resume and return ONLY valid JSON (no markdown, no code blocks, just pure JSON). Follow the schema exactly and provide empty arrays when data is absent:

{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "professionalSummary": "",
  "currentRole": "",
  "currentCompany": "",
  "experience": [{
    "company": "",
    "position": "",
    "location": "",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM or empty for current",
    "isCurrent": false,
    "period": "Start Month YYYY - End Month YYYY or Present",
    "description": "",
    "achievements": [""],
    "technologies": [""],
    "client": "",
    "projectType": "Full-time | Part-time | Contract | Freelance | Consulting | Client Project"
  }],
  "education": [{
    "school": "",
    "degree": "",
    "field": "",
    "startDate": "YYYY",
    "endDate": "YYYY or Present",
    "period": "Start YYYY - End YYYY",
    "description": ""
  }],
  "projects": [{
    "name": "",
    "description": "",
    "technologies": [""],
    "link": "",
    "github": "",
    "date": ""
  }],
  "skills": [""],
  "certifications": [{
    "name": "",
    "issuer": "",
    "date": "YYYY or Month YYYY",
    "expiryDate": "",
    "description": ""
  }],
  "volunteerExperiences": [{
    "organization": "",
    "role": "",
    "location": "",
    "startDate": "",
    "endDate": "",
    "description": ""
  }],
  "languages": [""],
  "links": {
    "linkedin": "",
    "github": "",
    "website": "",
    "portfolio": ""
  }
}

Resume text:
${text.substring(0, 4000)}`; // Limit to avoid token limits

  if (!openai) {
    throw new Error('OpenAI not configured');
  }

  try {
    // Add timeout to OpenAI API call to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out after 30 seconds')), 30000);
    });
    
    const apiPromise = openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume parser. Extract structured data from resumes and return ONLY valid JSON. No markdown formatting, no code blocks, just pure JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      timeout: 30000 // 30 second timeout
    });
    
    const response = await Promise.race([apiPromise, timeoutPromise]);

    const content = response.choices[0].message.content;
    
    // Try to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    return normalizeParsedData(parsed);
  } catch (error) {
    logger.error('AI parsing failed:', error);
    throw error;
  }
}

const MONTH_NAME_TO_NUMBER = {
  jan: '01',
  january: '01',
  feb: '02',
  february: '02',
  mar: '03',
  march: '03',
  apr: '04',
  april: '04',
  may: '05',
  jun: '06',
  june: '06',
  jul: '07',
  july: '07',
  aug: '08',
  august: '08',
  sep: '09',
  sept: '09',
  september: '09',
  oct: '10',
  october: '10',
  nov: '11',
  november: '11',
  dec: '12',
  december: '12'
};

function normalizeDateFragment(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  const monthYearMatch = trimmed.match(/([A-Za-z]+)\s+(\d{4})/);
  if (monthYearMatch) {
    const monthNum = MONTH_NAME_TO_NUMBER[monthYearMatch[1].toLowerCase()];
    if (monthNum) {
      return `${monthYearMatch[2]}-${monthNum}`;
    }
    return monthYearMatch[2];
  }
  const slashFormat = trimmed.match(/(\d{1,2})[\/](\d{4})/);
  if (slashFormat) {
    const month = String(slashFormat[1]).padStart(2, '0');
    return `${slashFormat[2]}-${month}`;
  }
  return trimmed;
}

/**
 * Parse resume using regex (fallback method)
 */
function parseWithRegex(text) {
  const parsed = {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: ''
    },
    professionalSummary: '',
    currentRole: '',
    currentCompany: '',
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    projects: [],
    links: {}
  };

  // Parse name (look for first non-empty line without digits or commas)
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const nameLine = lines.find(line => {
    if (!line) return false;
    if (/[@\d,]/.test(line)) return false; // skip lines with email, digits, or commas (likely not name)
    return /^[A-Za-z][A-Za-z\s.'-]+$/.test(line);
  });

  if (nameLine) {
    const nameParts = nameLine.trim().split(/\s+/);
    parsed.personalInfo.firstName = nameParts[0] || '';
    parsed.personalInfo.lastName = nameParts.slice(1).join(' ') || '';
  } else {
    const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (nameMatch) {
      const nameParts = nameMatch[1].trim().split(/\s+/);
      parsed.personalInfo.firstName = nameParts[0] || '';
      parsed.personalInfo.lastName = nameParts.slice(1).join(' ') || '';
    }
  }

  // Parse email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    parsed.personalInfo.email = emailMatch[0];
  }

  // Parse phone (various formats)
  const phonePatterns = [
    /\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/,
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
    /\d{10}/
  ];
  for (const pattern of phonePatterns) {
    const phoneMatch = text.match(pattern);
    if (phoneMatch) {
      parsed.personalInfo.phone = phoneMatch[0].trim();
      break;
    }
  }

  // Parse location
  const locationPatterns = [
    /(?:Location|Address|City)[:\s]+([A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+,\s*[A-Z]{2})/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2})/
  ];
  for (const pattern of locationPatterns) {
    const locationMatch = text.match(pattern);
    if (locationMatch) {
      parsed.personalInfo.location = locationMatch[1].trim();
      break;
    }
  }

  // Parse professional summary
  const summaryPatterns = [
    /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT)[:\s]*\n?\s*([^\n]+(?:\n[^\n]+){0,8})/i,
    /(?:Professional\s+Summary|Summary|Profile)[:\s]*\n?\s*([^\n]+(?:\n[^\n]+){0,8})/i
  ];
  for (const pattern of summaryPatterns) {
    const summaryMatch = text.match(new RegExp(pattern.source + '(?=EXPERIENCE|SKILLS|EDUCATION|WORK)', 'is'));
    if (summaryMatch) {
      parsed.professionalSummary = summaryMatch[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // Parse current role/title
  const titlePatterns = [
    /(?:Senior|Junior|Lead|Staff|Principal|Chief)\s+([A-Z][a-z\s]+Engineer|Developer|Designer|Analyst|Manager|Architect)/i,
    /([A-Z][a-z\s]+Engineer|Developer|Designer|Analyst|Manager|Architect)/i,
    /Software\s+Engineer/i,
    /(?:Title|Position|Role)[:\s]+(.+)/i
  ];
  for (const pattern of titlePatterns) {
    const titleMatch = text.match(pattern);
    if (titleMatch) {
      parsed.currentRole = titleMatch[1] || titleMatch[0];
      break;
    }
  }

  // Parse current company
  const companyPatterns = [
    /(?:at|works? at|working at|Company)[:\s]+([A-Z][a-zA-Z\s&]+?)(?:\.|,|\n|$)/i,
    /([A-Z][a-zA-Z\s&]+\s+(?:Inc|LLC|Corp|Co|Technologies|Systems|Solutions))/i
  ];
  for (const pattern of companyPatterns) {
    const companyMatch = text.match(pattern);
    if (companyMatch) {
      parsed.currentCompany = companyMatch[1].trim();
      break;
    }
  }

  // Parse experience
  const extractDatesFromPeriod = (period) => {
    if (!period) return { startDate: '', endDate: '', isCurrent: false };
    const rangeMatch = period.match(/(\w+\s+\d{4}|\d{4})(?:\s*[-–]\s*)(\w+\s+\d{4}|\d{4}|Present|Current)/i);
    if (rangeMatch) {
      const startDate = normalizeDateFragment(rangeMatch[1]);
      const endRaw = rangeMatch[2];
      const isCurrent = /present|current/i.test(endRaw);
      const endDate = isCurrent ? '' : normalizeDateFragment(endRaw);
      return { startDate, endDate, isCurrent };
    }

    const singleYear = period.match(/(\d{4})/);
    if (singleYear) {
      return { startDate: singleYear[1], endDate: '', isCurrent: true };
    }

    return { startDate: '', endDate: '', isCurrent: false };
  };

  const experienceSection = text.match(/(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT)[:\s]*(.*?)(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)/is);
  if (experienceSection) {
    const expText = experienceSection[1].replace(/^\s*(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT)[:\s-]*/i, '');
    // Try to extract individual jobs
    const jobPattern = /([^\n]+?)\s{1,}([A-Za-z][^\n]+?)(?=\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|\d{4}))\s+(?:,\s*)?([A-Za-z]{3,9}\s+\d{4}|\d{4})\s*[-–]\s*([A-Za-z]{3,9}\s+\d{4}|\d{4}|Present|Current)/g;
    let match;
    while ((match = jobPattern.exec(expText)) !== null && parsed.experience.length < 5) {
      const period = `${match[3]} - ${match[4]}`;
      const { startDate, endDate, isCurrent } = extractDatesFromPeriod(period);
      let company = (match[1] || '').trim();
      let position = (match[2] || '').trim();

      if (!company || /experience/i.test(company) || company.length <= 3 || position.includes(company)) {
        const combined = `${match[1] || ''} ${match[2] || ''}`.trim();
        const split = splitCompanyAndRole(combined);
        if (split) {
          company = split.company;
          position = split.position;
        }
      }

      parsed.experience.push({
        company,
        position,
        period,
        location: '',
        description: '',
        achievements: [],
        technologies: [],
        startDate,
        endDate,
        isCurrent,
        client: '',
        projectType: ''
      });
    }
  }

  // Parse skills
  const skillsSection = text.match(/(?:SKILLS|TECHNICAL SKILLS|COMPETENCIES)[:\s]*([^\n]+(?:\n[^\n]+){0,15})/i);
  if (skillsSection) {
    parsed.skills = skillsSection[1]
      .split(/[,\n•\-\u2022]/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.length < 50)
      .slice(0, 30);
  }

  // Parse education
  const educationSection = text.match(/(?:EDUCATION|EDUCATIONAL BACKGROUND)[:\s]*(.*?)(?:EXPERIENCE|PROJECTS|CERTIFICATIONS|SKILLS)/is);
  if (educationSection) {
    const eduText = educationSection[1];
    const schoolPattern = /([A-Z][^\n]+?)\s+([A-Z][^\n]*?)\s+(\d{4})\s*[-–]\s*(\d{4}|Present)/g;
    let match;
    while ((match = schoolPattern.exec(eduText)) !== null && parsed.education.length < 5) {
      const period = `${match[3]} - ${match[4]}`;
      let schoolName = match[1]?.trim() || '';
      let degreeInfo = match[2]?.trim() || '';

      const splitDegree = degreeInfo.split(/\s+(?=(?:B\.?(?:A|S)|Bachelor|Master|M\.?(?:A|S)|MBA|MSc|MS|Ph\.?D|Associate|Diploma|Certificate))/i);
      if (splitDegree.length > 1) {
        schoolName = `${schoolName} ${splitDegree[0]}`.trim();
        degreeInfo = splitDegree.slice(1).join(' ').trim();
      } else if (!schoolName && degreeInfo) {
        schoolName = degreeInfo;
        degreeInfo = '';
      }

      parsed.education.push({
        school: schoolName,
        degree: degreeInfo,
        field: '',
        period,
        startDate: match[3] || '',
        endDate: /present/i.test(match[4]) ? '' : match[4],
        description: ''
      });
    }
  }

  // Parse certifications
  const certSection = text.match(/(?:CERTIFICATIONS|CERTIFICATES)[:\s]*(.*?)(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS)/is);
  if (certSection) {
    const certText = certSection[1];
    const certPattern = /([A-Z][^\n]+?)(?:\s+-\s+)?([A-Z][^\n]*?)?(?:\s+(\d{4}))/g;
    let match;
    while ((match = certPattern.exec(certText)) !== null && parsed.certifications.length < 10) {
      parsed.certifications.push({
        name: match[1]?.trim() || '',
        issuer: match[2]?.trim() || '',
        date: match[3] || ''
      });
    }
  }

  // Parse LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    parsed.links.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  // Parse GitHub
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
  if (githubMatch) {
    parsed.links.github = `https://github.com/${githubMatch[1]}`;
  }

  // Parse website
  const websiteMatch = text.match(/(?:website|portfolio)[:\s]+(https?:\/\/[^\s]+)/i);
  if (websiteMatch) {
    parsed.links.website = websiteMatch[1];
  }

  return parsed;
}

/**
 * Normalize parsed data to ensure consistent format
 */
function normalizeParsedData(raw) {
  const source = raw || {};
  const personalInfo = source.personalInfo || {};

  const normalizeExperienceItem = (item) => {
    if (!item || typeof item !== 'object') return null;

    const derivedFromPeriod = parsePeriod(item.period);

    let company = item.company || item.employer || '';
    let position = item.position || item.title || '';

    if (!company || /experience/i.test(company) || company.length <= 3 || position.includes(company)) {
      const split = splitCompanyAndRole(`${company} ${position}`.trim()) || splitCompanyAndRole(position);
      if (split) {
        company = split.company;
        position = split.position;
      }
    }

    company = company.replace(/^[\s:,-]*(?:experience|work history)[:\s-]*/i, '').trim();
    position = position.replace(/^[\s:,-]*(?:experience|work history)[:\s-]*/i, '').trim();

    let start = item.startDate || derivedFromPeriod.startDate || '';
    let end = item.endDate || derivedFromPeriod.endDate || '';
    const isCurrent = typeof item.isCurrent === 'boolean'
      ? item.isCurrent
      : derivedFromPeriod.isCurrent;

    const period = item.period || buildPeriodString(start, end, isCurrent);

    const achievements = Array.isArray(item.achievements)
      ? item.achievements
      : item.achievements
        ? [item.achievements]
        : [];
    const technologies = Array.isArray(item.technologies)
      ? item.technologies
      : item.technologies
        ? [item.technologies]
        : [];

    return {
      company,
      position,
      location: item.location || '',
      startDate: start,
      endDate: end,
      isCurrent,
      period,
      description: item.description || '',
      achievements,
      technologies,
      client: item.client || '',
      projectType: item.projectType || ''
    };
  };

  const normalizeEducationItem = (item) => {
    if (!item || typeof item !== 'object') return null;
    let start = item.startDate || '';
    let end = item.endDate || '';
    const derived = parsePeriod(item.period);
    if (!start && derived.startDate) start = derived.startDate;
    if (!end && derived.endDate) end = derived.endDate;
    const period = item.period || buildPeriodString(start, end, false);

    let school = item.school || item.institution || '';
    let degree = item.degree || '';

    const combined = [school, degree].filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
    const degreeMarker = combined.match(/(B\.?(?:A|S)|BSc|BA|BS|Bachelor|Master|M\.?(?:A|S)|MBA|MSc|MS|Ph\.?D|Associate|Diploma|Certificate)/i);
    if ((!school || school.length <= 3 || /university|college|institute|school/i.test(degree)) && degreeMarker) {
      const idx = combined.toLowerCase().indexOf(degreeMarker[0].toLowerCase());
      if (idx > 0) {
        school = combined.slice(0, idx).trim();
        degree = combined.slice(idx).trim();
      }
    } else {
      school = school || combined;
    }

    return {
      school: school,
      degree: degree,
      field: item.field || item.area || '',
      startDate: start,
      endDate: end,
      period,
      description: item.description || '',
      gpa: item.gpa || ''
    };
  };

  const normalizeProjectItem = (item) => {
    if (!item || typeof item !== 'object') return null;
    const technologies = Array.isArray(item.technologies)
      ? item.technologies
      : item.technologies
        ? [item.technologies]
        : [];
    return {
      name: item.name || item.title || '',
      description: item.description || '',
      technologies,
      link: item.link || item.url || '',
      github: item.github || '',
      date: item.date || item.period || ''
    };
  };

  const normalizeCertification = (item) => {
    if (!item || typeof item !== 'object') return null;
    return {
      name: item.name || '',
      issuer: item.issuer || item.organization || '',
      date: item.date || item.issuedDate || '',
      expiryDate: item.expiryDate || item.validUntil || null,
      description: item.description || ''
    };
  };

  const normalizeVolunteer = (item) => {
    if (!item || typeof item !== 'object') return null;
    return {
      organization: item.organization || '',
      role: item.role || '',
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      description: item.description || ''
    };
  };

  const mergeExperienceSources = () => {
    const experienceArray = Array.isArray(source.experience) ? source.experience : [];
    const workArray = Array.isArray(source.workExperiences) ? source.workExperiences : [];
    const combined = [...experienceArray, ...workArray];
    return combined
      .map(normalizeExperienceItem)
      .filter(Boolean);
  };

  const buildLinks = () => {
    const links = source.links || {};
    return {
      linkedin: links.linkedin || '',
      github: links.github || '',
      website: links.website || links.portfolio || '',
      portfolio: links.portfolio || ''
    };
  };

  return {
    personalInfo: {
      firstName: personalInfo.firstName || source.firstName || (source.name ? source.name.split(' ')[0] : ''),
      lastName: personalInfo.lastName || source.lastName || (source.name ? source.name.split(' ').slice(1).join(' ') : ''),
      email: personalInfo.email || source.email || '',
      phone: personalInfo.phone || source.phone || '',
      location: personalInfo.location || source.location || ''
    },
    professionalSummary: source.professionalSummary || source.summary || source.bio || '',
    currentRole: source.currentRole || source.title || '',
    currentCompany: source.currentCompany || source.company || '',
    experience: mergeExperienceSources(),
    education: (Array.isArray(source.education) ? source.education : [])
      .map(normalizeEducationItem)
      .filter(Boolean),
    certifications: (Array.isArray(source.certifications) ? source.certifications : [])
      .map(normalizeCertification)
      .filter(Boolean),
    projects: (Array.isArray(source.projects) ? source.projects : [])
      .map(normalizeProjectItem)
      .filter(Boolean),
    skills: Array.isArray(source.skills)
      ? source.skills.filter((skill) => typeof skill === 'string' && skill.trim().length > 0).map((skill) => skill.trim())
      : [],
    volunteerExperiences: (Array.isArray(source.volunteerExperiences) ? source.volunteerExperiences : [])
      .map(normalizeVolunteer)
      .filter(Boolean),
    languages: Array.isArray(source.languages)
      ? source.languages.filter((lang) => typeof lang === 'string' && lang.trim().length > 0).map((lang) => lang.trim())
      : [],
    links: buildLinks()
  };
}

function buildPeriodString(startDate, endDate, isCurrent) {
  const start = startDate ? formatYearOrMonth(startDate) : '';
  const end = isCurrent ? 'Present' : endDate ? formatYearOrMonth(endDate) : '';
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

function formatYearOrMonth(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [year, month] = trimmed.split('-');
    return `${month}/${year}`;
  }
  if (/^\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

function inferIsCurrent(endDate) {
  if (!endDate) return true;
  const normalized = String(endDate).toLowerCase();
  return ['current', 'present', 'ongoing'].includes(normalized);
}

function parsePeriod(period) {
  if (!period) {
    return { startDate: '', endDate: '', isCurrent: false };
  }

  const rangeMatch = period.match(/([A-Za-z]{3,9}\s+\d{4}|\d{4})\s*[-–]\s*([A-Za-z]{3,9}\s+\d{4}|\d{4}|Present|Current)/i);
  if (rangeMatch) {
    const startDate = normalizeDateFragment(rangeMatch[1]);
    const endRaw = rangeMatch[2];
    const isCurrent = /present|current/i.test(endRaw);
    const endDate = isCurrent ? '' : normalizeDateFragment(endRaw);
    return { startDate, endDate, isCurrent };
  }

  const singleYear = period.match(/(\d{4})/);
  if (singleYear) {
    return { startDate: singleYear[1], endDate: '', isCurrent: true };
  }

  return { startDate: '', endDate: '', isCurrent: false };
}

function splitCompanyAndRole(text) {
  if (!text) return null;
  const cleaned = text.trim().replace(/\s{2,}/g, ' ');
  const stripped = cleaned.replace(/^(?:experience|work history)[:\s-]*/i, '').trim();
  if (!stripped) return null;

  const suffixPattern = /^(.*?\b(?:Inc\.|Incorporated|LLC|Ltd\.?|Corporation|Company|Corp\.|Group|Technologies|Systems|Solutions|Studios|Agency|Partners|Holdings))\s+(.*)$/i;
  const suffixMatch = stripped.match(suffixPattern);
  if (suffixMatch) {
    return {
      company: suffixMatch[1].trim(),
      position: suffixMatch[2].trim()
    };
  }

  const dotIndex = stripped.indexOf('. ');
  if (dotIndex !== -1) {
    return {
      company: stripped.slice(0, dotIndex + 1).trim(),
      position: stripped.slice(dotIndex + 1).trim()
    };
  }

  const commaIndex = stripped.indexOf(', ');
  if (commaIndex !== -1) {
    return {
      company: stripped.slice(0, commaIndex).trim(),
      position: stripped.slice(commaIndex + 1).trim()
    };
  }

  const atIndex = stripped.toLowerCase().indexOf(' at ');
  if (atIndex !== -1) {
    return {
      company: stripped.slice(atIndex + 4).trim(),
      position: stripped.slice(0, atIndex).trim()
    };
  }

  const withIndex = stripped.toLowerCase().indexOf(' with ');
  if (withIndex !== -1) {
    return {
      company: stripped.slice(withIndex + 6).trim(),
      position: stripped.slice(0, withIndex).trim()
    };
  }

  const segments = stripped.split(/\s[-–—]\s|\s\|\s|\u2022/).filter(Boolean);
  if (segments.length >= 2) {
    return {
      company: segments[0].trim(),
      position: segments.slice(1).join(' ').trim()
    };
  }

  const words = stripped.split(' ');
  if (words.length > 3) {
    const pivot = Math.max(1, Math.min(words.length - 1, 3));
    return {
      company: words.slice(0, pivot).join(' ').trim(),
      position: words.slice(pivot).join(' ').trim()
    };
  }

  return null;
}

module.exports = {
  parseResumeText,
  parseWithAI,
  parseWithRegex
};

