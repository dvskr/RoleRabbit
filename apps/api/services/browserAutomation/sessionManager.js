/**
 * Session Manager
 * Manages browser sessions, cookies, and authentication persistence
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');
const prisma = require('../../utils/prisma');

class SessionManager {
  constructor() {
    this.sessionsDir = path.join(__dirname, '../../../.sessions');
    this.encryptionKey = process.env.SESSION_ENCRYPTION_KEY || this.generateKey();
    this.algorithm = 'aes-256-gcm';
    this.sessions = new Map(); // In-memory cache
  }

  /**
   * Initialize session manager
   */
  async initialize() {
    try {
      // Ensure sessions directory exists
      await fs.mkdir(this.sessionsDir, { recursive: true });
      logger.info('Session manager initialized', { sessionsDir: this.sessionsDir });
    } catch (error) {
      logger.error('Failed to initialize session manager', { error: error.message });
      throw error;
    }
  }

  /**
   * Save session cookies and data
   */
  async saveSession(userId, platform, sessionData) {
    try {
      const sessionKey = this.getSessionKey(userId, platform);

      // Encrypt sensitive data
      const encryptedData = this.encrypt(JSON.stringify(sessionData));

      // Save to database
      await prisma.jobBoardSession.upsert({
        where: {
          userId_platform: {
            userId: parseInt(userId),
            platform: platform
          }
        },
        create: {
          userId: parseInt(userId),
          platform: platform,
          sessionData: encryptedData.encryptedData,
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
          expiresAt: sessionData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
        },
        update: {
          sessionData: encryptedData.encryptedData,
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
          expiresAt: sessionData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      });

      // Save to file system as backup
      const sessionPath = path.join(this.sessionsDir, `${sessionKey}.json`);
      await fs.writeFile(sessionPath, JSON.stringify(encryptedData, null, 2));

      // Cache in memory
      this.sessions.set(sessionKey, sessionData);

      logger.info('Session saved', { userId, platform });
      return true;

    } catch (error) {
      logger.error('Failed to save session', { userId, platform, error: error.message });
      throw error;
    }
  }

  /**
   * Load session cookies and data
   */
  async loadSession(userId, platform) {
    try {
      const sessionKey = this.getSessionKey(userId, platform);

      // Check in-memory cache first
      if (this.sessions.has(sessionKey)) {
        const cachedSession = this.sessions.get(sessionKey);
        if (this.isSessionValid(cachedSession)) {
          logger.info('Session loaded from cache', { userId, platform });
          return cachedSession;
        } else {
          this.sessions.delete(sessionKey);
        }
      }

      // Load from database
      const dbSession = await prisma.jobBoardSession.findUnique({
        where: {
          userId_platform: {
            userId: parseInt(userId),
            platform: platform
          }
        }
      });

      if (dbSession) {
        // Check if session is expired
        if (new Date() > dbSession.expiresAt) {
          logger.warn('Session expired', { userId, platform });
          await this.deleteSession(userId, platform);
          return null;
        }

        // Decrypt session data
        const decryptedData = this.decrypt({
          encryptedData: dbSession.sessionData,
          iv: dbSession.iv,
          authTag: dbSession.authTag
        });

        const sessionData = JSON.parse(decryptedData);

        // Cache in memory
        this.sessions.set(sessionKey, sessionData);

        logger.info('Session loaded from database', { userId, platform });
        return sessionData;
      }

      // Fallback to file system
      const sessionPath = path.join(this.sessionsDir, `${sessionKey}.json`);
      try {
        const fileData = await fs.readFile(sessionPath, 'utf-8');
        const encryptedData = JSON.parse(fileData);
        const decryptedData = this.decrypt(encryptedData);
        const sessionData = JSON.parse(decryptedData);

        if (this.isSessionValid(sessionData)) {
          this.sessions.set(sessionKey, sessionData);
          logger.info('Session loaded from file', { userId, platform });
          return sessionData;
        }
      } catch (fileError) {
        // File doesn't exist or is corrupted
        logger.debug('No session file found', { userId, platform });
      }

      return null;

    } catch (error) {
      logger.error('Failed to load session', { userId, platform, error: error.message });
      return null;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(userId, platform) {
    try {
      const sessionKey = this.getSessionKey(userId, platform);

      // Remove from database
      await prisma.jobBoardSession.deleteMany({
        where: {
          userId: parseInt(userId),
          platform: platform
        }
      });

      // Remove from file system
      const sessionPath = path.join(this.sessionsDir, `${sessionKey}.json`);
      try {
        await fs.unlink(sessionPath);
      } catch (error) {
        // File might not exist
      }

      // Remove from cache
      this.sessions.delete(sessionKey);

      logger.info('Session deleted', { userId, platform });
      return true;

    } catch (error) {
      logger.error('Failed to delete session', { userId, platform, error: error.message });
      throw error;
    }
  }

  /**
   * Apply cookies to page
   */
  async applyCookiesToPage(page, userId, platform) {
    try {
      const sessionData = await this.loadSession(userId, platform);

      if (!sessionData || !sessionData.cookies) {
        logger.debug('No cookies to apply', { userId, platform });
        return false;
      }

      // Set cookies
      await page.setCookie(...sessionData.cookies);

      // Apply local storage if available
      if (sessionData.localStorage) {
        await page.evaluateOnNewDocument((localStorageData) => {
          for (const [key, value] of Object.entries(localStorageData)) {
            localStorage.setItem(key, value);
          }
        }, sessionData.localStorage);
      }

      // Apply session storage if available
      if (sessionData.sessionStorage) {
        await page.evaluateOnNewDocument((sessionStorageData) => {
          for (const [key, value] of Object.entries(sessionStorageData)) {
            sessionStorage.setItem(key, value);
          }
        }, sessionData.sessionStorage);
      }

      logger.info('Cookies applied to page', { userId, platform, cookieCount: sessionData.cookies.length });
      return true;

    } catch (error) {
      logger.error('Failed to apply cookies', { userId, platform, error: error.message });
      return false;
    }
  }

  /**
   * Extract and save cookies from page
   */
  async extractAndSaveCookies(page, userId, platform, expiresAt = null) {
    try {
      // Get cookies
      const cookies = await page.cookies();

      // Get local storage
      const localStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          items[key] = window.localStorage.getItem(key);
        }
        return items;
      });

      // Get session storage
      const sessionStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          items[key] = window.sessionStorage.getItem(key);
        }
        return items;
      });

      const sessionData = {
        cookies,
        localStorage,
        sessionStorage,
        expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        savedAt: new Date()
      };

      await this.saveSession(userId, platform, sessionData);

      logger.info('Cookies extracted and saved', {
        userId,
        platform,
        cookieCount: cookies.length
      });

      return true;

    } catch (error) {
      logger.error('Failed to extract cookies', { userId, platform, error: error.message });
      return false;
    }
  }

  /**
   * Check if user is authenticated on platform
   */
  async isAuthenticated(userId, platform) {
    try {
      const sessionData = await this.loadSession(userId, platform);
      return sessionData !== null && this.isSessionValid(sessionData);
    } catch (error) {
      logger.error('Failed to check authentication', { userId, platform, error: error.message });
      return false;
    }
  }

  /**
   * Validate session data
   */
  isSessionValid(sessionData) {
    if (!sessionData) return false;

    // Check if session has expired
    if (sessionData.expiresAt && new Date() > new Date(sessionData.expiresAt)) {
      return false;
    }

    // Check if cookies exist
    if (!sessionData.cookies || sessionData.cookies.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Get all sessions for user
   */
  async getUserSessions(userId) {
    try {
      const sessions = await prisma.jobBoardSession.findMany({
        where: {
          userId: parseInt(userId),
          expiresAt: {
            gt: new Date()
          }
        },
        select: {
          platform: true,
          updatedAt: true,
          expiresAt: true
        }
      });

      return sessions;

    } catch (error) {
      logger.error('Failed to get user sessions', { userId, error: error.message });
      return [];
    }
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions() {
    try {
      const result = await prisma.jobBoardSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      logger.info('Expired sessions cleaned', { count: result.count });
      return result.count;

    } catch (error) {
      logger.error('Failed to clean expired sessions', { error: error.message });
      return 0;
    }
  }

  /**
   * Encrypt data
   */
  encrypt(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };

    } catch (error) {
      logger.error('Encryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey, 'hex'),
        Buffer.from(encryptedData.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate session key
   */
  getSessionKey(userId, platform) {
    return `${userId}_${platform}`;
  }

  /**
   * Generate encryption key
   */
  generateKey() {
    const key = crypto.randomBytes(32).toString('hex');
    logger.warn('Generated new encryption key - this should be set in environment variables', {
      key: key.substring(0, 8) + '...'
    });
    return key;
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      cachedSessions: this.sessions.size,
      sessionsDir: this.sessionsDir
    };
  }
}

// Singleton instance
const sessionManager = new SessionManager();

// Initialize on startup
sessionManager.initialize().catch(err => {
  logger.error('Failed to initialize session manager', { error: err.message });
});

// Clean expired sessions daily
setInterval(() => {
  sessionManager.cleanExpiredSessions().catch(err => {
    logger.error('Failed to clean expired sessions', { error: err.message });
  });
}, 24 * 60 * 60 * 1000); // 24 hours

module.exports = sessionManager;
