/**
 * Authentication & Authorization Middleware
 * Section 2.10: Authorization & Security
 *
 * Requirements #1-4: verifyOwnership and requireAdmin middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { OwnershipError, AdminRequiredError, UnauthorizedError } from '../lib/errors/custom-errors';

/**
 * User interface (should match your auth system)
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
}

/**
 * Get current authenticated user from request
 * TODO: Replace with actual authentication logic
 */
export function getCurrentUser(request: NextRequest): AuthUser | null {
  // TODO: In production, extract user from JWT token, session, etc.
  // const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // const user = await verifyToken(token);
  // return user;

  // Mock implementation for development
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  // Extract user ID from bearer token (mock)
  const userId = authHeader.replace('Bearer ', '');

  // Mock user object
  return {
    id: userId,
    email: `${userId}@example.com`,
    role: userId === 'admin-user' ? 'admin' : 'user',
  };
}

/**
 * Require authentication middleware
 * Ensures user is logged in
 */
export function requireAuth(request: NextRequest): AuthUser {
  const user = getCurrentUser(request);

  if (!user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  return user;
}

/**
 * Verify ownership middleware factory
 * Requirement #1: Create verifyOwnership middleware verifying portfolio.userId === request.user.userId
 *
 * Usage:
 * const user = requireAuth(request);
 * await verifyOwnership(user.id, portfolio.userId, 'portfolio');
 */
export async function verifyOwnership(
  userId: string,
  resourceUserId: string,
  resourceType: string = 'resource'
): Promise<void> {
  if (userId !== resourceUserId) {
    throw new OwnershipError(resourceType, {
      userId,
      resourceUserId,
    });
  }
}

/**
 * Require admin middleware
 * Requirement #3: Create requireAdmin middleware checking request.user.role === 'admin'
 *
 * Usage:
 * const user = requireAdmin(request);
 */
export function requireAdmin(request: NextRequest): AuthUser {
  const user = requireAuth(request);

  if (user.role !== 'admin') {
    throw new AdminRequiredError('This operation requires admin privileges');
  }

  return user;
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

/**
 * Check if user owns resource
 */
export function ownsResource(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Middleware wrapper for routes requiring authentication
 */
export function withAuth<T extends any[], R>(
  handler: (user: AuthUser, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    const user = requireAuth(request);
    return handler(user, request, ...args);
  };
}

/**
 * Middleware wrapper for routes requiring admin
 */
export function withAdmin<T extends any[], R>(
  handler: (user: AuthUser, ...args: T) => Promise<R>
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    const user = requireAdmin(request);
    return handler(user, request, ...args);
  };
}

/**
 * Middleware wrapper for routes requiring ownership
 * Requirement #2: Apply verifyOwnership to PUT/PATCH/DELETE routes
 */
export function withOwnership<T extends any[], R>(
  handler: (user: AuthUser, ...args: T) => Promise<R>,
  getResourceUserId: (...args: T) => Promise<string | null>,
  resourceType: string = 'resource'
) {
  return async (request: NextRequest, ...args: T): Promise<R> => {
    const user = requireAuth(request);
    const resourceUserId = await getResourceUserId(request, ...args);

    if (!resourceUserId) {
      throw new OwnershipError(resourceType);
    }

    await verifyOwnership(user.id, resourceUserId, resourceType);
    return handler(user, request, ...args);
  };
}
