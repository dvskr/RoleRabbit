/**
 * Database Helper Functions
 * 
 * Utilities for working with new database features:
 * - Soft delete
 * - Optimistic locking
 * - Tagging
 * - Archiving
 * - Analytics tracking
 */

/**
 * Soft Delete Helpers
 */
const SoftDelete = {
  /**
   * Soft delete a resume
   */
  async softDelete(prisma, resumeId) {
    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { deletedAt: new Date() }
    });
  },

  /**
   * Restore a soft-deleted resume
   */
  async restore(prisma, resumeId) {
    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { deletedAt: null }
    });
  },

  /**
   * Permanently delete soft-deleted resumes older than X days
   */
  async cleanup(prisma, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.baseResume.deleteMany({
      where: {
        deletedAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`Permanently deleted ${result.count} old resumes`);
    return result.count;
  },

  /**
   * Get all soft-deleted resumes for a user
   */
  async getDeleted(prisma, userId) {
    return await prisma.baseResume.findMany({
      where: {
        userId,
        deletedAt: { not: null }
      },
      orderBy: { deletedAt: 'desc' }
    });
  }
};

/**
 * Optimistic Locking Helpers
 */
const OptimisticLocking = {
  /**
   * Update with optimistic locking
   * Throws error if version mismatch (concurrent edit detected)
   */
  async updateWithLock(prisma, resumeId, currentVersion, data) {
    // Verify version matches
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { version: true }
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    if (resume.version !== currentVersion) {
      throw new Error(
        `Version mismatch: expected ${currentVersion}, got ${resume.version}. ` +
        'The resume was modified by another user or session.'
      );
    }

    // Update with incremented version
    return await prisma.baseResume.update({
      where: {
        id: resumeId,
        version: currentVersion // Ensure version still matches
      },
      data: {
        ...data,
        version: { increment: 1 }
      }
    });
  },

  /**
   * Get current version
   */
  async getVersion(prisma, resumeId) {
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { version: true }
    });
    return resume?.version || 0;
  }
};

/**
 * Tagging Helpers
 */
const Tagging = {
  /**
   * Add tags to resume
   */
  async addTags(prisma, resumeId, newTags) {
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { tags: true }
    });

    const existingTags = resume?.tags || [];
    const uniqueTags = [...new Set([...existingTags, ...newTags])];

    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { tags: uniqueTags }
    });
  },

  /**
   * Remove tags from resume
   */
  async removeTags(prisma, resumeId, tagsToRemove) {
    const resume = await prisma.baseResume.findUnique({
      where: { id: resumeId },
      select: { tags: true }
    });

    const existingTags = resume?.tags || [];
    const filteredTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { tags: filteredTags }
    });
  },

  /**
   * Set tags (replace all)
   */
  async setTags(prisma, resumeId, tags) {
    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { tags }
    });
  },

  /**
   * Get resumes by tags
   */
  async getByTags(prisma, userId, tags, matchAll = false) {
    const where = {
      userId,
      deletedAt: null,
      archivedAt: null
    };

    if (matchAll) {
      // Match all tags (AND)
      where.tags = { hasEvery: tags };
    } else {
      // Match any tag (OR)
      where.tags = { hasSome: tags };
    }

    return await prisma.baseResume.findMany({ where });
  },

  /**
   * Get popular tags for user
   */
  async getPopularTags(prisma, userId, limit = 10) {
    const resumes = await prisma.baseResume.findMany({
      where: { userId, deletedAt: null },
      select: { tags: true }
    });

    // Count tag occurrences
    const tagCounts = {};
    resumes.forEach(resume => {
      resume.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }
};

/**
 * Archiving Helpers
 */
const Archiving = {
  /**
   * Archive a resume
   */
  async archive(prisma, resumeId) {
    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { archivedAt: new Date() }
    });
  },

  /**
   * Unarchive a resume
   */
  async unarchive(prisma, resumeId) {
    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: { archivedAt: null }
    });
  },

  /**
   * Get archived resumes
   */
  async getArchived(prisma, userId) {
    return await prisma.baseResume.findMany({
      where: {
        userId,
        archivedAt: { not: null },
        deletedAt: null
      },
      orderBy: { archivedAt: 'desc' }
    });
  },

  /**
   * Auto-archive old resumes
   */
  async autoArchive(prisma, userId, daysOld = 180) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.baseResume.updateMany({
      where: {
        userId,
        updatedAt: { lt: cutoffDate },
        archivedAt: null,
        deletedAt: null
      },
      data: { archivedAt: new Date() }
    });

    return result.count;
  }
};

/**
 * Analytics Helpers
 */
const Analytics = {
  /**
   * Track view
   */
  async trackView(prisma, resumeId) {
    return await prisma.resumeAnalytics.upsert({
      where: { baseResumeId: resumeId },
      create: {
        baseResumeId: resumeId,
        viewCount: 1,
        lastViewedAt: new Date()
      },
      update: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    });
  },

  /**
   * Track export
   */
  async trackExport(prisma, resumeId) {
    return await prisma.resumeAnalytics.upsert({
      where: { baseResumeId: resumeId },
      create: {
        baseResumeId: resumeId,
        exportCount: 1,
        lastExportedAt: new Date()
      },
      update: {
        exportCount: { increment: 1 },
        lastExportedAt: new Date()
      }
    });
  },

  /**
   * Track tailor
   */
  async trackTailor(prisma, resumeId) {
    return await prisma.resumeAnalytics.upsert({
      where: { baseResumeId: resumeId },
      create: {
        baseResumeId: resumeId,
        tailorCount: 1,
        lastTailoredAt: new Date()
      },
      update: {
        tailorCount: { increment: 1 },
        lastTailoredAt: new Date()
      }
    });
  },

  /**
   * Track share
   */
  async trackShare(prisma, resumeId) {
    return await prisma.resumeAnalytics.upsert({
      where: { baseResumeId: resumeId },
      create: {
        baseResumeId: resumeId,
        shareCount: 1
      },
      update: {
        shareCount: { increment: 1 }
      }
    });
  },

  /**
   * Get analytics
   */
  async getAnalytics(prisma, resumeId) {
    return await prisma.resumeAnalytics.findUnique({
      where: { baseResumeId: resumeId }
    });
  }
};

/**
 * Version History Helpers
 */
const VersionHistory = {
  /**
   * Create version snapshot
   */
  async createVersion(prisma, resumeId, userId, changeType, data, formatting, metadata) {
    // Get next version number
    const lastVersion = await prisma.resumeVersion.findFirst({
      where: { baseResumeId: resumeId },
      orderBy: { versionNumber: 'desc' }
    });

    const versionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Create version
    const version = await prisma.resumeVersion.create({
      data: {
        baseResumeId: resumeId,
        userId,
        versionNumber,
        changeType,
        data,
        formatting,
        metadata
      }
    });

    // Keep only last 10 versions
    await this.cleanup(prisma, resumeId, 10);

    return version;
  },

  /**
   * Get version history
   */
  async getHistory(prisma, resumeId, limit = 10) {
    return await prisma.resumeVersion.findMany({
      where: { baseResumeId: resumeId },
      orderBy: { versionNumber: 'desc' },
      take: limit
    });
  },

  /**
   * Restore from version
   */
  async restoreVersion(prisma, resumeId, versionNumber) {
    const version = await prisma.resumeVersion.findUnique({
      where: {
        baseResumeId_versionNumber: {
          baseResumeId: resumeId,
          versionNumber
        }
      }
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return await prisma.baseResume.update({
      where: { id: resumeId },
      data: {
        data: version.data,
        formatting: version.formatting,
        metadata: version.metadata,
        version: { increment: 1 }
      }
    });
  },

  /**
   * Cleanup old versions (keep only last N)
   */
  async cleanup(prisma, resumeId, keepCount = 10) {
    const versions = await prisma.resumeVersion.findMany({
      where: { baseResumeId: resumeId },
      orderBy: { versionNumber: 'desc' },
      skip: keepCount
    });

    if (versions.length > 0) {
      await prisma.resumeVersion.deleteMany({
        where: {
          id: { in: versions.map(v => v.id) }
        }
      });
    }

    return versions.length;
  }
};

/**
 * Share Link Helpers
 */
const ShareLinks = {
  /**
   * Create share link
   */
  async create(prisma, resumeId, userId, expiresInDays = null) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const shareLink = await prisma.resumeShareLink.create({
      data: {
        baseResumeId: resumeId,
        userId,
        token,
        expiresAt
      }
    });

    // Track share in analytics
    await Analytics.trackShare(prisma, resumeId);

    return shareLink;
  },

  /**
   * Get share link by token
   */
  async getByToken(prisma, token) {
    const shareLink = await prisma.resumeShareLink.findUnique({
      where: { token },
      include: { baseResume: true }
    });

    // Check if expired
    if (shareLink && shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return null;
    }

    // Check if active
    if (shareLink && !shareLink.isActive) {
      return null;
    }

    return shareLink;
  },

  /**
   * Increment view count
   */
  async incrementViews(prisma, token) {
    return await prisma.resumeShareLink.update({
      where: { token },
      data: { viewCount: { increment: 1 } }
    });
  },

  /**
   * Revoke share link
   */
  async revoke(prisma, linkId) {
    return await prisma.resumeShareLink.update({
      where: { id: linkId },
      data: { isActive: false }
    });
  },

  /**
   * Get all share links for resume
   */
  async getByResume(prisma, resumeId) {
    return await prisma.resumeShareLink.findMany({
      where: { baseResumeId: resumeId },
      orderBy: { createdAt: 'desc' }
    });
  }
};

module.exports = {
  SoftDelete,
  OptimisticLocking,
  Tagging,
  Archiving,
  Analytics,
  VersionHistory,
  ShareLinks
};

