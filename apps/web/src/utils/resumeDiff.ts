/**
 * Utility functions for calculating and highlighting differences between original and tailored resumes
 */

export interface DiffChange {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  section: string;
  field?: string;
  index?: number;
  oldValue?: string;
  newValue?: string;
  path: string; // e.g., "experience.0.bullets.1"
}

export interface DiffResult {
  changes: DiffChange[];
  addedCount: number;
  removedCount: number;
  modifiedCount: number;
  totalChanges: number;
}

/**
 * Calculate differences between two resume data objects
 */
export function calculateResumeDiff(original: any, tailored: any): DiffResult {
  const changes: DiffChange[] = [];
  
  // Compare summary
  if (original.summary !== tailored.summary) {
    changes.push({
      type: original.summary ? 'modified' : 'added',
      section: 'summary',
      path: 'summary',
      oldValue: original.summary || '',
      newValue: tailored.summary || ''
    });
  }
  
  // Compare experience
  if (Array.isArray(original.experience) && Array.isArray(tailored.experience)) {
    tailored.experience.forEach((newExp: any, index: number) => {
      const oldExp = original.experience[index];
      if (!oldExp) {
        changes.push({
          type: 'added',
          section: 'experience',
          index,
          path: `experience.${index}`,
          newValue: JSON.stringify(newExp)
        });
        return;
      }
      
      // Compare role
      if (oldExp.role !== newExp.role) {
        changes.push({
          type: 'modified',
          section: 'experience',
          field: 'role',
          index,
          path: `experience.${index}.role`,
          oldValue: oldExp.role,
          newValue: newExp.role
        });
      }
      
      // Compare bullets
      if (Array.isArray(newExp.bullets)) {
        newExp.bullets.forEach((bullet: string, bulletIndex: number) => {
          const oldBullet = oldExp.bullets?.[bulletIndex];
          if (!oldBullet) {
            changes.push({
              type: 'added',
              section: 'experience',
              field: 'bullets',
              index: bulletIndex,
              path: `experience.${index}.bullets.${bulletIndex}`,
              newValue: bullet
            });
          } else if (oldBullet !== bullet) {
            changes.push({
              type: 'modified',
              section: 'experience',
              field: 'bullets',
              index: bulletIndex,
              path: `experience.${index}.bullets.${bulletIndex}`,
              oldValue: oldBullet,
              newValue: bullet
            });
          }
        });
      }
    });
  }
  
  // Compare skills
  if (original.skills && tailored.skills) {
    ['technical', 'tools', 'soft'].forEach((skillType) => {
      const oldSkills = original.skills[skillType] || [];
      const newSkills = tailored.skills[skillType] || [];
      
      // Find added skills
      newSkills.forEach((skill: string) => {
        if (!oldSkills.includes(skill)) {
          changes.push({
            type: 'added',
            section: 'skills',
            field: skillType,
            path: `skills.${skillType}`,
            newValue: skill
          });
        }
      });
      
      // Find removed skills
      oldSkills.forEach((skill: string) => {
        if (!newSkills.includes(skill)) {
          changes.push({
            type: 'removed',
            section: 'skills',
            field: skillType,
            path: `skills.${skillType}`,
            oldValue: skill
          });
        }
      });
    });
  }
  
  // Compare education
  if (Array.isArray(original.education) && Array.isArray(tailored.education)) {
    tailored.education.forEach((newEdu: any, index: number) => {
      const oldEdu = original.education[index];
      if (!oldEdu) {
        changes.push({
          type: 'added',
          section: 'education',
          index,
          path: `education.${index}`,
          newValue: JSON.stringify(newEdu)
        });
        return;
      }
      
      // Compare degree
      if (oldEdu.degree !== newEdu.degree) {
        changes.push({
          type: 'modified',
          section: 'education',
          field: 'degree',
          index,
          path: `education.${index}.degree`,
          oldValue: oldEdu.degree,
          newValue: newEdu.degree
        });
      }
    });
  }
  
  // Calculate counts
  const addedCount = changes.filter(c => c.type === 'added').length;
  const removedCount = changes.filter(c => c.type === 'removed').length;
  const modifiedCount = changes.filter(c => c.type === 'modified').length;
  
  return {
    changes,
    addedCount,
    removedCount,
    modifiedCount,
    totalChanges: addedCount + removedCount + modifiedCount
  };
}

/**
 * Get CSS class for highlighting based on change type
 */
export function getDiffHighlightClass(changeType: 'added' | 'removed' | 'modified' | 'unchanged'): string {
  switch (changeType) {
    case 'added':
      return 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500';
    case 'removed':
      return 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 line-through opacity-60';
    case 'modified':
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500';
    default:
      return '';
  }
}

/**
 * Check if a specific path has changes
 */
export function hasChangesAtPath(changes: DiffChange[], path: string): boolean {
  return changes.some(change => change.path === path || change.path.startsWith(path + '.'));
}

/**
 * Get change type for a specific path
 */
export function getChangeTypeAtPath(changes: DiffChange[], path: string): 'added' | 'removed' | 'modified' | 'unchanged' {
  const change = changes.find(c => c.path === path);
  return change?.type || 'unchanged';
}

