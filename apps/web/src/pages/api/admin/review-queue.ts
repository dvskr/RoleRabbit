/**
 * Review Queue Management API - /api/admin/review-queue
 *
 * Manage moderation review queue (Admin/Moderator only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {
  getReviewQueue,
  approveContent,
  rejectContent,
  ReviewStatus,
  ReviewPriority,
} from '@/lib/moderation/review-queue';
import { withAuth } from '@/middleware/auth';
import { requirePermission, Permission } from '@/lib/auth/rbac';

const reviewActionSchema = z.object({
  queueId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(500).optional(),
  requiresRevision: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check moderator permission
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
      const status = req.query.status as ReviewStatus | undefined;
      const priority = req.query.priority as ReviewPriority | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // Get review queue
      const result = await getReviewQueue({
        status,
        priority,
        page,
        limit,
      });

      return res.status(200).json({
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
        stats: {
          pending: result.stats?.pending || 0,
          inReview: result.stats?.inReview || 0,
          urgent: result.stats?.urgent || 0,
        },
      });
    } else if (req.method === 'POST') {
      // Take review action
      const validation = reviewActionSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
      }

      const { queueId, action, notes, requiresRevision } = validation.data;

      let result;
      if (action === 'approve') {
        result = await approveContent(queueId, user.id, notes);
      } else {
        result = await rejectContent(queueId, user.id, notes || '', requiresRevision);
      }

      if (!result.success) {
        return res.status(400).json({
          error: result.error || `Failed to ${action} content`,
        });
      }

      return res.status(200).json({
        message: `Content ${action}d successfully`,
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error managing review queue:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
