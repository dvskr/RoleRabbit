/**
 * Test Email Sending with Verified Domain
 * Run: node test-email-production.js
 */

require('dotenv').config();
const { sendEmail, sendOTPEmail } = require('./utils/emailService');

async function testEmailSending() {
  console.log('🧪 Testing Email Service with rolerabbit.com\n');
  console.log('='.repeat(60));
  
  // Check configuration
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  console.log(`📧 From Address: ${emailFrom}`);
  console.log(`🔑 Resend API Key: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}\n`);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  // Test email sending
  const testEmail = process.env.TEST_EMAIL || 'daggulasatish143@gmail.com';
  console.log(`📬 Test Recipient: ${testEmail}\n`);
  
  try {
    console.log('Sending test email...\n');
    
    const result = await sendEmail({
      to: testEmail,
      subject: '✅ RoleReady Email Test - Domain Verified!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .success { color: #10B981; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Email Test Successful!</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p class="success">✅ Your rolerabbit.com domain is verified and working!</p>
              <p>This email was sent from <strong>${emailFrom}</strong></p>
              <p>You can now send emails to any recipient using your verified domain.</p>
              <p>Best regards,<br>The RoleReady Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Email Test Successful! Your rolerabbit.com domain is verified and working. This email was sent from ${emailFrom}`,
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Email ID: ${result.id || 'N/A'}\n`);
    console.log('📬 Check your inbox:', testEmail);
    console.log('   The email should be from:', emailFrom);
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure RESEND_API_KEY is set in .env');
    console.error('   2. Make sure EMAIL_FROM is set to noreply@rolerabbit.com');
    console.error('   3. Verify domain is verified in Resend dashboard');
    console.error('   4. Check Resend API key is valid');
    process.exit(1);
  }
}

testEmailSending();

