const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('📦 Reading migration SQL...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'prisma/migrations/20251114045013_add_job_tracker_models/migration.sql'),
      'utf-8'
    );

    console.log('🗄️  Applying migration to database...');

    // Split by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`   Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
      } catch (error) {
        // Check if it's a "already exists" error, which we can skip
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
          console.log(`   ⚠ Statement ${i + 1}/${statements.length} skipped (already exists)`);
        } else {
          throw error;
        }
      }
    }

    console.log('✅ Migration applied successfully!');

    // Update migration record
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid()::text,
        '',
        NOW(),
        '20251114045013_add_job_tracker_models',
        NULL,
        NULL,
        NOW(),
        1
      )
      ON CONFLICT DO NOTHING
    `;

    console.log('📝 Migration record updated');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('🎉 Job Tracker migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });
