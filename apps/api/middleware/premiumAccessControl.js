/**
 * Premium Access Control Middleware
 * Manages access to premium templates and features
 *
 * Features:
 * - Role-based access control (FREE, PREMIUM, ENTERPRISE)
 * - Template-level access control
 * - Feature flags for premium features
 * - Usage tracking and limits
 * - Trial period management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User subscription tiers
const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
  ADMIN: 'ADMIN',
};

// Feature access matrix
const FEATURE_ACCESS = {
  FREE: {
    templateAccess: ['ATS', 'MINIMAL'],
    maxDownloads: 3,
    maxFavorites: 10,
    canUploadTemplates: false,
    canCommentTemplates: true,
    canRateTemplates: true,
    canShareTemplates: false,
    canCollaborate: false,
    canExportPDF: true,
    canExportDOCX: false,
    canExportLaTeX: false,
    canAccessAnalytics: false,
    maxVersionHistory: 0,
  },
  PREMIUM: {
    templateAccess: 'ALL',
    maxDownloads: 50,
    maxFavorites: 100,
    canUploadTemplates: true,
    canCommentTemplates: true,
    canRateTemplates: true,
    canShareTemplates: true,
    canCollaborate: true,
    canExportPDF: true,
    canExportDOCX: true,
    canExportLaTeX: true,
    canAccessAnalytics: true,
    maxVersionHistory: 10,
  },
  ENTERPRISE: {
    templateAccess: 'ALL',
    maxDownloads: -1, // Unlimited
    maxFavorites: -1, // Unlimited
    canUploadTemplates: true,
    canCommentTemplates: true,
    canRateTemplates: true,
    canShareTemplates: true,
    canCollaborate: true,
    canExportPDF: true,
    canExportDOCX: true,
    canExportLaTeX: true,
    canAccessAnalytics: true,
    maxVersionHistory: -1, // Unlimited
    customBranding: true,
    prioritySupport: true,
    apiAccess: true,
  },
  ADMIN: {
    templateAccess: 'ALL',
    maxDownloads: -1,
    maxFavorites: -1,
    canUploadTemplates: true,
    canCommentTemplates: true,
    canRateTemplates: true,
    canShareTemplates: true,
    canCollaborate: true,
    canExportPDF: true,
    canExportDOCX: true,
    canExportLaTeX: true,
    canAccessAnalytics: true,
    maxVersionHistory: -1,
    canApproveTemplates: true,
    canManageUsers: true,
    canAccessAdmin: true,
  },
};

/**
 * Get user's subscription tier
 */
async function getUserSubscription(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          where: {
            status: 'ACTIVE',
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return { tier: SUBSCRIPTION_TIERS.FREE, isValid: false };
    }

    // Check if admin
    if (user.role === 'ADMIN') {
      return {
        tier: SUBSCRIPTION_TIERS.ADMIN,
        isValid: true,
        user,
      };
    }

    // Check active subscription
    if (user.subscription && user.subscription.length > 0) {
      const subscription = user.subscription[0];
      return {
        tier: subscription.tier,
        isValid: true,
        expiresAt: subscription.expiresAt,
        user,
        subscription,
      };
    }

    // Check trial period
    if (user.trialEndsAt && user.trialEndsAt > new Date()) {
      return {
        tier: SUBSCRIPTION_TIERS.PREMIUM,
        isValid: true,
        isTrial: true,
        expiresAt: user.trialEndsAt,
        user,
      };
    }

    // Default to free tier
    return {
      tier: SUBSCRIPTION_TIERS.FREE,
      isValid: true,
      user,
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { tier: SUBSCRIPTION_TIERS.FREE, isValid: false };
  }
}

/**
 * Check if user has access to a specific feature
 */
function hasFeatureAccess(subscriptionTier, feature) {
  const tierAccess = FEATURE_ACCESS[subscriptionTier];
  if (!tierAccess) return false;

  return tierAccess[feature] === true || tierAccess[feature] === -1;
}

/**
 * Check if user has access to a specific template
 */
async function hasTemplateAccess(userId, templateId) {
  try {
    const subscription = await getUserSubscription(userId);
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      select: {
        isPremium: true,
        category: true,
        authorId: true,
      },
    });

    if (!template) {
      return { hasAccess: false, reason: 'Template not found' };
    }

    // User is the author
    if (template.authorId === userId) {
      return { hasAccess: true, reason: 'Owner' };
    }

    // Admin has access to everything
    if (subscription.tier === SUBSCRIPTION_TIERS.ADMIN) {
      return { hasAccess: true, reason: 'Admin' };
    }

    // Premium template check
    if (template.isPremium) {
      if (subscription.tier === SUBSCRIPTION_TIERS.FREE) {
        return {
          hasAccess: false,
          reason: 'Premium template requires subscription',
          requiresTier: SUBSCRIPTION_TIERS.PREMIUM,
        };
      }
    }

    // Category access check for free tier
    if (subscription.tier === SUBSCRIPTION_TIERS.FREE) {
      const allowedCategories = FEATURE_ACCESS.FREE.templateAccess;
      if (!allowedCategories.includes(template.category)) {
        return {
          hasAccess: false,
          reason: `Category ${template.category} requires subscription`,
          requiresTier: SUBSCRIPTION_TIERS.PREMIUM,
        };
      }
    }

    return { hasAccess: true };
  } catch (error) {
    console.error('Error checking template access:', error);
    return { hasAccess: false, reason: 'Error checking access' };
  }
}

/**
 * Check usage limits
 */
async function checkUsageLimit(userId, limitType) {
  try {
    const subscription = await getUserSubscription(userId);
    const tierAccess = FEATURE_ACCESS[subscription.tier];

    if (!tierAccess) {
      return { withinLimit: false, reason: 'Invalid subscription tier' };
    }

    const limit = tierAccess[limitType];

    // Unlimited access
    if (limit === -1) {
      return { withinLimit: true, limit: -1, current: 0 };
    }

    // Get current usage
    let currentUsage = 0;

    if (limitType === 'maxDownloads') {
      // Get downloads this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      currentUsage = await prisma.templateDownload.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });
    } else if (limitType === 'maxFavorites') {
      currentUsage = await prisma.favorite.count({
        where: { userId },
      });
    }

    const withinLimit = currentUsage < limit;

    return {
      withinLimit,
      limit,
      current: currentUsage,
      remaining: limit - currentUsage,
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return { withinLimit: false, reason: 'Error checking limit' };
  }
}

/**
 * Middleware: Require authentication
 */
function requireAuth(request, reply, done) {
  if (!request.user || !request.user.id) {
    return reply.code(401).send({
      success: false,
      error: 'Authentication required',
    });
  }
  done();
}

/**
 * Middleware: Require premium subscription
 */
async function requirePremium(request, reply) {
  const userId = request.user?.id;

  if (!userId) {
    return reply.code(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const subscription = await getUserSubscription(userId);

  if (subscription.tier === SUBSCRIPTION_TIERS.FREE) {
    return reply.code(403).send({
      success: false,
      error: 'Premium subscription required',
      currentTier: subscription.tier,
      requiredTier: SUBSCRIPTION_TIERS.PREMIUM,
    });
  }

  // Attach subscription info to request
  request.subscription = subscription;
}

/**
 * Middleware: Require specific feature access
 */
function requireFeature(feature) {
  return async (request, reply) => {
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
      });
    }

    const subscription = await getUserSubscription(userId);
    const hasAccess = hasFeatureAccess(subscription.tier, feature);

    if (!hasAccess) {
      return reply.code(403).send({
        success: false,
        error: `Feature '${feature}' requires a higher subscription tier`,
        currentTier: subscription.tier,
        feature,
      });
    }

    request.subscription = subscription;
  };
}

/**
 * Middleware: Check template access
 */
async function requireTemplateAccess(request, reply) {
  const userId = request.user?.id;
  const templateId = request.params.id || request.body?.templateId;

  if (!userId) {
    return reply.code(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  if (!templateId) {
    return reply.code(400).send({
      success: false,
      error: 'Template ID required',
    });
  }

  const access = await hasTemplateAccess(userId, templateId);

  if (!access.hasAccess) {
    return reply.code(403).send({
      success: false,
      error: access.reason,
      requiresTier: access.requiresTier,
    });
  }

  request.templateAccess = access;
}

/**
 * Middleware: Check usage limit
 */
function requireUsageLimit(limitType) {
  return async (request, reply) => {
    const userId = request.user?.id;

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
      });
    }

    const usageCheck = await checkUsageLimit(userId, limitType);

    if (!usageCheck.withinLimit) {
      return reply.code(429).send({
        success: false,
        error: `Usage limit exceeded for ${limitType}`,
        limit: usageCheck.limit,
        current: usageCheck.current,
        reason: usageCheck.reason,
      });
    }

    request.usageLimit = usageCheck;
  };
}

/**
 * Middleware: Require admin access
 */
async function requireAdmin(request, reply) {
  const userId = request.user?.id;

  if (!userId) {
    return reply.code(401).send({
      success: false,
      error: 'Authentication required',
    });
  }

  const subscription = await getUserSubscription(userId);

  if (subscription.tier !== SUBSCRIPTION_TIERS.ADMIN) {
    return reply.code(403).send({
      success: false,
      error: 'Admin access required',
    });
  }

  request.subscription = subscription;
}

/**
 * Get user's feature access summary
 */
async function getFeatureAccessSummary(userId) {
  const subscription = await getUserSubscription(userId);
  const tierAccess = FEATURE_ACCESS[subscription.tier];

  // Get usage stats
  const downloadLimit = await checkUsageLimit(userId, 'maxDownloads');
  const favoriteLimit = await checkUsageLimit(userId, 'maxFavorites');

  return {
    tier: subscription.tier,
    isValid: subscription.isValid,
    isTrial: subscription.isTrial || false,
    expiresAt: subscription.expiresAt,
    features: tierAccess,
    usage: {
      downloads: {
        current: downloadLimit.current,
        limit: downloadLimit.limit,
        remaining: downloadLimit.remaining,
      },
      favorites: {
        current: favoriteLimit.current,
        limit: favoriteLimit.limit,
        remaining: favoriteLimit.remaining,
      },
    },
  };
}

module.exports = {
  SUBSCRIPTION_TIERS,
  FEATURE_ACCESS,
  getUserSubscription,
  hasFeatureAccess,
  hasTemplateAccess,
  checkUsageLimit,
  requireAuth,
  requirePremium,
  requireFeature,
  requireTemplateAccess,
  requireUsageLimit,
  requireAdmin,
  getFeatureAccessSummary,
};
