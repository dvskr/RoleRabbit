/**
 * Authentication Routes Module
 * 
 * Handles all authentication-related routes including:
 * - User registration and login
 * - Token refresh and logout
 * - Password reset
 * - Session management
 * - 2FA (via separate twoFactorAuth.routes.js)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import utilities
const { registerUser, authenticateUser, getUserById, resetUserPassword } = require('../auth');
const { createRefreshToken, verifyRefreshToken, deleteAllUserRefreshTokens } = require('../utils/refreshToken');
const { createSession, getUserSessions, deactivateSession } = require('../utils/sessionManager');
const { createPasswordResetToken } = require('../utils/passwordReset');
const { sendWelcomeEmail, sendPasswordResetEmail, sendOTPEmail, sendEmailChangeNotification, sendEmailChangeConfirmation } = require('../utils/emailService');
const { sendOTPToEmail, verifyOTP, createOTP } = require('../utils/otpService');
const { validateEmail, validatePassword, validateRequired, validateLength } = require('../utils/validation');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

// In-memory store for pending email changes (userId -> { newEmail, verifiedCurrent })
// In production, consider using Redis or database
const pendingEmailChanges = new Map();

/**
 * Register all authentication routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function authRoutes(fastify, options) {
  // Register user endpoint
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { email, password, name } = request.body;
      
      // Validate required fields
      const requiredValidation = validateRequired(['email', 'password', 'name'], request.body);
      if (!requiredValidation.isValid) {
        return reply.status(400).send({
          success: false,
          error: `Missing required fields: ${requiredValidation.missing.join(', ')}`
        });
      }
      
      // Validate email format
      if (!validateEmail(email)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid email format'
        });
      }
      
      // Validate password strength
      if (!validatePassword(password)) {
        return reply.status(400).send({
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
      }
      
      // Validate name length
      const nameValidation = validateLength('Name', name, 1, 100);
      if (!nameValidation.isValid) {
        return reply.status(400).send({
          success: false,
          error: nameValidation.message
        });
      }
      
      const user = await registerUser(email, password, name);
      
      // Send welcome email
      try {
        await sendWelcomeEmail(user, prisma);
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }
      
      // Generate JWT access token (persists until logout: 1 year)
      const accessToken = fastify.jwt.sign({ 
        userId: user.id, 
        email: user.email 
      }, { expiresIn: '365d' });
      
      // Create refresh token (persists until logout: 10 years)
      const refreshToken = await createRefreshToken(user.id, 3650);
      
      // Create session (persists until logout: 10 years expiration)
      const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      const userAgent = request.headers['user-agent'];
      const sessionId = await createSession(user.id, ipAddress, userAgent, 3650);
      
      // Set access token in httpOnly cookie (1 year - browser cookie limit)
      reply.setCookie('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (browser cookie limit)
        path: '/'
      });
      
      // Set refresh token in httpOnly cookie (1 year - browser cookie limit)
      reply.setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (browser cookie limit)
        path: '/'
      });
      
      // Set session ID in httpOnly cookie (1 year expiration, session persists until logout)
      reply.setCookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (cookie expiration, session persists longer)
        path: '/'
      });
      
      reply.send({
        success: true,
        user,
        token: accessToken,
        refreshToken
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // Login endpoint
  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;
      
      // Validate required fields
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          error: 'Email and password are required'
        });
      }
      
      let user;
      try {
        user = await authenticateUser(email, password);
      } catch (authError) {
        // Log authentication error but don't expose details
        console.error('Authentication failed for email:', email);
        return reply.status(401).send({
          success: false,
          error: authError.message || 'Invalid credentials'
        });
      }
      
      // Check if user has 2FA enabled
      if (user.twoFactorEnabled) {
        // Return 2FA requirement instead of full login
        return reply.code(200).send({
          success: true,
          requires2FA: true,
          message: '2FA verification required',
          userId: user.id,
          email: user.email
        });
      }
      
      // Generate JWT access token (persists until logout: 1 year)
      const accessToken = fastify.jwt.sign({ 
        userId: user.id, 
        email: user.email 
      }, { expiresIn: '365d' });
      
      // Create refresh token (persists until logout: 10 years)
      const refreshToken = await createRefreshToken(user.id, 3650);
      
      // Create session (persists until logout - 10 years expiration)
      const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
      const userAgent = request.headers['user-agent'];
      const sessionId = await createSession(user.id, ipAddress, userAgent, 3650); // 10 years
      
      // Fetch user profile data
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
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
          createdAt: true,
          updatedAt: true
        }
      });
      
      // Prepare user object first - ensure it's serializable
      // Merge user and profile data
      const safeUser = {
        id: String(user.id),
        email: String(user.email || ''),
        name: user.name ? String(user.name) : null,
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: false, // Not supported in current database schema
        privacyLevel: null, // Not supported in current database schema
        profileVisibility: null, // Not supported in current database schema
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
        // Merge profile data if it exists
        ...(userProfile ? {
          firstName: userProfile.firstName || null,
          lastName: userProfile.lastName || null,
          phone: userProfile.phone || null,
          personalEmail: userProfile.personalEmail || null,
          location: userProfile.location || null,
          profilePicture: userProfile.profilePicture || null,
          professionalBio: userProfile.professionalBio || null,
          linkedin: userProfile.linkedin || null,
          github: userProfile.github || null,
          portfolio: userProfile.portfolio || null,
          website: userProfile.website || null
        } : {})
      };
      
      // Remove null/undefined values to prevent serialization issues
      const cleanedUser = {};
      Object.keys(safeUser).forEach(key => {
        if (safeUser[key] !== undefined && safeUser[key] !== null) {
          cleanedUser[key] = safeUser[key];
        }
      });
      
      // Prepare response object
      const responseData = {
        success: true,
        user: cleanedUser,
        token: String(accessToken)
      };
      
      // Set cookies before sending response (persists until logout: 1 year cookie expiration)
      reply.setCookie('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (browser cookie limit)
        path: '/'
      });
      
      reply.setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (browser cookie limit)
        path: '/'
      });
      
      reply.setCookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (cookie expiration, session persists until logout)
        path: '/'
      });
      
      // Send response - ensure it's fully sent before handler completes
      // Don't return anything - let Fastify handle the response naturally
      reply.code(200).send(responseData);
    } catch (error) {
      console.error('Login endpoint error:', error);
      console.error('Error stack:', error.stack);
      
      // Ensure we always send a valid JSON response
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({
        success: false,
        error: error.message || 'An unexpected error occurred during login'
      });
    }
  });

  // Refresh token endpoint
  fastify.post('/api/auth/refresh', async (request, reply) => {
    try {
      // Get refresh token from cookies
      const refreshToken = request.cookies.refresh_token;
      
      if (!refreshToken) {
        return reply.status(401).send({
          success: false,
          error: 'No refresh token provided'
        });
      }
      
      // Verify refresh token
      const result = await verifyRefreshToken(refreshToken);
      
      if (!result || !result.user) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid or expired refresh token'
        });
      }
      
      // Generate new access token (persists until logout: 1 year)
      const accessToken = fastify.jwt.sign({ 
        userId: result.user.id, 
        email: result.user.email 
      }, { expiresIn: '365d' });
      
      // Set new access token in httpOnly cookie (persists until logout: 1 year)
      reply.setCookie('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year (browser cookie limit)
        path: '/',
        // Don't set domain - let browser handle it (works for localhost)
      });
      
      reply.send({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      reply.status(401).send({
        success: false,
        error: error.message
      });
    }
  });

  // Logout endpoint
  fastify.post('/api/auth/logout', async (request, reply) => {
    try {
      // Get tokens and session from cookies before clearing
      const refreshToken = request.cookies.refresh_token;
      const sessionId = request.cookies.session_id;
      
      // Delete the refresh tokens from database
      if (refreshToken) {
        const result = await verifyRefreshToken(refreshToken);
        if (result && result.userId) {
          await deleteAllUserRefreshTokens(result.userId);
        }
      }
      
      // Deactivate the session
      if (sessionId) {
        await deactivateSession(sessionId);
      }
    } catch (error) {
      logger.error('Error during logout cleanup:', error);
    }
    
    // Clear all auth-related cookies
    reply.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    reply.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    reply.clearCookie('session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    reply.send({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // Verify token endpoint
  fastify.get('/api/auth/verify', {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user.userId;
    const user = await getUserById(userId);
    
    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      });
    }
    
    // Fetch user profile data
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
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
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Merge user and profile data
    const userWithProfile = {
      ...user,
      ...(userProfile ? {
        firstName: userProfile.firstName || null,
        lastName: userProfile.lastName || null,
        phone: userProfile.phone || null,
        personalEmail: userProfile.personalEmail || null,
        location: userProfile.location || null,
        profilePicture: userProfile.profilePicture || null,
        professionalBio: userProfile.professionalBio || null,
        linkedin: userProfile.linkedin || null,
        github: userProfile.github || null,
        portfolio: userProfile.portfolio || null,
        website: userProfile.website || null
      } : {})
    };
    
    // Convert dates to ISO strings for serialization
    if (userWithProfile.createdAt instanceof Date) {
      userWithProfile.createdAt = userWithProfile.createdAt.toISOString();
    }
    if (userWithProfile.updatedAt instanceof Date) {
      userWithProfile.updatedAt = userWithProfile.updatedAt.toISOString();
    }
    
    reply.send({
      success: true,
      user: userWithProfile
    });
  });

  // Get user sessions endpoint
  fastify.get('/api/auth/sessions', {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user.userId;
    const sessions = await getUserSessions(userId);
    
    reply.send({
      success: true,
      sessions
    });
  });

  // Forgot password endpoint
  fastify.post('/api/auth/forgot-password', async (request, reply) => {
    try {
      const { email } = request.body;
      
      if (!email) {
        return reply.status(400).send({
          success: false,
          error: 'Email is required'
        });
      }
      
      // Find user by email (only select fields that exist in users table)
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true
        }
      });
      
      if (!user) {
        // Don't reveal if user exists or not (security best practice)
        return reply.send({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }
      
      // Create password reset token
      const resetToken = await createPasswordResetToken(user.id, 1); // 1 hour expiration
      
      // Send password reset email
      try {
        await sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        // In production, don't reveal this error
        return reply.send({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }
      
      // For development mode only - log the reset link
      let resetLink;
      if (process.env.NODE_ENV !== 'production') {
        resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        logger.info('Password reset link:', resetLink);
      }
      
      reply.send({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Only include resetLink in development mode
        ...(process.env.NODE_ENV !== 'production' && { resetLink })
      });
    } catch (error) {
      logger.error('Error in forgot password:', error);
      reply.status(500).send({
        success: false,
        error: 'An error occurred while processing your request'
      });
    }
  });

  // Reset password endpoint
  fastify.post('/api/auth/reset-password', async (request, reply) => {
    try {
      const { token, newPassword } = request.body;
      
      if (!token || !newPassword) {
        return reply.status(400).send({
          success: false,
          error: 'Token and new password are required'
        });
      }
      
      // Reset the password
      await resetUserPassword(token, newPassword);
      
      reply.send({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      logger.error('Error in reset password:', error);
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // Change password endpoint (for authenticated users)
  const changePasswordHandler = async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { currentPassword, newPassword, confirmPassword } = request.body;
      
      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return reply.status(400).send({
          success: false,
          error: 'Current password, new password, and confirmation are required'
        });
      }
      
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return reply.status(400).send({
          success: false,
          error: 'New password and confirmation do not match'
        });
      }
      
      // Validate password strength
      if (!validatePassword(newPassword)) {
        return reply.status(400).send({
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
      }
      
      // Update password using auth utility
      const { updateUserPassword } = require('../auth');
      await updateUserPassword(userId, currentPassword, newPassword);
      
      reply.send({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Error changing password:', error);
      reply.status(400).send({
        success: false,
        error: error.message || 'Failed to change password'
      });
    }
  };

  fastify.put('/api/auth/password', {
    preHandler: authenticate
  }, changePasswordHandler);

  // Backwards compatibility for older clients hitting /password/change
  fastify.put('/api/auth/password/change', {
    preHandler: authenticate
  }, changePasswordHandler);

  fastify.post('/api/auth/password/change', {
    preHandler: authenticate
  }, changePasswordHandler);

  // Send OTP to current email for verification
  fastify.post('/api/auth/send-otp', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { purpose } = request.body; // 'email_update' or 'password_reset'

      if (!purpose || !['email_update', 'password_reset'].includes(purpose)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid purpose. Must be "email_update" or "password_reset"'
        });
      }

      // Get user's current email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }

      // Create and send OTP
      const result = await sendOTPToEmail(user.email, purpose);
      
      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: result.error || 'Failed to send OTP'
        });
      }

      // Send OTP email
      try {
        await sendOTPEmail(user.email, result.otp, purpose);
      } catch (emailError) {
        logger.error('Failed to send OTP email:', emailError);
        return reply.status(500).send({
          success: false,
          error: 'Failed to send OTP email'
        });
      }

      reply.send({
        success: true,
        message: 'OTP has been sent to your email'
      });
    } catch (error) {
      logger.error('Error sending OTP:', error);
      reply.status(500).send({
        success: false,
        error: 'An error occurred while sending OTP'
      });
    }
  });

  // Send OTP to new email address
  fastify.post('/api/auth/send-otp-to-new-email', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { newEmail } = request.body;

      if (!newEmail) {
        return reply.status(400).send({
          success: false,
          error: 'New email is required'
        });
      }

      if (!validateEmail(newEmail)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Check if pending email change exists (current email must be verified first)
      const pendingChange = pendingEmailChanges.get(userId);
      if (!pendingChange || !pendingChange.verifiedCurrent) {
        return reply.status(400).send({
          success: false,
          error: 'Please verify your current email first'
        });
      }

      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail.toLowerCase() }
      });

      if (existingUser && existingUser.id !== userId) {
        return reply.status(400).send({
          success: false,
          error: 'Email is already in use'
        });
      }

      // Create OTP for new email (use special purpose 'email_update_new')
      const otp = await createOTP(userId, newEmail, 'email_update');
      
      // Send OTP email to new address
      try {
        await sendOTPEmail(newEmail, otp, 'email_update');
      } catch (emailError) {
        logger.error('Failed to send OTP to new email:', emailError);
        return reply.status(500).send({
          success: false,
          error: 'Failed to send verification code to new email'
        });
      }

      reply.send({
        success: true,
        message: 'Verification code has been sent to your new email address'
      });
    } catch (error) {
      logger.error('Error sending OTP to new email:', error);
      reply.status(500).send({
        success: false,
        error: 'An error occurred while sending verification code'
      });
    }
  });

  // Verify OTP and update email (two-step verification)
  fastify.post('/api/auth/verify-otp-update-email', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { otp, newEmail, step } = request.body;

      if (!otp || !newEmail) {
        return reply.status(400).send({
          success: false,
          error: 'OTP and new email are required'
        });
      }

      if (!validateEmail(newEmail)) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid email format'
        });
      }

      const verificationStep = step || 'verify_current';

      if (verificationStep === 'verify_current') {
        // Step 1: Verify current email OTP
        const isValid = await verifyOTP(userId, otp, 'email_update');
        if (!isValid) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid or expired OTP'
          });
        }

        // Store pending email change
        pendingEmailChanges.set(userId, {
          newEmail: newEmail.toLowerCase(),
          verifiedCurrent: true,
          timestamp: Date.now()
        });

        // Send notification to current email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });

        if (user) {
          try {
            await sendEmailChangeNotification(user.email, newEmail);
          } catch (emailError) {
            logger.error('Failed to send email change notification:', emailError);
            // Don't fail the request if notification fails
          }
        }

        reply.send({
          success: true,
          message: 'Current email verified. Please verify your new email address.'
        });
      } else if (verificationStep === 'verify_new') {
        // Step 2: Verify new email OTP and complete the change
        const pendingChange = pendingEmailChanges.get(userId);
        if (!pendingChange || !pendingChange.verifiedCurrent) {
          return reply.status(400).send({
            success: false,
            error: 'Please verify your current email first'
          });
        }

        if (pendingChange.newEmail !== newEmail.toLowerCase()) {
          return reply.status(400).send({
            success: false,
            error: 'New email does not match the pending change'
          });
        }

        // Verify OTP for new email
        const isValid = await verifyOTP(userId, otp, 'email_update');
        if (!isValid) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid or expired OTP'
          });
        }

        // Get current email before updating
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });

        const oldEmail = user?.email;

        // Update email
        await prisma.user.update({
          where: { id: userId },
          data: { email: newEmail.toLowerCase() }
        });

        // Clear pending change
        pendingEmailChanges.delete(userId);

        // Send confirmation emails to both addresses
        try {
          if (oldEmail) {
            await sendEmailChangeConfirmation(oldEmail, newEmail, 'old');
          }
          await sendEmailChangeConfirmation(newEmail, newEmail, 'new');
        } catch (emailError) {
          logger.error('Failed to send email change confirmation:', emailError);
          // Don't fail the request if emails fail
        }

        logger.info(`Email updated for user ${userId} from ${oldEmail} to ${newEmail}`);

        reply.send({
          success: true,
          message: 'Email updated successfully'
        });
      } else {
        return reply.status(400).send({
          success: false,
          error: 'Invalid verification step'
        });
      }
    } catch (error) {
      logger.error('Error updating email:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update email'
      });
    }
  });

  // Verify OTP and reset password (for forgot password flow)
  fastify.post('/api/auth/verify-otp-reset-password', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { otp, newPassword, confirmPassword } = request.body;

      if (!otp || !newPassword || !confirmPassword) {
        return reply.status(400).send({
          success: false,
          error: 'OTP, new password, and confirmation are required'
        });
      }

      if (newPassword !== confirmPassword) {
        return reply.status(400).send({
          success: false,
          error: 'Passwords do not match'
        });
      }

      if (!validatePassword(newPassword)) {
        return reply.status(400).send({
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
      }

      // Verify OTP
      const isValid = await verifyOTP(userId, otp, 'password_reset');
      if (!isValid) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid or expired OTP'
        });
      }

      // Update password
      const { updateUserPassword } = require('../auth');
      await updateUserPassword(userId, null, newPassword); // Pass null for current password since we verified via OTP

      logger.info(`Password reset via OTP for user ${userId}`);

      reply.send({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Error resetting password:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Failed to reset password'
      });
    }
  });
}

module.exports = authRoutes;

