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
  CustomDomain,
  PortfolioAnalytics,
  PortfolioShare,
  PortfolioDeployment,
  CreateCustomDomainInput,
  UpsertAnalyticsInput,
  CreateShareInput,
  StartDeploymentInput,
  AnalyticsSummary,
  ShareAccessValidation,
  DeploymentStats,
  DomainSSLRenewal,
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
      custom_domains: {
        Row: CustomDomain;
        Insert: Omit<CustomDomain, 'id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'lastCheckedAt' | 'verifiedAt'>;
        Update: Partial<Omit<CustomDomain, 'id' | 'createdAt'>>;
      };
      portfolio_analytics: {
        Row: PortfolioAnalytics;
        Insert: Omit<PortfolioAnalytics, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<PortfolioAnalytics, 'id' | 'createdAt'>>;
      };
      portfolio_shares: {
        Row: PortfolioShare;
        Insert: Omit<PortfolioShare, 'id' | 'createdAt' | 'viewCount' | 'lastAccessedAt'>;
        Update: Partial<Omit<PortfolioShare, 'id' | 'createdAt'>>;
      };
      portfolio_deployments: {
        Row: PortfolioDeployment;
        Insert: Omit<PortfolioDeployment, 'id' | 'createdAt' | 'deployedAt'>;
        Update: Partial<Omit<PortfolioDeployment, 'id' | 'createdAt'>>;
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
      verify_custom_domain: {
        Args: { p_domain_id: string; p_verified: boolean };
        Returns: void;
      };
      update_domain_ssl_status: {
        Args: { p_domain_id: string; p_status: string; p_cert_path?: string; p_expires_at?: string };
        Returns: void;
      };
      get_domains_needing_ssl_renewal: {
        Args: { p_days_before_expiry?: number };
        Returns: DomainSSLRenewal[];
      };
      upsert_portfolio_analytics: {
        Args: UpsertAnalyticsInput;
        Returns: void;
      };
      get_portfolio_analytics_summary: {
        Args: { p_portfolio_id: string; p_start_date: string; p_end_date: string };
        Returns: AnalyticsSummary;
      };
      create_portfolio_share: {
        Args: { p_portfolio_id: string; p_expires_in_days?: number; p_password?: string; p_max_views?: number };
        Returns: { id: string; token: string };
      };
      validate_share_access: {
        Args: { p_share_token: string; p_password?: string };
        Returns: ShareAccessValidation;
      };
      increment_share_view_count: {
        Args: { p_share_token: string };
        Returns: void;
      };
      start_deployment: {
        Args: { p_portfolio_id: string; p_deployed_by?: string };
        Returns: string; // deployment_id
      };
      update_deployment_status: {
        Args: { p_deployment_id: string; p_status: string; p_error?: string; p_url?: string; p_duration?: number };
        Returns: void;
      };
      complete_deployment: {
        Args: { p_deployment_id: string; p_success: boolean; p_url?: string; p_error?: string; p_duration?: number };
        Returns: void;
      };
      get_deployment_history: {
        Args: { p_portfolio_id: string; p_limit?: number };
        Returns: PortfolioDeployment[];
      };
      get_deployment_stats: {
        Args: { p_portfolio_id: string };
        Returns: DeploymentStats;
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

  // ============================================================================
  // Custom Domains (Section 3.4)
  // ============================================================================

  /**
   * Create a custom domain for a portfolio
   */
  async createCustomDomain(input: CreateCustomDomainInput): Promise<CustomDomain> {
    const verificationToken = input.verificationToken || this.generateVerificationToken();

    const { data, error } = await this.client
      .from('custom_domains')
      .insert({
        portfolio_id: input.portfolioId,
        domain: input.domain,
        verification_token: verificationToken,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Generate a unique verification token
   */
  private generateVerificationToken(): string {
    // Generate a random 32-character token
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  }

  /**
   * Get custom domains for a portfolio
   */
  async getPortfolioCustomDomains(portfolioId: string): Promise<CustomDomain[]> {
    const { data, error } = await this.client
      .from('custom_domains')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Verify a custom domain
   */
  async verifyCustomDomain(domainId: string, verified: boolean): Promise<void> {
    const { error } = await this.client.rpc('verify_custom_domain', {
      p_domain_id: domainId,
      p_verified: verified,
    });

    if (error) throw error;
  }

  /**
   * Update SSL status for a domain
   */
  async updateDomainSSLStatus(
    domainId: string,
    status: string,
    certPath?: string,
    expiresAt?: Date
  ): Promise<void> {
    const { error } = await this.client.rpc('update_domain_ssl_status', {
      p_domain_id: domainId,
      p_status: status,
      p_cert_path: certPath,
      p_expires_at: expiresAt?.toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Get domains needing SSL renewal
   */
  async getDomainsNeedingSSLRenewal(daysBeforeExpiry: number = 30): Promise<DomainSSLRenewal[]> {
    const { data, error } = await this.client.rpc('get_domains_needing_ssl_renewal', {
      p_days_before_expiry: daysBeforeExpiry,
    });

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // Analytics (Section 3.5)
  // ============================================================================

  /**
   * Upsert portfolio analytics data
   */
  async upsertAnalytics(input: UpsertAnalyticsInput): Promise<void> {
    const { error } = await this.client.rpc('upsert_portfolio_analytics', {
      p_portfolio_id: input.portfolioId,
      p_date: input.date.toISOString().split('T')[0], // DATE format
      p_views: input.views,
      p_unique_visitors: input.uniqueVisitors,
      p_avg_time_on_page: input.avgTimeOnPage,
      p_bounce_rate: input.bounceRate,
      p_referrer: input.referrer,
      p_country: input.country,
      p_device: input.device,
    });

    if (error) throw error;
  }

  /**
   * Get analytics summary for a portfolio
   */
  async getAnalyticsSummary(
    portfolioId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSummary> {
    const { data, error } = await this.client.rpc('get_portfolio_analytics_summary', {
      p_portfolio_id: portfolioId,
      p_start_date: startDate.toISOString().split('T')[0],
      p_end_date: endDate.toISOString().split('T')[0],
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get analytics for a specific date range
   */
  async getAnalyticsByDateRange(
    portfolioId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PortfolioAnalytics[]> {
    const { data, error } = await this.client
      .from('portfolio_analytics')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ============================================================================
  // Shares (Section 3.6)
  // ============================================================================

  /**
   * Create a share link for a portfolio
   */
  async createShareLink(input: CreateShareInput): Promise<{ id: string; token: string }> {
    const { data, error } = await this.client.rpc('create_portfolio_share', {
      p_portfolio_id: input.portfolioId,
      p_expires_in_days: input.expiresInDays,
      p_password: input.password,
      p_max_views: input.maxViews,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Validate share access
   */
  async validateShareAccess(
    shareToken: string,
    password?: string
  ): Promise<ShareAccessValidation> {
    const { data, error } = await this.client.rpc('validate_share_access', {
      p_share_token: shareToken,
      p_password: password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Increment share view count
   */
  async incrementShareViewCount(shareToken: string): Promise<void> {
    const { error } = await this.client.rpc('increment_share_view_count', {
      p_share_token: shareToken,
    });

    if (error) throw error;
  }

  /**
   * Get share links for a portfolio
   */
  async getPortfolioShares(portfolioId: string): Promise<PortfolioShare[]> {
    const { data, error } = await this.client
      .from('portfolio_shares')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Delete a share link
   */
  async deleteShareLink(shareId: string): Promise<void> {
    const { error } = await this.client
      .from('portfolio_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;
  }

  // ============================================================================
  // Deployments (Section 3.7)
  // ============================================================================

  /**
   * Start a new deployment
   */
  async startDeployment(input: StartDeploymentInput): Promise<string> {
    const { data, error } = await this.client.rpc('start_deployment', {
      p_portfolio_id: input.portfolioId,
      p_deployed_by: input.deployedBy,
    });

    if (error) throw error;
    return data; // Returns deployment_id
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    deploymentId: string,
    status: string,
    errorMessage?: string,
    deployedUrl?: string,
    buildDuration?: number
  ): Promise<void> {
    const { error } = await this.client.rpc('update_deployment_status', {
      p_deployment_id: deploymentId,
      p_status: status,
      p_error: errorMessage,
      p_url: deployedUrl,
      p_duration: buildDuration,
    });

    if (error) throw error;
  }

  /**
   * Complete a deployment
   */
  async completeDeployment(
    deploymentId: string,
    success: boolean,
    deployedUrl?: string,
    errorMessage?: string,
    buildDuration?: number
  ): Promise<void> {
    const { error } = await this.client.rpc('complete_deployment', {
      p_deployment_id: deploymentId,
      p_success: success,
      p_url: deployedUrl,
      p_error: errorMessage,
      p_duration: buildDuration,
    });

    if (error) throw error;
  }

  /**
   * Append log entry to deployment
   */
  async appendDeploymentLog(deploymentId: string, logEntry: string): Promise<void> {
    const { error } = await this.client.rpc('append_deployment_log', {
      p_deployment_id: deploymentId,
      p_log_entry: logEntry,
    });

    if (error) throw error;
  }

  /**
   * Get deployment history for a portfolio
   */
  async getDeploymentHistory(portfolioId: string, limit: number = 20): Promise<PortfolioDeployment[]> {
    const { data, error } = await this.client.rpc('get_deployment_history', {
      p_portfolio_id: portfolioId,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get deployment statistics for a portfolio
   */
  async getDeploymentStats(portfolioId: string): Promise<DeploymentStats> {
    const { data, error } = await this.client.rpc('get_deployment_stats', {
      p_portfolio_id: portfolioId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get a single deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<PortfolioDeployment> {
    const { data, error } = await this.client
      .from('portfolio_deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get latest deployment for a portfolio
   */
  async getLatestDeployment(portfolioId: string): Promise<PortfolioDeployment | null> {
    const { data, error } = await this.client
      .from('portfolio_deployments')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  }
}

/**
 * Export singleton instance
 */
export const db = new DatabaseHelpers();
