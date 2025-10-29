/**
 * Database Connection Pooling Utility
 * Manages database connections efficiently to prevent connection exhaustion
 */

const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client instance with connection pooling
class ConnectionPool {
  constructor() {
    if (ConnectionPool.instance) {
      return ConnectionPool.instance;
    }

    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./dev.db'
        }
      }
    });

    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await this.prisma.$disconnect();
    });

    ConnectionPool.instance = this;
  }

  /**
   * Get database client
   */
  getClient() {
    return this.prisma;
  }

  /**
   * Check database connection health
   */
  async checkHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database connection healthy' };
    } catch (error) {
      return { healthy: false, message: error.message };
    }
  }

  /**
   * Get connection pool stats
   */
  getPoolStats() {
    return {
      maxConnections: 10, // Default Prisma pool size
      activeConnections: this.prisma.$connect ? 1 : 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Close all connections
   */
  async closeAllConnections() {
    await this.prisma.$disconnect();
  }
}

module.exports = new ConnectionPool();

