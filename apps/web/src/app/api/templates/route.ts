/**
 * Portfolio Templates API Routes
 * Section 2.2: Template Management Endpoints
 *
 * GET /api/templates - List all active templates with category filter
 * POST /api/templates - Create new template (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// TYPES
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
  config: TemplateConfig | null;
  defaultData: any;
  isPremium: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateConfig {
  sections: string[];
  colorSchemes: any[];
  fonts: any[];
  layouts: any[];
  customizableElements: string[];
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const TemplateCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(1000).optional(),
  category: z.enum(['DEVELOPER', 'DESIGNER', 'MARKETING', 'BUSINESS', 'CREATIVE', 'ACADEMIC', 'GENERAL']),
  thumbnail: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  htmlTemplate: z.string().min(1),
  cssTemplate: z.string().min(1),
  jsTemplate: z.string().optional(),
  config: z.object({
    sections: z.array(z.string()),
    colorSchemes: z.array(z.any()),
    fonts: z.array(z.any()),
    layouts: z.array(z.any()),
    customizableElements: z.array(z.string()),
  }).optional(),
  defaultData: z.any().optional(),
  isPremium: z.boolean().optional(),
});

const TemplateListQuerySchema = z.object({
  category: z.enum(['DEVELOPER', 'DESIGNER', 'MARKETING', 'BUSINESS', 'CREATIVE', 'ACADEMIC', 'GENERAL']).optional(),
  isPremium: z.string().transform((val) => val === 'true').optional(),
});

// ============================================================================
// MOCK DATABASE
// ============================================================================

// TODO: Replace with actual database
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
  {
    id: 'tpl-2',
    name: 'Creative Portfolio',
    slug: 'creative-portfolio',
    description: 'Bold and creative template for designers and artists',
    category: 'DESIGNER',
    thumbnail: 'https://via.placeholder.com/400x300',
    previewUrl: 'https://example.com/preview/creative-portfolio',
    htmlTemplate: '<div class="creative-portfolio">{{content}}</div>',
    cssTemplate: '.creative-portfolio { background: linear-gradient(to right, #ff6b6b, #4ecdc4); }',
    jsTemplate: null,
    config: {
      sections: ['hero', 'about', 'projects', 'contact'],
      colorSchemes: [{ name: 'vibrant', primary: '#ff6b6b', secondary: '#4ecdc4' }],
      fonts: [{ name: 'creative', headingFont: 'Poppins', bodyFont: 'Roboto' }],
      layouts: [{ name: 'grid', description: 'Grid layout' }],
      customizableElements: ['colors', 'fonts'],
    },
    defaultData: {},
    isPremium: true,
    isActive: true,
    usageCount: 128,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
];

// ============================================================================
// CACHE SIMULATION (Replace with Redis in production)
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

/**
 * Check if user is admin (mock - replace with real auth)
 */
function isAdmin(userId: string): boolean {
  // TODO: Implement real admin check
  // Example: Check if user has admin role in database
  // const user = await db.user.findUnique({ where: { id: userId } });
  // return user?.role === 'ADMIN';
  return userId === 'admin-user-id'; // Mock
}

/**
 * Get current user ID from request (mock)
 */
function getCurrentUserId(request: NextRequest): string {
  // TODO: Implement real auth
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || 'anonymous';
}

/**
 * Strip full template content from response
 */
function stripTemplateContent(template: PortfolioTemplate): Omit<PortfolioTemplate, 'htmlTemplate' | 'cssTemplate' | 'jsTemplate'> {
  const { htmlTemplate, cssTemplate, jsTemplate, ...metadata } = template;
  return metadata;
}

// ============================================================================
// GET /api/templates
// Requirements #1-4: List templates with caching
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = TemplateListQuerySchema.safeParse({
      category: searchParams.get('category'),
      isPremium: searchParams.get('isPremium'),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.error.errors },
        { status: 400 }
      );
    }

    const { category, isPremium } = queryValidation.data;

    // Requirement #4: Check cache first (TTL: 1 hour)
    const cacheKey = `templates:list:${category || 'all'}:${isPremium ?? 'all'}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        templates: cachedData,
        cached: true,
      });
    }

    // TODO: Replace with actual database query
    // const activeTemplates = await db.portfolioTemplate.findMany({
    //   where: {
    //     isActive: true,
    //     ...(category && { category }),
    //     ...(isPremium !== undefined && { isPremium }),
    //   },
    //   orderBy: { usageCount: 'desc' },
    // });

    let filteredTemplates = templates.filter((t) => t.isActive);

    // Requirement #1: Apply category filter
    if (category) {
      filteredTemplates = filteredTemplates.filter((t) => t.category === category);
    }

    if (isPremium !== undefined) {
      filteredTemplates = filteredTemplates.filter((t) => t.isPremium === isPremium);
    }

    // Requirement #2-3: Return metadata only (exclude htmlTemplate, cssTemplate, jsTemplate)
    const templateMetadata = filteredTemplates.map(stripTemplateContent);

    // Requirement #4: Cache the result (1 hour TTL)
    setCache(cacheKey, templateMetadata, 3600);

    return NextResponse.json({
      templates: templateMetadata,
      total: templateMetadata.length,
      cached: false,
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/templates
// Requirements #7-9: Create template (admin only)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId(request);

    // Requirement #8: Validate admin role
    if (!isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = TemplateCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Requirement #9: Validate unique slug and name
    const existingTemplate = templates.find(
      (t) => t.slug === data.slug || t.name === data.name
    );

    if (existingTemplate) {
      return NextResponse.json(
        {
          error: 'Template already exists',
          details: {
            slug: existingTemplate.slug === data.slug ? 'Slug already in use' : undefined,
            name: existingTemplate.name === data.name ? 'Name already in use' : undefined,
          },
        },
        { status: 409 }
      );
    }

    // TODO: Replace with actual database insert
    // const newTemplate = await db.portfolioTemplate.create({
    //   data: {
    //     ...data,
    //     isActive: true,
    //     usageCount: 0,
    //   },
    // });

    const newTemplate: PortfolioTemplate = {
      id: `tpl-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      category: data.category,
      thumbnail: data.thumbnail || null,
      previewUrl: data.previewUrl || null,
      htmlTemplate: data.htmlTemplate,
      cssTemplate: data.cssTemplate,
      jsTemplate: data.jsTemplate || null,
      config: data.config || null,
      defaultData: data.defaultData || {},
      isPremium: data.isPremium || false,
      isActive: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(newTemplate);

    // Clear cache after creating new template
    clearCache('templates:list');

    return NextResponse.json(
      { template: newTemplate, message: 'Template created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
