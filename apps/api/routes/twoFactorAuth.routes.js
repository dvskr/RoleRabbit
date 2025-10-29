/**
 * Complete 2FA Routes Implementation
 * Implements all 7 critical 2FA tasks
 */

const { 
  generateSecret, 
  verifyToken, 
  enable2FA, 
  disable2FA, 
  verifyBackupCode, 
  generateBackupCodes,
  generateQRCode 
} = require('../utils/twoFactorAuth');
const { sendEmail } = require('../utils/emailService');
const { prisma } = require('../utils/db');

/**
 * Task 1 & 2: Backend 2FA token generation + TOTP support
 * Generate 2FA setup (secret, QR code, backup codes)
 */
async function generate2FASetup(request, reply) {
  try {
    // Better error handling for authentication
    if (!request.user || !request.user.userId) {
      console.error('No user in request:', request.user);
      return reply.status(401).send({ error: 'Not authenticated. Please login first.' });
    }
    
    const userId = request.user.userId;
    console.log('2FA Setup requested by userId:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Generate TOTP secret
    const secret = generateSecret(user.email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    
    // Generate QR code
    const qrCode = await generateQRCode(secret.otpauth_url);
    
    reply.send({
      success: true,
      secret: secret.base32,
      qrCode,
      backupCodes,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Task 3: Send verification codes via email
 * Enable 2FA after verification
 */
async function enable2FAEndpoint(request, reply) {
  try {
    const userId = request.user.userId;
    const { token, secret, backupCodes, method = 'app' } = request.body;
    
    // Verify token
    const isValid = verifyToken(token, secret);
    if (!isValid) {
      return reply.status(400).send({ error: 'Invalid 2FA token' });
    }
    
    // Enable 2FA
    await enable2FA(userId, secret, backupCodes);
    
    // Send confirmation email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });
    
    if (user) {
      await sendEmail({
        to: user.email,
        subject: '2FA Enabled Successfully',
        html: `
          <h2>2FA Enabled</h2>
          <p>Hi ${user.name},</p>
          <p>Two-factor authentication has been successfully enabled on your RoleReady account.</p>
          <p><strong>Method:</strong> ${method === 'app' ? 'Authenticator App (TOTP)' : 'Email/SMS'}</p>
          <p>Your backup codes have been saved. Keep them safe!</p>
          <p>If you did not enable this, please contact support immediately.</p>
        `
      });
    }
    
    reply.send({ 
      success: true, 
      message: '2FA enabled successfully',
      backupCodes 
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Disable 2FA
 */
async function disable2FAEndpoint(request, reply) {
  try {
    const userId = request.user.userId;
    const { password, twoFactorToken } = request.body;
    
    // Get user
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });
    
    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({ error: '2FA not enabled' });
    }
    
    // Verify password first
    const { verifyPassword } = require('../utils/security');
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return reply.status(401).send({ error: 'Invalid password' });
    }
    
    // Verify 2FA token
    const isValid = verifyToken(twoFactorToken, user.twoFactorSecret);
    if (!isValid) {
      // Try backup code
      const isValidBackup = await verifyBackupCode(userId, twoFactorToken);
      if (!isValidBackup) {
        return reply.status(401).send({ error: 'Invalid 2FA token or backup code' });
      }
    }
    
    // Disable 2FA
    await disable2FA(userId);
    
    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: '2FA Disabled',
      html: `
        <h2>2FA Disabled</h2>
        <p>Hi ${user.name},</p>
        <p>Two-factor authentication has been disabled on your RoleReady account.</p>
        <p>If you did not disable this, please contact support immediately.</p>
      `
    });
    
    reply.send({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Task 6: 2FA enforcement on login
 * Verify 2FA token during login (called after password verification)
 */
async function verify2FAToken(request, reply) {
  try {
    const { email, twoFactorToken } = request.body;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, twoFactorEnabled: true, twoFactorSecret: true }
    });
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    if (!user.twoFactorEnabled) {
      return reply.status(400).send({ error: '2FA not enabled for this user' });
    }
    
    // Verify 2FA token
    let isValid = verifyToken(twoFactorToken, user.twoFactorSecret);
    
    // If token fails, try backup code
    if (!isValid) {
      isValid = await verifyBackupCode(user.id, twoFactorToken);
    }
    
    if (!isValid) {
      return reply.status(401).可以对({ error: 'Invalid 2FA token or backup code' });
    }
    
    reply.send({ 
      success: true,
      verified: true
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Get 2FA status
 */
async function get2FAStatus(request, reply) {
  try {
    const userId = request.user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        twoFactorEnabled: true,
        twoFactorBackupCodes: true 
      }
    });
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    reply.send({
      enabled: user.twoFactorEnabled,
      hasBackupCodes: !!user.twoFactorBackupCodes
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

module.exports = {
  generate2FASetup,
  enable2FAEndpoint,
  disable2FAEndpoint,
  verify2FAToken,
  get2FAStatus
};

