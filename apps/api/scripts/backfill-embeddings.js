/**
 * Backfill Embedding Column for Existing Resumes
 * 
 * Generates embeddings for resumes that don't have them.
 * Runs as a background job without blocking.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Configuration
 */
const CONFIG = {
  batchSize: 10, // Process 10 resumes at a time
  delayBetweenBatches: 1000, // 1 second delay between batches
  maxRetries: 3,
  dryRun: false
};

/**
 * Generate embedding from resume text
 * Uses OpenAI embeddings API
 */
async function generateEmbedding(resumeText) {
  // TODO: Implement actual OpenAI embeddings API call
  // For now, return a placeholder
  
  const { Configuration, OpenAIApi } = require('openai');
  
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const openai = new OpenAIApi(configuration);
  
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: resumeText
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error.message);
    throw error;
  }
}

/**
 * Extract text from resume data for embedding
 */
function extractResumeText(resumeData) {
  const textParts = [];

  // Contact info
  if (resumeData.contact) {
    if (resumeData.contact.name) textParts.push(resumeData.contact.name);
    if (resumeData.contact.title) textParts.push(resumeData.contact.title);
  }

  // Summary
  if (resumeData.summary) {
    textParts.push(resumeData.summary);
  }

  // Experience
  if (Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      if (exp.company) textParts.push(exp.company);
      if (exp.role) textParts.push(exp.role);
      if (Array.isArray(exp.bullets)) {
        textParts.push(...exp.bullets);
      }
    });
  }

  // Education
  if (Array.isArray(resumeData.education)) {
    resumeData.education.forEach(edu => {
      if (edu.institution) textParts.push(edu.institution);
      if (edu.degree) textParts.push(edu.degree);
      if (edu.field) textParts.push(edu.field);
    });
  }

  // Skills
  if (resumeData.skills) {
    if (Array.isArray(resumeData.skills.technical)) {
      textParts.push(...resumeData.skills.technical);
    }
    if (Array.isArray(resumeData.skills.tools)) {
      textParts.push(...resumeData.skills.tools);
    }
  }

  // Projects
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(proj => {
      if (proj.name) textParts.push(proj.name);
      if (proj.summary) textParts.push(proj.summary);
      if (Array.isArray(proj.bullets)) {
        textParts.push(...proj.bullets);
      }
    });
  }

  return textParts.join(' ').trim();
}

/**
 * Backfill embedding for a single resume
 */
async function backfillResumeEmbedding(resume, retries = 0) {
  try {
    // Extract text
    const resumeText = extractResumeText(resume.data);

    if (!resumeText) {
      console.log(`⏭️  Skipping resume ${resume.id} - no text content`);
      return { success: true, skipped: true };
    }

    if (CONFIG.dryRun) {
      console.log(`DRY RUN - Would generate embedding for resume ${resume.id}`);
      return { success: true, dryRun: true };
    }

    // Generate embedding
    console.log(`🔄 Generating embedding for resume ${resume.id}...`);
    const embedding = await generateEmbedding(resumeText);

    // Update resume
    await prisma.baseResume.update({
      where: { id: resume.id },
      data: {
        embedding: embedding,
        embeddingUpdatedAt: new Date()
      }
    });

    console.log(`✅ Generated embedding for resume ${resume.id}`);
    return { success: true, resumeId: resume.id };

  } catch (error) {
    console.error(`❌ Failed to generate embedding for resume ${resume.id}:`, error.message);

    // Retry logic
    if (retries < CONFIG.maxRetries) {
      console.log(`🔄 Retrying (${retries + 1}/${CONFIG.maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return backfillResumeEmbedding(resume, retries + 1);
    }

    return {
      success: false,
      resumeId: resume.id,
      error: error.message
    };
  }
}

/**
 * Backfill embeddings for all resumes
 */
async function backfillAllEmbeddings() {
  console.log('🚀 Starting embedding backfill...');
  console.log('Configuration:', CONFIG);

  try {
    // Get resumes without embeddings
    const totalCount = await prisma.baseResume.count({
      where: {
        OR: [
          { embedding: null },
          { embeddingUpdatedAt: null }
        ],
        deletedAt: null // Skip deleted resumes
      }
    });

    console.log(`📊 Found ${totalCount} resumes without embeddings`);

    if (totalCount === 0) {
      console.log('✅ All resumes already have embeddings');
      return;
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Process in batches
    let offset = 0;
    let batchNumber = 1;

    while (offset < totalCount) {
      console.log(`\n📦 Processing batch ${batchNumber}...`);

      const batch = await prisma.baseResume.findMany({
        where: {
          OR: [
            { embedding: null },
            { embeddingUpdatedAt: null }
          ],
          deletedAt: null
        },
        select: {
          id: true,
          data: true
        },
        take: CONFIG.batchSize,
        skip: offset
      });

      if (batch.length === 0) {
        break;
      }

      // Process batch
      for (const resume of batch) {
        const result = await backfillResumeEmbedding(resume);

        if (result.success) {
          if (result.skipped) {
            results.skipped.push(result.resumeId);
          } else {
            results.success.push(result.resumeId);
          }
        } else {
          results.failed.push({
            resumeId: result.resumeId,
            error: result.error
          });
        }
      }

      offset += CONFIG.batchSize;
      batchNumber++;

      // Progress update
      const processed = Math.min(offset, totalCount);
      const percentage = ((processed / totalCount) * 100).toFixed(1);
      console.log(`Progress: ${processed}/${totalCount} (${percentage}%)`);

      // Delay between batches to avoid rate limits
      if (offset < totalCount) {
        console.log(`⏳ Waiting ${CONFIG.delayBetweenBatches}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully generated: ${results.success.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(60));

    if (results.failed.length > 0) {
      console.log('\n❌ Failed embeddings:');
      results.failed.forEach(f => {
        console.log(`  - ${f.resumeId}: ${f.error}`);
      });
    }

    if (CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes were made');
    }

  } catch (error) {
    console.error('💥 Backfill failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backfill if called directly
if (require.main === module) {
  backfillAllEmbeddings()
    .then(() => {
      console.log('\n✅ Backfill completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Backfill failed:', error);
      process.exit(1);
    });
}

module.exports = {
  backfillAllEmbeddings,
  generateEmbedding,
  extractResumeText
};

