/**
 * Direct Prisma test to see the exact error
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirect() {
  try {
    console.log('🧪 Testing Prisma directly...\n');
    
    // Get a test user ID
    const user = await prisma.user.findFirst({
      where: { email: 'testresume@example.com' }
    });
    
    if (!user) {
      console.error('Test user not found');
      await prisma.$disconnect();
      return;
    }
    
    console.log('Found user:', user.id);
    
    // Test data structure that's failing
    const testData = {
      userId: user.id,
      fileName: 'Direct Prisma Test',
      templateId: null,
      data: {
        resumeData: {
          name: 'Test',
          email: 'test@example.com',
          skills: ['JS'],
          experience: [{
            id: '1',
            company: 'Test',
            position: 'Eng',
            period: '2020-01',
            endPeriod: '2024-12',
            location: 'SF',
            bullets: ['Did stuff']
          }],
          education: [{
            id: '1',
            degree: 'BS',
            school: 'Uni',
            startDate: '2016-09',
            endDate: '2020-05',
            field: 'CS'
          }]
        },
        sectionVisibility: { summary: true },
        customSections: [],
        customFields: [],
        formatting: { fontFamily: 'arial', fontSize: 'ats11pt' }
      },
      sectionOrder: ['summary', 'skills'],
      sectionVisibility: { summary: true },
      customSections: [],
      customFields: [],
      formatting: { fontFamily: 'arial', fontSize: 'ats11pt' }
    };
    
    console.log('Attempting Prisma create...');
    console.log('Data structure:', JSON.stringify({
      userId: typeof testData.userId,
      fileName: typeof testData.fileName,
      templateId: testData.templateId,
      hasData: !!testData.data,
      sectionOrder: Array.isArray(testData.sectionOrder),
      sectionVisibility: typeof testData.sectionVisibility
    }, null, 2));
    
    const result = await prisma.resume.create({
      data: testData
    });
    
    console.log('\n✅ SUCCESS!');
    console.log('Resume ID:', result.id);
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Meta:', error.meta);
    console.error('Stack:', error.stack);
    
    // Write to file
    const fs = require('fs');
    fs.writeFileSync('prisma-direct-error.json', JSON.stringify({
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
      name: error.name
    }, null, 2));
    console.log('\nError details written to prisma-direct-error.json');
  } finally {
    await prisma.$disconnect();
  }
}

testDirect();

