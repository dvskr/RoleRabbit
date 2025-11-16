/**
 * Environment Variable Validation
 * Validates required environment variables on startup
 */

const logger = require('./logger');

// ============================================
// REQUIRED ENVIRONMENT VARIABLES
// ============================================

const REQUIRED_VARS = {
  // Database
  DATABASE_URL: {
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:password@localhost:5432/dbname',
    validator: (val) => val && val.startsWith('postgresql://'),
    errorMessage: 'Must be a valid PostgreSQL connection string'
  },
  
  // JWT Authentication
  JWT_SECRET: {
    description: 'Secret key for JWT token signing',
    example: 'your-secret-key-min-32-chars',
    validator: (val) => val && val.length >= 32,
    errorMessage: 'Must be at least 32 characters long'
  },
  
  // OpenAI API
  OPENAI_API_KEY: {
    description: 'OpenAI API key for AI features',
    example: 'sk-...',
    validator: (val) => val && val.startsWith('sk-'),
    errorMessage: 'Must be a valid OpenAI API key (starts with sk-)',
    optional: process.env.NODE_ENV === 'development'
  },
  
  // Node Environment
  NODE_ENV: {
    description: 'Node environment',
    example: 'development | production | test',
    validator: (val) => ['development', 'production', 'test'].includes(val),
    errorMessage: 'Must be one of: development, production, test',
    default: 'development'
  }
};

// ============================================
// OPTIONAL BUT RECOMMENDED VARIABLES
// ============================================

const RECOMMENDED_VARS = {
  // Redis Cache
  REDIS_URL: {
    description: 'Redis connection string for caching',
    example: 'redis://localhost:6379',
    validator: (val) => val && val.startsWith('redis://'),
    errorMessage: 'Must be a valid Redis connection string'
  },
  
  // Frontend URL
  FRONTEND_URL: {
    description: 'Frontend application URL',
    example: 'http://localhost:3000',
    validator: (val) => val && (val.startsWith('http://') || val.startsWith('https://')),
    errorMessage: 'Must be a valid URL'
  },
  
  // Email Service
  SMTP_HOST: {
    description: 'SMTP server host for sending emails',
    example: 'smtp.gmail.com'
  },
  SMTP_PORT: {
    description: 'SMTP server port',
    example: '587',
    validator: (val) => val && !isNaN(parseInt(val)),
    errorMessage: 'Must be a valid port number'
  },
  SMTP_USER: {
    description: 'SMTP authentication username',
    example: 'your-email@example.com'
  },
  SMTP_PASS: {
    description: 'SMTP authentication password',
    example: 'your-password'
  },
  
  // Monitoring
  SENTRY_DSN: {
    description: 'Sentry DSN for error tracking',
    example: 'https://...@sentry.io/...'
  }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a single environment variable
 * @param {string} key - Variable name
 * @param {Object} config - Variable configuration
 * @param {boolean} isRequired - Whether variable is required
 * @returns {Object} Validation result
 */
function validateVar(key, config, isRequired = true) {
  const value = process.env[key];
  const result = {
    key,
    value: value ? '***' : undefined, // Mask actual value
    status: 'valid',
    message: null
  };

  // Check if variable exists
  if (!value) {
    if (config.optional || !isRequired) {
      result.status = 'optional';
      result.message = config.default 
        ? `Using default: ${config.default}` 
        : 'Not set (optional)';
      
      // Set default if provided
      if (config.default) {
        process.env[key] = config.default;
      }
    } else {
      result.status = 'missing';
      result.message = `Required variable not set. ${config.description}. Example: ${config.example}`;
    }
    return result;
  }

  // Validate value if validator provided
  if (config.validator && !config.validator(value)) {
    result.status = 'invalid';
    result.message = config.errorMessage || 'Invalid value';
    return result;
  }

  result.message = 'Valid';
  return result;
}

/**
 * Validate all environment variables
 * @param {Object} options - Validation options
 * @returns {Object} Validation results
 */
function validateEnv(options = {}) {
  const {
    exitOnError = false,
    logResults = true
  } = options;

  const results = {
    valid: true,
    required: {},
    recommended: {},
    errors: [],
    warnings: []
  };

  // Validate required variables
  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    const result = validateVar(key, config, true);
    results.required[key] = result;

    if (result.status === 'missing' || result.status === 'invalid') {
      results.valid = false;
      results.errors.push(`${key}: ${result.message}`);
    }
  }

  // Validate recommended variables
  for (const [key, config] of Object.entries(RECOMMENDED_VARS)) {
    const result = validateVar(key, config, false);
    results.recommended[key] = result;

    if (result.status === 'invalid') {
      results.warnings.push(`${key}: ${result.message}`);
    } else if (result.status === 'optional') {
      results.warnings.push(`${key}: ${result.message}`);
    }
  }

  // Log results
  if (logResults) {
    logValidationResults(results);
  }

  // Exit on error if configured
  if (!results.valid && exitOnError) {
    logger.error('Environment validation failed. Exiting...');
    process.exit(1);
  }

  return results;
}

/**
 * Log validation results
 * @param {Object} results - Validation results
 */
function logValidationResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 ENVIRONMENT VARIABLE VALIDATION');
  console.log('='.repeat(80) + '\n');

  // Required variables
  console.log('📋 Required Variables:');
  for (const [key, result] of Object.entries(results.required)) {
    const icon = result.status === 'valid' ? '✅' : 
                 result.status === 'optional' ? '⚠️' : '❌';
    console.log(`  ${icon} ${key}: ${result.message}`);
  }

  // Recommended variables
  console.log('\n💡 Recommended Variables:');
  for (const [key, result] of Object.entries(results.recommended)) {
    const icon = result.status === 'valid' ? '✅' : 
                 result.status === 'optional' ? '⚠️' : '❌';
    console.log(`  ${icon} ${key}: ${result.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  if (results.valid) {
    console.log('✅ All required environment variables are valid!');
  } else {
    console.log('❌ Environment validation failed!');
    console.log('\nErrors:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (results.warnings.length > 0) {
    console.log('\nWarnings:');
    results.warnings.forEach(warn => console.log(`  - ${warn}`));
  }
  console.log('='.repeat(80) + '\n');
}

/**
 * Print current environment status
 */
function printEnvStatus() {
  console.log('\n' + '='.repeat(80));
  console.log('🌍 ENVIRONMENT STATUS');
  console.log('='.repeat(80));
  console.log(`  Node Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Architecture: ${process.arch}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Get missing required variables
 * @returns {Array} List of missing variable names
 */
function getMissingVars() {
  const missing = [];
  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    if (!config.optional && !process.env[key]) {
      missing.push(key);
    }
  }
  return missing;
}

/**
 * Check if all required variables are set
 * @returns {boolean} True if all required variables are set
 */
function hasAllRequiredVars() {
  return getMissingVars().length === 0;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  validateEnv,
  printEnvStatus,
  getMissingVars,
  hasAllRequiredVars,
  REQUIRED_VARS,
  RECOMMENDED_VARS
};
