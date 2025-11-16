/**
 * Environment Variable Validator
 * Validates required environment variables on startup
 * 
 * Note: Uses console instead of logger to avoid circular dependencies
 */

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection string',
    example: 'postgresql://user:password@localhost:5432/roleready'
  },
  
  // OpenAI
  OPENAI_API_KEY: {
    required: true,
    description: 'OpenAI API key for AI features',
    example: 'sk-...'
  },
  
  // JWT Authentication
  JWT_SECRET: {
    required: true,
    description: 'Secret key for JWT token signing (64+ characters)',
    example: 'your-super-secret-jwt-key-here-min-64-chars'
  },
  
  // CSRF Protection
  CSRF_SECRET: {
    required: true,
    description: 'Secret key for CSRF token generation (32+ characters)',
    example: 'your-csrf-secret-key-here-min-32-chars'
  },
  
  // Server
  PORT: {
    required: false,
    description: 'Server port',
    example: '5000',
    default: '5000'
  },
  
  NODE_ENV: {
    required: false,
    description: 'Environment (development, production, test)',
    example: 'production',
    default: 'development'
  },
  
  // CORS
  CORS_ORIGIN: {
    required: false,
    description: 'Allowed CORS origin',
    example: 'https://yourdomain.com',
    default: 'http://localhost:3000'
  },
  
  // Optional: Redis (for caching and rate limiting)
  REDIS_URL: {
    required: false,
    description: 'Redis connection string (optional, for caching)',
    example: 'redis://localhost:6379'
  }
};

/**
 * Validate environment variables
 * @param {Object} options - Validation options
 * @returns {Object} { valid, errors, warnings }
 */
function validateEnv(options = {}) {
  const {
    exitOnError = true,
    logResults = true
  } = options;

  const errors = [];
  const warnings = [];
  const missing = [];

  // Check required variables
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    if (config.required && !value) {
      missing.push(key);
      errors.push({
        variable: key,
        message: `Missing required environment variable: ${key}`,
        description: config.description,
        example: config.example
      });
    } else if (!value && config.default) {
      warnings.push({
        variable: key,
        message: `Using default value for ${key}: ${config.default}`,
        description: config.description
      });
    }
  }

  // Validate specific variables
  const specificErrors = validateSpecificVars();
  errors.push(...specificErrors);

  const valid = errors.length === 0;

  // Log results (using console to avoid circular dependency with logger)
  if (logResults) {
    if (valid) {
      console.log('[ENV] ✅ All required environment variables are set');
      if (warnings.length > 0) {
        warnings.forEach(w => {
          console.warn(`[ENV] ⚠️  ${w.message}`);
        });
      }
    } else {
      console.error('[ENV] ❌ Environment variable validation failed');
      errors.forEach(e => {
        console.error(`[ENV] ❌ ${e.message}`);
        console.error(`[ENV]    Description: ${e.description}`);
        console.error(`[ENV]    Example: ${e.example}`);
      });
    }
  }

  // Exit if errors and exitOnError is true
  if (!valid && exitOnError) {
    console.error('[ENV] 🛑 Application cannot start without required environment variables');
    console.error('[ENV] 📝 Please create a .env file based on .env.example');
    process.exit(1);
  }

  return { valid, errors, warnings, missing };
}

/**
 * Validate specific environment variables
 * @returns {Array} Array of error objects
 */
function validateSpecificVars() {
  const errors = [];

  // Validate OpenAI API Key format
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-')) {
    errors.push({
      variable: 'OPENAI_API_KEY',
      message: 'OPENAI_API_KEY should start with "sk-"',
      description: 'Invalid OpenAI API key format'
    });
  }

  // Validate JWT_SECRET length
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    errors.push({
      variable: 'JWT_SECRET',
      message: 'JWT_SECRET should be at least 32 characters long',
      description: 'Weak JWT secret detected'
    });
  }

  // Validate CSRF_SECRET length
  const csrfSecret = process.env.CSRF_SECRET;
  if (csrfSecret && csrfSecret.length < 32) {
    errors.push({
      variable: 'CSRF_SECRET',
      message: 'CSRF_SECRET should be at least 32 characters long',
      description: 'Weak CSRF secret detected'
    });
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    errors.push({
      variable: 'DATABASE_URL',
      message: 'DATABASE_URL should start with "postgresql://" or "postgres://"',
      description: 'Invalid database URL format'
    });
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  const validEnvs = ['development', 'production', 'test', 'staging'];
  if (nodeEnv && !validEnvs.includes(nodeEnv)) {
    errors.push({
      variable: 'NODE_ENV',
      message: `NODE_ENV should be one of: ${validEnvs.join(', ')}`,
      description: `Invalid NODE_ENV value: ${nodeEnv}`
    });
  }

  return errors;
}

/**
 * Generate .env.example content
 * @returns {string} Content for .env.example file
 */
function generateEnvExample() {
  let content = '# Environment Variables\n\n';
  content += '# Copy this file to .env and fill in the values\n';
  content += '# DO NOT commit .env to version control\n\n';

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    content += `# ${config.description}\n`;
    if (config.required) {
      content += `# REQUIRED\n`;
    } else {
      content += `# Optional (default: ${config.default || 'none'})\n`;
    }
    content += `${key}=${config.example}\n\n`;
  }

  return content;
}

/**
 * Check for common security issues
 * @returns {Array} Array of security warnings
 */
function checkSecurityIssues() {
  const warnings = [];

  // Check for default/weak secrets in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    const csrfSecret = process.env.CSRF_SECRET;

    if (jwtSecret && jwtSecret.includes('your-') || jwtSecret === 'secret') {
      warnings.push({
        severity: 'CRITICAL',
        message: 'JWT_SECRET appears to be a default/example value in production!',
        recommendation: 'Generate a strong random secret immediately'
      });
    }

    if (csrfSecret && csrfSecret.includes('your-') || csrfSecret === 'secret') {
      warnings.push({
        severity: 'CRITICAL',
        message: 'CSRF_SECRET appears to be a default/example value in production!',
        recommendation: 'Generate a strong random secret immediately'
      });
    }

    // Check for localhost CORS in production
    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin && corsOrigin.includes('localhost')) {
      warnings.push({
        severity: 'HIGH',
        message: 'CORS_ORIGIN is set to localhost in production',
        recommendation: 'Set CORS_ORIGIN to your production domain'
      });
    }
  }

  return warnings;
}

/**
 * Print environment variable status
 */
function printEnvStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('Environment Variables Status');
  console.log('='.repeat(60));

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const status = value ? '✅' : (config.required ? '❌' : '⚠️');
    const displayValue = value ? (key.includes('SECRET') || key.includes('KEY') ? '***' : value.slice(0, 20) + '...') : 'NOT SET';
    
    console.log(`${status} ${key.padEnd(20)} ${displayValue}`);
  }

  console.log('='.repeat(60) + '\n');

  // Check security issues
  const securityWarnings = checkSecurityIssues();
  if (securityWarnings.length > 0) {
    console.log('🔒 Security Warnings:');
    securityWarnings.forEach(w => {
      console.log(`   [${w.severity}] ${w.message}`);
      console.log(`   → ${w.recommendation}`);
    });
    console.log('');
  }
}

module.exports = {
  validateEnv,
  generateEnvExample,
  checkSecurityIssues,
  printEnvStatus,
  REQUIRED_ENV_VARS
};

