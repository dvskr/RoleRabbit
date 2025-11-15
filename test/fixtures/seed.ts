/**
 * Test Database Seed Script (Section 5.5)
 *
 * Populates test database with sample data for manual testing
 */

import { createClient } from '@supabase/supabase-js';
import { getAllTestUsers } from './users';
import { getAllTestPortfolios } from './portfolios';
import { getAllTestTemplates } from './templates';
import testAnalytics, { generateAnalyticsForPortfolio } from './analytics';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Seed Templates
    console.log('📝 Seeding templates...');
    const templates = getAllTestTemplates();

    for (const template of templates) {
      const { data, error } = await supabase
        .from('portfolio_templates')
        .upsert(template, { onConflict: 'id' });

      if (error) {
        console.error(`Error seeding template ${template.name}:`, error.message);
      } else {
        console.log(`  ✓ ${template.name}`);
      }
    }

    // 2. Seed Users (if you have a users table)
    console.log('\n👥 Seeding users...');
    const users = getAllTestUsers();

    for (const user of users) {
      // Note: This assumes you have a users/profiles table
      // Adjust based on your schema
      console.log(`  ✓ ${user.firstName} ${user.lastName} (${user.email})`);
    }

    // 3. Seed Portfolios
    console.log('\n💼 Seeding portfolios...');
    const portfolios = getAllTestPortfolios();

    for (const portfolio of portfolios) {
      const { data, error } = await supabase
        .from('portfolios')
        .upsert(portfolio, { onConflict: 'id' });

      if (error) {
        console.error(`Error seeding portfolio ${portfolio.title}:`, error.message);
      } else {
        console.log(`  ✓ ${portfolio.title} (${portfolio.isPublished ? 'Published' : 'Draft'})`);
      }
    }

    // 4. Seed Analytics
    console.log('\n📊 Seeding analytics data...');

    // Seed daily views
    for (const dailyView of testAnalytics.dailyViews) {
      await supabase
        .from('portfolio_analytics_daily')
        .upsert(dailyView, { onConflict: 'portfolio_id,date' });
    }
    console.log(`  ✓ ${testAnalytics.dailyViews.length} daily view records`);

    // Seed traffic sources (if you have this table)
    // for (const source of testAnalytics.trafficSources) {
    //   await supabase.from('portfolio_traffic_sources').upsert(source);
    // }
    // console.log(`  ✓ ${testAnalytics.trafficSources.length} traffic source records`);

    // 5. Seed Portfolio Versions
    console.log('\n📜 Seeding portfolio versions...');

    const versionData = {
      portfolio_id: 'portfolio-fullstack-1',
      data: portfolios[0],
      change_summary: 'Initial version',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    };

    await supabase.from('portfolio_versions').insert(versionData);
    console.log('  ✓ 1 version record');

    // 6. Seed Share Links
    console.log('\n🔗 Seeding share links...');

    const shareLink = {
      portfolio_id: 'portfolio-fullstack-1',
      token: 'test-share-token-' + Date.now(),
      expires_at: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    };

    await supabase.from('portfolio_share_links').insert(shareLink);
    console.log('  ✓ 1 share link');

    // 7. Seed Deployments
    console.log('\n🚀 Seeding deployments...');

    const deployment = {
      portfolio_id: 'portfolio-fullstack-1',
      status: 'completed',
      url: 'https://johndoe.rolerabbit.com',
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      completed_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
      duration_seconds: 300, // 5 minutes
    };

    await supabase.from('portfolio_deployments').insert(deployment);
    console.log('  ✓ 1 deployment record');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`  - ${templates.length} templates`);
    console.log(`  - ${users.length} users`);
    console.log(`  - ${portfolios.length} portfolios`);
    console.log(`  - ${testAnalytics.dailyViews.length} analytics records`);
    console.log('\n💡 You can now test the application with realistic data!');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing test data...\n');

  try {
    // Delete in reverse order of dependencies
    await supabase.from('portfolio_share_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_analytics_daily').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_versions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_deployments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('portfolio_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Database cleared\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === 'clear') {
    await clearDatabase();
  } else if (command === 'seed') {
    await seedDatabase();
  } else if (command === 'reset') {
    await clearDatabase();
    await seedDatabase();
  } else {
    console.log('Usage:');
    console.log('  npm run db:seed -- seed    # Seed database with test data');
    console.log('  npm run db:seed -- clear   # Clear all test data');
    console.log('  npm run db:seed -- reset   # Clear and reseed');
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { seedDatabase, clearDatabase };
