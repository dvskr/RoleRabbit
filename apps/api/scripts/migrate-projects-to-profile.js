/**
 * Migration script to move projects to profile (separate section)
 * Run this before applying the Prisma migration if you have existing data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateProjects() {
  console.log('Starting migration: Moving projects to profile...');

  try {
    // Get all projects currently linked to work experiences
    const projects = await prisma.$queryRaw`
      SELECT p.id, p."workExperienceId", we."profileId"
      FROM projects p
      LEFT JOIN work_experiences we ON p."workExperienceId" = we.id
      WHERE p."workExperienceId" IS NOT NULL
    `;

    console.log(`Found ${projects.length} projects to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const project of projects) {
      if (project.profileId) {
        // Update project to link to profile
        await prisma.$executeRaw`
          UPDATE projects
          SET "profileId" = ${project.profileId}
          WHERE id = ${project.id}
        `;
        migrated++;
        console.log(`✓ Migrated project ${project.id} to profile ${project.profileId}`);
      } else {
        skipped++;
        console.log(`⚠ Skipped project ${project.id} - no profile found for work experience ${project.workExperienceId}`);
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`  - Migrated: ${migrated}`);
    console.log(`  - Skipped: ${skipped}`);

    if (skipped > 0) {
      console.log(`\n⚠ Warning: ${skipped} projects were skipped because no profile was found.`);
      console.log('You may want to check these projects manually before running the migration.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateProjects()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

