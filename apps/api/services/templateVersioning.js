/**
 * Template Versioning Service
 * Manages version control for templates
 *
 * Features:
 * - Version tracking with semantic versioning
 * - Diff comparison between versions
 * - Version rollback
 * - Change history
 * - Branch management (draft, published)
 * - Version tagging
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

/**
 * Create a new version of a template
 */
async function createVersion(templateId, userId, changes = {}, versionType = 'minor') {
  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to version this template');
    }

    // Get current version number or start at 1.0.0
    let currentVersion = { major: 1, minor: 0, patch: 0 };

    if (template.versions.length > 0) {
      const lastVersion = template.versions[0];
      currentVersion = parseVersion(lastVersion.version);
    }

    // Increment version based on type
    const newVersion = incrementVersion(currentVersion, versionType);
    const versionString = formatVersion(newVersion);

    // Create snapshot of current template state
    const snapshot = createSnapshot(template);

    // Calculate changes hash
    const changesHash = calculateHash(snapshot);

    // Create version record
    const version = await prisma.templateVersion.create({
      data: {
        templateId,
        version: versionString,
        versionNumber: versionToNumber(newVersion),
        major: newVersion.major,
        minor: newVersion.minor,
        patch: newVersion.patch,
        snapshot,
        changesHash,
        changeLog: changes.changeLog || '',
        changeType: versionType.toUpperCase(),
        changedBy: userId,
        createdAt: new Date(),
        isPublished: false,
        tag: changes.tag || null,
      },
    });

    // Record detailed changes
    if (changes.details) {
      await recordDetailedChanges(version.id, changes.details);
    }

    return {
      success: true,
      version: versionString,
      versionId: version.id,
      message: `Version ${versionString} created successfully`,
    };
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

/**
 * Get version history for a template
 */
async function getVersionHistory(templateId, options = {}) {
  try {
    const { limit = 50, offset = 0, includeUnpublished = false } = options;

    const where = {
      templateId,
    };

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const [versions, total] = await Promise.all([
      prisma.templateVersion.findMany({
        where,
        include: {
          changedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          changeDetails: true,
        },
        orderBy: { versionNumber: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.templateVersion.count({ where }),
    ]);

    return {
      versions,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching version history:', error);
    throw error;
  }
}

/**
 * Get specific version
 */
async function getVersion(versionId) {
  try {
    const version = await prisma.templateVersion.findUnique({
      where: { id: versionId },
      include: {
        template: true,
        changedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        changeDetails: true,
      },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return version;
  } catch (error) {
    console.error('Error fetching version:', error);
    throw error;
  }
}

/**
 * Compare two versions
 */
async function compareVersions(versionId1, versionId2) {
  try {
    const [version1, version2] = await Promise.all([
      getVersion(versionId1),
      getVersion(versionId2),
    ]);

    if (version1.templateId !== version2.templateId) {
      throw new Error('Versions belong to different templates');
    }

    const diff = calculateDiff(version1.snapshot, version2.snapshot);

    return {
      version1: {
        id: version1.id,
        version: version1.version,
        createdAt: version1.createdAt,
      },
      version2: {
        id: version2.id,
        version: version2.version,
        createdAt: version2.createdAt,
      },
      diff,
      changeCount: diff.length,
    };
  } catch (error) {
    console.error('Error comparing versions:', error);
    throw error;
  }
}

/**
 * Rollback to a specific version
 */
async function rollbackToVersion(templateId, versionId, userId) {
  try {
    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to rollback this template');
    }

    const version = await getVersion(versionId);

    if (version.templateId !== templateId) {
      throw new Error('Version does not belong to this template');
    }

    // Create backup of current state
    await createVersion(templateId, userId, {
      changeLog: 'Backup before rollback',
      tag: 'backup',
    }, 'patch');

    // Restore snapshot
    const snapshot = version.snapshot;

    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        name: snapshot.name,
        description: snapshot.description,
        category: snapshot.category,
        difficulty: snapshot.difficulty,
        layout: snapshot.layout,
        colorScheme: snapshot.colorScheme,
        features: snapshot.features,
        tags: snapshot.tags,
        preview: snapshot.preview,
        industry: snapshot.industry,
        isPremium: snapshot.isPremium,
      },
    });

    // Create new version for the rollback
    await createVersion(templateId, userId, {
      changeLog: `Rolled back to version ${version.version}`,
      tag: 'rollback',
    }, 'minor');

    return {
      success: true,
      message: `Successfully rolled back to version ${version.version}`,
    };
  } catch (error) {
    console.error('Error rolling back version:', error);
    throw error;
  }
}

/**
 * Publish a version
 */
async function publishVersion(versionId, userId) {
  try {
    const version = await getVersion(versionId);

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: version.templateId },
    });

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to publish this version');
    }

    // Unpublish all other versions
    await prisma.templateVersion.updateMany({
      where: {
        templateId: version.templateId,
        isPublished: true,
      },
      data: {
        isPublished: false,
      },
    });

    // Publish this version
    await prisma.templateVersion.update({
      where: { id: versionId },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Version ${version.version} published successfully`,
    };
  } catch (error) {
    console.error('Error publishing version:', error);
    throw error;
  }
}

/**
 * Tag a version
 */
async function tagVersion(versionId, tag, userId) {
  try {
    const version = await getVersion(versionId);

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: version.templateId },
    });

    if (template.authorId !== userId) {
      throw new Error('You do not have permission to tag this version');
    }

    await prisma.templateVersion.update({
      where: { id: versionId },
      data: { tag },
    });

    return {
      success: true,
      message: `Version tagged as '${tag}'`,
    };
  } catch (error) {
    console.error('Error tagging version:', error);
    throw error;
  }
}

/**
 * Get version by tag
 */
async function getVersionByTag(templateId, tag) {
  try {
    const version = await prisma.templateVersion.findFirst({
      where: {
        templateId,
        tag,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!version) {
      throw new Error(`No version found with tag '${tag}'`);
    }

    return version;
  } catch (error) {
    console.error('Error fetching version by tag:', error);
    throw error;
  }
}

/**
 * Get version statistics
 */
async function getVersionStatistics(templateId) {
  try {
    const [totalVersions, publishedVersions, versions] = await Promise.all([
      prisma.templateVersion.count({
        where: { templateId },
      }),
      prisma.templateVersion.count({
        where: { templateId, isPublished: true },
      }),
      prisma.templateVersion.findMany({
        where: { templateId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate version frequency
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentVersions = versions.filter(
      (v) => v.createdAt >= thirtyDaysAgo
    ).length;

    // Get change types distribution
    const changeTypes = await prisma.templateVersion.groupBy({
      by: ['changeType'],
      where: { templateId },
      _count: {
        changeType: true,
      },
    });

    return {
      totalVersions,
      publishedVersions,
      recentVersions,
      changeTypes: changeTypes.reduce((acc, item) => {
        acc[item.changeType] = item._count.changeType;
        return acc;
      }, {}),
      latestVersion: versions[0]?.version || '1.0.0',
    };
  } catch (error) {
    console.error('Error fetching version statistics:', error);
    throw error;
  }
}

/**
 * Helper: Create snapshot of template
 */
function createSnapshot(template) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    difficulty: template.difficulty,
    layout: template.layout,
    colorScheme: template.colorScheme,
    features: template.features,
    tags: template.tags,
    preview: template.preview,
    industry: template.industry,
    isPremium: template.isPremium,
    rating: template.rating,
    downloads: template.downloads,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

/**
 * Helper: Calculate hash of snapshot
 */
function calculateHash(snapshot) {
  const content = JSON.stringify(snapshot);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Helper: Parse version string
 */
function parseVersion(versionString) {
  const parts = versionString.split('.');
  return {
    major: parseInt(parts[0]) || 1,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  };
}

/**
 * Helper: Format version object to string
 */
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

/**
 * Helper: Convert version to comparable number
 */
function versionToNumber(version) {
  return version.major * 1000000 + version.minor * 1000 + version.patch;
}

/**
 * Helper: Increment version based on type
 */
function incrementVersion(currentVersion, type) {
  const newVersion = { ...currentVersion };

  switch (type.toLowerCase()) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
      newVersion.patch += 1;
      break;
    default:
      newVersion.patch += 1;
  }

  return newVersion;
}

/**
 * Helper: Calculate diff between snapshots
 */
function calculateDiff(snapshot1, snapshot2) {
  const diff = [];

  for (const key in snapshot1) {
    if (snapshot1.hasOwnProperty(key) && snapshot2.hasOwnProperty(key)) {
      if (JSON.stringify(snapshot1[key]) !== JSON.stringify(snapshot2[key])) {
        diff.push({
          field: key,
          oldValue: snapshot1[key],
          newValue: snapshot2[key],
          type: typeof snapshot1[key],
        });
      }
    }
  }

  return diff;
}

/**
 * Helper: Record detailed changes
 */
async function recordDetailedChanges(versionId, details) {
  try {
    const changes = details.map((detail) => ({
      versionId,
      field: detail.field,
      oldValue: JSON.stringify(detail.oldValue),
      newValue: JSON.stringify(detail.newValue),
      changeType: detail.type || 'UPDATE',
    }));

    await prisma.versionChangeDetail.createMany({
      data: changes,
    });
  } catch (error) {
    console.error('Error recording detailed changes:', error);
  }
}

module.exports = {
  createVersion,
  getVersionHistory,
  getVersion,
  compareVersions,
  rollbackToVersion,
  publishVersion,
  tagVersion,
  getVersionByTag,
  getVersionStatistics,
};
