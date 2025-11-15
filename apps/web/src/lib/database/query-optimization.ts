/**
 * Database Query Optimization Utilities
 * Section 2.14: Performance Optimizations
 *
 * Requirement #3: Ensure all foreign key columns have indexes
 * Requirement #4: Use SELECT with field list instead of SELECT *
 * Requirement #5: Use pagination on all list endpoints
 * Requirement #10: Configure database connection pooling
 */

import { logger } from '@/lib/logger/logger';

/**
 * Pagination parameters
 * Requirement #5: Pagination on all list endpoints
 */
export interface PaginationParams {
  page?: number; // Page number (1-indexed)
  limit?: number; // Items per page
  offset?: number; // Direct offset (alternative to page)
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Default pagination limits
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Parse pagination parameters
 * Requirement #5: Pagination to prevent loading thousands of records
 */
export const parsePaginationParams = (
  params: PaginationParams
): { limit: number; offset: number; page: number } => {
  let { page = 1, limit = DEFAULT_PAGE_SIZE, offset } = params;

  // Ensure page is at least 1
  page = Math.max(1, Math.floor(page));

  // Ensure limit is within bounds
  limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit)));

  // Calculate offset from page if not provided
  if (offset === undefined) {
    offset = (page - 1) * limit;
  } else {
    offset = Math.max(0, Math.floor(offset));
  }

  return { limit, offset, page };
};

/**
 * Create paginated result
 */
export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Field selection utility
 * Requirement #4: Use SELECT with field list instead of SELECT *
 */
export interface FieldSelection {
  include?: string[]; // Fields to include
  exclude?: string[]; // Fields to exclude
}

/**
 * Sensitive fields that should be excluded by default
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'apiKey',
  'secretKey',
  'accessToken',
  'refreshToken',
  'privateKey',
];

/**
 * Filter object fields based on selection
 */
export const selectFields = <T extends Record<string, any>>(
  obj: T,
  selection?: FieldSelection
): Partial<T> => {
  const result: Partial<T> = {};

  // If include is specified, only include those fields
  if (selection?.include && selection.include.length > 0) {
    for (const field of selection.include) {
      if (field in obj) {
        result[field as keyof T] = obj[field];
      }
    }
    return result;
  }

  // Otherwise, include all except excluded fields
  const excludeSet = new Set([
    ...(selection?.exclude || []),
    ...SENSITIVE_FIELDS, // Always exclude sensitive fields
  ]);

  for (const [key, value] of Object.entries(obj)) {
    if (!excludeSet.has(key)) {
      result[key as keyof T] = value;
    }
  }

  return result;
};

/**
 * Filter array of objects
 */
export const selectFieldsArray = <T extends Record<string, any>>(
  arr: T[],
  selection?: FieldSelection
): Partial<T>[] => {
  return arr.map(obj => selectFields(obj, selection));
};

/**
 * Common field selections
 */
export const FieldSelections = {
  // Portfolio public fields
  PORTFOLIO_PUBLIC: {
    include: [
      'id',
      'userId',
      'name',
      'slug',
      'subdomain',
      'templateId',
      'data',
      'isPublished',
      'publishedAt',
      'createdAt',
      'updatedAt',
    ],
  },

  // Portfolio minimal fields (for listings)
  PORTFOLIO_MINIMAL: {
    include: ['id', 'name', 'slug', 'isPublished', 'createdAt', 'updatedAt'],
  },

  // User public fields
  USER_PUBLIC: {
    include: ['id', 'email', 'name', 'role', 'createdAt'],
  },

  // Template fields
  TEMPLATE_PUBLIC: {
    include: [
      'id',
      'name',
      'description',
      'thumbnail',
      'category',
      'isPremium',
      'createdAt',
    ],
  },
};

/**
 * Database index recommendations
 * Requirement #3: Ensure all foreign key columns have indexes
 *
 * SQL to create indexes:
 */
export const INDEX_RECOMMENDATIONS = `
-- Requirement #3: Index all foreign key columns

-- Portfolios table
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_template_id ON portfolios(template_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_subdomain ON portfolios(subdomain);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_published ON portfolios(is_published);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

-- Portfolio versions table
CREATE INDEX IF NOT EXISTS idx_portfolio_versions_portfolio_id ON portfolio_versions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_versions_created_by ON portfolio_versions(created_by);

-- Portfolio shares table
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_portfolio_id ON portfolio_shares(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_token ON portfolio_shares(token);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_expires_at ON portfolio_shares(expires_at);

-- Portfolio analytics table
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_date ON portfolio_analytics(date);

-- Custom domains table
CREATE INDEX IF NOT EXISTS idx_custom_domains_portfolio_id ON custom_domains(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_is_verified ON custom_domains(is_verified);

-- Deployments table
CREATE INDEX IF NOT EXISTS idx_deployments_portfolio_id ON deployments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);

-- Templates table
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON templates(is_premium);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_portfolios_user_published ON portfolios(user_id, is_published);
CREATE INDEX IF NOT EXISTS idx_analytics_portfolio_date ON portfolio_analytics(portfolio_id, date DESC);
`;

/**
 * Supabase connection pool configuration
 * Requirement #10: Configure database connection pool size
 *
 * In your Supabase client initialization:
 */
export const SUPABASE_POOL_CONFIG = {
  // Connection pooling is handled by Supavisor (automatic in Supabase)
  // Configure in Supabase dashboard: Database > Connection Pooling

  // Recommended settings:
  // - Session mode: For serverless (Next.js API routes)
  // - Transaction mode: For long-running processes
  // - Pool size: 15 (default, adjust based on load)

  // For local development with Prisma:
  // datasource db {
  //   provider = "postgresql"
  //   url      = env("DATABASE_URL")
  //   pool {
  //     connection_limit = 10
  //     timeout          = 20
  //   }
  // }
};

/**
 * Query performance logger
 */
export const logSlowQuery = (
  query: string,
  duration: number,
  threshold: number = 1000 // 1 second
): void => {
  if (duration > threshold) {
    logger.warn('Slow query detected', {
      query,
      duration,
      threshold,
    });
  }
};

/**
 * Execute query with timing
 */
export const executeWithTiming = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();

  try {
    const result = await queryFn();
    const duration = Date.now() - start;

    logSlowQuery(queryName, duration);

    logger.debug('Query executed', { queryName, duration });

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Query failed', { queryName, duration, error });
    throw error;
  }
};

/**
 * Batch query helper
 * Prevents N+1 query problems
 */
export const batchQuery = async <T, K extends keyof T>(
  items: T[],
  key: K,
  fetchFn: (ids: T[K][]) => Promise<Record<string, any>>
): Promise<Map<T[K], any>> => {
  if (items.length === 0) {
    return new Map();
  }

  const ids = items.map(item => item[key]);
  const uniqueIds = Array.from(new Set(ids));

  const results = await fetchFn(uniqueIds);

  const map = new Map<T[K], any>();
  for (const [id, data] of Object.entries(results)) {
    map.set(id as T[K], data);
  }

  return map;
};

/**
 * Example usage:
 *
 * // Pagination
 * const { limit, offset, page } = parsePaginationParams({ page: 2, limit: 20 });
 * const portfolios = await fetchPortfolios(limit, offset);
 * const total = await countPortfolios();
 * const result = createPaginatedResult(portfolios, total, page, limit);
 *
 * // Field selection
 * const publicPortfolios = selectFieldsArray(portfolios, FieldSelections.PORTFOLIO_PUBLIC);
 *
 * // Query timing
 * const data = await executeWithTiming('fetch-portfolios', async () => {
 *   return await supabase.from('portfolios').select('*').limit(20);
 * });
 */
