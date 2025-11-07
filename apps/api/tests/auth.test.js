/**
 * Tests for Authentication utilities
 */

const { registerUser, authenticateUser, getUserById } = require('../auth');

// Mock Prisma
jest.mock('../utils/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../utils/security', () => ({
  hashPassword: jest.fn((pwd) => Promise.resolve('hashed_' + pwd)),
  verifyPassword: jest.fn((pwd, hash) => Promise.resolve(hash === 'hashed_' + pwd)),
  isValidEmail: jest.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isStrongPassword: jest.fn((pwd) => pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd)),
  sanitizeInput: jest.fn((input) => input),
}));

const { prisma } = require('../utils/db');

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_Password123',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await registerUser('test@example.com', 'Password123', 'Test User');

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.password).toBeUndefined();
    });

    it('should throw error if email is invalid', async () => {
      await expect(
        registerUser('invalid-email', 'Password123', 'Test User')
      ).rejects.toThrow();
    });

    it('should throw error if password is weak', async () => {
      await expect(
        registerUser('test@example.com', 'weak', 'Test User')
      ).rejects.toThrow();
    });

    it('should throw error if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        registerUser('test@example.com', 'Password123', 'Test User')
      ).rejects.toThrow('User already exists');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_Password123',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authenticateUser('test@example.com', 'Password123');

      expect(result.email).toBe('test@example.com');
      expect(result.password).toBeUndefined();
    });

    it('should throw error if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authenticateUser('test@example.com', 'Password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_Password123',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authenticateUser('test@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById('1');

      expect(result.email).toBe('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await getUserById('999');

      expect(result).toBeNull();
    });
  });
});

