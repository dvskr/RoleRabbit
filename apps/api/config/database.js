/**
 * Database Configuration
 * 
 * Connection pooling and optimization settings for Prisma.
 */

/**
 * Prisma connection pool configuration
 */
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Connection pool settings
    connection_limit: parseInt(process.env.DB_CONNECTION_LIMIT) || (isProduction ? 20 : 10),
    pool_timeout: parseInt(process.env.DB_POOL_TIMEOUT) || 20, // seconds
    
    // Query settings
    statement_cache_size: 500,
    
    // Connection settings
    connect_timeout: 30, // seconds
    socket_timeout: 60, // seconds
    
    // SSL settings (production only)
    sslmode: isProduction ? 'require' : 'prefer',
    
    // Performance settings
    pgbouncer: process.env.DB_PGBOUNCER === 'true',
    
    // Logging
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn']
  };
};

/**
 * Build Prisma datasource URL with connection pool params
 */
const buildDatabaseURL = () => {
  const baseURL = process.env.DATABASE_URL;
  if (!baseURL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const config = getDatabaseConfig();
  const params = new URLSearchParams({
    connection_limit: config.connection_limit.toString(),
    pool_timeout: config.pool_timeout.toString(),
    connect_timeout: config.connect_timeout.toString(),
    socket_timeout: config.socket_timeout.toString()
  });

  // Add SSL if in production
  if (config.sslmode === 'require') {
    params.append('sslmode', 'require');
  }

  // Add pgbouncer mode if enabled
  if (config.pgbouncer) {
    params.append('pgbouncer', 'true');
  }

  return `${baseURL}?${params.toString()}`;
};

/**
 * Prisma client options
 */
const getPrismaClientOptions = () => {
  const config = getDatabaseConfig();

  return {
    datasources: {
      db: {
        url: buildDatabaseURL()
      }
    },
    log: config.log.map(level => ({
      emit: 'event',
      level
    })),
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal'
  };
};

/**
 * Query performance monitoring
 */
function setupQueryMonitoring(prisma) {
  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
      if (e.duration > 100) {
        console.warn('⚠️  Slow query detected:', {
          query: e.query,
          duration: `${e.duration}ms`,
          params: e.params
        });
      }
    });
  }

  prisma.$on('error', (e) => {
    console.error('❌ Database error:', e);
  });
}

/**
 * Database health check
 */
async function checkDatabaseHealth(prisma) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      message: 'Database connection is healthy'
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      message: 'Database connection failed',
      error: error.message
    };
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(prisma) {
  console.log('Closing database connections...');
  try {
    await prisma.$disconnect();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

/**
 * Database indexes for optimization
 * Run these in your migration files
 */
const recommendedIndexes = `
-- Resume queries
CREATE INDEX IF NOT EXISTS idx_base_resume_user_id ON "BaseResume"("userId");
CREATE INDEX IF NOT EXISTS idx_base_resume_active ON "BaseResume"("userId", "isActive");
CREATE INDEX IF NOT EXISTS idx_base_resume_created_at ON "BaseResume"("createdAt" DESC);

-- Tailored versions
CREATE INDEX IF NOT EXISTS idx_tailored_version_base_resume ON "TailoredVersion"("baseResumeId");
CREATE INDEX IF NOT EXISTS idx_tailored_version_created_at ON "TailoredVersion"("createdAt" DESC);

-- Working drafts
CREATE INDEX IF NOT EXISTS idx_working_draft_resume ON "WorkingDraft"("baseResumeId");
CREATE INDEX IF NOT EXISTS idx_working_draft_updated ON "WorkingDraft"("updatedAt" DESC);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON "AuditLog"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON "AuditLog"("action");

-- Storage files
CREATE INDEX IF NOT EXISTS idx_storage_file_user ON "StorageFile"("userId");
CREATE INDEX IF NOT EXISTS idx_storage_file_expires ON "StorageFile"("expiresAt");
`;

module.exports = {
  getDatabaseConfig,
  buildDatabaseURL,
  getPrismaClientOptions,
  setupQueryMonitoring,
  checkDatabaseHealth,
  gracefulShutdown,
  recommendedIndexes
};

