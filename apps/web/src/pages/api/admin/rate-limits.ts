/**
 * Rate Limit Statistics API - GET /api/admin/rate-limits
 *
 * View rate limiting statistics and top abusers (Admin only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getRateLimitStats, RATE_LIMITS } from '@/lib/rate-limiting/rate-limiter';
import { withAuth } from '@/middleware/auth';
import { requirePermission, Permission } from '@/lib/auth/rbac';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check admin permission
  const hasPermission = requirePermission(Permission.ADMIN_DASHBOARD);
  const canAccess = await hasPermission(req, res, () => {});

  if (!canAccess) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin role required',
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get rate limit statistics
    const stats = await getRateLimitStats();

    // Get rate limit configurations
    const configurations = Object.entries(RATE_LIMITS).map(([key, config]) => ({
      name: key,
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      identifier: config.identifier,
      windowHours: config.windowMs / (1000 * 60 * 60),
    }));

    return res.status(200).json({
      stats: {
        totalRequests: stats.totalRequests,
        blockedRequests: stats.blockedRequests,
        blockRate: stats.totalRequests > 0
          ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(2)
          : 0,
      },
      topAbusers: stats.topAbusers,
      configurations,
    });
  } catch (error) {
    console.error('Error fetching rate limit stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
