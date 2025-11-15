/**
 * Audit Logging System - Section 6.1
 *
 * Logs sensitive operations with userId, timestamp, IP address
 */

import { createSupabaseServiceClient } from '@/database/client';

export enum AuditAction {
  PORTFOLIO_CREATED = 'portfolio.created',
  PORTFOLIO_UPDATED = 'portfolio.updated',
  PORTFOLIO_DELETED = 'portfolio.deleted',
  PORTFOLIO_PUBLISHED = 'portfolio.published',
  PORTFOLIO_UNPUBLISHED = 'portfolio.unpublished',
  PORTFOLIO_SHARED = 'portfolio.shared',
  PORTFOLIO_EXPORTED = 'portfolio.exported',

  TEMPLATE_CREATED = 'template.created',
  TEMPLATE_UPDATED = 'template.updated',
  TEMPLATE_DELETED = 'template.deleted',

  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_REGISTERED = 'user.registered',
  USER_PASSWORD_CHANGED = 'user.password_changed',
  USER_DELETED = 'user.deleted',

  ADMIN_ACCESS = 'admin.access',
  ADMIN_USER_MODIFIED = 'admin.user_modified',

  DATA_EXPORTED = 'data.exported',
  DATA_DELETED = 'data.deleted',
}

export interface AuditLogEntry {
  id?: string;
  action: AuditAction;
  userId: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

class AuditLogger {
  private supabase = createSupabaseServiceClient();

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        action: entry.action,
        user_id: entry.userId,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        metadata: entry.metadata,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to write audit log:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async logPortfolioCreated(
    userId: string,
    portfolioId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PORTFOLIO_CREATED,
      userId,
      resourceType: 'portfolio',
      resourceId: portfolioId,
      ipAddress,
      userAgent,
    });
  }

  async logPortfolioDeleted(
    userId: string,
    portfolioId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PORTFOLIO_DELETED,
      userId,
      resourceType: 'portfolio',
      resourceId: portfolioId,
      ipAddress,
      userAgent,
      metadata: { deletedAt: new Date().toISOString() },
    });
  }

  async logPortfolioPublished(
    userId: string,
    portfolioId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PORTFOLIO_PUBLISHED,
      userId,
      resourceType: 'portfolio',
      resourceId: portfolioId,
      ipAddress,
      userAgent,
    });
  }

  async logTemplateCreated(
    userId: string,
    templateId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.TEMPLATE_CREATED,
      userId,
      resourceType: 'template',
      resourceId: templateId,
      ipAddress,
      userAgent,
    });
  }

  async logTemplateDeleted(
    userId: string,
    templateId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.TEMPLATE_DELETED,
      userId,
      resourceType: 'template',
      resourceId: templateId,
      ipAddress,
      userAgent,
    });
  }

  async logDataExported(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.DATA_EXPORTED,
      userId,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
    });
  }

  async logDataDeleted(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.DATA_DELETED,
      userId,
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent,
      metadata: { deletedAt: new Date().toISOString() },
    });
  }

  async logAdminAccess(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.ADMIN_ACCESS,
      userId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Query audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      action: row.action,
      userId: row.user_id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  /**
   * Query audit logs for a resource
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      action: row.action,
      userId: row.user_id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }
}

export const auditLogger = new AuditLogger();

export function getRequestMetadata(req: any): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  return { ipAddress, userAgent };
}
