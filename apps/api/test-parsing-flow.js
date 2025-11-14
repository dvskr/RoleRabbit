/**
 * Test script to verify the parsing flow
 * Run with: node test-parsing-flow.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testParsingFlow() {
  try {
    console.log('🔍 Testing parsing flow...\n');

    // Get the most recent resume for your user
    const userId = 'cmhr95ku0000jou3bcuihjrfu';
    
    const resumes = await prisma.baseResume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        isActive: true,
        fileHash: true,
        storageFileId: true,
        data: true,
        createdAt: true
      }
    });

    console.log(`Found ${resumes.length} resumes:\n`);

    resumes.forEach((resume, idx) => {
      console.log(`${idx + 1}. ${resume.name}`);
      console.log(`   ID: ${resume.id}`);
      console.log(`   Active: ${resume.isActive}`);
      console.log(`   Has fileHash: ${!!resume.fileHash}`);
      console.log(`   fileHash: ${resume.fileHash || 'null'}`);
      console.log(`   Has storageFileId: ${!!resume.storageFileId}`);
      console.log(`   Data keys: ${resume.data ? Object.keys(resume.data).length : 0}`);
      
      if (resume.data) {
        console.log(`   Data structure:`, JSON.stringify(resume.data, null, 2).substring(0, 500));
      }
      
      console.log('');
    });

    // Test the activation logic
    const activeResume = resumes.find(r => r.isActive) || resumes[0];
    
    if (!activeResume) {
      console.log('❌ No resumes found to test!');
      return;
    }

    console.log(`\n🧪 Testing activation logic for: ${activeResume.name}`);
    console.log(`   Resume ID: ${activeResume.id}`);
    
    // Simulate the activation check
    const hasEmptyData = !activeResume.data || Object.keys(activeResume.data).length === 0;
    const hasFileReference = !!(activeResume.fileHash || activeResume.storageFileId);
    const needsParsing = hasEmptyData && hasFileReference;

    console.log(`\n📊 Parsing Check Results:`);
    console.log(`   hasEmptyData: ${hasEmptyData}`);
    console.log(`   hasFileReference: ${hasFileReference}`);
    console.log(`   needsParsing: ${needsParsing}`);

    if (!needsParsing) {
      console.log(`\n❌ Parsing would NOT trigger!`);
      console.log(`   Reason: ${!hasEmptyData ? 'Data is not empty' : 'No file reference'}`);
      
      if (!hasEmptyData && activeResume.data) {
        console.log(`\n📝 Current data structure:`);
        const data = activeResume.data;
        console.log(`   - summary: ${data.summary ? 'exists' : 'empty'}`);
        console.log(`   - contact: ${data.contact ? JSON.stringify(data.contact) : 'empty'}`);
        console.log(`   - skills: ${data.skills ? JSON.stringify(data.skills).substring(0, 100) : 'empty'}`);
        console.log(`   - experience: ${data.experience ? `${data.experience.length} entries` : 'empty'}`);
        console.log(`   - education: ${data.education ? `${data.education.length} entries` : 'empty'}`);
        console.log(`   - projects: ${data.projects ? `${data.projects.length} entries` : 'empty'}`);
        console.log(`   - certifications: ${data.certifications ? `${data.certifications.length} entries` : 'empty'}`);
      }
    } else {
      console.log(`\n✅ Parsing WOULD trigger!`);
      
      // Try to actually parse it
      console.log(`\n🔄 Attempting to parse resume...`);
      const { parseResumeByFileHash } = require('./services/resumeParser');
      
      try {
        const parseResult = await parseResumeByFileHash({
          userId: activeResume.userId || userId,
          fileHash: activeResume.fileHash,
          storageFileId: activeResume.storageFileId
        });

        console.log(`\n✅ Parsing successful!`);
        console.log(`   Method: ${parseResult.method}`);
        console.log(`   Confidence: ${parseResult.confidence}`);
        console.log(`   Cache hit: ${parseResult.cacheHit}`);
        console.log(`   Structured resume keys: ${Object.keys(parseResult.structuredResume || {}).join(', ')}`);
      } catch (parseError) {
        console.log(`\n❌ Parsing failed!`);
        console.log(`   Error: ${parseError.message}`);
        console.log(`   Stack: ${parseError.stack}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testParsingFlow();

