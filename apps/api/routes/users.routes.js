/**
 * User Routes Module
 * 
 * Handles user profile and user-related routes
 */

const { getUserById } = require('../auth');
const { authenticate } = require('../middleware/auth');
const { validateEmail } = require('../utils/validation');
const { errorHandler } = require('../utils/errorMiddleware');
const logger = require('../utils/logger');

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
          workExperiences: true,
          volunteerExperiences: true,
          recommendations: true,
          publications: true,
          patents: true,
          organizations: true,
          testScores: true,
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
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores'];
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
      'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores',
      'jobAlerts', 'emailNotifications', 'smsNotifications',
      'privacyLevel', 'profileVisibility'
    ];
    
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // Handle JSON array fields - stringify arrays/objects
        const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores'];
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
          workExperiences: true,
          volunteerExperiences: true,
          recommendations: true,
          publications: true,
          patents: true,
          organizations: true,
          testScores: true,
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
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores'];
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

      // Auto-calculate and update profile completeness
      try {
        const { calculateProfileCompleteness } = require('../utils/profileCompleteness');
        const completeness = calculateProfileCompleteness(parsedUser);
        await prisma.user.update({
          where: { id: userId },
          data: { profileCompleteness: completeness.score }
        });
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
          phone: true,
          location: true,
          bio: true,
          profilePicture: true,
          currentRole: true,
          currentCompany: true,
          experience: true,
          industry: true,
          jobLevel: true,
          skills: true,
          education: true,
          workExperiences: true,
          careerGoals: true,
          targetRoles: true,
          targetCompanies: true
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      const completeness = calculateProfileCompleteness(user);
      
      // Update completeness in database
      await prisma.user.update({
        where: { id: userId },
        data: { 
          profileCompleteness: completeness.score
        }
      });
      
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
      const jsonFields = ['skills', 'certifications', 'languages', 'education', 'careerGoals', 'targetRoles', 'targetCompanies', 'socialLinks', 'projects', 'achievements', 'careerTimeline', 'workExperiences', 'volunteerExperiences', 'recommendations', 'publications', 'patents', 'organizations', 'testScores'];
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
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          profilePicture: true,
          bio: true,
          currentRole: true,
          currentCompany: true,
          industry: true,
          skills: true,
          linkedin: true,
          github: true,
          website: true,
          profileVisibility: true,
          privacyLevel: true
        }
      });
      
      if (!user) {
        return reply.status(404).send({ error: 'Profile not found' });
      }
      
      // Check if profile is public
      if (user.profileVisibility !== 'Public') {
        return reply.status(403).send({ error: 'Profile is not public' });
      }
      
      // Increment profile views
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileViews: {
            increment: 1
          }
        }
      });
      
      // Parse JSON fields
      const parsedUser = { ...user };
      if (parsedUser.skills) {
        try {
          parsedUser.skills = JSON.parse(parsedUser.skills);
        } catch (e) {
          parsedUser.skills = [];
        }
      } else {
        parsedUser.skills = [];
      }
      
      // Remove sensitive fields based on privacy level
      const publicProfile = {
        id: parsedUser.id,
        name: parsedUser.name,
        profilePicture: parsedUser.profilePicture,
        bio: parsedUser.bio,
        currentRole: parsedUser.currentRole,
        currentCompany: parsedUser.currentCompany,
        industry: parsedUser.industry,
        skills: parsedUser.privacyLevel === 'Professional' ? parsedUser.skills : [],
        linkedin: parsedUser.linkedin,
        github: parsedUser.github,
        website: parsedUser.website
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

