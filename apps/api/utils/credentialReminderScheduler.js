/**
 * Credential Reminder Email Scheduler
 * Sends email reminders for expiring credentials
 */

const cron = require('node-cron');
const { prisma } = require('./db');
const logger = require('./logger');

/**
 * Check for expiring credentials and send email reminders
 */
async function checkExpiringCredentials() {
  try {
    logger.info('Checking for expiring credentials...');

    // Get date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Get date 7 days from now
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get date 1 day from now
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const now = new Date();

    // Find credentials expiring within 30 days
    const expiringCredentials = await prisma.credential.findMany({
      where: {
        expirationDate: {
          not: null
        },
        verificationStatus: {
          not: 'expired'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailNotifications: true
          }
        },
        reminders: {
          where: {
            isSent: false
          }
        }
      }
    });

    let emailsSent = 0;
    let remindersCreated = 0;

    for (const credential of expiringCredentials) {
      // Skip if user has email notifications disabled
      if (!credential.user.emailNotifications) {
        continue;
      }

      // Parse expiration date
      const expirationDate = new Date(credential.expirationDate);

      if (isNaN(expirationDate.getTime())) {
        logger.warn(`Invalid expiration date for credential ${credential.id}`);
        continue;
      }

      // Check if credential is expired
      if (expirationDate <= now) {
        // Update status to expired
        await prisma.credential.update({
          where: { id: credential.id },
          data: {
            verificationStatus: 'expired'
          }
        });
        logger.info(`Marked credential ${credential.id} as expired`);
        continue;
      }

      // Determine priority and reminder date
      let priority = 'low';
      let shouldSendReminder = false;

      if (expirationDate <= oneDayFromNow) {
        priority = 'urgent';
        shouldSendReminder = true;
      } else if (expirationDate <= sevenDaysFromNow) {
        priority = 'high';
        shouldSendReminder = true;
      } else if (expirationDate <= thirtyDaysFromNow) {
        priority = 'medium';
        // Only send monthly reminder
        shouldSendReminder = credential.reminders.length === 0;
      }

      // Create reminder if it doesn't exist
      if (shouldSendReminder && credential.reminders.length === 0) {
        await prisma.credentialReminder.create({
          data: {
            credentialId: credential.id,
            reminderDate: now,
            priority,
            isSent: false
          }
        });
        remindersCreated++;
        logger.info(`Created reminder for credential ${credential.id} (${priority} priority)`);
      }

      // Send email notification
      if (shouldSendReminder) {
        try {
          // Calculate days until expiration
          const daysUntilExpiration = Math.ceil(
            (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Send email (implement your email service here)
          await sendExpirationReminderEmail({
            userEmail: credential.user.email,
            userName: credential.user.name,
            credentialName: credential.name,
            credentialType: credential.credentialType,
            issuer: credential.issuer,
            expirationDate: credential.expirationDate,
            daysUntilExpiration,
            priority
          });

          // Mark reminder as sent
          if (credential.reminders.length > 0) {
            await prisma.credentialReminder.update({
              where: { id: credential.reminders[0].id },
              data: {
                isSent: true
              }
            });
          }

          emailsSent++;
          logger.info(`Sent expiration reminder for credential ${credential.id} to ${credential.user.email}`);
        } catch (emailError) {
          logger.error(`Failed to send reminder email for credential ${credential.id}:`, emailError);
        }
      }
    }

    logger.info(`Credential reminder check complete: ${remindersCreated} reminders created, ${emailsSent} emails sent`);

  } catch (error) {
    logger.error('Error checking expiring credentials:', error);
  }
}

/**
 * Send expiration reminder email
 * @param {Object} params - Email parameters
 */
async function sendExpirationReminderEmail(params) {
  const {
    userEmail,
    userName,
    credentialName,
    credentialType,
    issuer,
    expirationDate,
    daysUntilExpiration,
    priority
  } = params;

  // TODO: Implement actual email sending using your email service
  // For now, just log the email content
  logger.info('Email to be sent:', {
    to: userEmail,
    subject: `⚠️ Credential Expiring ${daysUntilExpiration === 0 ? 'Today' : `in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`}`,
    body: `
      Hi ${userName},

      Your ${credentialType} "${credentialName}" issued by ${issuer} is expiring ${daysUntilExpiration === 0 ? 'today' : `in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`}.

      Expiration Date: ${new Date(expirationDate).toLocaleDateString()}

      Please take action to renew your credential to avoid any interruptions.

      Priority: ${priority.toUpperCase()}

      Best regards,
      RoleRabbit Team
    `,
    priority
  });

  // Example implementation with nodemailer (uncomment when ready):
  /*
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransporter({
    // Your email service configuration
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@rolerabbit.com',
    to: userEmail,
    subject: `⚠️ Credential Expiring ${daysUntilExpiration === 0 ? 'Today' : `in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`}`,
    html: `
      <h2>Credential Expiration Reminder</h2>
      <p>Hi ${userName},</p>
      <p>Your <strong>${credentialType}</strong> "${credentialName}" issued by ${issuer} is expiring ${daysUntilExpiration === 0 ? 'today' : `in ${daysUntilExpiration} day${daysUntilExpiration === 1 ? '' : 's'}`}.</p>
      <p><strong>Expiration Date:</strong> ${new Date(expirationDate).toLocaleDateString()}</p>
      <p>Please take action to renew your credential to avoid any interruptions.</p>
      <p style="color: ${priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'gray'}">Priority: <strong>${priority.toUpperCase()}</strong></p>
      <p>Best regards,<br>RoleRabbit Team</p>
    `
  });
  */
}

/**
 * Start the credential reminder scheduler
 * Runs daily at 9 AM
 */
function startCredentialReminderScheduler() {
  // Run daily at 9:00 AM
  const job = cron.schedule('0 9 * * *', async () => {
    logger.info('Running scheduled credential reminder check...');
    await checkExpiringCredentials();
  });

  // Run immediately on startup
  logger.info('Credential reminder scheduler started (runs daily at 9 AM)');
  checkExpiringCredentials().catch((error) => {
    logger.error('Error running initial credential check:', error);
  });

  return job;
}

/**
 * Stop the credential reminder scheduler
 */
function stopCredentialReminderScheduler(job) {
  if (job) {
    job.stop();
    logger.info('Credential reminder scheduler stopped');
  }
}

module.exports = {
  startCredentialReminderScheduler,
  stopCredentialReminderScheduler,
  checkExpiringCredentials,
  sendExpirationReminderEmail
};
