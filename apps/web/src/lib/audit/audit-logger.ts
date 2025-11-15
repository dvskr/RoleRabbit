/**
 * Audit Logging
 * Section 2.10: Authorization & Security
 *
 * Requirement #14: Audit logging for sensitive operations
 * Record: userId, IP, timestamp for portfolio delete, publish, template create/update
 */

import { logger, AuditAction } from '../logger/logger';
import { NextRequest } from 'next/server';

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail?: string;
  ip: string;
  userAgent?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * In-memory audit log store
 * TODO: In production, store in database table
 */
const auditLogs: AuditLogEntry[] = [];

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Create audit log entry
 * Requirement #14: Record userId, IP, timestamp
 */
export function createAuditLog(
  action: AuditAction,
  resource: string,
  resourceId: string,
  request: NextRequest,
  userId: string,
  metadata?: Record<string, any>
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    action,
    resource,
    resourceId,
    userId,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || undefined,
    correlationId: request.headers.get('x-correlation-id') || undefined,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // Store in memory
  // TODO: In production, store in database
  // await db.auditLog.create({ data: entry });
  auditLogs.push(entry);

  // Log to application logger
  logger.audit(action, resource, userId, entry.ip, {
    resourceId,
    correlationId: entry.correlationId,
    metadata,
  });

  return entry;
}

/**
 * Log portfolio operations
 * Requirement #14: Audit sensitive operations
 */
export class PortfolioAuditLogger {
  /**
   * Log portfolio creation
   */
  static logCreate(
    portfolioId: string,
    request: NextRequest,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_CREATE,
      'portfolio',
      portfolioId,
      request,
      userId,
      metadata
    );
  }

  /**
   * Log portfolio update
   */
  static logUpdate(
    portfolioId: string,
    request: NextRequest,
    userId: string,
    changes?: Record<string, any>
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_UPDATE,
      'portfolio',
      portfolioId,
      request,
      userId,
      { changes }
    );
  }

  /**
   * Log portfolio deletion
   * Requirement #14: Audit portfolio delete
   */
  static logDelete(
    portfolioId: string,
    request: NextRequest,
    userId: string,
    reason?: string
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_DELETE,
      'portfolio',
      portfolioId,
      request,
      userId,
      { reason, deletedAt: new Date().toISOString() }
    );
  }

  /**
   * Log portfolio publish
   * Requirement #14: Audit publish
   */
  static logPublish(
    portfolioId: string,
    request: NextRequest,
    userId: string,
    subdomain?: string
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_PUBLISH,
      'portfolio',
      portfolioId,
      request,
      userId,
      { subdomain, publishedAt: new Date().toISOString() }
    );
  }

  /**
   * Log portfolio unpublish
   */
  static logUnpublish(
    portfolioId: string,
    request: NextRequest,
    userId: string
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_UNPUBLISH,
      'portfolio',
      portfolioId,
      request,
      userId,
      { unpublishedAt: new Date().toISOString() }
    );
  }

  /**
   * Log portfolio deployment
   */
  static logDeploy(
    portfolioId: string,
    request: NextRequest,
    userId: string,
    deploymentId: string,
    url?: string
  ): void {
    createAuditLog(
      AuditAction.PORTFOLIO_DEPLOY,
      'portfolio',
      portfolioId,
      request,
      userId,
      { deploymentId, url, deployedAt: new Date().toISOString() }
    );
  }
}

/**
 * Log template operations
 * Requirement #14: Audit template create/update
 */
export class TemplateAuditLogger {
  /**
   * Log template creation
   * Requirement #14: Audit template create
   */
  static logCreate(
    templateId: string,
    request: NextRequest,
    userId: string,
    templateName: string
  ): void {
    createAuditLog(
      AuditAction.TEMPLATE_CREATE,
      'template',
      templateId,
      request,
      userId,
      { templateName, createdAt: new Date().toISOString() }
    );
  }

  /**
   * Log template update
   * Requirement #14: Audit template update
   */
  static logUpdate(
    templateId: string,
    request: NextRequest,
    userId: string,
    changes?: Record<string, any>
  ): void {
    createAuditLog(
      AuditAction.TEMPLATE_UPDATE,
      'template',
      templateId,
      request,
      userId,
      { changes, updatedAt: new Date().toISOString() }
    );
  }

  /**
   * Log template deletion
   */
  static logDelete(
    templateId: string,
    request: NextRequest,
    userId: string
  ): void {
    createAuditLog(
      AuditAction.TEMPLATE_DELETE,
      'template',
      templateId,
      request,
      userId,
      { deletedAt: new Date().toISOString() }
    );
  }
}

/**
 * Log version control operations
 */
export class VersionAuditLogger {
  /**
   * Log version creation
   */
  static logCreate(
    portfolioId: string,
    versionId: string,
    request: NextRequest,
    userId: string,
    versionNumber: number
  ): void {
    createAuditLog(
      AuditAction.VERSION_CREATE,
      'version',
      versionId,
      request,
      userId,
      { portfolioId, versionNumber }
    );
  }

  /**
   * Log version restore
   */
  static logRestore(
    portfolioId: string,
    versionId: string,
    request: NextRequest,
    userId: string,
    versionNumber: number
  ): void {
    createAuditLog(
      AuditAction.VERSION_RESTORE,
      'version',
      versionId,
      request,
      userId,
      { portfolioId, versionNumber, restoredAt: new Date().toISOString() }
    );
  }
}

/**
 * Log sharing operations
 */
export class ShareAuditLogger {
  /**
   * Log share creation
   */
  static logCreate(
    shareId: string,
    portfolioId: string,
    request: NextRequest,
    userId: string,
    config?: { expiresAt?: string; hasPassword: boolean; maxViews?: number }
  ): void {
    createAuditLog(
      AuditAction.SHARE_CREATE,
      'share',
      shareId,
      request,
      userId,
      { portfolioId, config }
    );
  }

  /**
   * Log share revocation
   */
  static logRevoke(
    shareId: string,
    portfolioId: string,
    request: NextRequest,
    userId: string
  ): void {
    createAuditLog(
      AuditAction.SHARE_REVOKE,
      'share',
      shareId,
      request,
      userId,
      { portfolioId, revokedAt: new Date().toISOString() }
    );
  }
}

/**
 * Log domain operations
 */
export class DomainAuditLogger {
  /**
   * Log domain addition
   */
  static logAdd(
    domainId: string,
    portfolioId: string,
    request: NextRequest,
    userId: string,
    domain: string
  ): void {
    createAuditLog(
      AuditAction.DOMAIN_ADD,
      'domain',
      domainId,
      request,
      userId,
      { portfolioId, domain }
    );
  }

  /**
   * Log domain verification
   */
  static logVerify(
    domainId: string,
    portfolioId: string,
    request: NextRequest,
    userId: string,
    domain: string
  ): void {
    createAuditLog(
      AuditAction.DOMAIN_VERIFY,
      'domain',
      domainId,
      request,
      userId,
      { portfolioId, domain, verifiedAt: new Date().toISOString() }
    );
  }

  /**
   * Log domain removal
   */
  static logRemove(
    domainId: string,
    portfolioId: string,
    request: NextRequest,
    userId: string,
    domain: string
  ): void {
    createAuditLog(
      AuditAction.DOMAIN_REMOVE,
      'domain',
      domainId,
      request,
      userId,
      { portfolioId, domain, removedAt: new Date().toISOString() }
    );
  }
}

/**
 * Log authentication events
 */
export class AuthAuditLogger {
  /**
   * Log user login
   */
  static logLogin(
    userId: string,
    request: NextRequest,
    success: boolean,
    reason?: string
  ): void {
    createAuditLog(
      AuditAction.USER_LOGIN,
      'user',
      userId,
      request,
      userId,
      { success, reason, loginAt: new Date().toISOString() }
    );
  }

  /**
   * Log user logout
   */
  static logLogout(
    userId: string,
    request: NextRequest
  ): void {
    createAuditLog(
      AuditAction.USER_LOGOUT,
      'user',
      userId,
      request,
      userId,
      { logoutAt: new Date().toISOString() }
    );
  }
}

/**
 * Log admin operations
 */
export class AdminAuditLogger {
  /**
   * Log admin action
   */
  static logAction(
    adminId: string,
    action: string,
    request: NextRequest,
    target?: { type: string; id: string },
    metadata?: Record<string, any>
  ): void {
    createAuditLog(
      AuditAction.ADMIN_ACTION,
      target?.type || 'admin',
      target?.id || adminId,
      request,
      adminId,
      { action, ...metadata }
    );
  }
}

/**
 * Get audit logs for a resource
 */
export function getAuditLogsForResource(
  resource: string,
  resourceId: string
): AuditLogEntry[] {
  return auditLogs.filter(
    (log) => log.resource === resource && log.resourceId === resourceId
  );
}

/**
 * Get audit logs for a user
 */
export function getAuditLogsForUser(userId: string): AuditLogEntry[] {
  return auditLogs.filter((log) => log.userId === userId);
}

/**
 * Get recent audit logs
 */
export function getRecentAuditLogs(limit: number = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit).reverse();
}

/**
 * Export audit logs (for compliance)
 */
export function exportAuditLogs(
  startDate?: Date,
  endDate?: Date
): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (startDate) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) >= startDate
    );
  }

  if (endDate) {
    filtered = filtered.filter(
      (log) => new Date(log.timestamp) <= endDate
    );
  }

  return filtered;
}
