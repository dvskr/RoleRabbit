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
 * Normalize incoming skills into a consistent structure
 * Supports legacy formats: string arrays, JSON strings, mixed objects
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
          proficiency: 'Beginner',
          yearsOfExperience: null,
          verified: false
        };
      }

      if (typeof skill === 'object') {
        const name = ((skill.name || skill.skill || skill.title || '') + '').trim();
        if (!name) {
          return null;
        }

        const allowedProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const proficiency = allowedProficiencies.includes(skill.proficiency)
          ? skill.proficiency
          : 'Beginner';

        let yearsOfExperience = null;
        if (skill.yearsOfExperience !== undefined && skill.yearsOfExperience !== null && skill.yearsOfExperience !== '') {
          const parsedYears = Number(skill.yearsOfExperience);
          if (Number.isFinite(parsedYears)) {
            yearsOfExperience = parsedYears;
          }
        }

        return {
          name,
          proficiency,
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
      return Object.values(value);
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

      const sanitized = {
        company,
        role,
        location,
        startDate,
        endDate: isCurrent ? '' : endDateString,
        isCurrent,
        description,
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
              bio: true,
              professionalBio: true,
              profilePicture: true,
              currentRole: true,
              currentCompany: true,
              linkedin: true,
              github: true,
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
              userSkills: {
                select: {
                  id: true,
                  proficiency: true,
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
              socialLinks: {
                select: {
                  id: true,
                  platform: true,
                  url: true
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
              },
              achievements: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  description: true,
                  date: true,
                  link: true
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
      
      // Transform skills array from UserSkill[] to Skill[] format expected by frontend
      if (parsedUser.userSkills && Array.isArray(parsedUser.userSkills)) {
        parsedUser.skills = parsedUser.userSkills.map(us => ({
          name: us.skill.name,
          proficiency: us.proficiency || 'Beginner',
          yearsOfExperience: us.yearsOfExperience,
          verified: us.verified || false
        }));
        // Remove userSkills from response (frontend expects 'skills')
        delete parsedUser.userSkills;
      } else {
        parsedUser.skills = [];
      }
      
      // Ensure arrays are arrays (not null/undefined)
      parsedUser.workExperiences = parsedUser.workExperiences || [];
      parsedUser.education = Array.isArray(parsedUser.education) ? parsedUser.education.map((edu) => {
        if (!edu || typeof edu !== 'object') {
          return null;
        }

        return {
          ...edu,
          startDate: edu.startDate || null,
          endDate: edu.endDate || edu.graduationDate || null,
          gpa: edu.gpa || null,
          honors: edu.honors || null,
          location: edu.location || null,
          description: edu.description || null,
        };
      }).filter(Boolean) : [];
      parsedUser.certifications = parsedUser.certifications || [];
      parsedUser.socialLinks = parsedUser.socialLinks || [];
      parsedUser.projects = parsedUser.projects || [];
      parsedUser.achievements = parsedUser.achievements || [];
      
      // Maintain backward compatibility between bio and professionalBio fields
      if (!parsedUser.professionalBio && parsedUser.bio) {
        parsedUser.professionalBio = parsedUser.bio;
      } else if (parsedUser.professionalBio && !parsedUser.bio) {
        parsedUser.bio = parsedUser.professionalBio;
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
      'firstName', 'lastName', 'phone', 'personalEmail', 'location', 'bio', 'professionalBio', 'profilePicture',
      'currentRole', 'currentCompany',
      'linkedin', 'github', 'website'
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
    const socialLinks = updates.socialLinks;
    const projects = updates.projects;
    const achievements = updates.achievements;
    
    // Debug logging
    console.log('=== PROFILE UPDATE DEBUG ===');
    console.log('Received workExperiences:', JSON.stringify(workExperiences, null, 2));
    console.log('workExperiences type:', typeof workExperiences, Array.isArray(workExperiences));
    console.log('workExperiences length:', workExperiences?.length);
    console.log('All updates keys:', Object.keys(updates));
    
    // Remove these from updates so they don't try to save to UserProfile
    delete updates.workExperiences;
    delete updates.skills;
    delete updates.education;
    delete updates.certifications;
    delete updates.languages;
    delete updates.socialLinks;
    delete updates.projects;
    delete updates.achievements;
    
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
              bio: true,
              professionalBio: true,
              profilePicture: true,
              currentRole: true,
              currentCompany: true,
              linkedin: true,
              github: true,
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
            const workExpData = normalizedWorkExperiences.map((exp) => ({
              profileId: profileId,
              company: exp.company || '',
              role: exp.role || '',
              location: exp.location || null,
              startDate: exp.startDate || '',
              endDate: exp.isCurrent ? null : (exp.endDate || null),
              isCurrent: Boolean(exp.isCurrent),
              description: exp.description || null,
              projectType: exp.projectType || 'Full-time'
            }));
            
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
      if (Array.isArray(education)) {
        console.log('Processing education:', { count: education.length, profileId });
        try {
          await prisma.education.deleteMany({ where: { profileId: profileId } });
          if (education.length > 0) {
            await prisma.education.createMany({
              data: education.map(edu => ({
                profileId: profileId,
                institution: edu.institution || '',
                degree: edu.degree || null,
                field: edu.field || null,
                startDate: edu.startDate || null,
                endDate: edu.endDate || edu.graduationDate || null,
                gpa: edu.gpa || null,
                honors: edu.honors || null,
                location: edu.location || null,
                description: edu.description || null
              }))
            });
            console.log('Successfully created education records');
          }
        } catch (eduError) {
          console.error('Error saving education:', eduError);
          throw new Error(`Failed to save education: ${eduError.message}`);
        }
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

      // Handle socialLinks - replace all existing ones
      if (Array.isArray(socialLinks)) {
        console.log('Processing socialLinks:', { count: socialLinks.length, profileId });
        try {
          await prisma.socialLink.deleteMany({ where: { profileId: profileId } });
          if (socialLinks.length > 0) {
            await prisma.socialLink.createMany({
              data: socialLinks.map(link => ({
                profileId: profileId,
                platform: link.platform || '',
                url: link.url || ''
              }))
            });
            console.log('Successfully created social link records');
          }
        } catch (linkError) {
          console.error('Error saving social links:', linkError);
          throw new Error(`Failed to save social links: ${linkError.message}`);
        }
      }

      // Handle projects - replace all existing ones
      if (Array.isArray(projects)) {
        console.log('Processing projects:', { count: projects.length, profileId });
        try {
          await prisma.project.deleteMany({ where: { profileId: profileId } });
          if (projects.length > 0) {
            await prisma.project.createMany({
              data: projects.map(proj => ({
                profileId: profileId,
                title: proj.title || '',
                description: proj.description || null,
                technologies: proj.technologies || null,
                date: proj.date || null,
                link: proj.link || null,
                github: proj.github || null
              }))
            });
            console.log('Successfully created project records');
          }
        } catch (projError) {
          console.error('Error saving projects:', projError);
          throw new Error(`Failed to save projects: ${projError.message}`);
        }
      }

      // Handle achievements - replace all existing ones
      if (Array.isArray(achievements)) {
        console.log('Processing achievements:', { count: achievements.length, profileId });
        try {
          await prisma.achievement.deleteMany({ where: { profileId: profileId } });
          if (achievements.length > 0) {
            await prisma.achievement.createMany({
              data: achievements.map(ach => ({
                profileId: profileId,
                type: ach.type || '',
                title: ach.title || '',
                description: ach.description || null,
                date: ach.date || null,
                link: ach.link || null
              }))
            });
            console.log('Successfully created achievement records');
          }
        } catch (achError) {
          console.error('Error saving achievements:', achError);
          throw new Error(`Failed to save achievements: ${achError.message}`);
        }
      }
      
      // Handle skills - replace all existing ones
      if (skills !== undefined) {
        const normalizedSkills = normalizeSkillInput(skills);
        
        // Delete all existing user skills for this profile
        await prisma.userSkill.deleteMany({
          where: { profileId: profileId }
        });
        
        // Insert the normalized skills
        for (const skillData of normalizedSkills) {
          const skillName = skillData.name;
          if (!skillName) {
            continue;
          }
            
          // Find or create global skill record
            let skill = await prisma.skill.findUnique({
              where: { name: skillName }
            });
            
            if (!skill) {
              skill = await prisma.skill.create({
                data: {
                  name: skillName,
                category: 'Technical'
                }
              });
            }
            
            await prisma.userSkill.create({
              data: {
                profileId: profileId,
                skillId: skill.id,
                proficiency: skillData.proficiency || 'Beginner',
                yearsOfExperience: skillData.yearsOfExperience || null,
              verified: Boolean(skillData.verified)
              }
            });
        }

        try {
          const cleanupResult = await prisma.skill.deleteMany({
            where: {
              userSkills: {
                none: {}
              }
            }
          });
          if (cleanupResult.count > 0) {
            console.log('Removed unused skills from dictionary:', cleanupResult.count);
          }
        } catch (cleanupError) {
          console.error('Failed to clean up unused skills:', cleanupError);
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
              bio: true,
              professionalBio: true,
              profilePicture: true,
              currentRole: true,
              currentCompany: true,
              linkedin: true,
              github: true,
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
              userSkills: {
                select: {
                  id: true,
                  proficiency: true,
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
              socialLinks: {
                select: {
                  id: true,
                  platform: true,
                  url: true
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
              },
              achievements: {
                orderBy: { date: 'desc' },
                select: {
                  id: true,
                  type: true,
                  title: true,
                  description: true,
                  date: true,
                  link: true
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
      
      // Transform skills array from UserSkill[] to Skill[] format expected by frontend
      if (parsedUser.userSkills && Array.isArray(parsedUser.userSkills)) {
        parsedUser.skills = parsedUser.userSkills.map(us => ({
          name: us.skill.name,
          proficiency: us.proficiency || 'Beginner',
          yearsOfExperience: us.yearsOfExperience,
          verified: us.verified || false
        }));
        delete parsedUser.userSkills;
      } else {
        parsedUser.skills = [];
      }
      
      // Ensure arrays are arrays (not null/undefined)
      parsedUser.workExperiences = parsedUser.workExperiences || [];
      parsedUser.education = Array.isArray(parsedUser.education) ? parsedUser.education.map((edu) => {
        if (!edu || typeof edu !== 'object') {
          return null;
        }

        return {
          ...edu,
          startDate: edu.startDate || null,
          endDate: edu.endDate || edu.graduationDate || null,
          gpa: edu.gpa || null,
          honors: edu.honors || null,
          location: edu.location || null,
          description: edu.description || null,
        };
      }).filter(Boolean) : [];
      parsedUser.certifications = parsedUser.certifications || [];
      parsedUser.socialLinks = parsedUser.socialLinks || [];
      parsedUser.projects = parsedUser.projects || [];
      parsedUser.achievements = parsedUser.achievements || [];

      if (!parsedUser.professionalBio && parsedUser.bio) {
        parsedUser.professionalBio = parsedUser.bio;
      } else if (parsedUser.professionalBio && !parsedUser.bio) {
        parsedUser.bio = parsedUser.professionalBio;
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
              bio: true,
              profilePicture: true,
              currentRole: true,
              currentCompany: true
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
        where: { id: userId }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      // Parse JSON fields
      const parsedUser = { ...user };
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores'];
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
              bio: true,
              professionalBio: true,
              currentRole: true,
              currentCompany: true,
              linkedin: true,
              github: true,
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
        bio: parsedUser.bio || null,
        professionalBio: parsedUser.professionalBio || parsedUser.bio || null,
        currentRole: parsedUser.currentRole || null,
        currentCompany: parsedUser.currentCompany || null,
        skills: parsedUser.privacyLevel === 'Professional' ? parsedUser.skills : [],
        linkedin: parsedUser.linkedin || null,
        github: parsedUser.github || null,
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

