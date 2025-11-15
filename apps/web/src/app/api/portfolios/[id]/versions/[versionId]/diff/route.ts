/**
 * Portfolio Version Diff API Route
 * Section 2.5: Version Control Endpoints
 *
 * GET /api/portfolios/:id/versions/:versionId/diff - Compare version to current state
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface Portfolio {
  id: string;
  userId: string;
  data: any;
}

interface PortfolioVersion {
  id: string;
  portfolioId: string;
  version: number;
  name: string | null;
  data: any;
  createdAt: string;
}

interface DiffChange {
  path: string[];
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
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

/**
 * Deep diff implementation (simplified)
 * Requirement #12: Use diff library (deep-diff or jsondiffpatch)
 *
 * In production, use actual library:
 * import { diff } from 'deep-diff';
 * import * as jsondiffpatch from 'jsondiffpatch';
 */
function deepDiff(oldObj: any, newObj: any, path: string[] = []): DiffChange[] {
  const changes: DiffChange[] = [];

  // Handle null/undefined
  if (oldObj === null || oldObj === undefined) {
    if (newObj !== null && newObj !== undefined) {
      changes.push({
        path,
        type: 'added',
        newValue: newObj,
      });
    }
    return changes;
  }

  if (newObj === null || newObj === undefined) {
    changes.push({
      path,
      type: 'removed',
      oldValue: oldObj,
    });
    return changes;
  }

  // Handle primitives
  if (typeof oldObj !== 'object' || typeof newObj !== 'object') {
    if (oldObj !== newObj) {
      changes.push({
        path,
        type: 'modified',
        oldValue: oldObj,
        newValue: newObj,
      });
    }
    return changes;
  }

  // Handle arrays
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLength = Math.max(oldObj.length, newObj.length);

    for (let i = 0; i < maxLength; i++) {
      if (i >= oldObj.length) {
        changes.push({
          path: [...path, i.toString()],
          type: 'added',
          newValue: newObj[i],
        });
      } else if (i >= newObj.length) {
        changes.push({
          path: [...path, i.toString()],
          type: 'removed',
          oldValue: oldObj[i],
        });
      } else {
        changes.push(...deepDiff(oldObj[i], newObj[i], [...path, i.toString()]));
      }
    }

    return changes;
  }

  // Handle objects
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    if (!(key in oldObj)) {
      changes.push({
        path: [...path, key],
        type: 'added',
        newValue: newObj[key],
      });
    } else if (!(key in newObj)) {
      changes.push({
        path: [...path, key],
        type: 'removed',
        oldValue: oldObj[key],
      });
    } else {
      changes.push(...deepDiff(oldObj[key], newObj[key], [...path, key]));
    }
  }

  return changes;
}

/**
 * Generate human-readable change summary
 */
function generateChangeSummary(changes: DiffChange[]): any {
  const summary = {
    totalChanges: changes.length,
    added: 0,
    removed: 0,
    modified: 0,
    sections: {} as Record<string, any>,
  };

  for (const change of changes) {
    // Count by type
    if (change.type === 'added') summary.added++;
    if (change.type === 'removed') summary.removed++;
    if (change.type === 'modified') summary.modified++;

    // Group by top-level section
    const section = change.path[0] || 'root';

    if (!summary.sections[section]) {
      summary.sections[section] = {
        added: 0,
        removed: 0,
        modified: 0,
        changes: [],
      };
    }

    summary.sections[section][change.type]++;
    summary.sections[section].changes.push({
      path: change.path.join('.'),
      type: change.type,
      ...(change.oldValue !== undefined && { oldValue: change.oldValue }),
      ...(change.newValue !== undefined && { newValue: change.newValue }),
    });
  }

  return summary;
}

// ============================================================================
// GET /api/portfolios/:id/versions/:versionId/diff
// Requirement #12: Compare version to current portfolio state
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const userId = getCurrentUserId(request);
    const { id: portfolioId, versionId } = params;

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

    // Find version
    const version = portfolioVersions.find(
      (v) => v.id === versionId && v.portfolioId === portfolioId
    );

    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Requirement #12: Use diff library to generate change summary
    // TODO: In production, use actual diff library
    // import * as jsondiffpatch from 'jsondiffpatch';
    // const delta = jsondiffpatch.diff(version.data, portfolio.data);
    // const changes = jsondiffpatch.formatters.jsonpatch.format(delta);

    const changes = deepDiff(version.data, portfolio.data);
    const summary = generateChangeSummary(changes);

    return NextResponse.json({
      comparison: {
        versionId: version.id,
        versionNumber: version.version,
        versionName: version.name,
        versionCreatedAt: version.createdAt,
        currentPortfolioState: 'latest',
      },
      summary,
      changes: changes.slice(0, 100), // Limit to first 100 changes in response
      hasMoreChanges: changes.length > 100,
      totalChanges: changes.length,
    });

  } catch (error) {
    console.error('Error generating diff:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
