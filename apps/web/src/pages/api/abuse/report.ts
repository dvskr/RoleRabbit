/**
 * Abuse Reporting API - POST /api/abuse/report
 *
 * Submit an abuse report for a published portfolio
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { submitAbuseReport, AbuseReasonType } from '@/lib/moderation/abuse-reporting';
import { checkRateLimit } from '@/lib/rate-limiting/rate-limiter';
import { withAuth } from '@/middleware/auth';

const reportSchema = z.object({
  portfolioId: z.string().uuid(),
  reason: z.nativeEnum(AbuseReasonType),
  description: z.string().min(10).max(1000),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit('abuse:report', user.id);
    res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.getTime().toString());

    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Too many reports',
        message: `You can only submit ${rateLimit.limit} reports per day. Please try again later.`,
        retryAfter: rateLimit.retryAfter,
      });
    }

    // Validate request body
    const validation = reportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const { portfolioId, reason, description } = validation.data;

    // Submit abuse report
    const result = await submitAbuseReport(
      user.id,
      portfolioId,
      reason,
      description
    );

    if (!result.success) {
      return res.status(400).json({
        error: result.error || 'Failed to submit report',
      });
    }

    return res.status(201).json({
      message: 'Report submitted successfully',
      reportId: result.reportId,
    });
  } catch (error) {
    console.error('Error submitting abuse report:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
