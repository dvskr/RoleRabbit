#!/usr/bin/env node
// Clean up empty/test resumes to achieve 100% coverage

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupEmptyResumes(dryRun = false) {
  console.log('\n========================================');
  console.log(dryRun ? '  DRY RUN: CLEANUP EMPTY RESUMES' : '  CLEANUP EMPTY RESUMES');
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
      console.log('✅ No resumes to clean up!\n');
      return;
    }

    // Identify which ones are empty
    const emptyResumes = [];
    const validResumes = [];

    resumes.forEach((resume) => {
      const data = resume.data;
      
      let hasContent = false;
      if (data) {
        const hasName = data.name && data.name.trim().length > 0;
        const hasTitle = data.title && data.title.trim().length > 0;
        const hasSummary = data.summary && data.summary.trim().length > 0;
        const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
        const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
        const hasEducation = Array.isArray(data.education) && data.education.length > 0;

        hasContent = hasName || hasTitle || hasSummary || hasSkills || hasExperience || hasEducation;
      }

      if (hasContent) {
        validResumes.push(resume);
      } else {
        emptyResumes.push(resume);
      }
    });

    console.log('Analysis:');
    console.log(`├─ Empty resumes: ${emptyResumes.length} (will be deleted)`);
    console.log(`└─ Valid resumes: ${validResumes.length} (will be kept)\n`);

    if (emptyResumes.length === 0) {
      console.log('✅ No empty resumes to delete!\n');
      return;
    }

    if (dryRun) {
      console.log('🔍 DRY RUN - No changes will be made\n');
      console.log('Resumes that would be deleted:\n');
      emptyResumes.forEach((resume, index) => {
        console.log(`${index + 1}. ${resume.name} (${resume.id})`);
        console.log(`   Created: ${new Date(resume.createdAt).toLocaleDateString()}`);
      });
      console.log('\nRun without --dry-run to actually delete these resumes.\n');
      return;
    }

    // Actually delete them
    console.log('Deleting empty resumes...\n');
    
    let deleted = 0;
    for (const resume of emptyResumes) {
      try {
        await prisma.baseResume.delete({
          where: { id: resume.id }
        });
        console.log(`✅ Deleted: ${resume.name} (${resume.id})`);
        deleted++;
      } catch (error) {
        console.log(`❌ Failed to delete ${resume.name}: ${error.message}`);
      }
    }

    console.log(`\n✅ Deleted ${deleted} empty resume(s)\n`);

    // Check final coverage
    const stats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total,
        COUNT(embedding) as with_embeddings
      FROM base_resumes
    `;
    
    const s = stats[0];
    const coverage = (Number(s.with_embeddings) / Number(s.total) * 100).toFixed(1);
    
    console.log('========================================');
    console.log('  FINAL COVERAGE');
    console.log('========================================\n');
    console.log(`Total resumes: ${s.total}`);
    console.log(`With embeddings: ${s.with_embeddings}`);
    console.log(`Coverage: ${coverage}%\n`);

    if (coverage === '100.0') {
      console.log('🎉🎉🎉 100% COVERAGE ACHIEVED! 🎉🎉🎉\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check for --dry-run flag
const dryRun = process.argv.includes('--dry-run');
cleanupEmptyResumes(dryRun);

