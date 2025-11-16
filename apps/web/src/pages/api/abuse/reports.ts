/**
 * Abuse Reports Management API - GET /api/abuse/reports
 *
 * List and filter abuse reports (Admin only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {
  getAbuseReports,
  resolveAbuseReport,
  AbuseReportStatus,
  AbuseAction,
} from '@/lib/moderation/abuse-reporting';
import { withAuth } from '@/middleware/auth';
import { requirePermission, Permission } from '@/lib/auth/rbac';

const resolveSchema = z.object({
  reportId: z.string().uuid(),
  resolution: z.string().min(1).max(500),
  actionTaken: z.nativeEnum(AbuseAction),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check admin/moderator permission
  const hasPermission = requirePermission(Permission.CONTENT_MODERATE);
  const canModerate = await hasPermission(req, res, () => {});

  if (!canModerate) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Moderator role required',
    });
  }

  try {
    if (req.method === 'GET') {
      // Get query parameters
      const status = req.query.status as AbuseReportStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // Get abuse reports
      const result = await getAbuseReports({
        status,
        page,
        limit,
      });

      return res.status(200).json({
        data: result.reports,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } else if (req.method === 'PUT') {
      // Resolve abuse report
      const validation = resolveSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
      }

      const { reportId, resolution, actionTaken } = validation.data;

      const result = await resolveAbuseReport(
        reportId,
        user.id,
        resolution,
        actionTaken
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Failed to resolve report',
        });
      }

      return res.status(200).json({
        message: 'Report resolved successfully',
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error managing abuse reports:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
