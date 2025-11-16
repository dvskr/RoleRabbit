/**
 * Integration Test Setup (Section 5.3)
 *
 * Sets up test database and cleans up after tests
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// Test database configuration
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/rolerabbit_test';

// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.JWT_SECRET = 'test-jwt-secret-for-integration';

let supabase: ReturnType<typeof createClient>;

/**
 * Run database migrations before all tests
 */
beforeAll(async () => {
  console.log('Setting up test database...');

  try {
    // Run migrations
    execSync('npm run db:migrate', {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: 'inherit',
    });

    // Initialize Supabase client
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Test database ready');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

/**
 * Clean up database after each test
 */
afterEach(async () => {
  if (!supabase) return;

  try {
    // Delete test data in reverse order of dependencies
    await supabase.from('portfolio_share_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_analytics_daily').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_deployments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Failed to clean up test data:', error);
  }
});

/**
 * Close connections after all tests
 */
afterAll(async () => {
  console.log('Cleaning up test database...');
  // Give async operations time to complete
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Export test utilities
export { supabase };
