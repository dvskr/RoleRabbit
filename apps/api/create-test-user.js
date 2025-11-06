/**
 * Create a test user for testing resume save functionality
 * Run with: node create-test-user.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { registerUser } = require('./auth');

async function createTestUser() {
  try {
    const testEmail = 'testresume@example.com';
    const testPassword = 'TestResume123!';
    const testName = 'Test Resume User';
    
    console.log('🔧 Creating test user...\n');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('Name:', testName);
    console.log('');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log('   User ID:', existingUser.id);
      console.log('   Email:', existingUser.email);
      console.log('\n💡 You can now run:');
      console.log(`   TEST_EMAIL=${testEmail} TEST_PASSWORD=${testPassword} node test-resume-save.js`);
      await prisma.$disconnect();
      return;
    }
    
    // Create new user
    const user = await registerUser(testEmail, testPassword, testName);
    
    console.log('✅ Test user created successfully!');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('\n💡 You can now run:');
    console.log(`   TEST_EMAIL=${testEmail} TEST_PASSWORD=${testPassword} node test-resume-save.js`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n💡 User already exists. You can use these credentials:');
      console.log('   TEST_EMAIL=testresume@example.com');
      console.log('   TEST_PASSWORD=TestResume123!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

