/**
 * Custom Domains API Route
 * Section 2.4: Publishing & Deployment Endpoints
 *
 * POST /api/portfolios/:id/domains - Add custom domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

type SSLStatus = 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'FAILED' | 'EXPIRED';

interface CustomDomain {
  id: string;
  portfolioId: string;
  domain: string;
  isVerified: boolean;
  verificationToken: string;
  sslStatus: SSLStatus;
  sslCertPath: string | null;
  dnsRecords: DNSRecords | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DNSRecords {
  verification: {
    type: 'TXT';
    name: string;
    value: string;
    verified: boolean;
  };
  routing: {
    type: 'CNAME' | 'A';
    name: string;
    value: string;
  };
}

interface Portfolio {
  id: string;
  userId: string;
  customDomains: string[];
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const DomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
      'Invalid domain format (must be a valid FQDN without protocol)'
    )
    .refine(
      (domain) => !domain.startsWith('http://') && !domain.startsWith('https://'),
      'Domain must not include protocol (http:// or https://)'
    ),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const customDomains: CustomDomain[] = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'test-user-id';
}

function verifyOwnership(portfolio: Portfolio, userId: string): boolean {
  return portfolio.userId === userId;
}

/**
 * Check domain availability
 * Requirement #12: Check domain availability
 */
function isDomainAvailable(domain: string): boolean {
  return !customDomains.some((d) => d.domain.toLowerCase() === domain.toLowerCase());
}

/**
 * Generate verification token
 * Requirement #13: Generate verification token
 */
function generateVerificationToken(): string {
  return `rolerabbit-verify=${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate DNS records for domain
 * Requirement #14: Return DNS records user must create
 */
function generateDNSRecords(domain: string, verificationToken: string): DNSRecords {
  return {
    verification: {
      type: 'TXT',
      name: `_rolerabbit-verify.${domain}`,
      value: verificationToken,
      verified: false,
    },
    routing: {
      type: 'CNAME',
      name: domain,
      value: 'hosting.rolerabbit.com',
    },
  };
}

// ============================================================================
// POST /api/portfolios/:id/domains
// Requirements #10-14: Add custom domain
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId } = params;

    const body = await request.json();

    // Requirement #11: Validate domain format
    const validation = DomainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid domain format', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { domain } = validation.data;

    // Find portfolio
    const portfolio = portfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Requirement #12: Check domain availability
    if (!isDomainAvailable(domain)) {
      return NextResponse.json(
        { error: 'Domain is already in use by another portfolio', domain },
        { status: 409 }
      );
    }

    // Requirement #13: Generate verification token and create CustomDomain record
    const verificationToken = generateVerificationToken();
    const dnsRecords = generateDNSRecords(domain, verificationToken);

    const customDomain: CustomDomain = {
      id: `dom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      domain,
      isVerified: false,
      verificationToken,
      sslStatus: 'PENDING',
      sslCertPath: null,
      dnsRecords,
      lastCheckedAt: null,
      verifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await db.customDomain.create({ data: customDomain });

    customDomains.push(customDomain);

    // Add to portfolio's custom domains array
    if (!portfolio.customDomains.includes(domain)) {
      portfolio.customDomains.push(domain);
    }

    // Requirement #14: Return DNS records user must create
    return NextResponse.json(
      {
        message: 'Custom domain added. Please configure DNS records to verify ownership.',
        domain: customDomain,
        dnsRecords: {
          verification: {
            type: 'TXT',
            name: dnsRecords.verification.name,
            value: dnsRecords.verification.value,
            instructions: `Add a TXT record with name "${dnsRecords.verification.name}" and value "${dnsRecords.verification.value}"`,
          },
          routing: {
            type: dnsRecords.routing.type,
            name: dnsRecords.routing.name,
            value: dnsRecords.routing.value,
            instructions: `Add a ${dnsRecords.routing.type} record pointing "${dnsRecords.routing.name}" to "${dnsRecords.routing.value}"`,
          },
        },
        nextSteps: [
          `1. Add the TXT record for verification: ${dnsRecords.verification.name} → ${dnsRecords.verification.value}`,
          `2. Add the ${dnsRecords.routing.type} record for routing: ${dnsRecords.routing.name} → ${dnsRecords.routing.value}`,
          `3. Wait for DNS propagation (usually 5-30 minutes)`,
          `4. Call POST /api/portfolios/${portfolioId}/domains/${customDomain.id}/verify to verify ownership`,
        ],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
