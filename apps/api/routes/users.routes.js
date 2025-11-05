/**
 * User Routes Module
 * 
 * Handles user profile and user-related routes
 */

const path = require('path');
const { getUserById } = require('../auth');
const { authenticate } = require('../middleware/auth');
const { validateEmail } = require('../utils/validation');
const { errorHandler } = require('../utils/errorMiddleware');
const logger = require('../utils/logger');

/**
 * Extract storage path from Supabase URL or return path as-is
 * Handles: public URLs, signed URLs, local storage paths
 */
function extractStoragePath(urlOrPath) {
  if (!urlOrPath) return null;
  
  // If it's base64 data URL, return null (can't extract path)
  if (urlOrPath.startsWith('data:')) {
    return null;
  }
  
  // If it's already a simple path (no http), return as-is
  if (!urlOrPath.startsWith('http')) {
    // Remove local storage prefix if present
    return urlOrPath.replace('/api/storage/files/', '');
  }
  
  // Supabase public URL: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
  if (urlOrPath.includes('/storage/v1/object/public/')) {
    const urlParts = urlOrPath.split('/storage/v1/object/public/');
    if (urlParts.length > 1) {
      const afterBucket = urlParts[1];
      const bucketAndPath = afterBucket.split('/');
      // Remove bucket name (first part) and join the rest as path
      if (bucketAndPath.length > 1) {
        return bucketAndPath.slice(1).join('/');
      }
    }
  }
  
  // Supabase signed URL: https://xxx.supabase.co/storage/v1/object/sign/bucket-name/path?token=...
  if (urlOrPath.includes('/storage/v1/object/sign/')) {
    const urlParts = urlOrPath.split('/storage/v1/object/sign/');
    if (urlParts.length > 1) {
      const pathAndQuery = urlParts[1].split('?')[0]; // Remove query params
      const bucketAndPath = pathAndQuery.split('/');
      if (bucketAndPath.length > 1) {
        return bucketAndPath.slice(1).join('/');
      }
    }
  }
  
  // Local storage path with /api/storage/files/ prefix
  if (urlOrPath.includes('/api/storage/files/')) {
    return urlOrPath.replace('/api/storage/files/', '');
  }
  
  // Unknown URL format
  logger.warn('Unknown URL format for storage path extraction:', urlOrPath);
  return null;
}

const VALID_WORK_EXPERIENCE_TYPES = [
  'Client Project',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Consulting',
  'Internship'
];

/**
 * Get or create a skill in the dictionary (skills table)
 * Uses dictionary pattern: skills table is the master/dictionary,
 * user_skills links users to dictionary skills
 * 
 * @param {string} skillName - The skill name to find or create
 * @param {string} category - Optional category (defaults to 'Technical')
 * @returns {Promise<Object>} The skill object from dictionary
 */
async function getOrCreateSkillInDictionary(skillName, category = 'Technical') {
  const { prisma } = require('../utils/db');
  
  if (!skillName || !skillName.trim()) {
    throw new Error('Skill name is required');
  }
  
  const normalizedName = skillName.trim();
  
  // Try case-insensitive lookup first
  let skill = await prisma.skill.findFirst({
    where: { 
      name: {
        equals: normalizedName,
        mode: 'insensitive'
      }
    }
  });
  
  // Fallback to exact match
  if (!skill) {
    skill = await prisma.skill.findUnique({
      where: { name: normalizedName }
    });
  }
  
  // Create in dictionary if it doesn't exist
  if (!skill) {
    skill = await prisma.skill.create({
      data: {
        name: normalizedName,
        category: category
      }
    });
  }
  
  return skill;
}

/**
 * Normalize incoming skills into a consistent structure
 * Supports legacy formats: string arrays, JSON strings, mixed objects
 * Note: Actual skill storage uses dictionary pattern via getOrCreateSkillInDictionary()
 */
function normalizeSkillInput(skillsInput) {
  if (!skillsInput) return [];

  const coerceArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return coerceArray(parsed);
      } catch (err) {
        const trimmed = value.trim();
        return trimmed ? [trimmed] : [];
      }
    }
    if (value && typeof value === 'object') {
      return Object.values(value);
    }
    return [];
  };

  const rawSkills = coerceArray(skillsInput);

  return rawSkills
    .map((skill) => {
      if (!skill) {
        return null;
      }

      if (typeof skill === 'string') {
        const name = skill.trim();
        if (!name) {
          return null;
        }
        return {
          name,
          yearsOfExperience: null,
          verified: false
        };
      }

      if (typeof skill === 'object') {
        const name = ((skill.name || skill.skill || skill.title || '') + '').trim();
        if (!name) {
          return null;
        }

        let yearsOfExperience = null;
        if (skill.yearsOfExperience !== undefined && skill.yearsOfExperience !== null && skill.yearsOfExperience !== '') {
          const parsedYears = Number(skill.yearsOfExperience);
          if (Number.isFinite(parsedYears)) {
            yearsOfExperience = parsedYears;
          }
        }

        return {
          name,
          yearsOfExperience,
          verified: Boolean(skill.verified)
        };
      }

      return null;
    })
    .filter(Boolean);
}

/**
 * Normalize incoming work experiences into a consistent structure
 * Handles arrays, JSON strings, loose objects, and legacy shapes
 */
function normalizeWorkExperienceInput(experiencesInput) {
  if (!experiencesInput) return [];

  const coerceArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return coerceArray(parsed);
      } catch (err) {
        const trimmed = value.trim();
        if (!trimmed) {
          return [];
        }
        return [{ description: trimmed }];
      }
    }
    if (value && typeof value === 'object') {
      // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
      // or regular objects - convert to array
      const values = Object.values(value);
      // If it's an object with numeric keys, sort by key to maintain order
      const keys = Object.keys(value);
      const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
      if (hasNumericKeys && keys.length > 0) {
        // Sort by numeric key to maintain order
        const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
        return sortedKeys.map(key => value[key]);
      }
      return values;
    }
    return [];
  };

  const rawExperiences = coerceArray(experiencesInput);

  const toString = (input) => (typeof input === 'string' ? input.trim() : '');

  return rawExperiences
    .map((exp) => {
      if (!exp) {
        return null;
      }

      if (typeof exp === 'string') {
        try {
          const parsed = JSON.parse(exp);
          return parsed && typeof parsed === 'object' ? parsed : { description: exp };
        } catch (err) {
          const trimmed = exp.trim();
          return trimmed ? { description: trimmed } : null;
        }
      }

      if (typeof exp !== 'object') {
        return null;
      }

      const company = toString(exp.company || exp.employer || exp.organization || '');
      const role = toString(exp.role || exp.title || exp.position || '');
      const location = toString(exp.location || exp.city || exp.region || '');
      const startDate = toString(exp.startDate || exp.start || exp.start_time || '');
      const rawEndDate = exp.endDate ?? exp.end ?? exp.finish ?? '';
      const endDateString = toString(rawEndDate);

      let isCurrent = Boolean(exp.isCurrent || exp.current || exp.present);
      if (!isCurrent && endDateString) {
        isCurrent = ['present', 'current', 'ongoing'].includes(endDateString.toLowerCase());
      }

      const allowedProjectType = (() => {
        const candidate = toString(exp.projectType || exp.type || exp.employmentType || '');
        if (!candidate) {
          return 'Full-time';
        }
        const match = VALID_WORK_EXPERIENCE_TYPES.find(
          (type) => type.toLowerCase() === candidate.toLowerCase()
        );
        return match || 'Full-time';
      })();

      const description = typeof exp.description === 'string' ? exp.description : '';
      
      // Normalize technologies array
      let technologies = [];
      if (exp.technologies) {
        if (Array.isArray(exp.technologies)) {
          technologies = exp.technologies
            .map(t => (typeof t === 'string' ? t.trim() : String(t || '').trim()))
            .filter(t => t.length > 0 && t !== 'null' && t !== 'undefined');
        } else if (typeof exp.technologies === 'string') {
          try {
            const parsed = JSON.parse(exp.technologies);
            if (Array.isArray(parsed)) {
              technologies = parsed
                .map(t => (typeof t === 'string' ? t.trim() : String(t || '').trim()))
                .filter(t => t.length > 0 && t !== 'null' && t !== 'undefined');
            } else {
              // Comma-separated string
              technologies = exp.technologies
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);
            }
          } catch {
            // Not JSON, treat as comma-separated
            technologies = exp.technologies
              .split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0);
          }
        } else if (exp.technologies && typeof exp.technologies === 'object') {
          const entries = Object.keys(exp.technologies)
            .sort((a, b) => {
              const aNum = Number(a);
              const bNum = Number(b);
              if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return aNum - bNum;
              }
              return a.localeCompare(b);
            })
            .map((key) => exp.technologies[key])
            .filter((value) => value !== undefined && value !== null)
            .map((value) => (typeof value === 'string' ? value.trim() : String(value || '').trim()))
            .filter((value) => value.length > 0 && value !== 'null' && value !== 'undefined');

          technologies = entries;
        }
      }

      const sanitized = {
        company,
        role,
        location,
        startDate,
        endDate: isCurrent ? '' : endDateString,
        isCurrent,
        description,
        technologies,
        projectType: allowedProjectType
      };

      const hasContent =
        !!sanitized.isCurrent ||
        [company, role, location, startDate, sanitized.endDate, toString(description)].some(
          (field) => field && field.length > 0
        );

      return hasContent ? sanitized : null;
    })
    .filter(Boolean);
}

/**
 * Normalize incoming certifications into a consistent structure
 * Supports strings, JSON strings, arrays, and loose objects
 */
function normalizeCertificationInput(certificationsInput) {
  if (!certificationsInput) return [];

  const coerceArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return coerceArray(parsed);
      } catch (err) {
        const trimmed = value.trim();
        return trimmed ? [{ name: trimmed }] : [];
      }
    }
    if (value && typeof value === 'object') {
      const certShapeKeys = ['name', 'certification', 'title', 'issuer', 'organization', 'authority'];
      const hasCertificationShape = certShapeKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key));
      if (hasCertificationShape) {
        return [value];
      }
      return Object.values(value);
    }
    return [];
  };

  const rawCertifications = coerceArray(certificationsInput);

  const toString = (input) => (typeof input === 'string' ? input.trim() : '');

  return rawCertifications
    .map((cert) => {
      if (!cert) {
        return null;
      }

      if (typeof cert === 'string') {
        const trimmed = cert.trim();
        if (!trimmed) {
          return null;
        }
        return {
          name: trimmed,
          issuer: '',
          date: '',
          expiryDate: '',
          credentialUrl: ''
        };
      }

      if (typeof cert !== 'object') {
        return null;
      }

      const name = toString(cert.name || cert.title || cert.certification || '');
      const issuer = toString(cert.issuer || cert.organization || cert.authority || '');
      const date = toString(cert.date || cert.issueDate || cert.issued || '');
      const expiryDate = toString(cert.expiryDate || cert.expirationDate || cert.expires || '');
      const credentialUrl = toString(cert.credentialUrl || cert.url || cert.link || '');

      const hasMeaningfulData = [name, issuer, date, expiryDate, credentialUrl].some((field) => field && field.length > 0);
      if (!hasMeaningfulData && !cert.verified) {
        return null;
      }

      return {
        name: name || issuer || date || expiryDate || credentialUrl || 'Certification',
        issuer,
        date,
        expiryDate,
        credentialUrl
      };
    })
    .filter(Boolean);
}

/**
 * Register all user routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function userRoutes(fastify, options) {
  // Get user profile
  fastify.get('/api/users/profile', {
    preHandler: authenticate
  }, async (request, reply) => {
    // SECURITY: Always use the authenticated user's ID from JWT token
    // This ensures users can ONLY access their own profile
    const userId = request.user.userId;
    
    if (!userId) {
      reply.status(401).send({ error: 'Unauthorized: No user ID found in token' });
      return;
    }
    
    const { prisma } = require('../utils/db');
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailNotifications: true,
          smsNotifications: true,
          privacyLevel: true,
          profileVisibility: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              professionalBio: true,
              profilePicture: true,
              linkedin: true,
              github: true,
              portfolio: true,
              website: true,
              createdAt: true,
              updatedAt: true,
              // Include related data
              workExperiences: {
                orderBy: { startDate: 'desc' },
                select: {
                  id: true,
                  company: true,
                  role: true,
                  location: true,
                  startDate: true,
                  endDate: true,
                  isCurrent: true,
                  description: true,
                  technologies: true,
                  projectType: true
                }
              },
              education: {
                orderBy: { endDate: 'desc' },
                select: {
                  id: true,
                  institution: true,
                  degree: true,
                  field: true,
                  startDate: true,
                  endDate: true,
                  gpa: true,
                  honors: true,
                  location: true,
                  description: true
                }
              },
              certifications: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  name: true,
                  issuer: true,
                  date: true,
                  expiryDate: true,
                  credentialUrl: true
                }
              },
              languages: {
                select: {
                  id: true,
                  name: true,
                  proficiency: true
                }
              },
              userSkills: {
                select: {
                  id: true,
                  yearsOfExperience: true,
                  verified: true,
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true
                    }
                  }
                }
              },
              projects: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  link: true,
                  github: true,
                  date: true,
                  technologies: true
                }
              }
            }
          }
        }
      });
      
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      
      // Merge profile data into user object for flat structure (for backward compatibility)
      const { profile, ...userData } = user;
      const parsedUser = {
        ...userData,
        ...(profile || {})
      };
      
      // Transform skills: user_skills (join table) -> skills (dictionary names)
      // Uses dictionary pattern: user_skills links to skills table (dictionary)
      if (parsedUser.userSkills && Array.isArray(parsedUser.userSkills)) {
        parsedUser.skills = parsedUser.userSkills.map(us => ({
          name: us.skill.name, // Get skill name from dictionary (skills table)
          yearsOfExperience: us.yearsOfExperience, // User-specific data from user_skills
          verified: us.verified || false // User-specific data from user_skills
        }));
        // Remove userSkills from response (frontend expects 'skills')
        delete parsedUser.userSkills;
      } else {
        parsedUser.skills = [];
      }
      
      // Ensure arrays are arrays (not null/undefined)
      // Transform work experiences - ensure technologies is parsed from array if needed
      const cleanTechnology = (value) => {
        if (value === null || value === undefined) return '';
        let tech = String(value).trim();
        if (!tech) return '';
        tech = tech.replace(/^\[|\]$/g, '').trim();
        tech = tech.replace(/\\"/g, '"').replace(/\\'/g, "'");
        while (
          (tech.startsWith('"') && tech.endsWith('"')) ||
          (tech.startsWith("'") && tech.endsWith("'"))
        ) {
          tech = tech.substring(1, tech.length - 1).trim();
        }
        tech = tech.replace(/^,+|,+$/g, '').trim();
        return tech;
      };

      // Transform work experiences - ensure technologies is parsed from array if needed
      parsedUser.workExperiences = Array.isArray(parsedUser.workExperiences) ? parsedUser.workExperiences.map((exp) => {
        if (!exp || typeof exp !== 'object') {
          return null;
        }
        
        // Ensure technologies is an array
        let technologies = [];
        if (exp.technologies) {
          if (Array.isArray(exp.technologies)) {
            technologies = exp.technologies
              .map((t) => cleanTechnology(t))
              .filter((t) => t.length > 0);
          } else if (typeof exp.technologies === 'string') {
            // If stored as string (shouldn't happen with native array, but handle it)
            try {
              technologies = JSON.parse(exp.technologies);
              if (Array.isArray(technologies)) {
                technologies = technologies
                  .map((t) => cleanTechnology(t))
                  .filter((t) => t.length > 0);
              } else {
                technologies = [];
              }
            } catch {
              technologies = exp.technologies
                .split(',')
                .map((t) => cleanTechnology(t))
                .filter((t) => t.length > 0);
            }
          }
        }
        
        return {
          ...exp,
          technologies
        };
      }).filter(Boolean) : [];
      
      parsedUser.education = Array.isArray(parsedUser.education) ? parsedUser.education.map((edu) => {
        if (!edu || typeof edu !== 'object') {
          return null;
        }

        return {
          ...edu,
          startDate: edu.startDate || null,
          endDate: edu.endDate || null,
          gpa: edu.gpa || null,
          honors: edu.honors || null,
          location: edu.location || null,
          description: edu.description || null,
        };
      }).filter(Boolean) : [];
      parsedUser.certifications = parsedUser.certifications || [];
      parsedUser.languages = parsedUser.languages || [];
      parsedUser.projects = parsedUser.projects || [];
      
      // Convert social link fields to array format for frontend compatibility
      parsedUser.socialLinks = [];
      if (parsedUser.linkedin) {
        parsedUser.socialLinks.push({ platform: 'LinkedIn', url: parsedUser.linkedin });
      }
      if (parsedUser.github) {
        parsedUser.socialLinks.push({ platform: 'GitHub', url: parsedUser.github });
      }
      if (parsedUser.portfolio) {
        parsedUser.socialLinks.push({ platform: 'Portfolio', url: parsedUser.portfolio });
      }
      if (parsedUser.website) {
        parsedUser.socialLinks.push({ platform: 'Website', url: parsedUser.website });
      }

      // Debug logging for GET endpoint
      console.log('=== GET PROFILE RESPONSE ===');
      console.log('userId (from JWT):', userId);
      console.log('user.id:', user.id);
      console.log('user.profile:', user.profile ? 'exists' : 'null');
      console.log('user.profile.id:', user.profile?.id);
      console.log('user.profile.workExperiences count:', user.profile?.workExperiences?.length || 0);
      console.log('user.profile.workExperiences:', JSON.stringify(user.profile?.workExperiences, null, 2));
      console.log('parsedUser.workExperiences count:', parsedUser.workExperiences?.length || 0);
      console.log('parsedUser.workExperiences data:', JSON.stringify(parsedUser.workExperiences, null, 2));
      console.log('parsedUser.id (profile.id):', parsedUser.id);
      
      // Additional check: Query work experiences directly to verify they exist
      if (user.profile?.id) {
        const directWorkExp = await prisma.workExperience.findMany({
          where: { profileId: user.profile.id }
        });
        console.log('=== DIRECT DB QUERY CHECK ===');
        console.log('Profile ID:', user.profile.id);
        console.log('Direct query workExperiences count:', directWorkExp.length);
        console.log('Direct query workExperiences:', JSON.stringify(directWorkExp, null, 2));
      }
      
      return { user: parsedUser };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      reply.status(500).send({ error: 'Failed to fetch profile', details: error.message });
      return;
    }
  });

  // Update user profile
  fastify.put('/api/users/profile', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    // SECURITY: Always use the authenticated user's ID from JWT token
    // This ensures users can ONLY update their own profile
    const userId = request.user.userId;
    
    if (!userId) {
      reply.status(401).send({ error: 'Unauthorized: No user ID found in token' });
      return;
    }
    
    const updates = request.body;
    
    // Debug: Log the raw request body
    console.log('=== RAW REQUEST BODY ===');
    console.log('Request body type:', typeof updates);
    console.log('Request body keys:', updates ? Object.keys(updates) : 'null/undefined');
    console.log('Request body workExperiences:', updates?.workExperiences);
    console.log('Request Content-Type:', request.headers['content-type']);
    
    // SECURITY: Explicitly reject any attempt to change user ID or login email
    if (updates.id !== undefined || updates.userId !== undefined) {
      reply.status(400).send({ error: 'Cannot modify user ID' });
      return;
    }
    
    // SECURITY: Prevent editing login email (it's used for authentication)
    if (updates.email !== undefined) {
      reply.status(400).send({ 
        error: 'Login email cannot be changed. Use personal email field for contact information.',
        hint: 'The email you use to log in cannot be modified. If you need to update your contact email, use the "Personal Email" field in your profile.'
      });
      return;
    }
    
    // Get user first to verify they exist
    const user = await getUserById(userId);
    if (!user) {
      reply.status(404).send({ error: 'User not found' });
      return;
    }

    // Separate fields by model
    // User model fields (excluding 'email' - login email cannot be changed)
    const userFields = [
      'name',
      'emailNotifications', 'smsNotifications',
      'privacyLevel', 'profileVisibility'
    ];
    
    // UserProfile model fields
    const profileFields = [
      'firstName', 'lastName', 'phone', 'personalEmail', 'location', 'professionalBio', 'profilePicture',
      'linkedin', 'github', 'portfolio', 'website'
    ];
    
    const userUpdateData = {};
    const profileUpdateData = {};
    
    // Collect User fields - only include known fields from the schema
    for (const field of userFields) {
      if (updates.hasOwnProperty(field)) {
        // Skip empty strings for name and email (required fields)
        if ((field === 'name' || field === 'email') && updates[field] === '') {
          continue;
        }
        // Convert empty strings to null for optional fields
        userUpdateData[field] = updates[field] === '' ? null : updates[field];
      }
    }
    
    // Collect UserProfile fields - only include known fields from the schema
    for (const field of profileFields) {
      if (updates.hasOwnProperty(field)) {
        // Convert empty strings to null for optional profile fields
        profileUpdateData[field] = updates[field] === '' ? null : updates[field];
      }
    }

    // Validate personalEmail if provided (must be valid email format if not empty)
    if (profileUpdateData.hasOwnProperty('personalEmail') && profileUpdateData.personalEmail) {
      if (!validateEmail(profileUpdateData.personalEmail)) {
        reply.status(400).send({ error: 'Invalid personal email format' });
        return;
      }
    }

    // Update name field if firstName/lastName are provided but name is not
    if (profileUpdateData.firstName || profileUpdateData.lastName) {
      const firstName = profileUpdateData.firstName || '';
      const lastName = profileUpdateData.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName && !userUpdateData.name) {
        userUpdateData.name = fullName || user.name;
      }
    }

    // Handle array fields separately (they're in separate tables)
    const workExperiences = updates.workExperiences;
    const skills = updates.skills;
    const education = updates.education;
    const certifications = updates.certifications;
    const languages = updates.languages;
    const socialLinks = updates.socialLinks; // Will be converted to individual fields
    const projects = updates.projects;
    
    // Debug logging
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Received workExperiences:', JSON.stringify(workExperiences, null, 2));
    console.log('workExperiences - typeof:', typeof workExperiences, '| isArray:', Array.isArray(workExperiences), '| isObject:', typeof workExperiences === 'object' && !Array.isArray(workExperiences));
    console.log('workExperiences length:', workExperiences?.length, '| Object.keys().length:', workExperiences ? Object.keys(workExperiences).length : 0);
    console.log('Received projects:', JSON.stringify(projects, null, 2));
    console.log('projects - typeof:', typeof projects, '| isArray:', Array.isArray(projects), '| isObject:', typeof projects === 'object' && !Array.isArray(projects));
    console.log('projects length:', projects?.length, '| Object.keys().length:', projects ? Object.keys(projects).length : 0);
    console.log('Received education:', JSON.stringify(education, null, 2));
    console.log('education - typeof:', typeof education, '| isArray:', Array.isArray(education), '| isObject:', typeof education === 'object' && !Array.isArray(education));
    console.log('education length:', education?.length, '| Object.keys().length:', education ? Object.keys(education).length : 0);
    console.log('Received languages:', JSON.stringify(languages, null, 2));
    console.log('languages - typeof:', typeof languages, '| isArray:', Array.isArray(languages), '| isObject:', typeof languages === 'object' && !Array.isArray(languages));
    console.log('languages length:', languages?.length, '| Object.keys().length:', languages ? Object.keys(languages).length : 0);
    console.log('All updates keys:', Object.keys(updates));
    
    // Handle socialLinks - convert to individual fields
    if (socialLinks && Array.isArray(socialLinks)) {
      socialLinks.forEach(link => {
        if (link.platform && link.url) {
          const platform = link.platform.toLowerCase();
          if (platform === 'linkedin') {
            profileUpdateData.linkedin = link.url;
          } else if (platform === 'github') {
            profileUpdateData.github = link.url;
          } else if (platform === 'portfolio') {
            profileUpdateData.portfolio = link.url;
          } else if (platform === 'website') {
            profileUpdateData.website = link.url;
          }
        }
      });
    }
    
    // Remove these from updates so they don't try to save to UserProfile
    delete updates.workExperiences;
    delete updates.skills;
    delete updates.education;
    delete updates.certifications;
    delete updates.languages;
    delete updates.socialLinks;
    delete updates.projects;
    
    // Update in database
    const { prisma } = require('../utils/db');
    
    try {
      // Get or create UserProfile first (needed for workExperiences and skills)
      let userProfile = await prisma.userProfile.findUnique({
        where: { userId: userId }
      });
      
      if (!userProfile) {
        // Create profile if it doesn't exist
        userProfile = await prisma.userProfile.create({
          data: {
            userId: userId,
            ...profileUpdateData
          }
        });
      }
      
      // Build update data
      const dataToUpdate = { ...userUpdateData };
      
      // Update or create UserProfile using nested write if there are profile fields to update
      if (Object.keys(profileUpdateData).length > 0) {
        dataToUpdate.profile = {
          upsert: {
            create: {
              ...profileUpdateData
            },
            update: profileUpdateData
          }
        };
      }
      
      // Update User model
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          email: true,
          name: true,
          emailNotifications: true,
          smsNotifications: true,
          privacyLevel: true,
          profileVisibility: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              professionalBio: true,
              profilePicture: true,
              linkedin: true,
              github: true,
              portfolio: true,
              website: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });
      
      const profileId = updatedUser.profile?.id || userProfile.id;
      
      if (!profileId) {
        console.error('ERROR: profileId is undefined!', { updatedUser, userProfile });
        reply.status(500).send({ error: 'Failed to update profile: profileId is missing' });
        return;
      }
      
      // Handle workExperiences - replace all existing ones
      if (workExperiences !== undefined) {
        const normalizedWorkExperiences = normalizeWorkExperienceInput(workExperiences);
        console.log('Processing workExperiences:', { count: normalizedWorkExperiences.length, profileId });
        
        try {
          await prisma.workExperience.deleteMany({
            where: { profileId: profileId }
          });
          
          if (normalizedWorkExperiences.length > 0) {
            const workExpData = normalizedWorkExperiences.map((exp) => {
              // Ensure technologies is properly formatted as array
              let technologies = [];
              if (exp.technologies) {
                if (Array.isArray(exp.technologies)) {
                  technologies = exp.technologies.filter(t => typeof t === 'string' && t.trim().length > 0);
                } else if (typeof exp.technologies === 'string') {
                  // Handle string format (shouldn't happen, but just in case)
                  try {
                    const parsed = JSON.parse(exp.technologies);
                    if (Array.isArray(parsed)) {
                      technologies = parsed.filter(t => typeof t === 'string' && t.trim().length > 0);
                    } else {
                      technologies = exp.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    }
                  } catch {
                    technologies = exp.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
                  }
                }
              }
              
              console.log('WorkExp data being saved:', {
                company: exp.company,
                role: exp.role,
                technologies: technologies,
                technologiesType: typeof exp.technologies,
                technologiesIsArray: Array.isArray(exp.technologies),
                technologiesLength: technologies.length,
                rawTechnologies: exp.technologies
              });
              
              return {
                profileId: profileId,
                company: exp.company || '',
                role: exp.role || '',
                location: exp.location || null,
                startDate: exp.startDate || '',
                endDate: exp.isCurrent ? null : (exp.endDate || null),
                isCurrent: Boolean(exp.isCurrent),
                description: exp.description || null,
                technologies: technologies,
                projectType: exp.projectType || 'Full-time'
              };
            });
            
            if (workExpData.length > 0) {
            console.log('Creating work experiences:', workExpData);
            
            const result = await prisma.workExperience.createMany({
              data: workExpData
            });
            
            console.log('Successfully created work experiences:', result);
            console.log('Created count:', result.count);
            
            const verifyCount = await prisma.workExperience.count({
              where: { profileId: profileId }
            });
            console.log('Verification: Total work experiences in DB for this profile:', verifyCount);
            }
          }
        } catch (workExpError) {
          console.error('Error saving work experiences:', workExpError);
          console.error('WorkExp Error Details:', {
            message: workExpError.message,
            stack: workExpError.stack,
            workExperiences: normalizedWorkExperiences,
            profileId: profileId
          });
          throw new Error(`Failed to save work experiences: ${workExpError.message}`);
        }
      }

      // Handle education - replace all existing ones
      // Normalize education from object format (e.g., {"0": {...}, "1": {...}}) to array
      let normalizedEducation = [];
      if (education !== undefined) {
        if (Array.isArray(education)) {
          normalizedEducation = education;
        } else if (education && typeof education === 'object') {
          // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
          const keys = Object.keys(education);
          const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
          if (hasNumericKeys && keys.length > 0) {
            // Sort by numeric key to maintain order
            const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
            normalizedEducation = sortedKeys.map(key => education[key]);
          } else {
            normalizedEducation = Object.values(education);
          }
        }
        console.log('Normalized education:', JSON.stringify(normalizedEducation, null, 2));
        console.log('Normalized education count:', normalizedEducation.length);
      }
      
      // Always process education if it's defined (even if empty array - need to clear existing)
      if (education !== undefined) {
        console.log('Processing education:', { count: normalizedEducation.length, profileId, educationDefined: true });
        try {
          await prisma.education.deleteMany({ where: { profileId: profileId } });
          if (normalizedEducation.length > 0) {
            const result = await prisma.education.createMany({
              data: normalizedEducation.map(edu => ({
                profileId: profileId,
                institution: (edu.institution || '').trim(),
                degree: edu.degree ? (edu.degree.trim() || null) : null,
                field: edu.field ? (edu.field.trim() || null) : null,
                startDate: edu.startDate ? (edu.startDate.trim() || null) : null,
                endDate: edu.endDate ? (edu.endDate.trim() || null) : null,
                gpa: edu.gpa ? (edu.gpa.trim() || null) : null,
                honors: edu.honors ? (edu.honors.trim() || null) : null,
                location: edu.location ? (edu.location.trim() || null) : null,
                description: edu.description ? (edu.description.trim() || null) : null
              }))
            });
            console.log('Successfully created education records:', result);
            console.log('Created count:', result.count);
            
            // Verify education was saved
            const verifyEducation = await prisma.education.findMany({
              where: { profileId: profileId }
            });
            console.log('Verification: Education in DB after save:', verifyEducation.length);
            console.log('Verification: Education institutions:', verifyEducation.map(e => e.institution));
          } else {
            console.log('No education to save (empty array)');
          }
        } catch (eduError) {
          console.error('Error saving education:', eduError);
          console.error('Education error details:', {
            message: eduError.message,
            stack: eduError.stack,
            normalizedEducation: normalizedEducation,
            profileId: profileId
          });
          throw new Error(`Failed to save education: ${eduError.message}`);
        }
      } else {
        console.log('Education not provided in update (undefined)');
      }

      // Handle certifications - replace all existing ones
      if (certifications !== undefined) {
        const normalizedCertifications = normalizeCertificationInput(certifications);
        console.log('Processing certifications:', { count: normalizedCertifications.length, profileId });

        try {
          await prisma.certification.deleteMany({ where: { profileId: profileId } });

          if (normalizedCertifications.length > 0) {
            await prisma.certification.createMany({
              data: normalizedCertifications.map((cert) => ({
                profileId: profileId,
                name: cert.name || '',
                issuer: cert.issuer || null,
                date: cert.date || null,
                expiryDate: cert.expiryDate || null,
                credentialUrl: cert.credentialUrl || null
              }))
            });
            console.log('Successfully created certification records');
          }
        } catch (certError) {
          console.error('Error saving certifications:', certError);
          throw new Error(`Failed to save certifications: ${certError.message}`);
        }
      }

      // Handle projects - replace all existing ones
      // Normalize projects from object format (e.g., {"0": {...}, "1": {...}}) to array
      let normalizedProjects = [];
      if (projects !== undefined) {
        if (Array.isArray(projects)) {
          normalizedProjects = projects;
        } else if (projects && typeof projects === 'object') {
          // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
          const keys = Object.keys(projects);
          const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
          if (hasNumericKeys && keys.length > 0) {
            // Sort by numeric key to maintain order
            const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
            normalizedProjects = sortedKeys.map(key => projects[key]);
          } else {
            normalizedProjects = Object.values(projects);
          }
        }
        console.log('Normalized projects:', JSON.stringify(normalizedProjects, null, 2));
        console.log('Normalized projects count:', normalizedProjects.length);
      }
      
      // Always process projects if they're defined (even if empty array - need to clear existing)
      if (projects !== undefined) {
        console.log('Processing projects:', { count: normalizedProjects.length, profileId, projectsDefined: true });
        try {
          await prisma.project.deleteMany({ where: { profileId: profileId } });
          if (normalizedProjects.length > 0) {
            console.log('Creating projects:', JSON.stringify(normalizedProjects, null, 2));
            const result = await prisma.project.createMany({
              data: normalizedProjects.map(proj => {
                // Serialize technologies array to JSON string for database storage
                let technologiesJson = null;
                if (proj.technologies) {
                  if (Array.isArray(proj.technologies)) {
                    // It's already an array
                    technologiesJson = proj.technologies.length > 0 ? JSON.stringify(proj.technologies) : null;
                  } else if (typeof proj.technologies === 'string') {
                    // Already a string, check if it's JSON or comma-separated
                    try {
                      JSON.parse(proj.technologies); // Validate it's valid JSON
                      technologiesJson = proj.technologies;
                    } catch {
                      // Not JSON, treat as comma-separated and convert to JSON array
                      const techArray = proj.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
                      technologiesJson = techArray.length > 0 ? JSON.stringify(techArray) : null;
                    }
                  } else if (typeof proj.technologies === 'object' && proj.technologies !== null) {
                    // Handle object (should be converted to array)
                    // If it's an object with numeric keys, convert to array
                    const keys = Object.keys(proj.technologies);
                    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
                    if (hasNumericKeys && keys.length > 0) {
                      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
                      const techArray = sortedKeys.map(key => proj.technologies[key]).filter(t => t && t.trim().length > 0);
                      technologiesJson = techArray.length > 0 ? JSON.stringify(techArray) : null;
                    } else {
                      // Regular object, convert values to array
                      const techArray = Object.values(proj.technologies).filter(t => t && (typeof t === 'string' ? t.trim().length > 0 : true));
                      technologiesJson = techArray.length > 0 ? JSON.stringify(techArray) : null;
                    }
                  }
                }
                
                return {
                  profileId: profileId,
                  title: (proj.title || '').trim(),
                  description: proj.description ? (proj.description.trim() || null) : null,
                  technologies: technologiesJson,
                  date: proj.date ? (proj.date.trim() || null) : null,
                  link: proj.link ? (proj.link.trim() || null) : null,
                  github: proj.github ? (proj.github.trim() || null) : null
                };
              })
            });
            console.log('Successfully created project records:', result);
            console.log('Created count:', result.count);
            
            // Verify projects were saved
            const verifyProjects = await prisma.project.findMany({
              where: { profileId: profileId }
            });
            console.log('Verification: Projects in DB after save:', verifyProjects.length);
            console.log('Verification: Project titles:', verifyProjects.map(p => p.title));
          } else {
            console.log('No projects to save (empty array)');
          }
        } catch (projError) {
          console.error('Error saving projects:', projError);
          console.error('Project error details:', {
            message: projError.message,
            stack: projError.stack,
            normalizedProjects: normalizedProjects,
            profileId: profileId
          });
          throw new Error(`Failed to save projects: ${projError.message}`);
        }
      } else {
        console.log('Projects not provided in update (undefined)');
      }

      // Handle languages - replace all existing ones
      // Normalize languages from object format (e.g., {"0": {...}, "1": {...}}) to array
      let normalizedLanguages = [];
      if (languages !== undefined) {
        if (Array.isArray(languages)) {
          normalizedLanguages = languages;
        } else if (languages && typeof languages === 'object') {
          // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
          const keys = Object.keys(languages);
          const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
          if (hasNumericKeys && keys.length > 0) {
            // Sort by numeric key to maintain order
            const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
            normalizedLanguages = sortedKeys.map(key => languages[key]);
          } else {
            normalizedLanguages = Object.values(languages);
          }
        }
        console.log('Normalized languages:', JSON.stringify(normalizedLanguages, null, 2));
        console.log('Normalized languages count:', normalizedLanguages.length);
      }
      
      // Always process languages if they're defined (even if empty array - need to clear existing)
      if (languages !== undefined) {
        console.log('Processing languages:', { count: normalizedLanguages.length, profileId, languagesDefined: true });
        try {
          await prisma.language.deleteMany({ where: { profileId: profileId } });
          if (normalizedLanguages.length > 0) {
            const result = await prisma.language.createMany({
              data: normalizedLanguages.map(lang => ({
                profileId: profileId,
                name: (lang.name || '').trim(),
                proficiency: lang.proficiency ? (lang.proficiency.trim() || 'Native') : 'Native'
              }))
            });
            console.log('Successfully created language records:', result);
            console.log('Created count:', result.count);
            
            // Verify languages were saved
            const verifyLanguages = await prisma.language.findMany({
              where: { profileId: profileId }
            });
            console.log('Verification: Languages in DB after save:', verifyLanguages.length);
            console.log('Verification: Language names:', verifyLanguages.map(l => l.name));
          } else {
            console.log('No languages to save (empty array)');
          }
        } catch (langError) {
          console.error('Error saving languages:', langError);
          console.error('Language error details:', {
            message: langError.message,
            stack: langError.stack,
            normalizedLanguages: normalizedLanguages,
            profileId: profileId
          });
          throw new Error(`Failed to save languages: ${langError.message}`);
        }
      } else {
        console.log('Languages not provided in update (undefined)');
      }

      // Handle skills - replace all existing ones
      if (skills !== undefined) {
        const normalizedSkills = normalizeSkillInput(skills);
        
        // Delete all existing user skills for this profile
        await prisma.userSkill.deleteMany({
          where: { profileId: profileId }
        });
        
        // Insert the normalized skills using dictionary pattern
        for (const skillData of normalizedSkills) {
          const skillName = skillData.name;
          if (!skillName) {
            continue;
          }
          
          // Use dictionary pattern: get or create skill in skills table (dictionary)
          const skill = await getOrCreateSkillInDictionary(skillName, 'Technical');
          
          // Create user_skills relation linking user profile to dictionary skill
          // This is the join table that connects users to skills in the dictionary
          await prisma.userSkill.create({
            data: {
              profileId: profileId,
              skillId: skill.id, // Reference to skill in dictionary (skills table)
              yearsOfExperience: skillData.yearsOfExperience || null,
              verified: Boolean(skillData.verified)
            }
          });
        }

        // Cleanup: Remove skills from dictionary that are no longer used by any user
        // This maintains the dictionary pattern - only keep skills that are actively referenced
        try {
          const cleanupResult = await prisma.skill.deleteMany({
            where: {
              userSkills: {
                none: {} // No user_skills relations exist for this skill
              }
            }
          });
          if (cleanupResult.count > 0) {
            console.log('Cleaned up unused skills from dictionary:', cleanupResult.count);
          }
        } catch (cleanupError) {
          console.error('Failed to clean up unused skills from dictionary:', cleanupError);
          // Don't fail the update if cleanup fails
        }
      }

      // Fetch updated profile with all related data (same as GET endpoint)
      const fullProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailNotifications: true,
          smsNotifications: true,
          privacyLevel: true,
          profileVisibility: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              professionalBio: true,
              profilePicture: true,
              linkedin: true,
              github: true,
              portfolio: true,
              website: true,
              createdAt: true,
              updatedAt: true,
              workExperiences: {
                orderBy: { startDate: 'desc' },
                select: {
                  id: true,
                  company: true,
                  role: true,
                  location: true,
                  startDate: true,
                  endDate: true,
                  isCurrent: true,
                  description: true,
                  projectType: true,
                  technologies: true
                }
              },
              education: {
                orderBy: { endDate: 'desc' },
                select: {
                  id: true,
                  institution: true,
                  degree: true,
                  field: true,
                  startDate: true,
                  endDate: true,
                  gpa: true,
                  honors: true,
                  location: true,
                  description: true
                }
              },
              certifications: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  name: true,
                  issuer: true,
                  date: true,
                  expiryDate: true,
                  credentialUrl: true
                }
              },
              languages: {
                select: {
                  id: true,
                  name: true,
                  proficiency: true
                }
              },
              userSkills: {
                select: {
                  id: true,
                  yearsOfExperience: true,
                  verified: true,
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true
                    }
                  }
                }
              },
              projects: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  link: true,
                  github: true,
                  date: true,
                  technologies: true
                }
              }
            }
          }
        }
      });
      
      // Merge profile data into user object for flat structure (for backward compatibility)
      const { profile, ...userData } = fullProfile;
      const parsedUser = {
        ...userData,
        ...(profile || {})
      };
      
      // Transform skills: user_skills (join table) -> skills (dictionary names)
      // Uses dictionary pattern: user_skills links to skills table (dictionary)
      if (parsedUser.userSkills && Array.isArray(parsedUser.userSkills)) {
        parsedUser.skills = parsedUser.userSkills.map(us => ({
          name: us.skill.name, // Get skill name from dictionary (skills table)
          yearsOfExperience: us.yearsOfExperience, // User-specific data from user_skills
          verified: us.verified || false // User-specific data from user_skills
        }));
        delete parsedUser.userSkills;
      } else {
        parsedUser.skills = [];
      }
      
      // Ensure arrays are arrays (not null/undefined)
      // Transform work experiences - ensure technologies is parsed from array if needed
      const cleanTechnology = (value) => {
        if (value === null || value === undefined) return '';
        let tech = String(value).trim();
        if (!tech) return '';
        tech = tech.replace(/^\[|\]$/g, '').trim();
        tech = tech.replace(/\\"/g, '"').replace(/\\'/g, "'");
        while (
          (tech.startsWith('"') && tech.endsWith('"')) ||
          (tech.startsWith("'") && tech.endsWith("'"))
        ) {
          tech = tech.substring(1, tech.length - 1).trim();
        }
        tech = tech.replace(/^,+|,+$/g, '').trim();
        return tech;
      };

      // Transform work experiences - ensure technologies is parsed from array if needed
      parsedUser.workExperiences = Array.isArray(parsedUser.workExperiences) ? parsedUser.workExperiences.map((exp) => {
        if (!exp || typeof exp !== 'object') {
          return null;
        }
        
        // Ensure technologies is an array
        let technologies = [];
        if (exp.technologies) {
          if (Array.isArray(exp.technologies)) {
            technologies = exp.technologies
              .map((t) => cleanTechnology(t))
              .filter((t) => t.length > 0);
          } else if (typeof exp.technologies === 'string') {
            // If stored as string (shouldn't happen with native array, but handle it)
            try {
              technologies = JSON.parse(exp.technologies);
              if (Array.isArray(technologies)) {
                technologies = technologies
                  .map((t) => cleanTechnology(t))
                  .filter((t) => t.length > 0);
              } else {
                technologies = [];
              }
            } catch {
              technologies = exp.technologies
                .split(',')
                .map((t) => cleanTechnology(t))
                .filter((t) => t.length > 0);
            }
          }
        }
        
        return {
          ...exp,
          technologies
        };
      }).filter(Boolean) : [];
      
      parsedUser.education = Array.isArray(parsedUser.education) ? parsedUser.education.map((edu) => {
        if (!edu || typeof edu !== 'object') {
          return null;
        }

        return {
          ...edu,
          startDate: edu.startDate || null,
          endDate: edu.endDate || null,
          gpa: edu.gpa || null,
          honors: edu.honors || null,
          location: edu.location || null,
          description: edu.description || null,
        };
      }).filter(Boolean) : [];
      parsedUser.certifications = parsedUser.certifications || [];
      parsedUser.languages = parsedUser.languages || [];
      
      // Transform projects - ensure technologies is parsed from JSON if needed
      parsedUser.projects = Array.isArray(parsedUser.projects) ? parsedUser.projects.map((proj) => {
        if (!proj || typeof proj !== 'object') {
          return null;
        }
        
        // Parse technologies if it's a string (JSON) or ensure it's an array
        let technologies = [];
        if (proj.technologies) {
          if (typeof proj.technologies === 'string') {
            const techStr = proj.technologies.trim();
            if (techStr) {
              // Handle escaped quotes pattern: ["React" "TypeScript"]
              if (techStr.startsWith('[') && techStr.includes('\\"')) {
                try {
                  // Handle pattern like: ["React" "TypeScript" "Python"]
                  // Replace escaped quotes and add commas between items
                  let cleaned = techStr.replace(/\\"/g, '"');
                  // If there are spaces between quoted items but no commas, add them
                  cleaned = cleaned.replace(/"\s+"/g, '", "');
                  technologies = JSON.parse(cleaned);
                } catch {
                  // Try alternative: split by space and clean each item
                  try {
                    const items = techStr
                      .replace(/^\[|\]$/g, '') // Remove brackets
                      .split(/\s+/) // Split by whitespace
                      .map(item => item.replace(/\\"/g, '').replace(/^"|"$/g, '').trim())
                      .filter(item => item.length > 0);
                    if (items.length > 0) {
                      technologies = items;
                    }
                  } catch {
                    // Fall through to other parsing methods
                  }
                }
              }
              
              // Try standard JSON parse
              if (!Array.isArray(technologies)) {
                try {
                  technologies = JSON.parse(techStr);
                } catch {
                  // If not JSON, try splitting by comma
                  technologies = techStr.split(',').map(t => t.trim().replace(/^["\[]|["\]]$/g, '')).filter(t => t.length > 0);
                }
              }
              
              // Ensure it's an array and filter out invalid values
              if (Array.isArray(technologies)) {
                technologies = technologies
                  .map(t => String(t || '').trim())
                  .filter(t => t.length > 0 && t !== 'null' && t !== 'undefined');
              } else {
                technologies = [];
              }
            }
          } else if (Array.isArray(proj.technologies)) {
            technologies = proj.technologies
              .map(t => String(t || '').trim())
              .filter(t => t.length > 0 && t !== 'null' && t !== 'undefined');
          }
        }
        
        return {
          ...proj,
          technologies,
          title: proj.title || '',
          description: proj.description || '',
          date: proj.date || '',
          link: proj.link || '',
          github: proj.github || ''
        };
      }).filter(Boolean) : [];
      
      // Convert social link fields to array format for frontend compatibility
      parsedUser.socialLinks = [];
      if (parsedUser.linkedin) {
        parsedUser.socialLinks.push({ platform: 'LinkedIn', url: parsedUser.linkedin });
      }
      if (parsedUser.github) {
        parsedUser.socialLinks.push({ platform: 'GitHub', url: parsedUser.github });
      }
      if (parsedUser.portfolio) {
        parsedUser.socialLinks.push({ platform: 'Portfolio', url: parsedUser.portfolio });
      }
      if (parsedUser.website) {
        parsedUser.socialLinks.push({ platform: 'Website', url: parsedUser.website });
      }

      // Auto-calculate and update profile completeness
      try {
        const { calculateProfileCompleteness } = require('../utils/profileCompleteness');
        const completeness = calculateProfileCompleteness(parsedUser);
        // Update profileCompleteness in UserProfile if profile exists
        if (fullProfile.profile) {
          await prisma.userProfile.update({
            where: { userId: userId },
            data: { profileCompleteness: completeness.score }
          });
        }
      } catch (completenessError) {
        // Don't fail the update if completeness calculation fails
        console.error('Error calculating completeness:', completenessError);
      }

      return { user: parsedUser, success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      reply.status(500).send({ error: 'Failed to update profile', details: error.message });
      return;
    }
  }));

  // Upload profile picture
  fastify.post('/api/users/profile/picture', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }
      
      // Validate file type (only images)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type. Only images are allowed.' });
      }
      
      // Validate file size (10MB max for profile pictures - cropped images are already optimized)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const buffer = await data.toBuffer();
      
      if (buffer.length > maxSize) {
        return reply.status(400).send({ error: 'File too large (max 10MB)' });
      }
      
      // Get existing profile picture to delete old one
      const { prisma } = require('../utils/db');
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: userId },
        select: { profilePicture: true }
      });
      
      // Upload to Supabase Storage
      const storageHandler = require('../utils/storageHandler');
      const { Readable } = require('stream');
      const fileStream = Readable.from(buffer);
      
      // Generate filename for profile picture
      // Use fixed filename pattern so we can overwrite old pictures
      const fileExtension = data.filename ? path.extname(data.filename) : '.jpg';
      const fileName = `profile-picture${fileExtension}`;
      
      // For profile pictures, we want to overwrite the old one
      // So we'll use a consistent path pattern: userId/profile-picture.ext
      // But first, delete the old one if it exists
      
      // Get old profile picture path BEFORE uploading new one
      let oldPicturePath = null;
      if (existingProfile?.profilePicture) {
        oldPicturePath = extractStoragePath(existingProfile.profilePicture);
        logger.info(`📸 Found existing profile picture, extracted path: ${oldPicturePath || 'failed to extract'}`);
      }
      
      // Upload to storage (Supabase or local)
      const uploadResult = await storageHandler.upload(
        fileStream,
        userId,
        fileName,
        data.mimetype
      );
      
      // Get public URL for the uploaded file
      let profilePictureUrl = uploadResult.publicUrl;
      
      // If no public URL, generate a signed/download URL
      if (!profilePictureUrl) {
        profilePictureUrl = await storageHandler.getDownloadUrl(uploadResult.path, 31536000); // 1 year expiry
      }
      
      // If still no URL, use the path (for local storage)
      if (!profilePictureUrl) {
        profilePictureUrl = uploadResult.path;
      }
      
      // Delete old profile picture from storage if it exists and is not base64
      // Use the path we extracted earlier, or try extracting again if needed
      const oldStoragePath = oldPicturePath || (existingProfile?.profilePicture ? extractStoragePath(existingProfile.profilePicture) : null);
      
      if (oldStoragePath) {
        logger.info(`🗑️  Deleting old profile picture: ${oldStoragePath}`);
        try {
          await storageHandler.deleteFile(oldStoragePath);
          logger.info(`✅ Successfully deleted old profile picture: ${oldStoragePath}`);
        } catch (deleteErr) {
          // If file doesn't exist, that's okay - it might have been manually deleted
          if (deleteErr.message?.includes('not found') || deleteErr.message?.includes('does not exist')) {
            logger.info(`ℹ️  Old profile picture already deleted: ${oldStoragePath}`);
          } else {
            logger.warn(`⚠️  Could not delete old profile picture: ${deleteErr.message}`);
            logger.debug('Delete error details:', { path: oldStoragePath, error: deleteErr });
          }
        }
      } else if (existingProfile?.profilePicture) {
        // Old picture exists but we couldn't extract the path
        logger.warn('⚠️  Old profile picture exists but path extraction failed. URL format:', existingProfile.profilePicture.substring(0, 100));
      }
      
      // Update user's profile picture in UserProfile with Supabase URL
      const updatedProfile = await prisma.userProfile.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          profilePicture: profilePictureUrl
        },
        update: {
          profilePicture: profilePictureUrl
        },
        select: {
          profilePicture: true
        }
      });
      
      // Get user data for response
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      return {
        success: true,
        profilePicture: updatedProfile.profilePicture,
        user: {
          ...updatedUser,
          profilePicture: updatedProfile.profilePicture
        }
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      reply.status(500).send({ error: 'Failed to upload profile picture', details: error.message });
      return;
    }
  });

  // Delete profile picture
  fastify.delete('/api/users/profile/picture', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { prisma } = require('../utils/db');
      const logger = require('../utils/logger');
      
      // Get existing profile picture before deleting
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: userId },
        select: { profilePicture: true }
      });
      
      // Delete file from Supabase Storage if it exists
      if (existingProfile?.profilePicture) {
        try {
          const storageHandler = require('../utils/storageHandler');
          
          // Extract storage path from URL
          const storagePath = extractStoragePath(existingProfile.profilePicture);
          
          // Delete from storage
          if (storagePath) {
            await storageHandler.deleteFile(storagePath).catch(err => {
              // Non-fatal - log but continue with database update
              logger.warn('Could not delete profile picture from storage:', err.message);
            });
          }
        } catch (deleteError) {
          // Non-fatal - log but continue with database update
          logger.warn('Error deleting profile picture from storage:', deleteError.message);
        }
      }
      
      // Update profile to remove profile picture URL from database
      await prisma.userProfile.updateMany({
        where: { userId: userId },
        data: {
          profilePicture: null
        }
      });
      
      return {
        success: true,
        message: 'Profile picture removed successfully',
        profilePicture: null
      };
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      reply.status(500).send({ error: 'Failed to delete profile picture', details: error.message });
      return;
    }
  });


  // Get profile completeness score
  fastify.get('/api/users/profile/completeness', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { calculateProfileCompleteness } = require('../utils/profileCompleteness');
      const { prisma } = require('../utils/db');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          profile: {
            select: {
              phone: true,
              location: true,
              professionalBio: true,
              profilePicture: true
            }
          }
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Merge profile data for completeness calculation
      const userForCompleteness = {
        ...user,
        ...(user.profile || {})
      };
      
      const completeness = calculateProfileCompleteness(userForCompleteness);
      
      // Update completeness in UserProfile
      if (user.profile) {
        await prisma.userProfile.update({
          where: { userId: userId },
          data: { 
            profileCompleteness: completeness.score
          }
        });
      }
      
      return {
        completeness: completeness.score,
        breakdown: completeness.breakdown || {},
        level: completeness.level
      };
    } catch (error) {
      console.error('Error calculating profile completeness:', error);
      reply.status(500).send({ error: 'Failed to calculate completeness', details: error.message });
      return;
    }
  });

  // Get user sessions
  fastify.get('/api/users/sessions', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const currentSessionId = request.cookies.session_id;
      const { getUserSessions } = require('../utils/sessionManager');
      
      const sessions = await getUserSessions(userId);
      
      // Format sessions with device info
      const formattedSessions = sessions.map(session => {
        const userAgent = session.userAgent || '';
        let device = 'Unknown';
        
        // Detect device type
        if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
          device = 'Mobile';
        } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
          device = 'Tablet';
        } else {
          device = 'Desktop';
        }
        
        // Extract browser info
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        return {
          id: session.id,
          device: `${device} (${browser})`,
          ipAddress: session.ipAddress || 'Unknown',
          userAgent: session.userAgent || '',
          createdAt: session.createdAt.toISOString(),
          lastActivity: session.lastActivity?.toISOString() || session.createdAt.toISOString(),
          isCurrent: session.id === currentSessionId
        };
      });
      
      return {
        sessions: formattedSessions
      };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      reply.status(500).send({ error: 'Failed to fetch sessions', details: error.message });
      return;
    }
  });

  // Delete specific session
  fastify.delete('/api/users/sessions/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;
      const { deactivateSession, getSession } = require('../utils/sessionManager');
      
      // Verify session belongs to user
      const session = await getSession(id);
      if (!session || session.userId !== userId) {
        return reply.status(404).send({ error: 'Session not found' });
      }
      
      await deactivateSession(id);
      
      return {
        success: true,
        message: 'Session revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking session:', error);
      reply.status(500).send({ error: 'Failed to revoke session', details: error.message });
      return;
    }
  });

  // Delete all sessions except current
  fastify.delete('/api/users/sessions', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const currentSessionId = request.cookies.session_id;
      const { deactivateAllUserSessions, deactivateSession } = require('../utils/sessionManager');
      
      // Deactivate all sessions
      await deactivateAllUserSessions(userId);
      
      // Reactivate current session if it exists
      if (currentSessionId) {
        const { prisma } = require('../utils/db');
        await prisma.session.updateMany({
          where: { id: currentSessionId, userId },
          data: { isActive: true }
        });
      }
      
      return {
        success: true,
        message: 'All other sessions revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking sessions:', error);
      reply.status(500).send({ error: 'Failed to revoke sessions', details: error.message });
      return;
    }
  });

  // Get profile analytics
  fastify.get('/api/users/profile/analytics', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { prisma } = require('../utils/db');
      
      // Get user with analytics fields
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          profileViews: true,
          applicationsSent: true,
          interviewsScheduled: true,
          offersReceived: true,
          successRate: true,
          profileCompleteness: true,
          skillMatchRate: true,
          avgResponseTime: true
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Return user metrics
      return {
        profileViews: user.profileViews || 0,
        applicationsSent: user.applicationsSent || 0,
        interviewsScheduled: user.interviewsScheduled || 0,
        offersReceived: user.offersReceived || 0,
        successRate: user.successRate || 0,
        profileCompleteness: user.profileCompleteness || 0,
        skillMatchRate: user.skillMatchRate || 0,
        avgResponseTime: user.avgResponseTime || 0
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      reply.status(500).send({ error: 'Failed to fetch analytics', details: error.message });
      return;
    }
  });

  // Export profile
  fastify.get('/api/users/profile/export', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { format = 'json' } = request.query;
      const { prisma } = require('../utils/db');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              profilePicture: true,
              professionalBio: true,
              linkedin: true,
              github: true,
              portfolio: true,
              website: true,
              workExperiences: {
                select: {
                  id: true,
                  company: true,
                  role: true,
                  location: true,
                  startDate: true,
                  endDate: true,
                  isCurrent: true,
                  description: true,
                  projectType: true
                }
              },
              education: {
                select: {
                  id: true,
                  institution: true,
                  degree: true,
                  field: true,
                  startDate: true,
                  endDate: true,
                  gpa: true,
                  honors: true,
                  location: true,
                  description: true
                }
              },
              projects: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  technologies: true,
                  date: true,
                  link: true,
                  github: true,
                  media: true
                }
              },
              certifications: {
                select: {
                  id: true,
                  name: true,
                  issuer: true,
                  date: true,
                  expiryDate: true,
                  credentialUrl: true
                }
              },
              languages: {
                select: {
                  id: true,
                  name: true,
                  proficiency: true
                }
              },
              userSkills: {
                select: {
                  id: true,
                  yearsOfExperience: true,
                  verified: true,
                  skill: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Parse JSON fields
      const parsedUser = { ...user };
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'workExperiences', 'projects'];
      jsonFields.forEach(field => {
        if (parsedUser[field]) {
          try {
            parsedUser[field] = JSON.parse(parsedUser[field]);
          } catch (e) {
            parsedUser[field] = [];
          }
        } else {
          parsedUser[field] = [];
        }
      });
      
      if (format === 'json') {
        reply.header('Content-Type', 'application/json');
        reply.header('Content-Disposition', `attachment; filename="profile-${userId}.json"`);
        return JSON.stringify(parsedUser, null, 2);
      } else if (format === 'pdf') {
        // PDF export would require pdfkit or puppeteer
        reply.status(501).send({ error: 'PDF export not yet implemented' });
        return;
      } else if (format === 'docx') {
        // DOCX export would require docx library
        reply.status(501).send({ error: 'DOCX export not yet implemented' });
        return;
      } else {
        reply.status(400).send({ error: 'Invalid format. Supported: json, pdf, docx' });
        return;
      }
    } catch (error) {
      console.error('Error exporting profile:', error);
      reply.status(500).send({ error: 'Failed to export profile', details: error.message });
      return;
    }
  });

  // Public profile endpoint
  fastify.get('/api/users/profile/public/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { prisma } = require('../utils/db');
      
      // Note: Most profile fields are now in user_profiles table
      // For now, we'll query the user and their profile separately
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profileVisibility: true,
          privacyLevel: true,
          profile: {
            select: {
              professionalBio: true,
              linkedin: true,
              github: true,
              portfolio: true,
              website: true,
              profileViews: true
            }
          }
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'Profile not found' });
      }
      
      // Check if profile is public
      if (user.profileVisibility !== 'Public') {
        return reply.status(403).send({ error: 'Profile is not public' });
      }
      
      // Increment profile views in user_profiles table
      if (user.profile) {
        await prisma.userProfile.update({
          where: { userId: userId },
          data: {
            profileViews: {
              increment: 1
            }
          }
        });
      }
      
      // Merge user and profile data
      const parsedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profileVisibility: user.profileVisibility,
        privacyLevel: user.privacyLevel,
        ...(user.profile || {}),
        skills: [] // Skills are now in user_skills table, would need separate query
      };
      
      // Remove sensitive fields based on privacy level
      const publicProfile = {
        id: parsedUser.id,
        name: parsedUser.name,
        profilePicture: parsedUser.profilePicture || null,
        professionalBio: parsedUser.professionalBio || null,
        skills: parsedUser.privacyLevel === 'Professional' ? parsedUser.skills : [],
        linkedin: parsedUser.linkedin || null,
        github: parsedUser.github || null,
        portfolio: parsedUser.portfolio || null,
        website: parsedUser.website || null
      };
      
      return {
        profile: publicProfile
      };
    } catch (error) {
      console.error('Error fetching public profile:', error);
      reply.status(500).send({ error: 'Failed to fetch profile', details: error.message });
      return;
    }
  });
}

module.exports = userRoutes;

