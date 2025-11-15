/**
 * Content Moderation API - POST /api/admin/moderate
 *
 * Take moderation actions on portfolios (Admin/Moderator only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/database/client';
import { scanPortfolio } from '@/lib/moderation/content-scanner';
import { addToReviewQueue } from '@/lib/moderation/review-queue';
import { auditLogger, AuditAction } from '@/lib/audit/audit-logger';
import { withAuth } from '@/middleware/auth';
import { requirePermission, Permission } from '@/lib/auth/rbac';

const moderateSchema = z.object({
  portfolioId: z.string().uuid(),
  action: z.enum(['scan', 'unpublish', 'flag', 'ban_user']),
  reason: z.string().max(500).optional(),
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validation = moderateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { portfolioId, action, reason } = validation.data;
    const supabase = createSupabaseServiceClient();

    // Get portfolio
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*, users!inner(id, email)')
      .eq('id', portfolioId)
      .single();

    if (fetchError || !portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    switch (action) {
      case 'scan': {
        // Scan portfolio content
        const scanResult = await scanPortfolio(portfolioId);

        // If flagged, add to review queue
        if (scanResult.flagged) {
          await addToReviewQueue(
            portfolioId,
            portfolio.user_id,
            scanResult,
            portfolio.data
          );
        }

        await auditLogger.log({
          action: AuditAction.CONTENT_MODERATED,
          userId: user.id,
          targetUserId: portfolio.user_id,
          metadata: {
            portfolioId,
            action: 'scan',
            result: scanResult,
          },
        });

        return res.status(200).json({
          message: 'Portfolio scanned',
          result: scanResult,
        });
      }

      case 'unpublish': {
        // Unpublish portfolio
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({ published: false, moderation_reason: reason })
          .eq('id', portfolioId);

        if (updateError) {
          throw updateError;
        }

        await auditLogger.log({
          action: AuditAction.CONTENT_MODERATED,
          userId: user.id,
          targetUserId: portfolio.user_id,
          metadata: {
            portfolioId,
            action: 'unpublish',
            reason,
          },
        });

        return res.status(200).json({
          message: 'Portfolio unpublished',
        });
      }

      case 'flag': {
        // Flag portfolio for review
        const scanResult = await scanPortfolio(portfolioId);

        await addToReviewQueue(
          portfolioId,
          portfolio.user_id,
          scanResult,
          portfolio.data
        );

        await auditLogger.log({
          action: AuditAction.CONTENT_MODERATED,
          userId: user.id,
          targetUserId: portfolio.user_id,
          metadata: {
            portfolioId,
            action: 'flag',
            reason,
          },
        });

        return res.status(200).json({
          message: 'Portfolio flagged for review',
        });
      }

      case 'ban_user': {
        // Ban user (requires admin)
        if (!requirePermission(Permission.USER_BAN)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin role required to ban users',
          });
        }

        // Update user status
        const { error: banError } = await supabase
          .from('users')
          .update({
            banned: true,
            banned_at: new Date().toISOString(),
            ban_reason: reason,
          })
          .eq('id', portfolio.user_id);

        if (banError) {
          throw banError;
        }

        // Unpublish all user's portfolios
        await supabase
          .from('portfolios')
          .update({ published: false, moderation_reason: 'User banned' })
          .eq('user_id', portfolio.user_id);

        await auditLogger.log({
          action: AuditAction.USER_BANNED,
          userId: user.id,
          targetUserId: portfolio.user_id,
          metadata: {
            reason,
          },
        });

        return res.status(200).json({
          message: 'User banned',
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error moderating content:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
