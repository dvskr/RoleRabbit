const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

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
 * Send email using Resend, tempGrid, or fallback SMTP
 */
async function sendEmail({ to, subject, html, text, from = 'noreply@roleready.com' }) {
  try {
    // Try Resend first (Primary - You chose this)
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        html: html,
        text: text,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`Email sent via Resend to ${to}:`, data.id);
      return { success: true, provider: 'resend', id: data.id };
    }
    
    // Try SendGrid if Resend not configured
    if (sendgridApiKey) {
      const msg = {
        to,
        from: { name: 'RoleReady', email: from },
        subject,
        text,
        html,
      };
      
      await sgMail.send(msg);
      console.log(`Email sent via SendGrid to ${to}`);
      return { success: true, provider: 'sendgrid' };
    }
    
    // Fallback to SMTP
    const info = await transporter.sendMail({
      from: `"RoleReady" <${from}>`,
      to,
      subject,
      text,
      html,
    });
    
    console.log(`Email sent via SMTP to ${to}:`, info.messageId);
    return { success: true, provider: 'smtp', messageId: info.messageId };
    
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(user) {
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
  });
}

/**
 * Send job application reminder email
 */
async function sendJobReminderEmail(email, job) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .job-card { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10B981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Job Application Reminder</h1>
        </div>
        <div class="content">
          <p>Don't forget to follow up on this job application:</p>
          <div class="job-card">
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Status:</strong> ${job.status}</p>
            <p><strong>Applied:</strong> ${new Date(job.appliedDate).toLocaleDateString()}</p>
          </div>
          <p>Time to send a follow up!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: `Reminder: Follow up on ${job.title} at ${job.company}`,
    html,
    text: `Reminder: Follow up on ${job.title} at ${job.company}`,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendJobReminderEmail,
};

