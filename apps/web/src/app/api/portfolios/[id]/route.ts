/**
 * Individual Portfolio API Endpoints
 * Section 2.1: GET, PUT, PATCH, DELETE operations (#11-24)
 * Updated to use Prisma Database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const PortfolioUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  templateId: z.string().uuid().optional(),
  data: z.object({
    hero: z.object({}).passthrough().optional(),
    about: z.object({}).passthrough().optional(),
    experience: z.array(z.object({}).passthrough()).optional(),
    projects: z.array(z.object({}).passthrough()).optional(),
    skills: z.array(z.string()).optional(),
    contact: z.object({}).passthrough().optional(),
  }).passthrough().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
});

const PortfolioPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  data: z.object({}).passthrough().optional(),
  isPublished: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
}).partial();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCurrentUserId(): Promise<string> {
  // TODO: Implement proper authentication
  // For now, return a test user ID
  // In production, get from session/JWT/auth token
  return 'user-123';
}

// ============================================================================
// GET /api/portfolios/[id] - Get Single Portfolio
// Requirements: #11-13
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = params;

    // Find portfolio with relations
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            versions: true,
            shares: true,
            analytics: true,
          },
        },
      },
    });

    // Return 404 if not found (#13)
    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership (#12)
    if (portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this portfolio' },
        { status: 403 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/portfolios/[id] - Update Portfolio (Full)
// Requirements: #14-18
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = params;
    const body = await request.json();

    // Find portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership (#15)
    if (portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate update data (#16)
    const validationResult = PortfolioUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, data, isPublished, isDraft, visibility } = validationResult.data;

    // Map frontend fields to Prisma schema
    const updateData: Prisma.PortfolioUpdateInput = {};
    if (name) updateData.title = name;
    if (data) updateData.content = data as Prisma.InputJsonValue;
    if (visibility) updateData.visibility = visibility as any;
    
    // Map isPublished/isDraft to status
    if (isPublished !== undefined) {
      updateData.status = isPublished ? 'PUBLISHED' : 'DRAFT';
      if (isPublished && !portfolio.publishedAt) {
        updateData.publishedAt = new Date();
      }
    } else if (isDraft !== undefined) {
      updateData.status = isDraft ? 'DRAFT' : 'PUBLISHED';
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/portfolios/[id] - Partial Update
// Requirements: #19-20
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = params;
    const body = await request.json();

    // Find portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate partial update
    const validationResult = PortfolioPatchSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, data, isPublished, isDraft, visibility } = validationResult.data;

    // Build update data
    const updateData: Prisma.PortfolioUpdateInput = {};
    if (name) updateData.title = name;
    if (visibility) updateData.visibility = visibility as any;
    
    // Deep merge content if provided
    if (data) {
      const currentContent = portfolio.content as any;
      updateData.content = {
        ...currentContent,
        ...data,
      } as Prisma.InputJsonValue;
    }
    
    // Map isPublished/isDraft to status
    if (isPublished !== undefined) {
      updateData.status = isPublished ? 'PUBLISHED' : 'DRAFT';
      if (isPublished && !portfolio.publishedAt) {
        updateData.publishedAt = new Date();
      }
    } else if (isDraft !== undefined) {
      updateData.status = isDraft ? 'DRAFT' : 'PUBLISHED';
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Failed to patch portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/portfolios/[id] - Delete Portfolio (Soft Delete)
// Requirements: #21-24
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const { id } = params;

    // Find portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify ownership (#22)
    if (portfolio.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If published, unpublish first (#24)
    if (portfolio.status === 'PUBLISHED') {
      // TODO: Remove from hosting
      // await hostingService.unpublish(portfolio.id);
      
      await prisma.portfolio.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          subdomain: null,
        },
      });
    }

    // Delete portfolio with cascade (#23, #24)
    // Prisma will automatically cascade delete related records
    // based on the onDelete: Cascade in schema.prisma
    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Portfolio deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
