/**
 * Environment Variable Validation
 * INFRA-001, INFRA-002: Document and validate all required environment variables
 */

const { logger } = require('./logger');

// INFRA-001: Document all required environment variables for My Files feature
const REQUIRED_ENV_VARS = {
  // Storage Configuration
  STORAGE_TYPE: {
    description: 'Storage provider type (supabase|local)',
    required: true,
    default: 'local',
    validate: (value) => ['supabase', 'local'].includes(value?.toLowerCase())
  },
  STORAGE_PATH: {
    description: 'Local storage path (required if STORAGE_TYPE=local)',
    required: (env) => env.STORAGE_TYPE?.toLowerCase() === 'local',
    default: './storage'
  },
  SUPABASE_URL: {
    description: 'Supabase project URL (required if STORAGE_TYPE=supabase)',
    required: (env) => env.STORAGE_TYPE?.toLowerCase() === 'supabase'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (required if STORAGE_TYPE=supabase)',
    required: (env) => env.STORAGE_TYPE?.toLowerCase() === 'supabase',
    secret: true
  },
  SUPABASE_STORAGE_BUCKET: {
    description: 'Supabase storage bucket name',
    required: (env) => env.STORAGE_TYPE?.toLowerCase() === 'supabase',
    default: 'files'
  },
  MAX_FILE_SIZE: {
    description: 'Maximum file size in bytes (default: 10MB)',
    required: false,
    default: 10 * 1024 * 1024,
    validate: (value) => {
      const size = parseInt(value);
      return !isNaN(size) && size > 0;
    },
    transform: (value) => parseInt(value) || 10 * 1024 * 1024
  },
  DEFAULT_STORAGE_LIMIT: {
    description: 'Default storage limit in bytes (default: 5GB)',
    required: false,
    default: 5 * 1024 * 1024 * 1024,
    validate: (value) => {
      const size = parseInt(value);
      return !isNaN(size) && size > 0;
    },
    transform: (value) => parseInt(value) || 5 * 1024 * 1024 * 1024
  },
  FRONTEND_URL: {
    description: 'Frontend URL for share links',
    required: false, // Not required in development (can default to CORS_ORIGIN)
    default: process.env.CORS_ORIGIN || 'http://localhost:3000',
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }
  },
  // Database
  DATABASE_URL: {
    description: 'PostgreSQL database connection URL',
    required: true
  },
  // Redis (for queues and caching)
  REDIS_URL: {
    description: 'Redis connection URL (for queues and caching)',
    required: false,
    default: 'redis://localhost:6379'
  },
  // Email Service
  EMAIL_SERVICE: {
    description: 'Email service provider (resend|sendgrid|smtp)',
    required: false,
    default: 'resend'
  },
  RESEND_API_KEY: {
    description: 'Resend API key (if using Resend)',
    required: (env) => env.EMAIL_SERVICE?.toLowerCase() === 'resend',
    secret: true
  },
  SENDGRID_API_KEY: {
    description: 'SendGrid API key (if using SendGrid)',
    required: (env) => env.EMAIL_SERVICE?.toLowerCase() === 'sendgrid',
    secret: true
  },
  // Environment
  NODE_ENV: {
    description: 'Node environment (development|staging|production)',
    required: true,
    default: 'development',
    validate: (value) => ['development', 'staging', 'production'].includes(value?.toLowerCase())
  },
  // API Configuration
  PORT: {
    description: 'Server port',
    required: false,
    default: 3001,
    transform: (value) => parseInt(value) || 3001
  },
  NEXT_PUBLIC_API_URL: {
    description: 'Public API URL',
    required: false,
    default: 'http://localhost:3001'
  }
};

/**
 * INFRA-002: Validate environment variables on server startup (fail fast if missing)
 */
// INFRA-001: Document all required environment variables for My Files feature
// INFRA-002: Validate environment variables on server startup (fail fast if missing)

/**
 * Required environment variables for My Files feature
 */
const REQUIRED_STORAGE_VARS = {
  // Core storage configuration
  STORAGE_TYPE: {
    required: true,
    default: 'supabase',
    validValues: ['supabase', 'local'],
    description: 'Storage type: supabase (recommended) or local (development)'
  },
  
  // Supabase configuration (required when STORAGE_TYPE=supabase)
  SUPABASE_URL: {
    required: (env) => env.STORAGE_TYPE === 'supabase',
    description: 'Supabase project URL (required when using Supabase storage)'
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: (env) => env.STORAGE_TYPE === 'supabase',
    description: 'Supabase service role key (required when using Supabase storage)'
  },
  SUPABASE_STORAGE_BUCKET: {
    required: (env) => env.STORAGE_TYPE === 'supabase',
    default: 'roleready-file',
    description: 'Supabase storage bucket name'
  },
  
  // Local storage (required when STORAGE_TYPE=local)
  STORAGE_PATH: {
    required: (env) => env.STORAGE_TYPE === 'local',
    default: './uploads',
    description: 'Local storage path (required when using local storage)'
  },
  
  // Application configuration
  FRONTEND_URL: {
    required: true,
    description: 'Frontend URL for share links and email notifications'
  }
};

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_STORAGE_VARS = {
  MAX_FILE_SIZE: {
    default: '10485760', // 10MB
    description: 'Maximum file size in bytes'
  },
  DEFAULT_STORAGE_LIMIT: {
    default: '5368709120', // 5GB
    description: 'Default storage limit per user in bytes'
  },
  STORAGE_TIMEOUT_MS: {
    default: '60000', // 60 seconds
    description: 'Storage operation timeout in milliseconds'
  },
  STORAGE_CDN_URL: {
    default: '',
    description: 'CDN URL for public file serving (optional)'
  },
  ENABLE_FILE_ENCRYPTION: {
    default: 'false',
    validValues: ['true', 'false'],
    description: 'Enable file encryption at rest'
  }
};

function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const validated = {};

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const isRequired = typeof config.required === 'function' 
      ? config.required(process.env)
      : config.required;

    // Check if required
    if (isRequired && !value) {
      errors.push(`Missing required environment variable: ${key} - ${config.description}`);
      continue;
    }

    // Use default if not provided
    const finalValue = value || config.default;

    // Validate if validator exists
    if (finalValue && config.validate && !config.validate(finalValue)) {
      errors.push(`Invalid value for ${key}: ${finalValue} - ${config.description}`);
      continue;
    }

    // Transform if transformer exists
    const transformedValue = config.transform ? config.transform(finalValue) : finalValue;

    validated[key] = transformedValue;

    // Log secret values as masked
    if (config.secret && value) {
      logger.debug(`Environment variable ${key} is set (masked)`);
    } else if (value) {
      logger.debug(`Environment variable ${key} = ${value}`);
    } else if (config.default) {
      logger.debug(`Environment variable ${key} using default: ${config.default}`);
    }
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach(error => logger.error(`  - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(warning));
  }

  logger.info('✅ Environment validation passed');
  return validated;
}

/**
 * Get validated environment variable
 */
function getEnv(key, defaultValue = null) {
  const config = REQUIRED_ENV_VARS[key];
  if (!config) {
    logger.warn(`Unknown environment variable: ${key}`);
    return process.env[key] || defaultValue;
  }

  const value = process.env[key];
  if (!value && config.default !== undefined) {
    return config.default;
  }

  return value || defaultValue;
}

/**
 * INFRA-003: Secrets management helper (for AWS Secrets Manager, HashiCorp Vault, etc.)
 */
class SecretsManager {
  constructor() {
    this.cache = new Map();
    this.providers = {
      aws: null,
      vault: null,
      env: null // Fallback to environment variables
    };
  }

  /**
   * Initialize secrets manager based on SECRETS_PROVIDER env var
   */
  async initialize() {
    const provider = process.env.SECRETS_PROVIDER?.toLowerCase() || 'env';

    switch (provider) {
      case 'aws':
        // TODO: Initialize AWS Secrets Manager
        // const AWS = require('aws-sdk');
        // this.providers.aws = new AWS.SecretsManager();
        logger.info('AWS Secrets Manager not yet implemented, using environment variables');
        break;
      case 'vault':
        // TODO: Initialize HashiCorp Vault
        // const vault = require('node-vault');
        // this.providers.vault = vault({ ... });
        logger.info('HashiCorp Vault not yet implemented, using environment variables');
        break;
      default:
        logger.info('Using environment variables for secrets');
    }
  }

  /**
   * Get secret value (with caching)
   */
  async getSecret(key) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Try AWS Secrets Manager
    if (this.providers.aws) {
      try {
        // const result = await this.providers.aws.getSecretValue({ SecretId: key }).promise();
        // const secret = JSON.parse(result.SecretString);
        // this.cache.set(key, secret);
        // return secret;
      } catch (error) {
        logger.warn(`Failed to get secret from AWS: ${error.message}`);
      }
    }

    // Try Vault
    if (this.providers.vault) {
      try {
        // const result = await this.providers.vault.read(`secret/data/${key}`);
        // const secret = result.data.data;
        // this.cache.set(key, secret);
        // return secret;
      } catch (error) {
        logger.warn(`Failed to get secret from Vault: ${error.message}`);
      }
    }

    // Fallback to environment variable
    const value = process.env[key];
    if (value) {
      this.cache.set(key, value);
      return value;
    }

    throw new Error(`Secret not found: ${key}`);
  }
}

const secretsManager = new SecretsManager();

/**
 * INFRA-004: Environment-specific configuration
 */
function getEnvironmentConfig() {
  const env = (process.env.NODE_ENV || 'development').toLowerCase();
  
  const configs = {
    development: {
      logLevel: 'debug',
      enableMetrics: false,
      enableTracing: false,
      storageType: 'local',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      defaultStorageLimit: 5 * 1024 * 1024 * 1024, // 5GB
      enableVirusScanning: false,
      enableSensitiveDataScanning: false,
      cleanupJobInterval: 60 * 60 * 1000, // 1 hour
      quotaWarningThreshold: 0.8 // 80%
    },
    staging: {
      logLevel: 'info',
      enableMetrics: true,
      enableTracing: true,
      storageType: 'supabase',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      defaultStorageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      enableVirusScanning: true,
      enableSensitiveDataScanning: true,
      cleanupJobInterval: 30 * 60 * 1000, // 30 minutes
      quotaWarningThreshold: 0.8 // 80%
    },
    production: {
      logLevel: 'warn',
      enableMetrics: true,
      enableTracing: true,
      storageType: 'supabase',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      defaultStorageLimit: 50 * 1024 * 1024 * 1024, // 50GB
      enableVirusScanning: true,
      enableSensitiveDataScanning: true,
      cleanupJobInterval: 15 * 60 * 1000, // 15 minutes
      quotaWarningThreshold: 0.8 // 80%
    }
  };

  return configs[env] || configs.development;
}

module.exports = {
  validateEnvironment,
  getEnv,
  secretsManager,
  getEnvironmentConfig,
  REQUIRED_ENV_VARS
};

