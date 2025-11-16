/**
 * Secrets Manager Integration
 * 
 * Supports multiple secrets management providers:
 * - AWS Secrets Manager
 * - Doppler
 * - HashiCorp Vault
 * - Environment variables (fallback)
 */

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

/**
 * Configuration
 */
const CONFIG = {
  provider: process.env.SECRETS_PROVIDER || 'env', // 'aws' | 'doppler' | 'vault' | 'env'
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  vaultAddress: process.env.VAULT_ADDR || 'http://localhost:8200',
  vaultToken: process.env.VAULT_TOKEN,
  cacheEnabled: true,
  cacheTTL: 300000 // 5 minutes
};

/**
 * In-memory cache for secrets
 */
const secretsCache = new Map();

/**
 * AWS Secrets Manager Client
 */
let awsSecretsClient = null;

function getAWSSecretsClient() {
  if (!awsSecretsClient) {
    awsSecretsClient = new SecretsManagerClient({
      region: CONFIG.awsRegion
    });
  }
  return awsSecretsClient;
}

/**
 * Fetch secret from AWS Secrets Manager
 */
async function fetchFromAWS(secretName) {
  try {
    const client = getAWSSecretsClient();
    const command = new GetSecretValueCommand({
      SecretId: secretName
    });

    const response = await client.send(command);
    
    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    } else if (response.SecretBinary) {
      return Buffer.from(response.SecretBinary, 'base64').toString('ascii');
    }

    throw new Error('Secret not found');
  } catch (error) {
    console.error(`Failed to fetch secret from AWS: ${secretName}`, error.message);
    throw error;
  }
}

/**
 * Fetch secret from Doppler
 */
async function fetchFromDoppler(secretName) {
  // Doppler injects secrets as environment variables
  // No need to fetch - just return from env
  return process.env[secretName];
}

/**
 * Fetch secret from HashiCorp Vault
 */
async function fetchFromVault(secretPath) {
  try {
    const fetch = require('node-fetch');
    const url = `${CONFIG.vaultAddress}/v1/${secretPath}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Vault-Token': CONFIG.vaultToken
      }
    });

    if (!response.ok) {
      throw new Error(`Vault returned ${response.status}`);
    }

    const data = await response.json();
    return data.data.data; // Vault KV v2 format
  } catch (error) {
    console.error(`Failed to fetch secret from Vault: ${secretPath}`, error.message);
    throw error;
  }
}

/**
 * Fetch secret from environment variables
 */
function fetchFromEnv(secretName) {
  return process.env[secretName];
}

/**
 * Get secret from cache
 */
function getFromCache(key) {
  if (!CONFIG.cacheEnabled) {
    return null;
  }

  const cached = secretsCache.get(key);
  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > CONFIG.cacheTTL) {
    secretsCache.delete(key);
    return null;
  }

  return cached.value;
}

/**
 * Store secret in cache
 */
function storeInCache(key, value) {
  if (!CONFIG.cacheEnabled) {
    return;
  }

  secretsCache.set(key, {
    value,
    timestamp: Date.now()
  });
}

/**
 * Get secret (main function)
 */
async function getSecret(secretName, options = {}) {
  const provider = options.provider || CONFIG.provider;
  const cacheKey = `${provider}:${secretName}`;

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  let secret;

  try {
    switch (provider) {
      case 'aws':
        secret = await fetchFromAWS(secretName);
        break;
      
      case 'doppler':
        secret = fetchFromDoppler(secretName);
        break;
      
      case 'vault':
        secret = await fetchFromVault(secretName);
        break;
      
      case 'env':
      default:
        secret = fetchFromEnv(secretName);
        break;
    }

    if (!secret) {
      throw new Error(`Secret not found: ${secretName}`);
    }

    // Store in cache
    storeInCache(cacheKey, secret);

    return secret;
  } catch (error) {
    console.error(`Failed to get secret: ${secretName}`, error.message);
    
    // Fallback to environment variable
    if (provider !== 'env') {
      console.warn(`Falling back to environment variable for: ${secretName}`);
      return fetchFromEnv(secretName);
    }

    throw error;
  }
}

/**
 * Get multiple secrets at once
 */
async function getSecrets(secretNames, options = {}) {
  const promises = secretNames.map(name => getSecret(name, options));
  const results = await Promise.allSettled(promises);

  const secrets = {};
  results.forEach((result, index) => {
    const name = secretNames[index];
    if (result.status === 'fulfilled') {
      secrets[name] = result.value;
    } else {
      console.error(`Failed to get secret: ${name}`, result.reason);
      secrets[name] = null;
    }
  });

  return secrets;
}

/**
 * Refresh secret (clear cache and fetch again)
 */
async function refreshSecret(secretName, options = {}) {
  const provider = options.provider || CONFIG.provider;
  const cacheKey = `${provider}:${secretName}`;
  
  secretsCache.delete(cacheKey);
  return getSecret(secretName, options);
}

/**
 * Clear all cached secrets
 */
function clearCache() {
  secretsCache.clear();
}

/**
 * Load all application secrets
 */
async function loadApplicationSecrets() {
  console.log(`Loading secrets from: ${CONFIG.provider}`);

  const secretNames = [
    'DATABASE_URL',
    'REDIS_URL',
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  try {
    const secrets = await getSecrets(secretNames);

    // Set as environment variables
    Object.entries(secrets).forEach(([name, value]) => {
      if (value) {
        process.env[name] = typeof value === 'object' ? JSON.stringify(value) : value;
      }
    });

    console.log('✅ Secrets loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to load secrets:', error.message);
    return false;
  }
}

/**
 * Secrets rotation helper
 */
async function rotateSecret(secretName, newValue, options = {}) {
  const provider = options.provider || CONFIG.provider;

  console.log(`Rotating secret: ${secretName}`);

  try {
    switch (provider) {
      case 'aws':
        // Update secret in AWS Secrets Manager
        const { PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
        const client = getAWSSecretsClient();
        const command = new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: typeof newValue === 'object' ? JSON.stringify(newValue) : newValue
        });
        await client.send(command);
        break;
      
      case 'vault':
        // Update secret in Vault
        const fetch = require('node-fetch');
        const url = `${CONFIG.vaultAddress}/v1/${secretName}`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'X-Vault-Token': CONFIG.vaultToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: newValue })
        });
        break;
      
      default:
        console.warn('Secret rotation not supported for provider:', provider);
        return false;
    }

    // Clear cache
    await refreshSecret(secretName, options);

    console.log(`✅ Secret rotated successfully: ${secretName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to rotate secret: ${secretName}`, error.message);
    return false;
  }
}

module.exports = {
  getSecret,
  getSecrets,
  refreshSecret,
  clearCache,
  loadApplicationSecrets,
  rotateSecret,
  CONFIG
};

