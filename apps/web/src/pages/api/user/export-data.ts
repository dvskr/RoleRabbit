/**
 * Data Export API - Section 6.3
 *
 * GDPR/CCPA compliance: Export all user data as JSON
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/database/client';
import { auditLogger, getRequestMetadata } from '@/lib/audit/audit-logger';
import { AuditAction } from '@/lib/audit/audit-logger';

interface UserDataExport {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  portfolios: any[];
  analytics: any[];
  auditLogs: any[];
  exportedAt: string;
}

/**
 * Export all user data
 * GET /api/user/export-data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const supabase = createSupabaseServiceClient();
    const userId = user.id;

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Fetch all portfolios
    const { data: portfolios, error: portfoliosError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId);

    if (portfoliosError) {
      console.error('Error fetching portfolios:', portfoliosError);
      return res.status(500).json({ error: 'Failed to fetch portfolios' });
    }

    // Fetch analytics data
    const { data: analytics, error: analyticsError } = await supabase
      .from('portfolio_analytics')
      .select('*')
      .in(
        'portfolio_id',
        portfolios?.map((p) => p.id) || []
      );

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    }

    // Fetch audit logs
    const { data: auditLogs, error: auditLogsError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId);

    if (auditLogsError) {
      console.error('Error fetching audit logs:', auditLogsError);
    }

    // Build export object
    const exportData: UserDataExport = {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      },
      portfolios: portfolios || [],
      analytics: analytics || [],
      auditLogs: auditLogs || [],
      exportedAt: new Date().toISOString(),
    };

    // Log data export
    const { ipAddress, userAgent } = getRequestMetadata(req);
    await auditLogger.logDataExported(userId, ipAddress, userAgent);

    // Return JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="rolerabbit-data-${userId}-${Date.now()}.json"`
    );

    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
