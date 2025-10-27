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
    where: { email }
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
  // Find user in database
  const user = await prisma.user.findUnique({
    where: { email }
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
    where: { id: userId }
  });
  if (!user) {
    return null;
  }
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user password
 */
async function updateUserPassword(userId, oldPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user || !user.password) {
    throw new Error('User not found');
  }

  // Verify old password
  const isValid = await verifyPassword(oldPassword, user.password);
  if (!isValid) {
    throw new Error('Invalid old password');
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
 * Get all users (for development/debugging)
 */
async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      provider: true,
      profilePicture: true,
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
  getAllUsers
};

