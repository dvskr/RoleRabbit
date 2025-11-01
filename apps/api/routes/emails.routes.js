/**
 * Email Routes Module
 * 
 * Handles all email-related routes for job applications
 */

const { 
  getEmailsByUserId,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  getEmailsByJobId
} = require('../utils/emails');
const { sendEmail } = require('../utils/emailService');
const { authenticate } = require('../middleware/auth');
const { errorHandler, requireOwnership } = require('../utils/errorMiddleware');
const CrudService = require('../utils/crudService');

const emailsService = new CrudService('email');

/**
 * Register all email routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function emailRoutes(fastify, options) {
  // Get all emails for user
  fastify.get('/api/emails', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const jobId = request.query.jobId;
    
    const emails = jobId 
      ? await getEmailsByJobId(jobId)
      : await getEmailsByUserId(userId);
    
    return { emails };
  }));

  // Create new email
  fastify.post('/api/emails', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const emailData = request.body;
    
    const email = await createEmail(userId, emailData);
    return { 
      success: true, 
      email 
    };
  }));

  // Get single email by ID
  fastify.get('/api/emails/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(emailsService, id, userId);
    const email = await getEmailById(id);

    return { email };
  }));

  // Update email
  fastify.put('/api/emails/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;
    const updates = request.body;

    // Verify ownership
    await requireOwnership(emailsService, id, userId);

    const email = await updateEmail(id, updates);
    return { 
      success: true, 
      email 
    };
  }));

  // Delete email
  fastify.delete('/api/emails/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { id } = request.params;
    const userId = request.user.userId;

    // Verify ownership
    await requireOwnership(emailsService, id, userId);

    await deleteEmail(id);
    return { success: true };
  }));

  // Send email
  fastify.post('/api/emails/send', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const { to, subject, body, html, from } = request.body;
    
    // Validate required fields
    if (!to || !subject || !body) {
      return reply.status(400).send({ error: 'Missing required fields: to, subject, body' });
    }

    // Send email using email service
    const result = await sendEmail({
      to,
      subject,
      html: html || body,
      text: body,
      from: from || process.env.EMAIL_FROM || 'noreply@roleready.com'
    });

    // Save email record to database
    const email = await createEmail(request.user.userId, {
      to,
      subject,
      body,
      status: 'sent',
      type: 'outgoing'
    });

    return {
      success: true,
      email,
      provider: result.provider,
      messageId: result.id || result.messageId
    };
  }));
}

module.exports = emailRoutes;

