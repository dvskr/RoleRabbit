/**
 * Subdomain Availability Check API Route
 * Section 2.4: Publishing & Deployment Endpoints
 *
 * GET /api/subdomains/check?subdomain=... - Check subdomain availability (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  subdomain: string | null;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const SubdomainCheckSchema = z.object({
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must not exceed 63 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/,
      'Subdomain must contain only lowercase letters, numbers, and hyphens'
    ),
});

// ============================================================================
// CONSTANTS
// ============================================================================

const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'blog',
  'dashboard',
  'mail',
  'ftp',
  'localhost',
  'staging',
  'dev',
  'test',
  'prod',
  'production',
  'demo',
  'docs',
  'help',
  'support',
  'status',
  'about',
  'contact',
  'login',
  'signup',
  'register',
  'auth',
  'oauth',
  'settings',
  'account',
  'profile',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'uploads',
  'downloads',
  'files',
  'webhooks',
  'analytics',
];

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSubdomainReserved(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

function isSubdomainTaken(subdomain: string): boolean {
  return portfolios.some((p) => p.subdomain?.toLowerCase() === subdomain.toLowerCase());
}

// ============================================================================
// GET /api/subdomains/check
// Requirements #20-21: Check subdomain availability (public endpoint)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain query parameter is required' },
        { status: 400 }
      );
    }

    // Requirement #21: Validate subdomain format
    const validation = SubdomainCheckSchema.safeParse({ subdomain });

    if (!validation.success) {
      return NextResponse.json(
        {
          available: false,
          subdomain,
          reason: 'INVALID_FORMAT',
          error: validation.error.errors[0]?.message || 'Invalid subdomain format',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Check if reserved
    if (isSubdomainReserved(subdomain)) {
      return NextResponse.json({
        available: false,
        subdomain,
        reason: 'RESERVED',
        message: 'This subdomain is reserved and cannot be used',
      });
    }

    // Requirement #21: Check availability without requiring authentication
    // TODO: Replace with actual database query
    // const isTaken = await db.portfolio.findFirst({
    //   where: { subdomain: { equals: subdomain, mode: 'insensitive' } }
    // });

    const isTaken = isSubdomainTaken(subdomain);

    if (isTaken) {
      return NextResponse.json({
        available: false,
        subdomain,
        reason: 'TAKEN',
        message: 'This subdomain is already in use',
      });
    }

    // Subdomain is available
    return NextResponse.json({
      available: true,
      subdomain,
      message: 'Subdomain is available',
      url: `https://${subdomain}.rolerabbit.com`,
    });

  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
