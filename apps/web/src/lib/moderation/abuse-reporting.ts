/**
 * Abuse Reporting System - Section 6.4
 *
 * Allow users to report inappropriate published portfolios
 */

import { createSupabaseServiceClient } from '@/database/client';
import { auditLogger } from '@/lib/audit/audit-logger';

export interface AbuseReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  portfolioId: string;
  reason: AbuseReasonType;
  description: string;
  status: AbuseReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  actionTaken?: AbuseAction;
}

export enum AbuseReasonType {
  HATE_SPEECH = 'hate_speech',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  IMPERSONATION = 'impersonation',
  MISINFORMATION = 'misinformation',
  ILLEGAL_CONTENT = 'illegal_content',
  OTHER = 'other',
}

export enum AbuseReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum AbuseAction {
  NO_ACTION = 'no_action',
  WARNING_SENT = 'warning_sent',
  CONTENT_REMOVED = 'content_removed',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_BANNED = 'account_banned',
}

/**
 * Submit abuse report
 */
export async function submitAbuseReport(
  reporterId: string,
  portfolioId: string,
  reason: AbuseReasonType,
  description: string,
  ipAddress?: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  const supabase = createSupabaseServiceClient();

  try {
    // Get portfolio details
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('user_id')
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      return { success: false, error: 'Portfolio not found' };
    }

    // Check if user is reporting their own portfolio
    if (portfolio.user_id === reporterId) {
      return { success: false, error: 'Cannot report your own portfolio' };
    }

    // Check for duplicate reports (same reporter, same portfolio, within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: existingReport } = await supabase
      .from('abuse_reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('portfolio_id', portfolioId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .single();

    if (existingReport) {
      return { success: false, error: 'You have already reported this portfolio' };
    }

    // Create abuse report
    const { data, error } = await supabase
      .from('abuse_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: portfolio.user_id,
        portfolio_id: portfolioId,
        reason,
        description,
        status: AbuseReportStatus.PENDING,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating abuse report:', error);
      return { success: false, error: 'Failed to submit report' };
    }

    // Log abuse report in audit trail
    await auditLogger.log({
      action: 'abuse.reported' as any,
      userId: reporterId,
      resourceType: 'portfolio',
      resourceId: portfolioId,
      ipAddress,
      metadata: {
        reason,
        reportedUserId: portfolio.user_id,
      },
    });

    // Check if this portfolio has multiple reports
    await checkForMultipleReports(portfolioId);

    return { success: true, reportId: data.id };
  } catch (error) {
    console.error('Error submitting abuse report:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Check if portfolio has multiple reports and auto-unpublish if needed
 */
async function checkForMultipleReports(portfolioId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();

  // Count pending reports for this portfolio
  const { count } = await supabase
    .from('abuse_reports')
    .select('*', { count: 'exact', head: true })
    .eq('portfolio_id', portfolioId)
    .in('status', [AbuseReportStatus.PENDING, AbuseReportStatus.INVESTIGATING]);

  // Auto-unpublish if >= 3 reports
  if (count && count >= 3) {
    await supabase
      .from('portfolios')
      .update({
        published: false,
        moderation_status: 'under_investigation',
        updated_at: new Date().toISOString(),
      })
      .eq('id', portfolioId);

    // Notify moderators
    console.warn(`Portfolio ${portfolioId} auto-unpublished due to ${count} reports`);
  }
}

/**
 * Get pending abuse reports
 */
export async function getPendingReports(
  limit: number = 50
): Promise<AbuseReport[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('abuse_reports')
    .select('*')
    .in('status', [AbuseReportStatus.PENDING, AbuseReportStatus.INVESTIGATING])
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching abuse reports:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    reporterId: row.reporter_id,
    reportedUserId: row.reported_user_id,
    portfolioId: row.portfolio_id,
    reason: row.reason,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    resolution: row.resolution,
    actionTaken: row.action_taken,
  }));
}

/**
 * Investigate abuse report
 */
export async function investigateReport(
  reportId: string,
  investigatorId: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from('abuse_reports')
      .update({
        status: AbuseReportStatus.INVESTIGATING,
        resolved_by: investigatorId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error investigating report:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error investigating report:', error);
    return { success: false };
  }
}

/**
 * Resolve abuse report with action
 */
export async function resolveAbuseReport(
  reportId: string,
  resolverId: string,
  action: AbuseAction,
  resolution: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    // Get report details
    const { data: report } = await supabase
      .from('abuse_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (!report) {
      return { success: false };
    }

    // Update report
    const { error: updateError } = await supabase
      .from('abuse_reports')
      .update({
        status: AbuseReportStatus.RESOLVED,
        resolved_at: new Date().toISOString(),
        resolved_by: resolverId,
        resolution,
        action_taken: action,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error resolving report:', updateError);
      return { success: false };
    }

    // Apply action
    await applyAbuseAction(report, action, resolution);

    // Log resolution
    await auditLogger.log({
      action: 'abuse.resolved' as any,
      userId: resolverId,
      resourceType: 'abuse_report',
      resourceId: reportId,
      metadata: {
        portfolioId: report.portfolio_id,
        reportedUserId: report.reported_user_id,
        action,
        resolution,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error resolving abuse report:', error);
    return { success: false };
  }
}

/**
 * Apply abuse action to user/content
 */
async function applyAbuseAction(
  report: any,
  action: AbuseAction,
  resolution: string
): Promise<void> {
  const supabase = createSupabaseServiceClient();

  switch (action) {
    case AbuseAction.NO_ACTION:
      // No action needed
      break;

    case AbuseAction.WARNING_SENT:
      // Send warning to user
      await supabase.from('notifications').insert({
        user_id: report.reported_user_id,
        type: 'moderation_warning',
        message: `Warning: ${resolution}`,
        created_at: new Date().toISOString(),
      });
      break;

    case AbuseAction.CONTENT_REMOVED:
      // Unpublish portfolio
      await supabase
        .from('portfolios')
        .update({
          published: false,
          moderation_status: 'removed',
          moderation_notes: resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.portfolio_id);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: report.reported_user_id,
        type: 'content_removed',
        message: `Your portfolio was removed: ${resolution}`,
        created_at: new Date().toISOString(),
      });
      break;

    case AbuseAction.ACCOUNT_SUSPENDED:
      // Suspend account temporarily (e.g., 7 days)
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + 7);

      await supabase
        .from('users')
        .update({
          suspended: true,
          suspend_until: suspendUntil.toISOString(),
          suspend_reason: resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.reported_user_id);

      // Unpublish all portfolios
      await supabase
        .from('portfolios')
        .update({
          published: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', report.reported_user_id);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: report.reported_user_id,
        type: 'account_suspended',
        message: `Your account has been suspended until ${suspendUntil.toLocaleDateString()}: ${resolution}`,
        created_at: new Date().toISOString(),
      });
      break;

    case AbuseAction.ACCOUNT_BANNED:
      // Ban account permanently
      await supabase
        .from('users')
        .update({
          banned: true,
          ban_reason: resolution,
          banned_at: new Date().toISOString(),
        })
        .eq('id', report.reported_user_id);

      // Unpublish all portfolios
      await supabase
        .from('portfolios')
        .update({
          published: false,
          moderation_status: 'banned',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', report.reported_user_id);

      // Notify user
      await supabase.from('notifications').insert({
        user_id: report.reported_user_id,
        type: 'account_banned',
        message: `Your account has been permanently banned: ${resolution}`,
        created_at: new Date().toISOString(),
      });
      break;
  }
}

/**
 * Dismiss abuse report
 */
export async function dismissReport(
  reportId: string,
  dismisserId: string,
  reason: string
): Promise<{ success: boolean }> {
  const supabase = createSupabaseServiceClient();

  try {
    const { error } = await supabase
      .from('abuse_reports')
      .update({
        status: AbuseReportStatus.DISMISSED,
        resolved_at: new Date().toISOString(),
        resolved_by: dismisserId,
        resolution: reason,
        action_taken: AbuseAction.NO_ACTION,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error dismissing report:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error dismissing report:', error);
    return { success: false };
  }
}

/**
 * Get abuse report statistics
 */
export async function getAbuseStats(): Promise<{
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
  byReason: Record<AbuseReasonType, number>;
  avgResolutionTime: number; // in hours
}> {
  const supabase = createSupabaseServiceClient();

  const { data } = await supabase
    .from('abuse_reports')
    .select('status, reason, created_at, resolved_at');

  if (!data) {
    return {
      pending: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0,
      byReason: {} as Record<AbuseReasonType, number>,
      avgResolutionTime: 0,
    };
  }

  const pending = data.filter(r => r.status === AbuseReportStatus.PENDING).length;
  const investigating = data.filter(r => r.status === AbuseReportStatus.INVESTIGATING).length;
  const resolved = data.filter(r => r.status === AbuseReportStatus.RESOLVED).length;
  const dismissed = data.filter(r => r.status === AbuseReportStatus.DISMISSED).length;

  // Count by reason
  const byReason = data.reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {} as Record<AbuseReasonType, number>);

  // Calculate average resolution time
  const resolvedReports = data.filter(r => r.resolved_at);
  const resolutionTimes = resolvedReports.map(r => {
    const created = new Date(r.created_at).getTime();
    const resolved = new Date(r.resolved_at).getTime();
    return (resolved - created) / 1000 / 60 / 60; // hours
  });

  const avgResolutionTime = resolutionTimes.length > 0
    ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
    : 0;

  return {
    pending,
    investigating,
    resolved,
    dismissed,
    byReason,
    avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
  };
}

/**
 * Get user's violation history
 */
export async function getUserViolationHistory(
  userId: string
): Promise<{
  totalReports: number;
  resolvedAgainst: number;
  warnings: number;
  suspensions: number;
  bans: number;
}> {
  const supabase = createSupabaseServiceClient();

  const { data } = await supabase
    .from('abuse_reports')
    .select('status, action_taken')
    .eq('reported_user_id', userId);

  if (!data) {
    return {
      totalReports: 0,
      resolvedAgainst: 0,
      warnings: 0,
      suspensions: 0,
      bans: 0,
    };
  }

  const resolvedAgainst = data.filter(r =>
    r.status === AbuseReportStatus.RESOLVED &&
    r.action_taken !== AbuseAction.NO_ACTION
  ).length;

  const warnings = data.filter(r => r.action_taken === AbuseAction.WARNING_SENT).length;
  const suspensions = data.filter(r => r.action_taken === AbuseAction.ACCOUNT_SUSPENDED).length;
  const bans = data.filter(r => r.action_taken === AbuseAction.ACCOUNT_BANNED).length;

  return {
    totalReports: data.length,
    resolvedAgainst,
    warnings,
    suspensions,
    bans,
  };
}

/**
 * Get abuse reports with filtering and pagination
 */
export async function getAbuseReports(options: {
  status?: AbuseReportStatus;
  page?: number;
  limit?: number;
}): Promise<{ reports: AbuseReport[]; total: number }> {
  const supabase = createSupabaseServiceClient();
  const { status, page = 1, limit = 20 } = options;

  try {
    let query = supabase
      .from('abuse_reports')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching abuse reports:', error);
      return { reports: [], total: 0 };
    }

    const reports: AbuseReport[] = (data || []).map((row: any) => ({
      id: row.id,
      reporterId: row.reporter_id,
      reportedUserId: row.reported_user_id,
      portfolioId: row.portfolio_id,
      reason: row.reason,
      description: row.description,
      status: row.status,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
      resolution: row.resolution,
      actionTaken: row.action_taken,
    }));

    return { reports, total: count || 0 };
  } catch (error) {
    console.error('Error fetching abuse reports:', error);
    return { reports: [], total: 0 };
  }
}
