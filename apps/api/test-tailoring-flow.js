/**
 * Test Tailoring Flow: Verify tailored content is saved to draft and retrieved correctly
 * Run with: node test-tailoring-flow.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTailoringFlow() {
  try {
    const userId = 'cmhr95ku0000jou3bcuihjrfu';
    
    console.log('🔍 Testing Tailoring Flow...\n');
    
    // Step 1: Get active resume
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeBaseResumeId: true }
    });
    
    if (!user?.activeBaseResumeId) {
      console.log('❌ No active resume found');
      return;
    }
    
    const baseResumeId = user.activeBaseResumeId;
    console.log('✅ Active resume ID:', baseResumeId);
    
    // Step 2: Check base resume data
    const baseResume = await prisma.baseResume.findUnique({
      where: { id: baseResumeId },
      select: {
        id: true,
        name: true,
        data: true,
        updatedAt: true
      }
    });
    
    console.log('\n📄 BASE RESUME:');
    console.log('  Name:', baseResume.name);
    console.log('  Updated:', baseResume.updatedAt);
    console.log('  Summary:', baseResume.data?.summary?.substring(0, 100) + '...');
    console.log('  Experience count:', baseResume.data?.experience?.length || 0);
    
    // Step 3: Check working draft
    const draft = await prisma.workingDraft.findUnique({
      where: { baseResumeId },
      select: {
        id: true,
        data: true,
        updatedAt: true
      }
    });
    
    if (draft) {
      console.log('\n📝 WORKING DRAFT:');
      console.log('  Draft ID:', draft.id);
      console.log('  Updated:', draft.updatedAt);
      console.log('  Summary:', draft.data?.summary?.substring(0, 100) + '...');
      console.log('  Experience count:', draft.data?.experience?.length || 0);
      
      // Step 4: Compare base vs draft
      console.log('\n🔄 COMPARISON:');
      const baseSummary = baseResume.data?.summary || '';
      const draftSummary = draft.data?.summary || '';
      
      if (baseSummary === draftSummary) {
        console.log('  ⚠️  Base and draft have SAME summary (no changes)');
      } else {
        console.log('  ✅ Base and draft have DIFFERENT summaries (draft has changes!)');
        console.log('  Base summary length:', baseSummary.length);
        console.log('  Draft summary length:', draftSummary.length);
      }
    } else {
      console.log('\n❌ NO WORKING DRAFT FOUND');
      console.log('   This means tailoring did NOT save to draft!');
    }
    
    // Step 5: Check tailored versions (history)
    const tailoredVersions = await prisma.tailoredVersion.findMany({
      where: { baseResumeId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        mode: true,
        atsScoreBefore: true,
        atsScoreAfter: true,
        createdAt: true
      }
    });
    
    console.log('\n📚 TAILORED VERSIONS (History):');
    if (tailoredVersions.length === 0) {
      console.log('  No tailored versions found');
    } else {
      tailoredVersions.forEach((tv, i) => {
        console.log(`  ${i + 1}. ${tv.mode} - Score: ${tv.atsScoreBefore} → ${tv.atsScoreAfter} (${tv.createdAt})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTailoringFlow();

