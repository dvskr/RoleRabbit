// 2FA Auth Routes
const { verifyToken, generateSecret, enable2FA, disable2FA, verifyBackupCode, generateBackupCodes, generateQRCode } = require('../utils/twoFactorAuth');
const { authenticateUser } = require('../auth');
const { sendEmail } = require('../utils/emailService');

/**
 * Generate 2FA setup for user
 */
async function generate2FASetup(request, reply) {
  try {
    const userId = request.user.userId;
    const username = request.user.email;
    
    // Generate secret
    const secret = generateSecret(username);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    
    // Generate QR code
    const qrCode = await generateQRCode(secret.otpauth_url);
    
    reply.send({
      success: true,
      secret: secret.base32,
      qrCode,
      backupCodes
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Enable 2FA for user
 */
async function enable2FAEndpoint(request, reply) {
  try {
    const userId = request.user.userId;
    const { token, secret, backupCodes } = request.body;
    
    // Verify token
    const isValid = verifyToken(token, secret);
    if (!isValid) {
      return reply.status(400).send({ error: 'Invalid 2FA token' });
    }
    
    // Enable 2FA
    await enable2FA(userId, secret, backupCodes);
    
    reply.send({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Disable 2FA for user
 */
async function disable2FAEndpoint(request, reply) {
  try {
    const userId = request.user.userId;
    const { token } = request.body;
    
    // Get user to verify token
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({ error: '2FA not enabled' });
    }
    
    // Verify token
    const isValid = verifyToken(token, user.twoFactorSecret);
    if (!isValid) {
      return reply.status(400).send({ error: 'Invalid 2FA token' });
    }
    
    // Disable 2FA
    await disable2FA(userId);
    
    reply.send({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

/**
 * Verify 2FA token during login
 */
async function verify2FALogin(request, reply) {
  try {
    const { email, password, twoFactorToken } = request.body;
    
    // Authenticate user first
    const user = await authenticateUser(email, password);
    
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
      return reply.status(401).send({ error: 'Invalid 2FA token or backup code' });
    }
    
    reply.send({ 
      success: true, 
      user: { ...user, password: undefined },
      message: '2FA verified successfully'
    });
  } catch (error) {
    reply.status(500).send({ error: error.message });
  }
}

module.exports = {
  generate2FASetup,
  enable2FAEndpoint,
  disable2FAEndpoint,
  verify2FALogin
};

