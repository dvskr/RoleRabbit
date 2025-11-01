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
  const prompt = `Extract the following information from this resume and return ONLY valid JSON (no markdown, no code blocks, just pure JSON):

{
  "personalInfo": {
    "firstName": "First name",
    "lastName": "Last name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State"
  },
  "professionalSummary": "Full professional summary/bio",
  "currentRole": "Current job title",
  "currentCompany": "Current company name",
  "experience": [{
    "company": "Company name",
    "position": "Job title",
    "period": "Start - End dates",
    "location": "City, State",
    "description": "Job description"
  }],
  "skills": ["skill1", "skill2", "skill3"],
  "education": [{
    "school": "School name",
    "degree": "Degree name",
    "field": "Field of study",
    "period": "Start - End dates"
  }],
  "certifications": [{
    "name": "Certification name",
    "issuer": "Issuing organization",
    "date": "Date obtained"
  }],
  "projects": [{
    "name": "Project name",
    "description": "Project description",
    "technologies": ["tech1", "tech2"]
  }],
  "links": {
    "linkedin": "Full LinkedIn URL",
    "github": "Full GitHub URL",
    "website": "Personal website URL"
  }
}

Resume text:
${text.substring(0, 4000)}`; // Limit to avoid token limits

  if (!openai) {
    throw new Error('OpenAI not configured');
  }

  try {
    const response = await openai.chat.completions.create({
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
      response_format: { type: 'json_object' }
    });

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

  // Parse name (usually first line with capitalized words)
  const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
  if (nameMatch) {
    const nameParts = nameMatch[1].trim().split(/\s+/);
    parsed.personalInfo.firstName = nameParts[0] || '';
    parsed.personalInfo.lastName = nameParts.slice(1).join(' ') || '';
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
  const experienceSection = text.match(/(?:EXPERIENCE|WORK HISTORY|EMPLOYMENT)[:\s]*(.*?)(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)/is);
  if (experienceSection) {
    const expText = experienceSection[1];
    // Try to extract individual jobs
    const jobPattern = /([A-Z][^\n]+?)\s+([A-Z][^\n]+?)\s+(\d{4}|\w+)\s*[-–]\s*(\d{4}|Present|Current)/g;
    let match;
    while ((match = jobPattern.exec(expText)) !== null && parsed.experience.length < 5) {
      parsed.experience.push({
        company: match[1]?.trim() || '',
        position: match[2]?.trim() || '',
        period: `${match[3]} - ${match[4]}`,
        location: '',
        description: ''
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
      parsed.education.push({
        school: match[1]?.trim() || '',
        degree: match[2]?.trim() || '',
        field: '',
        period: `${match[3]} - ${match[4]}`
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
function normalizeParsedData(data) {
  return {
    personalInfo: {
      firstName: data.personalInfo?.firstName || data.firstName || (data.name?.split(' ')[0] || ''),
      lastName: data.personalInfo?.lastName || data.lastName || (data.name?.split(' ').slice(1).join(' ') || ''),
      email: data.personalInfo?.email || data.email || '',
      phone: data.personalInfo?.phone || data.phone || '',
      location: data.personalInfo?.location || data.location || ''
    },
    professionalSummary: data.professionalSummary || data.summary || data.bio || '',
    currentRole: data.currentRole || data.title || '',
    currentCompany: data.currentCompany || data.company || '',
    experience: Array.isArray(data.experience) ? data.experience : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    education: Array.isArray(data.education) ? data.education : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    links: data.links || {}
  };
}

module.exports = {
  parseResumeText,
  parseWithAI,
  parseWithRegex
};

