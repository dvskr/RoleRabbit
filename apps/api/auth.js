// Authentication endpoints for RoleReady API
const { hashPassword, verifyPassword, sanitizeInput, isValidEmail, isStrongPassword } = require('./utils/security');
const { prisma } = require('./utils/db');

/**
 * Register a new user
 */
async function registerUser(email, password, name) {
  // Validate email
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      email: sanitizeInput(email),
      password: hashedPassword,
      name: sanitizeInput(name),
      provider: 'local'
    }
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Authenticate user and return JWT token
 */
async function authenticateUser(email, password) {
  // Find user in database (only select fields that exist in users table)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      provider: true,
      providerId: true,
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
      privacyLevel: true,
      profileVisibility: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      providerId: true,
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: true,
      privacyLevel: true,
      profileVisibility: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) {
    return null;
  }
  
  return user;
}

/**
 * Update user password
 */
async function updateUserPassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true
    }
  });
  if (!user || !user.password) {
    throw new Error('User not found');
  }

  // Verify old password only if provided (skip if null - used for OTP-based reset)
  if (oldPassword !== null && oldPassword !== undefined) {
    const isValid = await verifyPassword(oldPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid old password');
    }
  }

  // Validate new password
  if (!isStrongPassword(newPassword)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  // Hash new password and update in database
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return true;
}

/**
 * Reset user password (forgot password flow)
 */
async function resetUserPassword(token, newPassword) {
  // Validate new password
  if (!isStrongPassword(newPassword)) {
    throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);
  
  // Get token and user
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw new Error('Invalid or expired reset token');
  }

  if (resetToken.used) {
    throw new Error('Reset token has already been used');
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error('Reset token has expired');
  }

  // Update password and mark token as used
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  return true;
}

/**
 * Get all users (for development/debugging)
 */
async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return users;
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
  updateUserPassword,
  resetUserPassword,
  getAllUsers
};

