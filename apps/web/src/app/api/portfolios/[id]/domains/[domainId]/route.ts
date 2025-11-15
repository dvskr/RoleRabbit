/**
 * Custom Domain Management API Routes
 * Section 2.4: Publishing & Deployment Endpoints
 *
 * POST /api/portfolios/:id/domains/:domainId/verify - Verify domain ownership
 * DELETE /api/portfolios/:id/domains/:domainId - Remove custom domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as dns } from 'dns';

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
 * Query DNS for TXT record
 * Requirement #16: Query DNS for TXT record matching verification token
 */
async function checkDNSVerification(domain: string, expectedToken: string): Promise<boolean> {
  try {
    // Query TXT records for verification subdomain
    const txtRecordName = `_rolerabbit-verify.${domain}`;

    // TODO: In production, use actual DNS lookup
    // const records = await dns.resolveTxt(txtRecordName);

    // For now, simulate DNS lookup
    // In production: const records = await dns.resolveTxt(txtRecordName);
    // const flatRecords = records.flat();
    // return flatRecords.some(record => record === expectedToken);

    // Simulated: Always return true for testing
    console.log(`DNS lookup: ${txtRecordName} should contain ${expectedToken}`);
    return true; // Mock verification success

  } catch (error) {
    console.error('DNS verification failed:', error);
    return false;
  }
}

/**
 * Provision SSL certificate for domain
 * Requirement #18: Trigger SSL certificate provisioning
 */
async function provisionSSLCertificate(domain: string): Promise<{ success: boolean; certPath?: string; error?: string }> {
  try {
    // TODO: In production, use Let's Encrypt or similar
    // Example with Certbot:
    // const certbot = spawn('certbot', ['certonly', '--webroot', '-d', domain, ...]);

    // Simulated SSL provisioning
    console.log(`Provisioning SSL certificate for ${domain}...`);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const certPath = `/etc/letsencrypt/live/${domain}/fullchain.pem`;

    return {
      success: true,
      certPath,
    };

  } catch (error) {
    console.error('SSL provisioning failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SSL provisioning failed',
    };
  }
}

/**
 * Revoke SSL certificate
 * Requirement #19: Revoke SSL cert when removing domain
 */
async function revokeSSLCertificate(domain: string, certPath: string | null): Promise<void> {
  try {
    // TODO: In production, revoke SSL certificate
    // Example with Certbot:
    // const certbot = spawn('certbot', ['revoke', '--cert-path', certPath, ...]);

    console.log(`Revoking SSL certificate for ${domain}...`);
    // Simulated
  } catch (error) {
    console.error('SSL revocation failed:', error);
  }
}

// ============================================================================
// POST /api/portfolios/:id/domains/:domainId/verify
// Requirements #15-18: Verify domain ownership and provision SSL
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, domainId } = params;

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

    // Find custom domain
    const domainIndex = customDomains.findIndex(
      (d) => d.id === domainId && d.portfolioId === portfolioId
    );

    if (domainIndex === -1) {
      return NextResponse.json(
        { error: 'Custom domain not found' },
        { status: 404 }
      );
    }

    const customDomain = customDomains[domainIndex];

    // Check if already verified
    if (customDomain.isVerified) {
      return NextResponse.json({
        message: 'Domain is already verified',
        domain: customDomain,
      });
    }

    // Requirement #16: Query DNS for TXT record matching verification token
    const isVerified = await checkDNSVerification(
      customDomain.domain,
      customDomain.verificationToken
    );

    if (!isVerified) {
      // Update last checked time
      customDomain.lastCheckedAt = new Date().toISOString();
      customDomain.updatedAt = new Date().toISOString();

      return NextResponse.json(
        {
          error: 'Domain verification failed',
          message: 'TXT record not found or does not match verification token. Please ensure DNS records are configured correctly and wait for propagation.',
          domain: customDomain.domain,
          expectedTxtRecord: {
            name: customDomain.dnsRecords?.verification.name,
            value: customDomain.verificationToken,
          },
        },
        { status: 400 }
      );
    }

    // Requirement #17: Set CustomDomain.isVerified=true, verifiedAt=now
    customDomain.isVerified = true;
    customDomain.verifiedAt = new Date().toISOString();
    customDomain.lastCheckedAt = new Date().toISOString();
    customDomain.updatedAt = new Date().toISOString();

    if (customDomain.dnsRecords) {
      customDomain.dnsRecords.verification.verified = true;
    }

    // Requirement #18: Trigger SSL certificate provisioning
    customDomain.sslStatus = 'PROVISIONING';

    const sslResult = await provisionSSLCertificate(customDomain.domain);

    if (sslResult.success) {
      customDomain.sslStatus = 'ACTIVE';
      customDomain.sslCertPath = sslResult.certPath || null;
    } else {
      customDomain.sslStatus = 'FAILED';
    }

    customDomain.updatedAt = new Date().toISOString();

    // TODO: Save to database
    customDomains[domainIndex] = customDomain;

    return NextResponse.json({
      message: 'Domain verified successfully',
      domain: customDomain,
      ssl: {
        status: customDomain.sslStatus,
        message: sslResult.success
          ? 'SSL certificate provisioned successfully'
          : `SSL provisioning failed: ${sslResult.error}`,
      },
    });

  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/portfolios/:id/domains/:domainId
// Requirement #19: Remove custom domain and revoke SSL cert
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, domainId } = params;

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

    // Find custom domain
    const domainIndex = customDomains.findIndex(
      (d) => d.id === domainId && d.portfolioId === portfolioId
    );

    if (domainIndex === -1) {
      return NextResponse.json(
        { error: 'Custom domain not found' },
        { status: 404 }
      );
    }

    const customDomain = customDomains[domainIndex];

    // Requirement #19: Revoke SSL certificate
    if (customDomain.sslStatus === 'ACTIVE' && customDomain.sslCertPath) {
      await revokeSSLCertificate(customDomain.domain, customDomain.sslCertPath);
    }

    // Remove from portfolio's custom domains array
    portfolio.customDomains = portfolio.customDomains.filter(
      (d) => d !== customDomain.domain
    );

    // Remove from database
    // TODO: await db.customDomain.delete({ where: { id: domainId } });
    customDomains.splice(domainIndex, 1);

    return NextResponse.json({
      message: 'Custom domain removed successfully',
      domain: customDomain.domain,
    });

  } catch (error) {
    console.error('Error removing custom domain:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
