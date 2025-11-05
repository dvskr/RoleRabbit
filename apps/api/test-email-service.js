/**
 * Test Email Service Configuration
 * Verifies Resend (or other email service) is working
 */

require('dotenv').config();
const { sendEmail, sendOTPEmail } = require('./utils/emailService');
const logger = require('./utils/logger');

async function testEmailService() {
  console.log('📧 Testing Email Service Configuration...\n');

  // Check environment variables
  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;

  console.log('Configuration Status:');
  console.log(`  ✅ Resend API Key: ${resendKey ? '✓ Set' : '✗ Not set'}`);
  console.log(`  ${sendgridKey ? '✓' : '✗'} SendGrid API Key: ${sendgridKey ? 'Set' : 'Not set'}`);
  console.log(`  ${smtpHost ? '✓' : '✗'} SMTP Host: ${smtpHost || 'Not set'}`);
  console.log(`  ${smtpUser ? '✓' : '✗'} SMTP User: ${smtpUser || 'Not set'}`);
  console.log('');

  if (!resendKey && !sendgridKey && !smtpHost) {
    console.log('❌ No email service configured!');
    console.log('   Please set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP settings in .env file');
    return;
  }

  // Get test email from command line or use default
  const testEmail = process.argv[2] || process.env.TEST_EMAIL || 'test@example.com';

  console.log(`Testing with email: ${testEmail}\n`);

  try {
    // Test 1: Basic email sending
    console.log('Test 1: Sending basic test email...');
    const result1 = await sendEmail({
      to: testEmail,
      subject: 'RoleReady - Email Service Test',
      html: '<h1>Test Email</h1><p>If you receive this, your email service is working!</p>',
      text: 'Test Email - If you receive this, your email service is working!'
    });

    console.log(`✅ Email sent successfully via ${result1.provider}`);
    console.log(`   Message ID: ${result1.id || result1.messageId || 'N/A'}\n`);

    // Test 2: OTP email
    console.log('Test 2: Sending OTP email...');
    const result2 = await sendOTPEmail(testEmail, '123456', 'password_reset');
    console.log(`✅ OTP email sent successfully\n`);

    console.log('🎉 All email tests passed!');
    console.log(`\nCheck your inbox at: ${testEmail}`);
    console.log('Note: OTP in test email is "123456" (test only)');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('API key')) {
      console.error('\n💡 Check your RESEND_API_KEY in .env file');
    } else if (error.message.includes('domain') || error.message.includes('from')) {
      console.error('\n💡 You may need to verify your domain in Resend dashboard');
      console.error('   Or use a verified email address for "from" field');
    } else {
      console.error('\n💡 Check server logs for more details');
    }
  }
}

// Run test
testEmailService().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

