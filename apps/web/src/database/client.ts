/**
 * Database Client
 * Section 3: Database Schema
 *
 * Supabase client configuration and helpers
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Portfolio,
  PortfolioTemplate,
  PortfolioVersion,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  PortfolioData,
} from './types';

/**
 * Database schema interface for Supabase
 */
export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: Portfolio;
        Insert: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Portfolio, 'id' | 'createdAt'>>;
      };
      portfolio_templates: {
        Row: PortfolioTemplate;
        Insert: Omit<PortfolioTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;
        Update: Partial<Omit<PortfolioTemplate, 'id' | 'createdAt'>>;
      };
      portfolio_versions: {
        Row: PortfolioVersion;
        Insert: Omit<PortfolioVersion, 'id' | 'createdAt'>;
        Update: never; // Versions are immutable
      };
    };
    Functions: {
      get_next_portfolio_version: {
        Args: { p_portfolio_id: string };
        Returns: number;
      };
      restore_portfolio_version: {
        Args: { p_portfolio_id: string; p_version: number };
        Returns: boolean;
      };
      compare_portfolio_versions: {
        Args: { p_portfolio_id: string; p_version1: number; p_version2: number };
        Returns: Array<{
          field: string;
          version1_value: any;
          version2_value: any;
          is_different: boolean;
        }>;
      };
      get_portfolio_version_history: {
        Args: { p_portfolio_id: string; p_limit?: number };
        Returns: Array<{
          version: number;
          name: string | null;
          created_at: string;
          created_by: string | null;
          changes_summary: string;
        }>;
      };
      increment_template_usage: {
        Args: { template_uuid: string };
        Returns: void;
      };
    };
  };
}

/**
 * Create typed Supabase client
 */
export const createSupabaseClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};

/**
 * Create Supabase client with service role (for admin operations)
 */
export const createSupabaseServiceClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase service role environment variables'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Singleton Supabase client
 */
let supabase: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabase) {
    supabase = createSupabaseClient();
  }
  return supabase;
};

/**
 * Database helper functions
 */
export class DatabaseHelpers {
  private client: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client || getSupabaseClient();
  }

  /**
   * Generate unique slug from name
   */
  async generateUniqueSlug(name: string, userId: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200);

    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists
    while (true) {
      const { data } = await this.client
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .eq('slug', slug)
        .single();

      if (!data) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate subdomain availability
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const { data } = await this.client
      .from('portfolios')
      .select('id')
      .eq('subdomain', subdomain)
      .is('deleted_at', null)
      .single();

    return !data;
  }

  /**
   * Get portfolio with template
   */
  async getPortfolioWithTemplate(portfolioId: string) {
    const { data, error } = await this.client
      .from('portfolios')
      .select(`
        *,
        template:portfolio_templates(*)
      `)
      .eq('id', portfolioId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get portfolio version history
   */
  async getVersionHistory(portfolioId: string, limit: number = 10) {
    const { data, error } = await this.client.rpc('get_portfolio_version_history', {
      p_portfolio_id: portfolioId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Restore portfolio to specific version
   */
  async restoreVersion(portfolioId: string, version: number): Promise<boolean> {
    const { data, error } = await this.client.rpc('restore_portfolio_version', {
      p_portfolio_id: portfolioId,
      p_version: version,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Compare two versions
   */
  async compareVersions(portfolioId: string, version1: number, version2: number) {
    const { data, error } = await this.client.rpc('compare_portfolio_versions', {
      p_portfolio_id: portfolioId,
      p_version1: version1,
      p_version2: version2,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete portfolio
   */
  async softDeletePortfolio(portfolioId: string): Promise<void> {
    const { error } = await this.client
      .from('portfolios')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', portfolioId);

    if (error) throw error;
  }

  /**
   * Restore soft deleted portfolio
   */
  async restorePortfolio(portfolioId: string): Promise<void> {
    const { error } = await this.client
      .from('portfolios')
      .update({ deleted_at: null })
      .eq('id', portfolioId);

    if (error) throw error;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(portfolioId: string): Promise<void> {
    const { error } = await this.client.rpc('increment_view_count', {
      portfolio_id: portfolioId,
    });

    // If RPC doesn't exist, fallback to update
    if (error) {
      const { data: portfolio } = await this.client
        .from('portfolios')
        .select('view_count')
        .eq('id', portfolioId)
        .single();

      if (portfolio) {
        await this.client
          .from('portfolios')
          .update({
            view_count: (portfolio.view_count || 0) + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('id', portfolioId);
      }
    }
  }

  /**
   * Get published portfolios
   */
  async getPublishedPortfolios(limit: number = 20, offset: number = 0) {
    const { data, error } = await this.client
      .from('portfolios')
      .select('*')
      .eq('is_published', true)
      .eq('visibility', 'PUBLIC')
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Get user portfolios
   */
  async getUserPortfolios(userId: string, includeDeleted: boolean = false) {
    let query = this.client
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Get active templates
   */
  async getActiveTemplates(category?: string) {
    let query = this.client
      .from('portfolio_templates')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
}

/**
 * Export singleton instance
 */
export const db = new DatabaseHelpers();
