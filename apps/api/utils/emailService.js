const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const logger = require('./logger');

// Initialize Resend (Primary)
const resendApiKey = process.env.RESEND_API_KEY;
let resend = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

// Initialize SendGrid (Fallback)
const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
}

// Fallback transporter for development (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Check if user has email notifications enabled
 * Security emails always bypass this check
 */
async function shouldSendMarketingEmail(userId, prisma) {
  // If no userId provided, assume it's a security email and always send
  if (!userId) return true;
  
  try {
    // Use provided prisma instance or create one if needed
    let prismaClient = prisma;
    if (!prismaClient) {
      const { PrismaClient } = require('@prisma/client');
      prismaClient = new PrismaClient();
    }
    
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true }
    });
    
    // Default to true if user not found or preference not set
    return user?.emailNotifications ?? true;
  } catch (error) {
    logger.warn('Failed to check email preferences, defaulting to send:', error);
    return true; // Default to sending if check fails
  }
}

/**
 * Send email using Resend, tempGrid, or fallback SMTP
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @param {string} options.from - From address (optional)
 * @param {boolean} options.isSecurityEmail - If true, always sends regardless of preferences
 * @param {string} options.userId - User ID to check preferences (for marketing emails)
 */
async function sendEmail({ to, subject, html, text, from = null, isSecurityEmail = false, userId = null, prisma = null }) {
  // Security emails always send (OTP, password reset, email change)
  // Marketing emails check user preferences
  if (!isSecurityEmail && userId) {
    const canSend = await shouldSendMarketingEmail(userId, prisma);
    if (!canSend) {
      logger.info(`Email not sent to ${to} - user has disabled marketing notifications`);
      return { success: true, provider: 'skipped', reason: 'user_preferences' };
    }
  }
  // Use EMAIL_FROM from env, or Resend test domain, or default
  const defaultFrom = process.env.EMAIL_FROM || 
                     (resend ? 'onboarding@resend.dev' : 'noreply@rolerabbit.com');
  const fromAddress = from || defaultFrom;
  
  try {
    // Try Resend first (Primary - You chose this)
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: to,
        subject: subject,
        html: html,
        text: text,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      logger.info(`Email sent via Resend to ${to}:`, data.id);
      return { success: true, provider: 'resend', id: data.id };
    }
    
    // Try SendGrid if Resend not configured
    if (sendgridApiKey) {
      const msg = {
        to,
        from: { name: 'RoleReady', email: fromAddress },
        subject,
        text,
        html,
      };
      
      await sgMail.send(msg);
      logger.info(`Email sent via SendGrid to ${to}`);
      return { success: true, provider: 'sendgrid' };
    }
    
    // Fallback to SMTP
    const info = await transporter.sendMail({
      from: `"RoleReady" <${fromAddress}>`,
      to,
      subject,
      text,
      html,
    });
    
    logger.info(`Email sent via SMTP to ${to}:`, info.messageId);
    return { success: true, provider: 'smtp', messageId: info.messageId };
    
  } catch (error) {
    logger.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send welcome email (marketing email - respects user preferences)
 */
async function sendWelcomeEmail(user, prisma = null) {
  // Check if user wants marketing emails
  if (user.id) {
    const canSend = await shouldSendMarketingEmail(user.id, prisma);
    if (!canSend) {
      logger.info(`Welcome email skipped for ${user.email} - user has disabled marketing notifications`);
      return { success: true, provider: 'skipped', reason: 'user_preferences' };
    }
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to RoleReady! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>Welcome to RoleReady - your AI-powered career management platform!</p>
          <p>We're thrilled to have you on board. Here's what you can do:</p>
          <ul>
            <li>Build professional resumes with AI assistance</li>
            <li>Track all your job applications in one place</li>
            <li>Generate tailored cover letters automatically</li>
            <li>Get ATS-optimized suggestions</li>
            <li>And much more!</li>
          </ul>
          <p>
            <a href="https://roleready.com/dashboard" class="button">Get Started</a>
          </p>
          <p>Best of luck with your job search!</p>
          <p>The RoleReady Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Welcome to RoleReady!',
    html,
    text: `Hi ${user.name}, Welcome to RoleReady! Get started at https://roleready.com/dashboard`,
    isSecurityEmail: false, // Marketing email
    userId: user.id,
    prisma: prisma
  });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { color: #DC2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>We received a request to reset your password for your RoleReady account.</p>
          <p>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p class="warning">This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Password Reset Request - RoleReady',
    html,
    text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
    isSecurityEmail: true, // Security email - always send
  });
}

/**
 * Send OTP email for email/password updates
 */
async function sendOTPEmail(email, otp, purpose) {
  const purposeText = purpose === 'email_update' 
    ? 'update your login email' 
    : 'reset your password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .otp-box { background: #4F46E5; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; }
        .warning { color: #DC2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verification Code</h1>
        </div>
        <div class="content">
          <p>We received a request to ${purposeText} for your RoleReady account.</p>
          <p>Use the verification code below to complete your request:</p>
          <div class="otp-box">${otp}</div>
          <p class="warning">This code will expire in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `Verification Code - RoleReady`,
    html,
    text: `Your verification code is: ${otp}. This code expires in 10 minutes.`,
    isSecurityEmail: true, // Security email - always send
  });
}

/**
 * Send email change notification to old email
 */
async function sendEmailChangeNotification(oldEmail, newEmail) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Change Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to change your RoleReady account email address.</p>
          <div class="warning">
            <strong>Current email:</strong> ${oldEmail}<br>
            <strong>New email:</strong> ${newEmail}
          </div>
          <p>If you made this request, please proceed with verifying your new email address.</p>
          <p>If you did not request this change, please contact our support team immediately to secure your account.</p>
          <p>Best regards,<br>The RoleReady Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: oldEmail,
    subject: 'Email Change Request - RoleReady',
    html,
    text: `Email change requested for your RoleReady account. Current: ${oldEmail}, New: ${newEmail}. If you didn't request this, contact support immediately.`,
    isSecurityEmail: true, // Security email - always send
  });
}

/**
 * Send email change confirmation
 */
async function sendEmailChangeConfirmation(email, newEmail, type) {
  const isOldEmail = type === 'old';
  const title = isOldEmail ? 'Email Changed Successfully' : 'Welcome to Your New Email';
  const content = isOldEmail
    ? `<p>Your RoleReady account email has been successfully changed.</p>
       <p><strong>Previous email:</strong> ${email}<br>
       <strong>New email:</strong> ${newEmail}</p>
       <p>You will need to use your new email address (${newEmail}) to log in to your account.</p>
       <p>If you did not make this change, please contact our support team immediately.</p>`
    : `<p>Your RoleReady account email has been successfully changed to this address.</p>
       <p>You can now use this email address (${newEmail}) to log in to your account.</p>
       <p>Welcome! Your account is now associated with this email address.</p>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          ${content}
          <p>Best regards,<br>The RoleReady Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `${title} - RoleReady`,
    html,
    text: isOldEmail
      ? `Your RoleReady account email has been changed from ${email} to ${newEmail}. Use ${newEmail} to log in.`
      : `Your RoleReady account email has been changed to ${newEmail}. You can now use this email to log in.`,
    isSecurityEmail: true, // Security email - always send
  });
}

/**
 * Send marketing email (product updates, tips, features)
 * Respects user's email notification preferences
 */
async function sendMarketingEmail({ to, subject, html, text, userId, prisma = null, from = null }) {
  return sendEmail({
    to,
    subject,
    html,
    text,
    from,
    isSecurityEmail: false, // Marketing email - respects preferences
    userId,
    prisma
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendEmailChangeNotification,
  sendEmailChangeConfirmation,
  sendMarketingEmail,
  shouldSendMarketingEmail,
};

