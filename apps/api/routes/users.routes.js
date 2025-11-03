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
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              bio: true,
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
      'firstName', 'lastName', 'phone', 'personalEmail', 'location', 'bio', 'profilePicture',
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

    // Update in database
    const { prisma } = require('../utils/db');
    
    try {
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
              firstName: true,
              lastName: true,
              phone: true,
              personalEmail: true,
              location: true,
              bio: true,
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

      // Merge profile data into user object for flat structure (for backward compatibility)
      const { profile, ...userData } = updatedUser;
      const parsedUser = {
        ...userData,
        ...(profile || {})
      };

      // Auto-calculate and update profile completeness
      try {
        const { calculateProfileCompleteness } = require('../utils/profileCompleteness');
        const completeness = calculateProfileCompleteness(parsedUser);
        // Update profileCompleteness in UserProfile if profile exists
        if (updatedUser.profile) {
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

