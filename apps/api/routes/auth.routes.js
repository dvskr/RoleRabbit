/**
 * Authentication Routes
 * 
 * Enhanced authentication endpoints with security features:
 * - Login with rate limiting
 * - Registration with password strength validation
 * - Token refresh
 * - Logout
 * - 2FA setup and verification
 * - Password reset
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');
const { ipRateLimit } = require('../middleware/ipRateLimit');
const { validatePasswordStrength } = require('../middleware/passwordStrength');
const { generateTokenPair, refreshAccessToken, logout } = require('../middleware/sessionManagement');
const { enable2FA, verify2FASetup, disable2FA } = require('../middleware/twoFactorAuth');
const { detectSuspiciousActivity, ACTIVITY_TYPES } = require('../utils/suspiciousActivityDetection');
const { logPIIAccess } = require('../middleware/piiAccessLog');

/**
 * Register new user
 * POST /api/auth/register
 */
router.post(
  '/register',
  ipRateLimit('signup'),
  validatePasswordStrength,
  async (req, res) => {
    const { email, password, name } = req.body;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists',
          code: 'USER_EXISTS',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          tier: 'FREE',
          resumeAiUsageCount: 0,
          resumeAiUsageLimit: 10,
          aiProcessingConsent: true,
          analyticsConsent: true,
          marketingConsent: false,
        },
      });

      // Generate tokens
      const tokens = generateTokenPair(user.id, user.email);

      // Log registration
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          resourceType: 'USER',
          resourceId: user.id,
          ipAddress: req.ip,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
        },
        ...tokens,
        warnings: req.passwordWarnings,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_FAILED',
      });
    }
  }
);

/**
 * Login
 * POST /api/auth/login
 */
router.post(
  '/login',
  ipRateLimit('login'),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || user.deletedAt) {
        // Log failed attempt
        await prisma.auditLog.create({
          data: {
            userId: email,
            action: 'LOGIN_FAILED',
            resourceType: 'USER',
            resourceId: email,
            ipAddress: req.ip,
            metadata: {
              reason: 'USER_NOT_FOUND',
              timestamp: new Date().toISOString(),
            },
          },
        });

        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        // Log failed attempt
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_FAILED',
            resourceType: 'USER',
            resourceId: user.id,
            ipAddress: req.ip,
            metadata: {
              reason: 'INVALID_PASSWORD',
              timestamp: new Date().toISOString(),
            },
          },
        });

        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Generate tokens
      const tokens = generateTokenPair(user.id, user.email);

      // Log successful login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          resourceType: 'USER',
          resourceId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Detect suspicious activity
      await detectSuspiciousActivity(user.id, ACTIVITY_TYPES.LOGIN, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Login failed:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        code: 'LOGIN_FAILED',
      });
    }
  }
);

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
router.post('/refresh', refreshAccessToken);

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, logout);

/**
 * Enable 2FA
 * POST /api/auth/2fa/enable
 */
router.post(
  '/2fa/enable',
  authenticateToken,
  logPIIAccess('ENABLE_2FA'),
  async (req, res) => {
    const userId = req.user.userId;

    try {
      const setup = await enable2FA(userId);

      res.json({
        success: true,
        message: 'Scan QR code with authenticator app and verify with code',
        ...setup,
      });
    } catch (error) {
      console.error('2FA enable failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to enable 2FA',
        code: '2FA_ENABLE_FAILED',
      });
    }
  }
);

/**
 * Verify and activate 2FA
 * POST /api/auth/2fa/verify
 */
router.post(
  '/2fa/verify',
  authenticateToken,
  async (req, res) => {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '2FA code required',
        code: 'CODE_REQUIRED',
      });
    }

    try {
      const verified = await verify2FASetup(userId, code);

      if (verified) {
        res.json({
          success: true,
          message: '2FA enabled successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid 2FA code',
          code: 'INVALID_CODE',
        });
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA',
        code: '2FA_VERIFY_FAILED',
      });
    }
  }
);

/**
 * Disable 2FA
 * POST /api/auth/2fa/disable
 */
router.post(
  '/2fa/disable',
  authenticateToken,
  logPIIAccess('DISABLE_2FA'),
  async (req, res) => {
    const userId = req.user.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '2FA code required to disable',
        code: 'CODE_REQUIRED',
      });
    }

    try {
      await disable2FA(userId, code);

      res.json({
        success: true,
        message: '2FA disabled successfully',
      });
    } catch (error) {
      console.error('2FA disable failed:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to disable 2FA',
        code: '2FA_DISABLE_FAILED',
      });
    }
  }
);

/**
 * Request password reset
 * POST /api/auth/password-reset/request
 */
router.post(
  '/password-reset/request',
  ipRateLimit('passwordReset'),
  async (req, res) => {
    const { email } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Always return success (don't reveal if email exists)
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account exists, password reset email will be sent',
        });
      }

      // Generate reset token (implement token generation and email sending)
      // TODO: Implement password reset token generation and email
      
      res.json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (error) {
      console.error('Password reset request failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to request password reset',
        code: 'RESET_REQUEST_FAILED',
      });
    }
  }
);

module.exports = router;
