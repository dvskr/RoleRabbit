/**
 * Deployment Status API Route
 * Section 2.4: Publishing & Deployment Endpoints
 *
 * GET /api/portfolios/:id/deploy/:deploymentId - Get deployment status
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK';

interface Deployment {
  id: string;
  portfolioId: string;
  status: DeploymentStatus;
  subdomain: string;
  deployedUrl: string | null;
  buildLog: string | null;
  errorMessage: string | null;
  currentStep: string | null;
  percentageComplete: number;
  buildDuration: number | null;
  deployedBy: string | null;
  deployedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MOCK DATABASE (Same as deploy route)
// ============================================================================

const deployments: Deployment[] = [];

// ============================================================================
// GET /api/portfolios/:id/deploy/:deploymentId
// Requirements #8-9: Get deployment status with detailed progress
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; deploymentId: string } }
) {
  try {
    const { id: portfolioId, deploymentId } = params;

    // Find deployment
    // TODO: Replace with actual database query
    // const deployment = await db.deployment.findUnique({
    //   where: { id: deploymentId, portfolioId },
    // });

    const deployment = deployments.find(
      (d) => d.id === deploymentId && d.portfolioId === portfolioId
    );

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Requirement #8: Return current deployment status
    // Requirement #9: Return detailed progress
    const response = {
      deploymentId: deployment.id,
      portfolioId: deployment.portfolioId,
      status: deployment.status,
      currentStep: deployment.currentStep,
      percentageComplete: deployment.percentageComplete,
      errorMessage: deployment.errorMessage,
      buildLog: deployment.buildLog,
      deployedUrl: deployment.deployedUrl,
      buildDuration: deployment.buildDuration,
      deployedBy: deployment.deployedBy,
      deployedAt: deployment.deployedAt,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching deployment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
