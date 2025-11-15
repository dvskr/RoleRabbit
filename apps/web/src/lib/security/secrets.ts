/**
 * Secrets Management Service (Section 4.7)
 *
 * Manages secrets using AWS Secrets Manager or HashiCorp Vault
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  RotateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * Secret provider type
 */
export type SecretProvider = 'aws' | 'vault' | 'env';

/**
 * Secret metadata
 */
export interface SecretMetadata {
  name: string;
  arn?: string;
  versionId?: string;
  createdDate?: Date;
  lastChangedDate?: Date;
  lastRotatedDate?: Date;
  rotationEnabled?: boolean;
  rotationLambdaARN?: string;
}

/**
 * Secret value
 */
export interface SecretValue {
  [key: string]: string;
}

/**
 * Secret rotation configuration
 */
export interface RotationConfig {
  automaticallyAfterDays: number;
  rotationLambdaARN?: string;
}

/**
 * Secrets manager service
 */
export class SecretsManager {
  private static instance: SecretsManager;
  private provider: SecretProvider;
  private awsClient?: SecretsManagerClient;
  private cache: Map<string, { value: SecretValue; expiry: number }>;
  private cacheTTL: number = 300000; // 5 minutes

  private constructor() {
    this.provider = (process.env.SECRETS_PROVIDER as SecretProvider) || 'env';
    this.cache = new Map();

    if (this.provider === 'aws') {
      this.awsClient = new SecretsManagerClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: process.env.AWS_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            }
          : undefined, // Use IAM role if no credentials provided
      });
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  /**
   * Get secret value
   *
   * @example
   * const dbPassword = await secrets.getSecret('rolerabbit/db/password');
   * const apiKeys = await secrets.getSecret('rolerabbit/api-keys');
   */
  async getSecret(secretName: string): Promise<SecretValue> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    let value: SecretValue;

    if (this.provider === 'aws') {
      value = await this.getAWSSecret(secretName);
    } else if (this.provider === 'vault') {
      value = await this.getVaultSecret(secretName);
    } else {
      value = await this.getEnvSecret(secretName);
    }

    // Cache the value
    this.cache.set(secretName, {
      value,
      expiry: Date.now() + this.cacheTTL,
    });

    return value;
  }

  /**
   * Get secret from AWS Secrets Manager
   */
  private async getAWSSecret(secretName: string): Promise<SecretValue> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.awsClient.send(command);

      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }

      throw new Error('Secret value is not a string');
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Get secret from HashiCorp Vault
   */
  private async getVaultSecret(secretName: string): Promise<SecretValue> {
    const vaultAddr = process.env.VAULT_ADDR;
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultAddr || !vaultToken) {
      throw new Error('Vault configuration missing');
    }

    try {
      const response = await fetch(`${vaultAddr}/v1/secret/data/${secretName}`, {
        headers: {
          'X-Vault-Token': vaultToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Vault API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.data;
    } catch (error) {
      console.error(`Failed to get secret from Vault ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Get secret from environment variables (fallback)
   */
  private async getEnvSecret(secretName: string): Promise<SecretValue> {
    // Convert secret name to env var name
    // e.g., "rolerabbit/db/password" -> "ROLERABBIT_DB_PASSWORD"
    const envVarName = secretName.toUpperCase().replace(/[\/\-]/g, '_');

    const value = process.env[envVarName];
    if (!value) {
      throw new Error(`Secret ${secretName} not found in environment`);
    }

    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(value);
    } catch {
      return { value };
    }
  }

  /**
   * Get individual secret value
   */
  async getSecretValue(secretName: string, key?: string): Promise<string> {
    const secret = await this.getSecret(secretName);

    if (key) {
      if (!secret[key]) {
        throw new Error(`Key ${key} not found in secret ${secretName}`);
      }
      return secret[key];
    }

    // If no key specified, return first value or 'value' key
    return secret.value || Object.values(secret)[0];
  }

  /**
   * Create secret
   */
  async createSecret(
    secretName: string,
    secretValue: SecretValue,
    description?: string
  ): Promise<void> {
    if (this.provider === 'aws') {
      await this.createAWSSecret(secretName, secretValue, description);
    } else if (this.provider === 'vault') {
      await this.createVaultSecret(secretName, secretValue);
    } else {
      throw new Error('Creating secrets is not supported with env provider');
    }

    // Invalidate cache
    this.cache.delete(secretName);
  }

  /**
   * Create secret in AWS Secrets Manager
   */
  private async createAWSSecret(
    secretName: string,
    secretValue: SecretValue,
    description?: string
  ): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new CreateSecretCommand({
        Name: secretName,
        Description: description,
        SecretString: JSON.stringify(secretValue),
        Tags: [
          { Key: 'Application', Value: 'RoleRabbit' },
          { Key: 'ManagedBy', Value: 'SecretsManager' },
        ],
      });

      await this.awsClient.send(command);
    } catch (error) {
      console.error(`Failed to create secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Create secret in Vault
   */
  private async createVaultSecret(
    secretName: string,
    secretValue: SecretValue
  ): Promise<void> {
    const vaultAddr = process.env.VAULT_ADDR;
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultAddr || !vaultToken) {
      throw new Error('Vault configuration missing');
    }

    try {
      const response = await fetch(`${vaultAddr}/v1/secret/data/${secretName}`, {
        method: 'POST',
        headers: {
          'X-Vault-Token': vaultToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: secretValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vault API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to create secret in Vault ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Update secret
   */
  async updateSecret(secretName: string, secretValue: SecretValue): Promise<void> {
    if (this.provider === 'aws') {
      await this.updateAWSSecret(secretName, secretValue);
    } else if (this.provider === 'vault') {
      await this.createVaultSecret(secretName, secretValue); // Vault uses same endpoint for create/update
    } else {
      throw new Error('Updating secrets is not supported with env provider');
    }

    // Invalidate cache
    this.cache.delete(secretName);
  }

  /**
   * Update secret in AWS Secrets Manager
   */
  private async updateAWSSecret(secretName: string, secretValue: SecretValue): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new UpdateSecretCommand({
        SecretId: secretName,
        SecretString: JSON.stringify(secretValue),
      });

      await this.awsClient.send(command);
    } catch (error) {
      console.error(`Failed to update secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Rotate secret
   */
  async rotateSecret(secretName: string, rotationConfig?: RotationConfig): Promise<void> {
    if (this.provider === 'aws') {
      await this.rotateAWSSecret(secretName, rotationConfig);
    } else {
      throw new Error('Secret rotation is only supported with AWS Secrets Manager');
    }

    // Invalidate cache
    this.cache.delete(secretName);
  }

  /**
   * Rotate secret in AWS Secrets Manager
   */
  private async rotateAWSSecret(
    secretName: string,
    rotationConfig?: RotationConfig
  ): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new RotateSecretCommand({
        SecretId: secretName,
        RotationLambdaARN: rotationConfig?.rotationLambdaARN,
        RotationRules: rotationConfig
          ? {
              AutomaticallyAfterDays: rotationConfig.automaticallyAfterDays,
            }
          : undefined,
      });

      await this.awsClient.send(command);
    } catch (error) {
      console.error(`Failed to rotate secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Delete secret
   */
  async deleteSecret(secretName: string, forceDelete: boolean = false): Promise<void> {
    if (this.provider === 'aws') {
      await this.deleteAWSSecret(secretName, forceDelete);
    } else if (this.provider === 'vault') {
      await this.deleteVaultSecret(secretName);
    } else {
      throw new Error('Deleting secrets is not supported with env provider');
    }

    // Invalidate cache
    this.cache.delete(secretName);
  }

  /**
   * Delete secret from AWS Secrets Manager
   */
  private async deleteAWSSecret(secretName: string, forceDelete: boolean): Promise<void> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new DeleteSecretCommand({
        SecretId: secretName,
        ForceDeleteWithoutRecovery: forceDelete,
        RecoveryWindowInDays: forceDelete ? undefined : 7,
      });

      await this.awsClient.send(command);
    } catch (error) {
      console.error(`Failed to delete secret ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * Delete secret from Vault
   */
  private async deleteVaultSecret(secretName: string): Promise<void> {
    const vaultAddr = process.env.VAULT_ADDR;
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultAddr || !vaultToken) {
      throw new Error('Vault configuration missing');
    }

    try {
      const response = await fetch(`${vaultAddr}/v1/secret/data/${secretName}`, {
        method: 'DELETE',
        headers: {
          'X-Vault-Token': vaultToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Vault API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to delete secret from Vault ${secretName}:`, error);
      throw error;
    }
  }

  /**
   * List secrets
   */
  async listSecrets(prefix?: string): Promise<SecretMetadata[]> {
    if (this.provider === 'aws') {
      return this.listAWSSecrets(prefix);
    }

    throw new Error('Listing secrets is only supported with AWS Secrets Manager');
  }

  /**
   * List secrets from AWS Secrets Manager
   */
  private async listAWSSecrets(prefix?: string): Promise<SecretMetadata[]> {
    if (!this.awsClient) {
      throw new Error('AWS Secrets Manager client not initialized');
    }

    try {
      const command = new ListSecretsCommand({
        Filters: prefix
          ? [
              {
                Key: 'name',
                Values: [prefix],
              },
            ]
          : undefined,
      });

      const response = await this.awsClient.send(command);

      return (response.SecretList || []).map((secret) => ({
        name: secret.Name || '',
        arn: secret.ARN,
        createdDate: secret.CreatedDate,
        lastChangedDate: secret.LastChangedDate,
        lastRotatedDate: secret.LastRotatedDate,
        rotationEnabled: secret.RotationEnabled,
        rotationLambdaARN: secret.RotationLambdaARN,
      }));
    } catch (error) {
      console.error('Failed to list secrets:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(secretName?: string): void {
    if (secretName) {
      this.cache.delete(secretName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }
}

/**
 * Export singleton instance
 */
export const secrets = SecretsManager.getInstance();

/**
 * Helper to load database credentials
 */
export async function getDatabaseCredentials() {
  return {
    host: await secrets.getSecretValue('rolerabbit/database/host'),
    port: parseInt(await secrets.getSecretValue('rolerabbit/database/port')),
    database: await secrets.getSecretValue('rolerabbit/database/name'),
    user: await secrets.getSecretValue('rolerabbit/database/user'),
    password: await secrets.getSecretValue('rolerabbit/database/password'),
  };
}

/**
 * Helper to load API keys
 */
export async function getAPIKeys() {
  const keys = await secrets.getSecret('rolerabbit/api-keys');
  return {
    supabase: keys.supabase_key,
    stripe: keys.stripe_key,
    resend: keys.resend_key,
    cloudflare: keys.cloudflare_key,
  };
}

/**
 * Helper to load JWT secret
 */
export async function getJWTSecret(): Promise<string> {
  return secrets.getSecretValue('rolerabbit/jwt/secret');
}
