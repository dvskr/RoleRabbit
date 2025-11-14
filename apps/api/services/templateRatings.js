/**
 * Template Ratings Service
 * Manages user ratings and reviews for templates
 *
 * Features:
 * - Star ratings (1-5)
 * - Detailed reviews
 * - Rating verification
 * - Helpful votes on reviews
 * - Aggregate rating calculations
 * - Rating breakdowns
 * - Review moderation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Submit a rating for a template
 */
async function rateTemplate(templateId, userId, ratingData) {
  try {
    const { rating, review, title, pros, cons, wouldRecommend } = ratingData;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if template exists
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Check if user already rated this template
    const existingRating = await prisma.templateRating.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
    });

    let ratingRecord;

    if (existingRating) {
      // Update existing rating
      ratingRecord = await prisma.templateRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          review,
          title,
          pros,
          cons,
          wouldRecommend,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new rating
      ratingRecord = await prisma.templateRating.create({
        data: {
          templateId,
          userId,
          rating,
          review,
          title,
          pros,
          cons,
          wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
          isVerified: false,
          helpfulCount: 0,
        },
      });

      // Check if user has downloaded the template (verified review)
      const hasDownloaded = await prisma.templateDownload.findFirst({
        where: {
          templateId,
          userId,
        },
      });

      if (hasDownloaded) {
        await prisma.templateRating.update({
          where: { id: ratingRecord.id },
          data: { isVerified: true },
        });
      }
    }

    // Recalculate template rating
    await updateTemplateRating(templateId);

    return {
      success: true,
      rating: ratingRecord,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
}

/**
 * Get ratings for a template
 */
async function getTemplateRatings(templateId, options = {}) {
  try {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'helpful',
      minRating = null,
      maxRating = null,
      verifiedOnly = false,
    } = options;

    const where = {
      templateId,
      isModerated: false,
    };

    if (minRating !== null) {
      where.rating = { ...where.rating, gte: minRating };
    }

    if (maxRating !== null) {
      where.rating = { ...where.rating, lte: maxRating };
    }

    if (verifiedOnly) {
      where.isVerified = true;
    }

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating-high':
        orderBy = { rating: 'desc' };
        break;
      case 'rating-low':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { helpfulCount: 'desc' };
    }

    const [ratings, total] = await Promise.all([
      prisma.templateRating.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.templateRating.count({ where }),
    ]);

    // Get rating breakdown
    const breakdown = await getRatingBreakdown(templateId);

    return {
      ratings,
      total,
      limit,
      offset,
      breakdown,
    };
  } catch (error) {
    console.error('Error fetching template ratings:', error);
    throw error;
  }
}

/**
 * Get rating breakdown for a template
 */
async function getRatingBreakdown(templateId) {
  try {
    const breakdown = await prisma.templateRating.groupBy({
      by: ['rating'],
      where: {
        templateId,
        isModerated: false,
      },
      _count: {
        rating: true,
      },
    });

    const total = breakdown.reduce((sum, item) => sum + item._count.rating, 0);

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    breakdown.forEach((item) => {
      distribution[item.rating] = {
        count: item._count.rating,
        percentage: total > 0 ? ((item._count.rating / total) * 100).toFixed(1) : 0,
      };
    });

    return {
      distribution,
      total,
    };
  } catch (error) {
    console.error('Error fetching rating breakdown:', error);
    throw error;
  }
}

/**
 * Mark review as helpful
 */
async function markReviewHelpful(ratingId, userId) {
  try {
    // Check if already marked helpful
    const existing = await prisma.ratingHelpfulVote.findUnique({
      where: {
        userId_ratingId: {
          userId,
          ratingId,
        },
      },
    });

    if (existing) {
      // Remove vote
      await prisma.ratingHelpfulVote.delete({
        where: { id: existing.id },
      });

      // Decrement count
      await prisma.templateRating.update({
        where: { id: ratingId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });

      return {
        success: true,
        helpful: false,
        message: 'Helpful vote removed',
      };
    } else {
      // Add vote
      await prisma.ratingHelpfulVote.create({
        data: {
          userId,
          ratingId,
        },
      });

      // Increment count
      await prisma.templateRating.update({
        where: { id: ratingId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        helpful: true,
        message: 'Marked as helpful',
      };
    }
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
}

/**
 * Update template's aggregate rating
 */
async function updateTemplateRating(templateId) {
  try {
    const result = await prisma.templateRating.aggregate({
      where: {
        templateId,
        isModerated: false,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const avgRating = result._avg.rating || 0;
    const ratingCount = result._count.rating || 0;

    // Update template
    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        rating: avgRating,
        ratingCount,
      },
    });

    return {
      rating: avgRating,
      count: ratingCount,
    };
  } catch (error) {
    console.error('Error updating template rating:', error);
    throw error;
  }
}

/**
 * Report a review
 */
async function reportReview(ratingId, userId, reason) {
  try {
    const rating = await prisma.templateRating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new Error('Rating not found');
    }

    // Create report
    await prisma.reviewReport.create({
      data: {
        ratingId,
        reportedBy: userId,
        reason,
        status: 'PENDING',
      },
    });

    // Increment report count
    await prisma.templateRating.update({
      where: { id: ratingId },
      data: {
        reportCount: {
          increment: 1,
        },
      },
    });

    // Auto-moderate if too many reports
    if (rating.reportCount + 1 >= 5) {
      await moderateReview(ratingId, true, 'Automatically hidden due to multiple reports');
    }

    return {
      success: true,
      message: 'Review reported successfully',
    };
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
}

/**
 * Moderate a review (admin only)
 */
async function moderateReview(ratingId, shouldHide, moderationNote = '') {
  try {
    await prisma.templateRating.update({
      where: { id: ratingId },
      data: {
        isModerated: shouldHide,
        moderationNote,
        moderatedAt: new Date(),
      },
    });

    // Recalculate template rating
    const rating = await prisma.templateRating.findUnique({
      where: { id: ratingId },
      select: { templateId: true },
    });

    if (rating) {
      await updateTemplateRating(rating.templateId);
    }

    return {
      success: true,
      message: shouldHide ? 'Review hidden' : 'Review restored',
    };
  } catch (error) {
    console.error('Error moderating review:', error);
    throw error;
  }
}

/**
 * Delete a rating (user can delete their own)
 */
async function deleteRating(ratingId, userId) {
  try {
    const rating = await prisma.templateRating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new Error('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new Error('You do not have permission to delete this rating');
    }

    const templateId = rating.templateId;

    // Delete rating
    await prisma.templateRating.delete({
      where: { id: ratingId },
    });

    // Recalculate template rating
    await updateTemplateRating(templateId);

    return {
      success: true,
      message: 'Rating deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
}

/**
 * Get user's rating for a template
 */
async function getUserRating(templateId, userId) {
  try {
    const rating = await prisma.templateRating.findUnique({
      where: {
        userId_templateId: {
          userId,
          templateId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return rating;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    throw error;
  }
}

/**
 * Get rating statistics
 */
async function getRatingStatistics(templateId) {
  try {
    const [
      avgRating,
      totalRatings,
      verifiedRatings,
      breakdown,
      recentRatings,
      wouldRecommendCount,
    ] = await Promise.all([
      prisma.templateRating.aggregate({
        where: { templateId, isModerated: false },
        _avg: { rating: true },
      }),
      prisma.templateRating.count({
        where: { templateId, isModerated: false },
      }),
      prisma.templateRating.count({
        where: { templateId, isModerated: false, isVerified: true },
      }),
      getRatingBreakdown(templateId),
      prisma.templateRating.findMany({
        where: { templateId, isModerated: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          rating: true,
          createdAt: true,
        },
      }),
      prisma.templateRating.count({
        where: { templateId, isModerated: false, wouldRecommend: true },
      }),
    ]);

    const recommendationRate =
      totalRatings > 0 ? ((wouldRecommendCount / totalRatings) * 100).toFixed(1) : 0;

    return {
      averageRating: avgRating._avg.rating || 0,
      totalRatings,
      verifiedRatings,
      verifiedPercentage:
        totalRatings > 0 ? ((verifiedRatings / totalRatings) * 100).toFixed(1) : 0,
      breakdown: breakdown.distribution,
      recentTrend: calculateRatingTrend(recentRatings),
      recommendationRate,
    };
  } catch (error) {
    console.error('Error fetching rating statistics:', error);
    throw error;
  }
}

/**
 * Get pending review reports (admin)
 */
async function getPendingReports(options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const [reports, total] = await Promise.all([
      prisma.reviewReport.findMany({
        where: { status: 'PENDING' },
        include: {
          rating: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              template: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.reviewReport.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      reports,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    throw error;
  }
}

/**
 * Resolve review report (admin)
 */
async function resolveReport(reportId, action, adminNote = '') {
  try {
    const report = await prisma.reviewReport.findUnique({
      where: { id: reportId },
      include: { rating: true },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    // Update report status
    await prisma.reviewReport.update({
      where: { id: reportId },
      data: {
        status: action === 'HIDE' ? 'RESOLVED' : 'DISMISSED',
        resolvedAt: new Date(),
        adminNote,
      },
    });

    // Hide review if action is HIDE
    if (action === 'HIDE') {
      await moderateReview(report.ratingId, true, `Report resolved: ${adminNote}`);
    }

    return {
      success: true,
      message: `Report ${action.toLowerCase()}`,
    };
  } catch (error) {
    console.error('Error resolving report:', error);
    throw error;
  }
}

/**
 * Helper: Calculate rating trend
 */
function calculateRatingTrend(recentRatings) {
  if (recentRatings.length < 2) return 'neutral';

  const recent = recentRatings.slice(0, Math.floor(recentRatings.length / 2));
  const older = recentRatings.slice(Math.floor(recentRatings.length / 2));

  const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
  const olderAvg = older.reduce((sum, r) => sum + r.rating, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return 'improving';
  if (diff < -0.3) return 'declining';
  return 'stable';
}

module.exports = {
  rateTemplate,
  getTemplateRatings,
  getRatingBreakdown,
  markReviewHelpful,
  updateTemplateRating,
  reportReview,
  moderateReview,
  deleteRating,
  getUserRating,
  getRatingStatistics,
  getPendingReports,
  resolveReport,
};
