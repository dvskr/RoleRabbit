/**
 * Template Monitoring Utilities
 * Centralized helpers for logging, metrics, and audit tracking for template operations
 */

const { logAuditEvent, AuditActions } = require('./auditLogger');
const { templateUsageCounter, templateFavoritesGauge } = require('../observability/metrics');
const { logTemplateInfo, logTemplateError } = require('../middleware/templateLogging');

/**
 * Track template usage event
 */
async function trackTemplateUsage({ userId, templateId, action, category, metadata = {}, ip, userAgent }) {
  try {
    // Increment Prometheus counter
    templateUsageCounter.inc({
      action,
      templateId: templateId || 'unknown',
      category: category || 'unknown'
    });

    // Log to audit system
    const auditAction = getAuditActionForUsage(action);
    if (auditAction) {
      await logAuditEvent({
        userId,
        action: auditAction,
        resource: 'TEMPLATE',
        resourceId: templateId,
        details: { action, category, ...metadata },
        ip,
        userAgent
      });
    }

    logTemplateInfo('Template usage tracked', { userId, templateId, action });
  } catch (error) {
    logTemplateError('Failed to track template usage', error, { userId, templateId, action });
  }
}

/**
 * Track template favorite addition
 */
async function trackFavoriteAdd({ userId, templateId, ip, userAgent }) {
  try {
    await logAuditEvent({
      userId,
      action: AuditActions.TEMPLATE_FAVORITE_ADD,
      resource: 'TEMPLATE_FAVORITE',
      resourceId: templateId,
      details: { action: 'add' },
      ip,
      userAgent
    });

    logTemplateInfo('Template favorited', { userId, templateId });
  } catch (error) {
    logTemplateError('Failed to track favorite add', error, { userId, templateId });
  }
}

/**
 * Track template favorite removal
 */
async function trackFavoriteRemove({ userId, templateId, ip, userAgent }) {
  try {
    await logAuditEvent({
      userId,
      action: AuditActions.TEMPLATE_FAVORITE_REMOVE,
      resource: 'TEMPLATE_FAVORITE',
      resourceId: templateId,
      details: { action: 'remove' },
      ip,
      userAgent
    });

    logTemplateInfo('Template unfavorited', { userId, templateId });
  } catch (error) {
    logTemplateError('Failed to track favorite remove', error, { userId, templateId });
  }
}

/**
 * Update template favorites gauge metric
 */
function updateFavoritesGauge(templateId, count) {
  try {
    templateFavoritesGauge.set({ templateId }, count);
  } catch (error) {
    logTemplateError('Failed to update favorites gauge', error, { templateId, count });
  }
}

/**
 * Track template CRUD operations
 */
async function trackTemplateOperation({ operation, userId, templateId, changes = {}, ip, userAgent }) {
  try {
    const actionMap = {
      create: AuditActions.TEMPLATE_CREATE,
      update: AuditActions.TEMPLATE_UPDATE,
      delete: AuditActions.TEMPLATE_DELETE
    };

    const action = actionMap[operation];
    if (!action) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    await logAuditEvent({
      userId,
      action,
      resource: 'TEMPLATE',
      resourceId: templateId,
      details: { operation, changes },
      ip,
      userAgent
    });

    logTemplateInfo(`Template ${operation}d`, { userId, templateId, operation });
  } catch (error) {
    logTemplateError('Failed to track template operation', error, { operation, userId, templateId });
  }
}

/**
 * Track preference updates
 */
async function trackPreferencesUpdate({ userId, preferences, ip, userAgent }) {
  try {
    await logAuditEvent({
      userId,
      action: AuditActions.TEMPLATE_PREFERENCES_UPDATE,
      resource: 'TEMPLATE_PREFERENCES',
      resourceId: userId,
      details: { preferences },
      ip,
      userAgent
    });

    logTemplateInfo('Template preferences updated', { userId });
  } catch (error) {
    logTemplateError('Failed to track preferences update', error, { userId });
  }
}

/**
 * Map usage action to audit action
 */
function getAuditActionForUsage(action) {
  const map = {
    PREVIEW: AuditActions.TEMPLATE_PREVIEW,
    DOWNLOAD: AuditActions.TEMPLATE_DOWNLOAD,
    USE: AuditActions.TEMPLATE_USE,
    SHARE: AuditActions.TEMPLATE_SHARE,
    FAVORITE: AuditActions.TEMPLATE_FAVORITE_ADD
  };
  return map[action] || null;
}

/**
 * Get request context for logging
 */
function getRequestContext(request) {
  return {
    userId: request.user?.id || null,
    ip: request.ip || request.headers['x-forwarded-for'] || request.socket?.remoteAddress,
    userAgent: request.headers['user-agent'] || 'unknown'
  };
}

module.exports = {
  trackTemplateUsage,
  trackFavoriteAdd,
  trackFavoriteRemove,
  updateFavoritesGauge,
  trackTemplateOperation,
  trackPreferencesUpdate,
  getRequestContext
};
