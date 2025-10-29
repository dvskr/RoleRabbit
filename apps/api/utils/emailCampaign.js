/**
 * Email Campaign Management
 * Handles bulk email sending and campaign tracking
 */

const { sendEmail } = require('./emailService');
const { getJobById } = require('./jobs');

const campaigns = new Map();

async function sendBulkEmail(recipients, emailTemplate) {
  const campaignId = `campaign-${Date.now()}`;
  const results = {
    campaignId,
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  campaigns.set(campaignId, {
    ...results,
    status: 'processing',
    startedAt: new Date().toISOString()
  });

  for (const recipient of recipients) {
    try {
      await sendEmail({
        to: recipient.email,
        subject: emailTemplate.subject(recipient),
        html: emailTemplate.html(recipient),
        text: emailTemplate.text(recipient)
      });
      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: recipient.email,
        error: error.message
      });
    }
  }

  campaigns.set(campaignId, {
    ...results,
    status: 'completed',
    completedAt: new Date().toISOString()
  });

  return results;
}

function getCampaignStatus(campaignId) {
  return campaigns.get(campaignId);
}

function getAllCampaigns() {
  return Array.from(campaigns.values());
}

module.exports = {
  sendBulkEmail,
  getCampaignStatus,
  getAllCampaigns
};
