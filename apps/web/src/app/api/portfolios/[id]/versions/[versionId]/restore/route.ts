/**
 * Portfolio Version Restore API Route
 * Section 2.5: Version Control Endpoints
 *
 * POST /api/portfolios/:id/versions/:versionId/restore - Restore portfolio to version
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  data: any;
  updatedAt: string;
  updatedBy: string | null;
  version: number;
}

interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: any;
  metadata: any;
  createdBy: string | null;
  createdAt: string;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const portfolios: Portfolio[] = [];
const portfolioVersions: PortfolioVersion[] = [];

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

function calculateDataSize(data: any): number {
  return JSON.stringify(data).length;
}

function getNextVersionNumber(portfolioId: string): number {
  const versions = portfolioVersions.filter((v) => v.portfolioId === portfolioId);

  if (versions.length === 0) {
    return 1;
  }

  const maxVersion = Math.max(...versions.map((v) => v.version));
  return maxVersion + 1;
}

// ============================================================================
// POST /api/portfolios/:id/versions/:versionId/restore
// Requirements #9-11: Restore portfolio to selected version
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, versionId } = params;

    // Find portfolio
    const portfolioIndex = portfolios.findIndex((p) => p.id === portfolioId);

    if (portfolioIndex === -1) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const portfolio = portfolios[portfolioIndex];

    // Verify ownership
    if (!verifyOwnership(portfolio, userId)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    // Find version to restore
    const versionToRestore = portfolioVersions.find(
      (v) => v.id === versionId && v.portfolioId === portfolioId
    );

    if (!versionToRestore) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Requirement #10: Create new version of current state before restoring (safety backup)
    const currentStateSnapshot = JSON.parse(JSON.stringify(portfolio.data));

    const safetyBackupVersion: PortfolioVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      version: getNextVersionNumber(portfolioId),
      name: `Before restore to v${versionToRestore.version}`,
      data: currentStateSnapshot,
      metadata: {
        changeDescription: `Automatic backup before restoring to version ${versionToRestore.version}`,
        tags: ['auto-backup', 'pre-restore'],
        isAutoSave: true,
        dataSize: calculateDataSize(currentStateSnapshot),
      },
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    portfolioVersions.push(safetyBackupVersion);

    // Requirement #11: Copy version.data to portfolio.data and update updatedAt
    const restoredData = JSON.parse(JSON.stringify(versionToRestore.data)); // Deep copy

    portfolios[portfolioIndex] = {
      ...portfolio,
      data: restoredData,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      version: portfolio.version + 1,
    };

    // TODO: Save to database
    // await db.$transaction([
    //   db.portfolioVersion.create({ data: safetyBackupVersion }),
    //   db.portfolio.update({
    //     where: { id: portfolioId },
    //     data: {
    //       data: restoredData,
    //       updatedAt: new Date(),
    //       updatedBy: userId,
    //       version: { increment: 1 },
    //     },
    //   }),
    // ]);

    return NextResponse.json({
      message: 'Portfolio restored successfully',
      portfolio: portfolios[portfolioIndex],
      restoredFrom: {
        versionId: versionToRestore.id,
        versionNumber: versionToRestore.version,
        versionName: versionToRestore.name,
        createdAt: versionToRestore.createdAt,
      },
      safetyBackup: {
        versionId: safetyBackupVersion.id,
        versionNumber: safetyBackupVersion.version,
        message: 'Created automatic backup of current state before restore',
      },
    });

  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
