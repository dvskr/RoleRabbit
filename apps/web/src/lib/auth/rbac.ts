/**
 * Role-Based Access Control (RBAC) - Section 6.1
 *
 * Defines roles, permissions, and access control for portfolio operations
 */

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum Permission {
  // Portfolio permissions
  PORTFOLIO_CREATE = 'portfolio:create',
  PORTFOLIO_READ = 'portfolio:read',
  PORTFOLIO_UPDATE = 'portfolio:update',
  PORTFOLIO_DELETE = 'portfolio:delete',
  PORTFOLIO_PUBLISH = 'portfolio:publish',
  PORTFOLIO_SHARE = 'portfolio:share',

  // Template permissions
  TEMPLATE_CREATE = 'template:create',
  TEMPLATE_UPDATE = 'template:update',
  TEMPLATE_DELETE = 'template:delete',
  TEMPLATE_READ = 'template:read',

  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',

  // Admin permissions
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_USERS = 'admin:users',
  ADMIN_MODERATE = 'admin:moderate',

  // Moderation permissions
  CONTENT_MODERATE = 'content:moderate',
  USER_BAN = 'user:ban',

  // Organization permissions (future)
  ORG_CREATE = 'org:create',
  ORG_MANAGE = 'org:manage',
  ORG_MEMBERS = 'org:members',
}

// Role-Permission mapping
const userPermissions = [
  Permission.PORTFOLIO_CREATE,
  Permission.PORTFOLIO_READ,
  Permission.PORTFOLIO_UPDATE,
  Permission.PORTFOLIO_DELETE,
  Permission.PORTFOLIO_PUBLISH,
  Permission.PORTFOLIO_SHARE,
  Permission.TEMPLATE_READ,
  Permission.ANALYTICS_READ,
  Permission.ANALYTICS_EXPORT,
];

const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: userPermissions,
  [Role.MODERATOR]: [
    // All user permissions
    ...userPermissions,
    Permission.ADMIN_MODERATE,
    Permission.CONTENT_MODERATE,
  ],
  [Role.ADMIN]: [
    // All permissions
    ...Object.values(Permission),
  ],
};

/**
 * Check if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

/**
 * Check if user has permission
 */
export function userHasPermission(
  userRole: Role | string,
  permission: Permission
): boolean {
  const role = userRole as Role;
  return hasPermission(role, permission);
}

/**
 * Get all permissions for role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  userId: string,
  resourceOwnerId: string,
  userRole: Role,
  permission: Permission
): boolean {
  // Admins can access everything
  if (userRole === Role.ADMIN) {
    return true;
  }

  // Check if user has permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // User must own the resource
  return userId === resourceOwnerId;
}

/**
 * Require permission middleware
 */
export function requirePermission(permission: Permission) {
  return (req: any, res: any, next: any) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You do not have permission to ${permission}`,
      });
    }

    next();
  };
}

/**
 * Require role middleware
 */
export function requireRole(role: Role) {
  return (req: any, res: any, next: any) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (user.role !== role && user.role !== Role.ADMIN) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires ${role} role`,
      });
    }

    next();
  };
}

/**
 * Require ownership or admin
 */
export function requireOwnership(getResourceOwnerId: (req: any) => Promise<string | null>) {
  return async (req: any, res: any, next: any) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admins bypass ownership check
    if (user.role === Role.ADMIN) {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (ownerId !== user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have access to this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * IP Allow-list for admin endpoints
 */
const ADMIN_ALLOWED_IPS = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

export function requireAdminIP() {
  return (req: any, res: any, next: any) => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!ADMIN_ALLOWED_IPS.length) {
      console.warn('ADMIN_ALLOWED_IPS not configured');
      return next();
    }

    if (!ADMIN_ALLOWED_IPS.includes(clientIP)) {
      console.warn(`Rejected admin access from IP: ${clientIP}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied from this IP address',
      });
    }

    next();
  };
}

/**
 * Organization access control (future feature)
 */
export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
}

export function canAccessOrganizationResource(
  userId: string,
  organizationId: string,
  member: OrganizationMember | null,
  permission: Permission
): boolean {
  if (!member || member.organizationId !== organizationId) {
    return false;
  }

  // Organization owner has all permissions
  if (member.role === 'owner') {
    return true;
  }

  // Check if member has specific permission
  return member.permissions.includes(permission);
}
