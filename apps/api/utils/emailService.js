/**
 * Email Service
 * 
 * Sends transactional emails for:
 * - Security alerts
 * - Password reset
 * - Account verification
 * - 2FA setup
 * 
 * Uses SendGrid/AWS SES/Mailgun (configure via environment)
 */

const nodemailer = require('nodemailer');

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send security alert email
 * @param {string} to - Recipient email
 * @param {object} data - Alert data
 */
async function sendSecurityAlert(to, data) {
  const { name, alerts, timestamp } = data;

  const alertList = alerts
    .map(alert => `- ${alert.message} (Severity: ${alert.severity})`)
    .join('\n');

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'security@roleready.com',
    to,
    subject: '🚨 Security Alert - Unusual Activity Detected',
    text: `
Hello ${name},

We detected unusual activity on your RoleReady account:

${alertList}

Time: ${new Date(timestamp).toLocaleString()}

If this was you, you can safely ignore this email. Otherwise, please:
1. Change your password immediately
2. Review your recent account activity
3. Enable two-factor authentication

If you need help, contact our support team.

Best regards,
RoleReady Security Team
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .alert-item { margin: 10px 0; }
    .severity-high { color: #dc3545; font-weight: bold; }
    .severity-critical { color: #721c24; font-weight: bold; }
    .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🚨 Security Alert</h2>
    <p>Hello ${name},</p>
    <p>We detected unusual activity on your RoleReady account:</p>
    <div class="alert">
      ${alerts.map(alert => `
        <div class="alert-item">
          <span class="severity-${alert.severity.toLowerCase()}">${alert.severity}:</span>
          ${alert.message}
        </div>
      `).join('')}
    </div>
    <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
    <p>If this was you, you can safely ignore this email. Otherwise, please take action:</p>
    <ol>
      <li>Change your password immediately</li>
      <li>Review your recent account activity</li>
      <li>Enable two-factor authentication</li>
    </ol>
    <a href="https://roleready.com/account/security" class="button">Review Account Security</a>
    <p>If you need help, contact our support team.</p>
    <p>Best regards,<br>RoleReady Security Team</p>
  </div>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Security alert email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send security alert email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {object} data - Reset data
 */
async function sendPasswordResetEmail(to, data) {
  const { name, resetToken, expiresIn } = data;
  const resetUrl = `https://roleready.com/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@roleready.com',
    to,
    subject: 'Password Reset Request',
    text: `
Hello ${name},

You requested a password reset for your RoleReady account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiresIn} minutes.

If you didn't request this, please ignore this email.

Best regards,
RoleReady Team
    `,
    html: `
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>You requested a password reset for your RoleReady account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
    <p>This link will expire in ${expiresIn} minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>RoleReady Team</p>
  </div>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send 2FA setup email
 * @param {string} to - Recipient email
 * @param {object} data - Setup data
 */
async function send2FASetupEmail(to, data) {
  const { name } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@roleready.com',
    to,
    subject: 'Two-Factor Authentication Enabled',
    text: `
Hello ${name},

Two-factor authentication has been enabled on your RoleReady account.

Your account is now more secure. You'll need to enter a code from your authenticator app when logging in.

If you didn't enable this, please contact support immediately.

Best regards,
RoleReady Security Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`2FA setup email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send 2FA setup email:', error);
    throw error;
  }
}

module.exports = {
  sendSecurityAlert,
  sendPasswordResetEmail,
  send2FASetupEmail,
};
