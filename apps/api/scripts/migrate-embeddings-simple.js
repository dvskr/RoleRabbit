#!/usr/bin/env node
// Simplified migration script using raw SQL to bypass Prisma client cache

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { generateResumeEmbedding } = require('../services/embeddings/embeddingService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function migrateEmbeddings() {
  console.log('\n========================================');
  console.log('  EMBEDDING MIGRATION (SIMPLIFIED)');
  console.log('========================================\n');

  try {
    // Get resumes without embeddings using raw SQL
    const resumes = await prisma.$queryRaw`
      SELECT id, data, name
      FROM base_resumes
      WHERE embedding IS NULL
      ORDER BY id
    `;

    const total = resumes.length;
    
    if (total === 0) {
      console.log('✅ All resumes already have embeddings!\n');
      return;
    }

    console.log(`Found ${total} resumes without embeddings\n`);
    console.log('Starting migration...\n');

    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const resume of resumes) {
      try {
        console.log(`[${processed + 1}/${total}] Processing ${resume.name || resume.id}...`);
        
        // Generate embedding
        const embedding = await generateResumeEmbedding(resume.data);
        
        // Store using raw SQL
        const embeddingStr = `[${embedding.join(',')}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE base_resumes SET embedding = $1::vector, embedding_updated_at = NOW() WHERE id = $2`,
          embeddingStr,
          resume.id
        );
        
        successful++;
        console.log(`  ✅ Success`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        console.log(`  ❌ Failed: ${error.message}`);
      }
      
      processed++;
      
      // Progress update every 5 resumes
      if (processed % 5 === 0) {
        console.log(`\nProgress: ${processed}/${total} (${Math.round(processed/total*100)}%)\n`);
      }
    }

    console.log('\n========================================');
    console.log('  MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`\nProcessed: ${processed}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round(successful/processed*100)}%\n`);

    // Check final coverage
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(embedding) as with_embeddings
      FROM base_resumes
    `;
    
    const s = stats[0];
    const coverage = (Number(s.with_embeddings) / Number(s.total) * 100).toFixed(1);
    
    console.log('Final Coverage:');
    console.log(`  Total resumes: ${s.total}`);
    console.log(`  With embeddings: ${s.with_embeddings}`);
    console.log(`  Coverage: ${coverage}%\n`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateEmbeddings();

