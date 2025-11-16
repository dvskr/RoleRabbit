#!/usr/bin/env ts-node
/**
 * Secret Rotation Script (Section 4.7)
 *
 * Rotates secrets according to policy:
 * - Database passwords: every 90 days
 * - API keys: every 180 days
 * - JWT secrets: every 90 days
 */

import { secrets } from '../apps/web/src/lib/security/secrets';
import { createSupabaseServiceClient } from '../apps/web/src/database/client';
import crypto from 'crypto';

interface RotationPolicy {
  secretName: string;
  rotationDays: number;
  rotationFunction: () => Promise<string>;
}

/**
 * Generate secure random string
 */
function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Rotation policies
 */
const rotationPolicies: RotationPolicy[] = [
  {
    secretName: 'rolerabbit/database/password',
    rotationDays: 90,
    rotationFunction: async () => {
      // Generate new password
      const newPassword = generateSecureRandom(32);

      // Update database password
      const supabase = createSupabaseServiceClient();
      const dbUser = await secrets.getSecretValue('rolerabbit/database/user');

      // Note: This would need to be executed with superuser privileges
      await supabase.from('_migrations').select('*').limit(1); // Test connection

      console.log(`Generated new database password for user: ${dbUser}`);
      console.log('You need to manually update the database user password:');
      console.log(`ALTER USER ${dbUser} WITH PASSWORD '${newPassword}';`);

      return newPassword;
    },
  },
  {
    secretName: 'rolerabbit/jwt/secret',
    rotationDays: 90,
    rotationFunction: async () => {
      // Generate new JWT secret
      const newSecret = generateSecureRandom(64);
      console.log('Generated new JWT secret');
      console.log('Note: Users will need to re-login after this rotation');
      return newSecret;
    },
  },
  {
    secretName: 'rolerabbit/api-keys/stripe',
    rotationDays: 180,
    rotationFunction: async () => {
      console.log('Stripe API key rotation:');
      console.log('1. Go to Stripe Dashboard > Developers > API keys');
      console.log('2. Create new secret key');
      console.log('3. Enter the new key below');
      console.log('4. Update the secret in Secrets Manager');
      console.log('5. Roll out new key to all instances');
      console.log('6. Delete old key from Stripe Dashboard');

      // In production, this would prompt for new key
      throw new Error('Manual rotation required for Stripe API key');
    },
  },
  {
    secretName: 'rolerabbit/api-keys/cloudflare',
    rotationDays: 180,
    rotationFunction: async () => {
      console.log('Cloudflare API token rotation:');
      console.log('1. Go to Cloudflare Dashboard > My Profile > API Tokens');
      console.log('2. Create new API token with same permissions');
      console.log('3. Update the secret in Secrets Manager');
      console.log('4. Roll out new token to all instances');
      console.log('5. Revoke old token');

      throw new Error('Manual rotation required for Cloudflare API token');
    },
  },
];

/**
 * Get secret metadata
 */
async function getSecretMetadata(secretName: string) {
  const allSecrets = await secrets.listSecrets();
  return allSecrets.find((s) => s.name === secretName);
}

/**
 * Check if secret needs rotation
 */
async function needsRotation(
  secretName: string,
  rotationDays: number
): Promise<boolean> {
  try {
    const metadata = await getSecretMetadata(secretName);

    if (!metadata) {
      console.log(`Secret ${secretName} not found`);
      return false;
    }

    const lastRotated = metadata.lastRotatedDate || metadata.createdDate;
    if (!lastRotated) {
      console.log(`Secret ${secretName} has no rotation date, rotating...`);
      return true;
    }

    const daysSinceRotation = Math.floor(
      (Date.now() - lastRotated.getTime()) / (1000 * 60 * 60 * 24)
    );

    console.log(
      `Secret ${secretName} last rotated ${daysSinceRotation} days ago (policy: ${rotationDays} days)`
    );

    return daysSinceRotation >= rotationDays;
  } catch (error) {
    console.error(`Error checking rotation for ${secretName}:`, error);
    return false;
  }
}

/**
 * Rotate secret
 */
async function rotateSecret(policy: RotationPolicy): Promise<void> {
  console.log(`\n=== Rotating ${policy.secretName} ===`);

  try {
    // Check if rotation is needed
    const needs = await needsRotation(policy.secretName, policy.rotationDays);
    if (!needs) {
      console.log(`✓ Secret ${policy.secretName} does not need rotation yet`);
      return;
    }

    // Generate new secret value
    const newValue = await policy.rotationFunction();

    // Update secret in Secrets Manager
    await secrets.updateSecret(policy.secretName, { value: newValue });

    console.log(`✓ Secret ${policy.secretName} rotated successfully`);

    // Clear cache
    secrets.clearCache(policy.secretName);
  } catch (error) {
    console.error(`✗ Failed to rotate ${policy.secretName}:`, error);
    throw error;
  }
}

/**
 * Rotate all secrets
 */
async function rotateAllSecrets(force: boolean = false): Promise<void> {
  console.log('Starting secret rotation...\n');

  const results: { secret: string; status: 'success' | 'skipped' | 'failed'; error?: string }[] =
    [];

  for (const policy of rotationPolicies) {
    try {
      if (force) {
        console.log(`Force rotating ${policy.secretName}...`);
        const newValue = await policy.rotationFunction();
        await secrets.updateSecret(policy.secretName, { value: newValue });
        secrets.clearCache(policy.secretName);
        results.push({ secret: policy.secretName, status: 'success' });
      } else {
        await rotateSecret(policy);
        results.push({ secret: policy.secretName, status: 'success' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        secret: policy.secretName,
        status: 'failed',
        error: errorMessage,
      });
    }
  }

  // Print summary
  console.log('\n=== Rotation Summary ===');
  console.log(`Total secrets: ${results.length}`);
  console.log(`Successful: ${results.filter((r) => r.status === 'success').length}`);
  console.log(`Skipped: ${results.filter((r) => r.status === 'skipped').length}`);
  console.log(`Failed: ${results.filter((r) => r.status === 'failed').length}`);

  if (results.some((r) => r.status === 'failed')) {
    console.log('\nFailed rotations:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        console.log(`  - ${r.secret}: ${r.error}`);
      });
  }
}

/**
 * Verify secret rotation
 */
async function verifyRotation(secretName: string): Promise<void> {
  console.log(`Verifying rotation for ${secretName}...`);

  try {
    // Get current secret
    const value = await secrets.getSecretValue(secretName);
    console.log(`✓ Secret ${secretName} is accessible`);

    // Get metadata
    const metadata = await getSecretMetadata(secretName);
    if (metadata) {
      console.log(`  ARN: ${metadata.arn}`);
      console.log(`  Created: ${metadata.createdDate}`);
      console.log(`  Last Changed: ${metadata.lastChangedDate}`);
      console.log(`  Last Rotated: ${metadata.lastRotatedDate}`);
      console.log(`  Rotation Enabled: ${metadata.rotationEnabled}`);
    }
  } catch (error) {
    console.error(`✗ Failed to verify ${secretName}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'rotate') {
      const secretName = args[1];
      if (secretName) {
        // Rotate specific secret
        const policy = rotationPolicies.find((p) => p.secretName === secretName);
        if (!policy) {
          console.error(`Unknown secret: ${secretName}`);
          process.exit(1);
        }
        await rotateSecret(policy);
      } else {
        // Rotate all secrets
        await rotateAllSecrets();
      }
    } else if (command === 'force-rotate') {
      await rotateAllSecrets(true);
    } else if (command === 'verify') {
      const secretName = args[1];
      if (!secretName) {
        console.error('Secret name required for verify command');
        process.exit(1);
      }
      await verifyRotation(secretName);
    } else if (command === 'list') {
      const allSecrets = await secrets.listSecrets('rolerabbit');
      console.log('Secrets:');
      allSecrets.forEach((s) => {
        const daysSinceRotation = s.lastRotatedDate
          ? Math.floor((Date.now() - s.lastRotatedDate.getTime()) / (1000 * 60 * 60 * 24))
          : 'never';
        console.log(`  - ${s.name} (last rotated: ${daysSinceRotation} days ago)`);
      });
    } else {
      console.log('Usage:');
      console.log('  npm run rotate-secrets rotate [secret-name]  - Rotate secret(s)');
      console.log('  npm run rotate-secrets force-rotate          - Force rotate all secrets');
      console.log('  npm run rotate-secrets verify <secret-name>  - Verify secret rotation');
      console.log('  npm run rotate-secrets list                  - List all secrets');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
