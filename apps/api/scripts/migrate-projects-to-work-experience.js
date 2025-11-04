/**
 * Migration script to move projects under work experience
 * Run this before applying the Prisma migration if you have existing data
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateProjects() {
  console.log('Starting migration: Moving projects under work experience...');

  try {
    // Get all projects currently linked to profiles
    const projects = await prisma.$queryRaw`
      SELECT id, "profileId", title
      FROM projects
      WHERE "profileId" IS NOT NULL
    `;

    console.log(`Found ${projects.length} projects to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const project of projects) {
      // Find the most recent work experience for this profile
      const workExperience = await prisma.$queryRaw`
        SELECT id
        FROM work_experiences
        WHERE "profileId" = ${project.profileId}
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      if (workExperience && workExperience.length > 0) {
        // Update project to link to work experience
        await prisma.$executeRaw`
          UPDATE projects
          SET "workExperienceId" = ${workExperience[0].id}
          WHERE id = ${project.id}
        `;
        migrated++;
        console.log(`✓ Migrated project "${project.title}" to work experience ${workExperience[0].id}`);
      } else {
        skipped++;
        console.log(`⚠ Skipped project "${project.title}" - no work experience found for profile ${project.profileId}`);
      }
    }

    console.log(`\nMigration complete:`);
    console.log(`  - Migrated: ${migrated}`);
    console.log(`  - Skipped: ${skipped}`);

    if (skipped > 0) {
      console.log(`\n⚠ Warning: ${skipped} projects were skipped because no work experience was found.`);
      console.log('You may want to create work experiences for these profiles before running the migration.');
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

