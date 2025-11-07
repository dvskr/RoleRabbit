/**
 * Permission checking utility for frontend
 * Determines what actions a user can perform based on their permission level
 */

export type PermissionLevel = 'view' | 'comment' | 'edit' | 'admin';

/**
 * Check if user has permission to perform an action
 * @param userPermission - User's permission level
 * @param requiredAction - Required action level
 * @returns boolean
 */
export function hasPermission(userPermission: PermissionLevel | null, requiredAction: PermissionLevel | 'delete'): boolean {
  if (!userPermission) return false;

  // Permission hierarchy
  const hierarchy: Record<PermissionLevel | 'delete', number> = {
    'view': 1,
    'comment': 2,
    'edit': 3,
    'delete': 4,
    'admin': 4
  };

  const userLevel = hierarchy[userPermission] || 0;
  const requiredLevel = hierarchy[requiredAction] || 999;

  return userLevel >= requiredLevel;
}

/**
 * Get user's permission level for a file
 * @param file - File object
 * @param currentUserId - Current user's ID
 * @returns PermissionLevel | null
 */
export function getUserFilePermission(file: { userId: string; sharedWith?: Array<{ userId: string; permission: PermissionLevel }> }, currentUserId: string): PermissionLevel | null {
  // Owner has admin permission
  if (file.userId === currentUserId) {
    return 'admin';
  }

  // Check if user has a share
  const share = file.sharedWith?.find(s => s.userId === currentUserId);
  return share ? share.permission : null;
}

/**
 * Check if user can view file
 */
export function canView(permission: PermissionLevel | null): boolean {
  return hasPermission(permission, 'view');
}

/**
 * Check if user can comment on file
 */
export function canComment(permission: PermissionLevel | null): boolean {
  return hasPermission(permission, 'comment');
}

/**
 * Check if user can edit file
 */
export function canEdit(permission: PermissionLevel | null): boolean {
  return hasPermission(permission, 'edit');
}

/**
 * Check if user can delete file (only owner)
 */
export function canDelete(permission: PermissionLevel | null): boolean {
  return permission === 'admin'; // Only admin (owner) can delete
}

/**
 * Check if user can manage shares (only owner)
 */
export function canManageShares(permission: PermissionLevel | null): boolean {
  return permission === 'admin'; // Only admin (owner) can manage shares
}


