/**
 * User Routes Module
 * 
 * Handles user profile and user-related routes
 */

const { getUserById } = require('../auth');
const { authenticate } = require('../middleware/auth');
const { validateEmail } = require('../utils/validation');
const { errorHandler } = require('../utils/errorMiddleware');

/**
 * Register all user routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function userRoutes(fastify, options) {
  // Get user profile
  fastify.get('/api/users/profile', {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user.userId;
    const { prisma } = require('../utils/db');
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          profilePicture: true,
          firstName: true,
          lastName: true,
          phone: true,
          location: true,
          bio: true,
          currentRole: true,
          currentCompany: true,
          experience: true,
          industry: true,
          jobLevel: true,
          employmentType: true,
          availability: true,
          salaryExpectation: true,
          workPreference: true,
          linkedin: true,
          github: true,
          website: true,
          skills: true,
          certifications: true,
          languages: true,
          education: true,
          careerGoals: true,
          targetRoles: true,
          targetCompanies: true,
          socialLinks: true,
          projects: true,
          achievements: true,
          careerTimeline: true,
          jobAlerts: true,
          emailNotifications: true,
          smsNotifications: true,
          privacyLevel: true,
          profileVisibility: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }
      
      // Parse JSON fields back to arrays/objects
      const parsedUser = { ...user };
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline'];
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
    const userId = request.user.userId;
    const updates = request.body;
    
    // Get user first to verify they exist
    const user = await getUserById(userId);
    if (!user) {
      reply.status(404).send({ error: 'User not found' });
      return;
    }

    // Define allowed fields that exist in schema
    const allowedFields = [
      'name', 'email', 'profilePicture',
      'firstName', 'lastName', 'phone', 'location', 'bio',
      'currentRole', 'currentCompany', 'experience', 'industry',
      'jobLevel', 'employmentType', 'availability', 'salaryExpectation', 'workPreference',
      'linkedin', 'github', 'website',
      'skills', 'certifications', 'languages', 'education',
      'careerGoals', 'targetRoles', 'targetCompanies',
      'socialLinks', 'projects', 'achievements', 'careerTimeline',
      'jobAlerts', 'emailNotifications', 'smsNotifications',
      'privacyLevel', 'profileVisibility'
    ];
    
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // Handle JSON array fields - stringify arrays/objects
        const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline'];
        if (jsonFields.includes(field)) {
          if (Array.isArray(updates[field]) || typeof updates[field] === 'object') {
            updateData[field] = JSON.stringify(updates[field]);
          } else if (updates[field] === null || updates[field] === undefined) {
            updateData[field] = null;
          }
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    // If email is being updated, validate it
    if (updateData.email && !validateEmail(updateData.email)) {
      reply.status(400).send({ error: 'Invalid email format' });
      return;
    }

    // Update name field if firstName/lastName are provided but name is not
    if ((updateData.firstName || updateData.lastName) && !updateData.name) {
      const firstName = updateData.firstName || user.firstName || '';
      const lastName = updateData.lastName || user.lastName || '';
      updateData.name = `${firstName} ${lastName}`.trim() || user.name;
    }

    // Update in database
    const { prisma } = require('../utils/db');
    
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          profilePicture: true,
          firstName: true,
          lastName: true,
          phone: true,
          location: true,
          bio: true,
          currentRole: true,
          currentCompany: true,
          experience: true,
          industry: true,
          jobLevel: true,
          employmentType: true,
          availability: true,
          salaryExpectation: true,
          workPreference: true,
          linkedin: true,
          github: true,
          website: true,
          skills: true,
          certifications: true,
          languages: true,
          education: true,
          careerGoals: true,
          targetRoles: true,
          targetCompanies: true,
          socialLinks: true,
          projects: true,
          achievements: true,
          careerTimeline: true,
          jobAlerts: true,
          emailNotifications: true,
          smsNotifications: true,
          privacyLevel: true,
          profileVisibility: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Parse JSON fields back to arrays/objects
      const parsedUser = { ...updatedUser };
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline'];
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
      
      // Validate file size (5MB max for profile pictures)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const buffer = await data.toBuffer();
      
      if (buffer.length > maxSize) {
        return reply.status(400).send({ error: 'File too large (max 5MB)' });
      }
      
      // Convert image to base64 data URL for storage
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${data.mimetype};base64,${base64Data}`;
      
      // Update user's profile picture
      const { prisma } = require('../utils/db');
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: dataUrl },
        select: {
          id: true,
          email: true,
          name: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      return {
        success: true,
        profilePicture: updatedUser.profilePicture,
        user: updatedUser
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      reply.status(500).send({ error: 'Failed to upload profile picture', details: error.message });
      return;
    }
  });

  // Parse resume and extract profile information
  fastify.post('/api/users/profile/parse-resume', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({ error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' });
      }

      // Extract text from file
      const { extractTextFromFile } = require('../utils/documentExtractor');
      const buffer = await data.toBuffer();
      
      let resumeText;
      try {
        resumeText = await extractTextFromFile(buffer, data.mimetype);
      } catch (extractError) {
        console.error('Error extracting text from file:', extractError);
        return reply.status(400).send({ 
          error: 'Failed to extract text from file',
          details: extractError.message || 'File may be corrupted or unsupported format'
        });
      }

      if (!resumeText || resumeText.trim().length === 0) {
        return reply.status(400).send({ 
          error: 'Could not extract text from file',
          details: 'The file may be corrupted, empty, image-based (scanned), or encrypted. Please try a text-based PDF/DOCX file.'
        });
      }

      // Parse resume text
      let parsedData;
      try {
        const { parseResumeText } = require('../utils/resumeParser');
        parsedData = await parseResumeText(resumeText);
      } catch (parseError) {
        console.error('Error parsing resume text:', parseError);
        return reply.status(500).send({ 
          error: 'Failed to parse resume content',
          details: parseError.message || 'Unable to extract information from resume'
        });
      }

      if (!parsedData || Object.keys(parsedData).length === 0) {
        return reply.status(400).send({ 
          error: 'No data could be extracted from resume',
          details: 'The resume format may not be supported or the file may be corrupted'
        });
      }

      return {
        success: true,
        parsedData
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      console.error('Error stack:', error.stack);
      reply.status(500).send({ 
        error: 'Failed to parse resume', 
        details: error.message || 'An unexpected error occurred while parsing the resume'
      });
      return;
    }
  });
}

module.exports = userRoutes;

