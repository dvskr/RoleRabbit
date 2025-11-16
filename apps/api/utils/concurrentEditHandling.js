/**
 * Concurrent Edit Handling
 * 
 * Handles conflicts when multiple users/sessions edit the same resume.
 * Implements 3-way merge algorithm.
 */

const { generateResumeDiff } = require('./diffGeneration');

/**
 * Detect conflict
 */
function detectConflict(lastKnownServerUpdatedAt, currentServerUpdatedAt) {
  if (!lastKnownServerUpdatedAt || !currentServerUpdatedAt) {
    return false;
  }

  const lastKnown = new Date(lastKnownServerUpdatedAt).getTime();
  const currentServer = new Date(currentServerUpdatedAt).getTime();

  return currentServer > lastKnown;
}

/**
 * 3-way merge algorithm
 * Merges changes from two versions based on a common ancestor
 */
function threeWayMerge(base, local, remote) {
  const result = {
    merged: {},
    conflicts: [],
    autoResolved: []
  };

  // Get all keys from all versions
  const allKeys = new Set([
    ...Object.keys(base || {}),
    ...Object.keys(local || {}),
    ...Object.keys(remote || {})
  ]);

  for (const key of allKeys) {
    const baseValue = base?.[key];
    const localValue = local?.[key];
    const remoteValue = remote?.[key];

    // No changes
    if (
      JSON.stringify(baseValue) === JSON.stringify(localValue) &&
      JSON.stringify(baseValue) === JSON.stringify(remoteValue)
    ) {
      result.merged[key] = baseValue;
      continue;
    }

    // Only local changed
    if (
      JSON.stringify(baseValue) !== JSON.stringify(localValue) &&
      JSON.stringify(baseValue) === JSON.stringify(remoteValue)
    ) {
      result.merged[key] = localValue;
      result.autoResolved.push({
        field: key,
        resolution: 'local',
        reason: 'Only local version changed'
      });
      continue;
    }

    // Only remote changed
    if (
      JSON.stringify(baseValue) === JSON.stringify(localValue) &&
      JSON.stringify(baseValue) !== JSON.stringify(remoteValue)
    ) {
      result.merged[key] = remoteValue;
      result.autoResolved.push({
        field: key,
        resolution: 'remote',
        reason: 'Only remote version changed'
      });
      continue;
    }

    // Both changed to same value
    if (JSON.stringify(localValue) === JSON.stringify(remoteValue)) {
      result.merged[key] = localValue;
      result.autoResolved.push({
        field: key,
        resolution: 'both',
        reason: 'Both versions changed to same value'
      });
      continue;
    }

    // Both changed to different values - CONFLICT
    result.conflicts.push({
      field: key,
      baseValue,
      localValue,
      remoteValue,
      message: `Conflict in field "${key}": both local and remote versions modified`
    });

    // Default to local for now (can be configured)
    result.merged[key] = localValue;
  }

  return result;
}

/**
 * Merge resume data
 */
function mergeResumeData(base, local, remote) {
  const sections = [
    'contact',
    'summary',
    'experience',
    'education',
    'projects',
    'certifications',
    'skills',
    'customSections'
  ];

  const result = {
    merged: {},
    conflicts: [],
    autoResolved: [],
    summary: {
      totalFields: 0,
      conflictFields: 0,
      autoResolvedFields: 0
    }
  };

  sections.forEach(section => {
    const sectionMerge = threeWayMerge(
      base?.[section],
      local?.[section],
      remote?.[section]
    );

    result.merged[section] = sectionMerge.merged;
    
    if (sectionMerge.conflicts.length > 0) {
      result.conflicts.push(...sectionMerge.conflicts.map(c => ({
        ...c,
        section
      })));
    }

    if (sectionMerge.autoResolved.length > 0) {
      result.autoResolved.push(...sectionMerge.autoResolved.map(r => ({
        ...r,
        section
      })));
    }
  });

  // Calculate summary
  result.summary.totalFields = sections.length;
  result.summary.conflictFields = result.conflicts.length;
  result.summary.autoResolvedFields = result.autoResolved.length;

  return result;
}

/**
 * Resolve conflict with strategy
 */
function resolveConflict(conflict, strategy = 'local') {
  switch (strategy) {
    case 'local':
      return conflict.localValue;
    case 'remote':
      return conflict.remoteValue;
    case 'base':
      return conflict.baseValue;
    case 'merge':
      // Attempt to merge arrays/objects
      if (Array.isArray(conflict.localValue) && Array.isArray(conflict.remoteValue)) {
        return [...new Set([...conflict.localValue, ...conflict.remoteValue])];
      }
      if (typeof conflict.localValue === 'object' && typeof conflict.remoteValue === 'object') {
        return { ...conflict.remoteValue, ...conflict.localValue };
      }
      return conflict.localValue;
    default:
      return conflict.localValue;
  }
}

/**
 * Apply conflict resolutions
 */
function applyConflictResolutions(mergeResult, resolutions) {
  const resolved = { ...mergeResult.merged };

  resolutions.forEach(resolution => {
    const conflict = mergeResult.conflicts.find(c => 
      c.field === resolution.field && c.section === resolution.section
    );

    if (conflict) {
      const sectionData = resolved[resolution.section];
      if (sectionData) {
        sectionData[conflict.field] = resolveConflict(conflict, resolution.strategy);
      }
    }
  });

  return resolved;
}

/**
 * Middleware: Check for concurrent edits
 */
function concurrentEditMiddleware(options = {}) {
  const {
    getLastKnownUpdatedAt = (req) => req.body.lastKnownServerUpdatedAt,
    onConflict = null
  } = options;

  return async (req, res, next) => {
    try {
      const resumeId = req.params.id;
      const lastKnownUpdatedAt = getLastKnownUpdatedAt(req);

      if (!lastKnownUpdatedAt) {
        // No conflict detection possible
        return next();
      }

      // Get current server version
      const serverResume = await (req.prisma || global.prisma).baseResume.findUnique({
        where: { id: resumeId },
        select: { updatedAt: true, data: true }
      });

      if (!serverResume) {
        return next();
      }

      // Check for conflict
      const hasConflict = detectConflict(lastKnownUpdatedAt, serverResume.updatedAt);

      if (hasConflict) {
        if (onConflict) {
          return onConflict(req, res, serverResume);
        }

        return res.status(409).json({
          success: false,
          error: 'Concurrent edit detected',
          code: 'CONCURRENT_EDIT_CONFLICT',
          details: {
            lastKnownUpdatedAt,
            currentServerUpdatedAt: serverResume.updatedAt,
            serverData: serverResume.data
          }
        });
      }

      // No conflict, continue
      next();
    } catch (error) {
      console.error('Concurrent edit check error:', error);
      // Don't block on error
      next();
    }
  };
}

module.exports = {
  detectConflict,
  threeWayMerge,
  mergeResumeData,
  resolveConflict,
  applyConflictResolutions,
  concurrentEditMiddleware
};

