/**
 * Diff Generation Utility
 * 
 * Generates structured diffs for tailored resumes.
 * Shows what was added, removed, and modified.
 */

const diff = require('diff');

/**
 * Generate diff between two objects
 */
function generateObjectDiff(original, modified) {
  const changes = {
    added: [],
    removed: [],
    modified: []
  };

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(original || {}),
    ...Object.keys(modified || {})
  ]);

  for (const key of allKeys) {
    const originalValue = original?.[key];
    const modifiedValue = modified?.[key];

    // Key was added
    if (originalValue === undefined && modifiedValue !== undefined) {
      changes.added.push({
        field: key,
        value: modifiedValue
      });
      continue;
    }

    // Key was removed
    if (originalValue !== undefined && modifiedValue === undefined) {
      changes.removed.push({
        field: key,
        value: originalValue
      });
      continue;
    }

    // Key was modified
    if (JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)) {
      changes.modified.push({
        field: key,
        oldValue: originalValue,
        newValue: modifiedValue,
        diff: generateValueDiff(originalValue, modifiedValue)
      });
    }
  }

  return changes;
}

/**
 * Generate diff for a specific value
 */
function generateValueDiff(oldValue, newValue) {
  // Handle arrays
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    return generateArrayDiff(oldValue, newValue);
  }

  // Handle objects
  if (typeof oldValue === 'object' && typeof newValue === 'object') {
    return generateObjectDiff(oldValue, newValue);
  }

  // Handle strings
  if (typeof oldValue === 'string' && typeof newValue === 'string') {
    return generateTextDiff(oldValue, newValue);
  }

  // Simple value change
  return {
    type: 'value_change',
    from: oldValue,
    to: newValue
  };
}

/**
 * Generate diff for arrays
 */
function generateArrayDiff(oldArray, newArray) {
  const changes = {
    added: [],
    removed: [],
    modified: [],
    reordered: false
  };

  // Find added items
  newArray.forEach((item, index) => {
    const oldIndex = oldArray.findIndex(old => 
      JSON.stringify(old) === JSON.stringify(item)
    );
    
    if (oldIndex === -1) {
      changes.added.push({
        index,
        value: item
      });
    } else if (oldIndex !== index) {
      changes.reordered = true;
    }
  });

  // Find removed items
  oldArray.forEach((item, index) => {
    const newIndex = newArray.findIndex(newItem => 
      JSON.stringify(newItem) === JSON.stringify(item)
    );
    
    if (newIndex === -1) {
      changes.removed.push({
        index,
        value: item
      });
    }
  });

  // Find modified items (same position, different content)
  const minLength = Math.min(oldArray.length, newArray.length);
  for (let i = 0; i < minLength; i++) {
    if (JSON.stringify(oldArray[i]) !== JSON.stringify(newArray[i])) {
      // Check if it's not just a reorder
      const isReorder = newArray.some((item, idx) => 
        idx !== i && JSON.stringify(item) === JSON.stringify(oldArray[i])
      );
      
      if (!isReorder) {
        changes.modified.push({
          index: i,
          oldValue: oldArray[i],
          newValue: newArray[i],
          diff: generateValueDiff(oldArray[i], newArray[i])
        });
      }
    }
  }

  return changes;
}

/**
 * Generate text diff
 */
function generateTextDiff(oldText, newText) {
  const changes = diff.diffWords(oldText, newText);
  
  const added = [];
  const removed = [];
  
  changes.forEach(change => {
    if (change.added) {
      added.push(change.value);
    } else if (change.removed) {
      removed.push(change.value);
    }
  });

  return {
    type: 'text_diff',
    added: added.join(' '),
    removed: removed.join(' '),
    changes: changes.length
  };
}

/**
 * Generate resume diff
 */
function generateResumeDiff(originalResume, tailoredResume) {
  const diff = {
    summary: {
      sectionsModified: 0,
      fieldsAdded: 0,
      fieldsRemoved: 0,
      fieldsModified: 0
    },
    sections: {}
  };

  // Define sections to compare
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

  sections.forEach(section => {
    const originalSection = originalResume[section];
    const tailoredSection = tailoredResume[section];

    // Skip if both are undefined
    if (originalSection === undefined && tailoredSection === undefined) {
      return;
    }

    const sectionDiff = generateValueDiff(originalSection, tailoredSection);
    
    // Check if section has changes
    const hasChanges = 
      (sectionDiff.added && sectionDiff.added.length > 0) ||
      (sectionDiff.removed && sectionDiff.removed.length > 0) ||
      (sectionDiff.modified && sectionDiff.modified.length > 0) ||
      (sectionDiff.type === 'text_diff' && sectionDiff.changes > 0) ||
      (sectionDiff.type === 'value_change');

    if (hasChanges) {
      diff.sections[section] = sectionDiff;
      diff.summary.sectionsModified++;

      // Count field changes
      if (sectionDiff.added) {
        diff.summary.fieldsAdded += sectionDiff.added.length;
      }
      if (sectionDiff.removed) {
        diff.summary.fieldsRemoved += sectionDiff.removed.length;
      }
      if (sectionDiff.modified) {
        diff.summary.fieldsModified += sectionDiff.modified.length;
      }
    }
  });

  return diff;
}

/**
 * Format diff for display
 */
function formatDiffForDisplay(diff) {
  const formatted = [];

  Object.entries(diff.sections || {}).forEach(([section, changes]) => {
    formatted.push({
      section,
      changes: formatSectionChanges(changes)
    });
  });

  return {
    summary: diff.summary,
    changes: formatted
  };
}

/**
 * Format section changes
 */
function formatSectionChanges(changes) {
  const formatted = [];

  if (changes.added) {
    changes.added.forEach(item => {
      formatted.push({
        type: 'added',
        field: item.field,
        value: item.value
      });
    });
  }

  if (changes.removed) {
    changes.removed.forEach(item => {
      formatted.push({
        type: 'removed',
        field: item.field,
        value: item.value
      });
    });
  }

  if (changes.modified) {
    changes.modified.forEach(item => {
      formatted.push({
        type: 'modified',
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue
      });
    });
  }

  if (changes.type === 'text_diff') {
    formatted.push({
      type: 'text_modified',
      added: changes.added,
      removed: changes.removed
    });
  }

  return formatted;
}

/**
 * Calculate diff statistics
 */
function calculateDiffStats(diff) {
  return {
    totalChanges: 
      diff.summary.fieldsAdded +
      diff.summary.fieldsRemoved +
      diff.summary.fieldsModified,
    sectionsModified: diff.summary.sectionsModified,
    fieldsAdded: diff.summary.fieldsAdded,
    fieldsRemoved: diff.summary.fieldsRemoved,
    fieldsModified: diff.summary.fieldsModified,
    changePercentage: calculateChangePercentage(diff)
  };
}

/**
 * Calculate change percentage
 */
function calculateChangePercentage(diff) {
  const totalFields = Object.keys(diff.sections).reduce((count, section) => {
    const changes = diff.sections[section];
    return count + 
      (changes.added?.length || 0) +
      (changes.removed?.length || 0) +
      (changes.modified?.length || 0);
  }, 0);

  if (totalFields === 0) return 0;

  const changedFields = 
    diff.summary.fieldsAdded +
    diff.summary.fieldsRemoved +
    diff.summary.fieldsModified;

  return Math.round((changedFields / (totalFields + changedFields)) * 100);
}

module.exports = {
  generateObjectDiff,
  generateValueDiff,
  generateArrayDiff,
  generateTextDiff,
  generateResumeDiff,
  formatDiffForDisplay,
  calculateDiffStats
};

