#!/usr/bin/env node
// Check which resumes don't have embeddings and why

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingEmbeddings() {
  console.log('\n========================================');
  console.log('  CHECKING RESUMES WITHOUT EMBEDDINGS');
  console.log('========================================\n');

  try {
    // Get all resumes without embeddings
    const resumes = await prisma.$queryRaw`
      SELECT id, name, data, "createdAt"
      FROM base_resumes
      WHERE embedding IS NULL
      ORDER BY "createdAt" DESC
    `;

    console.log(`Found ${resumes.length} resumes without embeddings\n`);

    if (resumes.length === 0) {
      console.log('✅ All resumes already have embeddings!\n');
      return;
    }

    let emptyCount = 0;
    let validCount = 0;

    console.log('Analyzing each resume:\n');
    console.log('─'.repeat(80));

    resumes.forEach((resume, index) => {
      const data = resume.data;
      
      // Check if resume has content
      let hasContent = false;
      let contentSummary = '';

      if (data) {
        // Check for various content fields
        const hasName = data.name && data.name.trim().length > 0;
        const hasTitle = data.title && data.title.trim().length > 0;
        const hasSummary = data.summary && data.summary.trim().length > 0;
        const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
        const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
        const hasEducation = Array.isArray(data.education) && data.education.length > 0;

        hasContent = hasName || hasTitle || hasSummary || hasSkills || hasExperience || hasEducation;

        // Build content summary
        const parts = [];
        if (hasName) parts.push(`name`);
        if (hasTitle) parts.push(`title`);
        if (hasSummary) parts.push(`summary`);
        if (hasSkills) parts.push(`${data.skills.length} skills`);
        if (hasExperience) parts.push(`${data.experience.length} jobs`);
        if (hasEducation) parts.push(`${data.education.length} degrees`);
        
        contentSummary = parts.length > 0 ? parts.join(', ') : 'EMPTY';
      } else {
        contentSummary = 'NULL DATA';
      }

      const status = hasContent ? '✅ VALID' : '❌ EMPTY';
      if (hasContent) {
        validCount++;
      } else {
        emptyCount++;
      }

      console.log(`${index + 1}. ${status}`);
      console.log(`   Name: ${resume.name}`);
      console.log(`   ID: ${resume.id}`);
      console.log(`   Content: ${contentSummary}`);
      console.log(`   Created: ${new Date(resume.createdAt).toLocaleDateString()}`);
      console.log('─'.repeat(80));
    });

    console.log('\n========================================');
    console.log('  SUMMARY');
    console.log('========================================\n');
    console.log(`Total without embeddings: ${resumes.length}`);
    console.log(`├─ Valid resumes: ${validCount} ✅`);
    console.log(`└─ Empty/test resumes: ${emptyCount} ❌\n`);

    if (validCount > 0) {
      console.log(`🎯 We can generate embeddings for ${validCount} more resume(s)!\n`);
    } else {
      console.log('✅ All valid resumes already have embeddings!\n');
      console.log('The remaining resumes are empty/test data - this is expected.\n');
    }

    // Calculate potential coverage
    const total = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM base_resumes
    `;
    const withEmbeddings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM base_resumes WHERE embedding IS NOT NULL
    `;

    const currentCoverage = (Number(withEmbeddings[0].count) / Number(total[0].count) * 100).toFixed(1);
    const potentialCoverage = ((Number(withEmbeddings[0].count) + validCount) / Number(total[0].count) * 100).toFixed(1);

    console.log('Coverage:');
    console.log(`  Current: ${currentCoverage}% (${withEmbeddings[0].count}/${total[0].count})`);
    console.log(`  Potential: ${potentialCoverage}% (${Number(withEmbeddings[0].count) + validCount}/${total[0].count})\n`);

    if (validCount > 0) {
      console.log('Run the migration script to generate embeddings for valid resumes:\n');
      console.log('  node scripts/migrate-embeddings-simple.js\n');
    } else {
      console.log('🎉 Maximum coverage achieved for valid resumes!\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingEmbeddings();

