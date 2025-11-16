/**
 * Migrate Legacy Resume Records to BaseResume
 * 
 * This script migrates data from the old Resume table to the new BaseResume table.
 * Run once during deployment.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Migration configuration
 */
const CONFIG = {
  batchSize: 100, // Process 100 resumes at a time
  dryRun: false, // Set to true to preview without making changes
  skipExisting: true // Skip resumes already migrated
};

/**
 * Map legacy resume data to new BaseResume format
 */
function mapLegacyToBaseResume(legacyResume, slotNumber) {
  return {
    id: legacyResume.id, // Preserve ID
    userId: legacyResume.userId,
    slotNumber: slotNumber,
    name: legacyResume.name || 'Untitled Resume',
    isActive: legacyResume.isActive !== false, // Default to true
    
    // Map data structure
    data: normalizeLegacyData(legacyResume.data),
    
    // Map formatting
    formatting: legacyResume.formatting || {},
    
    // Map metadata
    metadata: {
      ...(legacyResume.metadata || {}),
      migratedFrom: 'legacy_resume',
      migratedAt: new Date().toISOString()
    },
    
    // Preserve timestamps
    createdAt: legacyResume.createdAt,
    updatedAt: legacyResume.updatedAt,
    
    // Initialize new fields
    version: 1,
    tags: [],
    deletedAt: null,
    archivedAt: null
  };
}

/**
 * Normalize legacy resume data to new schema
 */
function normalizeLegacyData(data) {
  if (!data) return {};

  const normalized = { ...data };

  // Normalize contact info
  if (normalized.contact) {
    normalized.contact = {
      name: normalized.contact.name || '',
      title: normalized.contact.title || '',
      email: normalized.contact.email || '',
      phone: normalized.contact.phone || '',
      location: normalized.contact.location || '',
      linkedin: normalized.contact.linkedin || '',
      github: normalized.contact.github || '',
      website: normalized.contact.website || '',
      links: Array.isArray(normalized.contact.links) ? normalized.contact.links : []
    };
  }

  // Normalize skills (ensure array format)
  if (normalized.skills) {
    if (typeof normalized.skills === 'string') {
      // Convert comma-separated string to array
      normalized.skills = {
        technical: normalized.skills.split(',').map(s => s.trim())
      };
    } else if (Array.isArray(normalized.skills)) {
      // Convert array to object format
      normalized.skills = {
        technical: normalized.skills
      };
    } else if (typeof normalized.skills === 'object') {
      // Ensure all skill categories are arrays
      normalized.skills = {
        technical: Array.isArray(normalized.skills.technical) ? normalized.skills.technical : [],
        tools: Array.isArray(normalized.skills.tools) ? normalized.skills.tools : [],
        soft: Array.isArray(normalized.skills.soft) ? normalized.skills.soft : [],
        languages: Array.isArray(normalized.skills.languages) ? normalized.skills.languages : []
      };
    }
  }

  // Normalize experience (ensure array)
  if (normalized.experience && !Array.isArray(normalized.experience)) {
    normalized.experience = [];
  }

  // Normalize education (ensure array)
  if (normalized.education && !Array.isArray(normalized.education)) {
    normalized.education = [];
  }

  // Normalize projects (ensure array)
  if (normalized.projects && !Array.isArray(normalized.projects)) {
    normalized.projects = [];
  }

  // Normalize certifications (ensure array)
  if (normalized.certifications && !Array.isArray(normalized.certifications)) {
    normalized.certifications = [];
  }

  return normalized;
}

/**
 * Get next available slot number for user
 */
async function getNextSlotNumber(userId) {
  const existingResumes = await prisma.baseResume.findMany({
    where: { userId },
    select: { slotNumber: true },
    orderBy: { slotNumber: 'desc' }
  });

  if (existingResumes.length === 0) {
    return 1;
  }

  const maxSlot = existingResumes[0].slotNumber;
  return Math.min(maxSlot + 1, 5); // Max 5 slots
}

/**
 * Migrate a batch of legacy resumes
 */
async function migrateBatch(legacyResumes) {
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const legacyResume of legacyResumes) {
    try {
      // Check if already migrated
      if (CONFIG.skipExisting) {
        const existing = await prisma.baseResume.findUnique({
          where: { id: legacyResume.id }
        });

        if (existing) {
          results.skipped.push({
            id: legacyResume.id,
            reason: 'Already exists in BaseResume'
          });
          continue;
        }
      }

      // Get next slot number
      const slotNumber = await getNextSlotNumber(legacyResume.userId);

      if (slotNumber > 5) {
        results.failed.push({
          id: legacyResume.id,
          error: 'User has reached maximum slot limit (5)'
        });
        continue;
      }

      // Map to new format
      const baseResumeData = mapLegacyToBaseResume(legacyResume, slotNumber);

      if (CONFIG.dryRun) {
        console.log('DRY RUN - Would migrate:', {
          id: legacyResume.id,
          userId: legacyResume.userId,
          slotNumber
        });
        results.success.push({ id: legacyResume.id, dryRun: true });
        continue;
      }

      // Create BaseResume
      await prisma.baseResume.create({
        data: baseResumeData
      });

      // Mark legacy resume as migrated
      await prisma.resume.update({
        where: { id: legacyResume.id },
        data: {
          migratedToBaseResumeId: legacyResume.id,
          migratedAt: new Date()
        }
      });

      results.success.push({
        id: legacyResume.id,
        userId: legacyResume.userId,
        slotNumber
      });

      console.log(`✅ Migrated resume ${legacyResume.id} to slot ${slotNumber}`);

    } catch (error) {
      console.error(`❌ Failed to migrate resume ${legacyResume.id}:`, error.message);
      results.failed.push({
        id: legacyResume.id,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Main migration function
 */
async function migrateAllResumes() {
  console.log('🚀 Starting legacy resume migration...');
  console.log('Configuration:', CONFIG);

  try {
    // Get total count
    const totalCount = await prisma.resume.count({
      where: {
        migratedToBaseResumeId: null // Not yet migrated
      }
    });

    console.log(`📊 Found ${totalCount} resumes to migrate`);

    if (totalCount === 0) {
      console.log('✅ No resumes to migrate');
      return;
    }

    const totalResults = {
      success: [],
      failed: [],
      skipped: []
    };

    // Process in batches
    let offset = 0;
    while (offset < totalCount) {
      console.log(`\n📦 Processing batch ${Math.floor(offset / CONFIG.batchSize) + 1}...`);

      const batch = await prisma.resume.findMany({
        where: {
          migratedToBaseResumeId: null
        },
        take: CONFIG.batchSize,
        skip: offset
      });

      if (batch.length === 0) {
        break;
      }

      const batchResults = await migrateBatch(batch);

      totalResults.success.push(...batchResults.success);
      totalResults.failed.push(...batchResults.failed);
      totalResults.skipped.push(...batchResults.skipped);

      offset += CONFIG.batchSize;

      // Progress update
      console.log(`Progress: ${Math.min(offset, totalCount)}/${totalCount}`);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${totalResults.success.length}`);
    console.log(`⏭️  Skipped: ${totalResults.skipped.length}`);
    console.log(`❌ Failed: ${totalResults.failed.length}`);
    console.log('='.repeat(60));

    if (totalResults.failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      totalResults.failed.forEach(f => {
        console.log(`  - ${f.id}: ${f.error}`);
      });
    }

    if (CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes were made');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateAllResumes()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateAllResumes,
  mapLegacyToBaseResume,
  normalizeLegacyData
};

