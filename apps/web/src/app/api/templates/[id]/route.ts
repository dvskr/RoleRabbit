/**
 * Individual Template API Routes
 * Section 2.2: Template Management Endpoints
 *
 * GET /api/templates/:id - Get single template with full details
 * PUT /api/templates/:id - Update template (admin only)
 * DELETE /api/templates/:id - Soft delete template (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES (Duplicated for clarity - in production, import from shared types)
// ============================================================================

type TemplateCategory = 'DEVELOPER' | 'DESIGNER' | 'MARKETING' | 'BUSINESS' | 'CREATIVE' | 'ACADEMIC' | 'GENERAL';

interface PortfolioTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: TemplateCategory;
  thumbnail: string | null;
  previewUrl: string | null;
  htmlTemplate: string | null;
  cssTemplate: string | null;
  jsTemplate: string | null;
  config: any;
  defaultData: any;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const TemplateUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(['DEVELOPER', 'DESIGNER', 'MARKETING', 'BUSINESS', 'CREATIVE', 'ACADEMIC', 'GENERAL']).optional(),
  thumbnail: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  htmlTemplate: z.string().optional(),
  cssTemplate: z.string().optional(),
  jsTemplate: z.string().optional(),
  config: z.any().optional(),
  defaultData: z.any().optional(),
  isPremium: z.boolean().optional(),
});

// ============================================================================
// MOCK DATABASE (Same as route.ts)
// ============================================================================

const templates: PortfolioTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Modern Developer',
    slug: 'modern-developer',
    description: 'A clean, modern template for software developers',
    category: 'DEVELOPER',
    thumbnail: 'https://via.placeholder.com/400x300',
    previewUrl: 'https://example.com/preview/modern-developer',
    htmlTemplate: '<div class="portfolio">{{content}}</div>',
    cssTemplate: '.portfolio { font-family: Inter, sans-serif; }',
    jsTemplate: 'console.log("Portfolio loaded");',
    config: {
      sections: ['hero', 'about', 'experience', 'projects', 'skills', 'contact'],
      colorSchemes: [{ name: 'default', primary: '#3B82F6', secondary: '#1E40AF' }],
      fonts: [{ name: 'default', headingFont: 'Inter', bodyFont: 'Inter' }],
      layouts: [{ name: 'default', description: 'Single column layout' }],
      customizableElements: ['colors', 'fonts', 'sections'],
    },
    defaultData: {},
    isPremium: false,
    isActive: true,
    usageCount: 245,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// ============================================================================
// CACHE SIMULATION
// ============================================================================

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

function setCache<T>(key: string, data: T, ttlSeconds: number = 3600): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isAdmin(userId: string): boolean {
  return userId === 'admin-user-id'; // Mock
}

function getCurrentUserId(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'anonymous';
}

// ============================================================================
// GET /api/templates/:id
// Requirements #5-6: Get template with full details and caching
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Requirement #6: Check cache first (TTL: 1 hour)
    const cacheKey = `template:${id}`;
    const cachedTemplate = getCache<PortfolioTemplate>(cacheKey);

    if (cachedTemplate) {
      return NextResponse.json({
        template: cachedTemplate,
        cached: true,
      });
    }

    // TODO: Replace with actual database query
    // const template = await db.portfolioTemplate.findUnique({
    //   where: { id },
    // });

    const template = templates.find((t) => t.id === id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.isActive) {
      return NextResponse.json(
        { error: 'Template is not active' },
        { status: 404 }
      );
    }

    // Requirement #5: Return full template including htmlTemplate, cssTemplate, jsTemplate
    // Cache the result (1 hour TTL)
    setCache(cacheKey, template, 3600);

    return NextResponse.json({
      template,
      cached: false,
    });

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/templates/:id
// Requirement #10: Update template (admin only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);

    // Validate admin role
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const validation = TemplateUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Find template
    const templateIndex = templates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const existingTemplate = templates[templateIndex];

    // Check for slug/name uniqueness if being updated
    if (data.slug || data.name) {
      const conflictingTemplate = templates.find(
        (t) => t.id !== id && (
          (data.slug && t.slug === data.slug) ||
          (data.name && t.name === data.name)
        )
      );

      if (conflictingTemplate) {
        return NextResponse.json(
          {
            error: 'Conflict - Slug or name already in use',
            details: {
              slug: conflictingTemplate.slug === data.slug ? 'Slug already in use' : undefined,
              name: conflictingTemplate.name === data.name ? 'Name already in use' : undefined,
            },
          },
          { status: 409 }
        );
      }
    }

    // TODO: Replace with actual database update
    // const updatedTemplate = await db.portfolioTemplate.update({
    //   where: { id },
    //   data: {
    //     ...data,
    //     updatedAt: new Date(),
    //   },
    // });

    const updatedTemplate: PortfolioTemplate = {
      ...existingTemplate,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    templates[templateIndex] = updatedTemplate;

    // Clear all template caches
    clearCache('template');
    clearCache('templates:list');

    return NextResponse.json({
      template: updatedTemplate,
      message: 'Template updated successfully',
    });

  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/templates/:id
// Requirement #11: Soft delete template (admin only)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getCurrentUserId(request);

    // Validate admin role
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Find template
    const templateIndex = templates.findIndex((t) => t.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // TODO: Replace with actual database update
    // await db.portfolioTemplate.update({
    //   where: { id },
    //   data: {
    //     isActive: false,
    //     updatedAt: new Date(),
    //   },
    // });

    // Soft delete: Set isActive to false
    templates[templateIndex] = {
      ...templates[templateIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    // Clear all template caches
    clearCache('template');
    clearCache('templates:list');

    return NextResponse.json({
      message: 'Template deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
