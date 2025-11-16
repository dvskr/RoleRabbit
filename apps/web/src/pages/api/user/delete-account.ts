/**
 * Account Deletion API - DELETE /api/user/delete-account
 *
 * Schedule or cancel account deletion (GDPR Right to be Forgotten)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {
  scheduleAccountDeletion,
  cancelAccountDeletion,
  permanentlyDeleteUserData,
} from '@/lib/privacy/data-deletion';
import { auditLogger, AuditAction } from '@/lib/audit/audit-logger';
import { withAuth } from '@/middleware/auth';

const deleteSchema = z.object({
  reason: z.string().max(500).optional(),
  password: z.string().min(8), // Confirm with password
});

const cancelSchema = z.object({
  confirm: z.literal(true),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'POST') {
      // Schedule account deletion
      const validation = deleteSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
      }

      const { reason, password } = validation.data;

      // TODO: Verify password
      // In production, verify the password matches user's password
      // const { data: authUser } = await supabase.auth.signInWithPassword({
      //   email: user.email,
      //   password,
      // });

      // Schedule deletion (30-day grace period)
      const result = await scheduleAccountDeletion(user.id, reason);

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Failed to schedule deletion',
        });
      }

      // Log audit event
      await auditLogger.log({
        action: AuditAction.ACCOUNT_DELETION_SCHEDULED,
        userId: user.id,
        metadata: {
          reason,
          scheduledFor: result.scheduledFor,
        },
      });

      return res.status(200).json({
        message: 'Account deletion scheduled',
        scheduledFor: result.scheduledFor,
        gracePeriodDays: 30,
        note: 'You can cancel this request within 30 days',
      });
    } else if (req.method === 'DELETE') {
      // Cancel scheduled deletion
      const validation = cancelSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors,
        });
      }

      const result = await cancelAccountDeletion(user.id);

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Failed to cancel deletion',
        });
      }

      await auditLogger.log({
        action: AuditAction.ACCOUNT_DELETION_CANCELLED,
        userId: user.id,
      });

      return res.status(200).json({
        message: 'Account deletion cancelled',
      });
    } else if (req.method === 'GET') {
      // Check deletion status
      const { data, error } = await (async () => {
        const { createSupabaseServiceClient } = await import('@/database/client');
        const supabase = createSupabaseServiceClient();

        return await supabase
          .from('deletion_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .single();
      })();

      if (error || !data) {
        return res.status(200).json({
          scheduled: false,
        });
      }

      return res.status(200).json({
        scheduled: true,
        scheduledFor: data.scheduled_for,
        daysRemaining: Math.ceil(
          (new Date(data.scheduled_for).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error managing account deletion:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
