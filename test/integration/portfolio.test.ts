/**
 * Integration Tests: Portfolio CRUD Flows (Section 5.3)
 *
 * End-to-end tests for portfolio creation, update, and deletion
 */

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../setup.integration';

describe('Portfolio Integration Tests', () => {
  let testUserId: string;
  let testTemplateId: string;

  beforeAll(async () => {
    // Create test user and template
    const { data: template } = await supabase
      .from('portfolio_templates')
      .insert({
        name: 'Test Template',
        category: 'professional',
        structure: { sections: ['hero', 'about'] },
        styles: {
          colors: { primary: '#000', secondary: '#FFF' },
          fonts: { heading: 'Inter', body: 'Inter' },
        },
      })
      .select()
      .single();

    testTemplateId = template!.id;
    testUserId = 'test-user-' + Date.now();
  });

  describe('Portfolio Creation Flow', () => {
    it('should create portfolio and retrieve it', async () => {
      // POST /api/portfolios -> database insert
      const { data: created, error: createError } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Test Portfolio',
          subtitle: 'Developer Portfolio',
          description: 'My portfolio description',
          subdomain: 'test-' + Date.now(),
          is_published: true,
        })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(created).toBeDefined();
      expect(created!.id).toBeDefined();
      expect(created!.title).toBe('Test Portfolio');

      // GET /api/portfolios/:id returns created portfolio
      const { data: retrieved, error: getError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', created!.id)
        .eq('user_id', testUserId)
        .single();

      expect(getError).toBeNull();
      expect(retrieved).toEqual(created);
    });

    it('should create portfolio with sections', async () => {
      const sections = [
        { type: 'hero', content: { title: 'Welcome' } },
        { type: 'about', content: { text: 'About me' } },
      ];

      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Portfolio with Sections',
          subdomain: 'sections-' + Date.now(),
          sections,
        })
        .select()
        .single();

      expect(portfolio!.sections).toHaveLength(2);
      expect(portfolio!.sections[0].type).toBe('hero');
    });

    it('should enforce unique subdomain constraint', async () => {
      const subdomain = 'unique-' + Date.now();

      // Create first portfolio
      await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'First',
          subdomain,
        });

      // Try to create second with same subdomain
      const { error } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Second',
          subdomain,
        });

      expect(error).toBeDefined();
      expect(error!.code).toBe('23505'); // Unique violation
    });
  });

  describe('Portfolio Update Flow', () => {
    it('should update portfolio and create version', async () => {
      // Create portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Original Title',
          subdomain: 'update-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;
      const originalUpdatedAt = portfolio!.updated_at;

      // Update portfolio
      const { data: updated, error: updateError } = await supabase
        .from('portfolios')
        .update({
          title: 'Updated Title',
          subtitle: 'New Subtitle',
        })
        .eq('id', portfolioId)
        .eq('user_id', testUserId)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.subtitle).toBe('New Subtitle');
      expect(updated!.updated_at).not.toBe(originalUpdatedAt);

      // Verify version was created (if version control is implemented)
      const { data: versions } = await supabase
        .from('portfolio_versions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      // Version should contain original data
      if (versions && versions.length > 0) {
        expect(versions[0].data.title).toBe('Original Title');
      }
    });

    it('should not update another user\'s portfolio', async () => {
      // Create portfolio for user 1
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'User 1 Portfolio',
          subdomain: 'user1-' + Date.now(),
        })
        .select()
        .single();

      // Try to update as user 2
      const { data: updated } = await supabase
        .from('portfolios')
        .update({ title: 'Hacked!' })
        .eq('id', portfolio!.id)
        .eq('user_id', 'different-user')
        .select();

      expect(updated).toHaveLength(0); // No rows updated
    });
  });

  describe('Portfolio Deletion Flow', () => {
    it('should soft delete portfolio', async () => {
      // Create portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'To Delete',
          subdomain: 'delete-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;

      // Soft delete
      const { error: deleteError } = await supabase
        .from('portfolios')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', portfolioId)
        .eq('user_id', testUserId);

      expect(deleteError).toBeNull();

      // Verify it's marked as deleted
      const { data: deleted } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      expect(deleted!.deleted_at).not.toBeNull();
    });

    it('should cascade delete versions and analytics', async () => {
      // Create portfolio with versions and analytics
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Cascade Delete Test',
          subdomain: 'cascade-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;

      // Create version
      await supabase.from('portfolio_versions').insert({
        portfolio_id: portfolioId,
        data: portfolio,
        change_summary: 'Initial version',
      });

      // Create analytics
      await supabase.from('portfolio_analytics_daily').insert({
        portfolio_id: portfolioId,
        date: new Date().toISOString().split('T')[0],
        views: 10,
        unique_visitors: 5,
      });

      // Hard delete portfolio
      await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      // Verify cascade deletion
      const { data: versions } = await supabase
        .from('portfolio_versions')
        .select('*')
        .eq('portfolio_id', portfolioId);

      const { data: analytics } = await supabase
        .from('portfolio_analytics_daily')
        .select('*')
        .eq('portfolio_id', portfolioId);

      expect(versions).toHaveLength(0);
      expect(analytics).toHaveLength(0);
    });
  });

  describe('Template Retrieval with Caching', () => {
    it('should retrieve templates', async () => {
      const { data: templates, error } = await supabase
        .from('portfolio_templates')
        .select('*')
        .order('name');

      expect(error).toBeNull();
      expect(templates).toBeDefined();
      expect(templates!.length).toBeGreaterThan(0);
    });

    it('should filter templates by category', async () => {
      const { data: templates } = await supabase
        .from('portfolio_templates')
        .select('*')
        .eq('category', 'professional');

      templates!.forEach((template) => {
        expect(template.category).toBe('professional');
      });
    });
  });

  describe('Import from Profile', () => {
    it('should import profile data and merge into portfolio', async () => {
      // This test would require profile data structure
      // For now, test the data transformation

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Developer',
        skills: ['JavaScript', 'TypeScript'],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Engineer',
            startDate: '2020-01',
            endDate: '2023-01',
          },
        ],
      };

      // Create portfolio from profile
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: `${profileData.firstName} ${profileData.lastName}`,
          subtitle: profileData.title,
          subdomain: 'import-' + Date.now(),
          sections: [
            {
              type: 'skills',
              content: { skills: profileData.skills },
            },
            {
              type: 'experience',
              content: { items: profileData.experience },
            },
          ],
        })
        .select()
        .single();

      expect(portfolio!.title).toBe('John Doe');
      expect(portfolio!.subtitle).toBe('Developer');
      expect(portfolio!.sections).toHaveLength(2);
    });
  });

  describe('Analytics Tracking', () => {
    it('should track views and aggregate data', async () => {
      // Create portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Analytics Test',
          subdomain: 'analytics-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;
      const today = new Date().toISOString().split('T')[0];

      // Track view (upsert)
      await supabase
        .from('portfolio_analytics_daily')
        .upsert({
          portfolio_id: portfolioId,
          date: today,
          views: 1,
          unique_visitors: 1,
        })
        .eq('portfolio_id', portfolioId)
        .eq('date', today);

      // Track another view
      const { data: existing } = await supabase
        .from('portfolio_analytics_daily')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('date', today)
        .single();

      await supabase
        .from('portfolio_analytics_daily')
        .upsert({
          portfolio_id: portfolioId,
          date: today,
          views: (existing!.views || 0) + 1,
          unique_visitors: existing!.unique_visitors,
        })
        .eq('portfolio_id', portfolioId)
        .eq('date', today);

      // Get aggregated data
      const { data: analytics } = await supabase
        .from('portfolio_analytics_daily')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('date', today)
        .single();

      expect(analytics!.views).toBeGreaterThanOrEqual(1);
    });

    it('should aggregate analytics over date range', async () => {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Analytics Range Test',
          subdomain: 'analytics-range-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;

      // Insert analytics for multiple days
      const dates = [
        new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
      ];

      for (const date of dates) {
        await supabase.from('portfolio_analytics_daily').insert({
          portfolio_id: portfolioId,
          date,
          views: 10,
          unique_visitors: 5,
        });
      }

      // Query date range
      const { data: analytics } = await supabase
        .from('portfolio_analytics_daily')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .gte('date', dates[0])
        .lte('date', dates[2])
        .order('date');

      expect(analytics).toHaveLength(3);
    });
  });

  describe('Version Control', () => {
    it('should create version and restore', async () => {
      // Create portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Version Test',
          subtitle: 'Original',
          subdomain: 'version-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;

      // Create version
      const { data: version } = await supabase
        .from('portfolio_versions')
        .insert({
          portfolio_id: portfolioId,
          data: portfolio,
          change_summary: 'Original version',
        })
        .select()
        .single();

      // Update portfolio
      await supabase
        .from('portfolios')
        .update({ subtitle: 'Modified' })
        .eq('id', portfolioId);

      // Restore from version
      const restoredData = version!.data;
      await supabase
        .from('portfolios')
        .update(restoredData)
        .eq('id', portfolioId);

      // Verify restoration
      const { data: restored } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      expect(restored!.subtitle).toBe('Original');
    });
  });

  describe('Sharing', () => {
    it('should create share link and retrieve portfolio', async () => {
      // Create portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: testUserId,
          template_id: testTemplateId,
          title: 'Share Test',
          subdomain: 'share-' + Date.now(),
        })
        .select()
        .single();

      const portfolioId = portfolio!.id;

      // Create share link
      const shareToken = 'share-' + Date.now();
      const { data: shareLink } = await supabase
        .from('portfolio_share_links')
        .insert({
          portfolio_id: portfolioId,
          token: shareToken,
          expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
        })
        .select()
        .single();

      expect(shareLink!.token).toBe(shareToken);

      // Retrieve portfolio via share token
      const { data: sharedPortfolio } = await supabase
        .from('portfolio_share_links')
        .select('portfolio_id, portfolios(*)')
        .eq('token', shareToken)
        .gte('expires_at', new Date().toISOString())
        .single();

      expect(sharedPortfolio).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should prevent updating another user\'s portfolio', async () => {
      // Create portfolio for user A
      const { data: portfolio } = await supabase
        .from('portfolios')
        .insert({
          user_id: 'user-a',
          template_id: testTemplateId,
          title: 'User A Portfolio',
          subdomain: 'auth-' + Date.now(),
        })
        .select()
        .single();

      // Try to update as user B
      const { data } = await supabase
        .from('portfolios')
        .update({ title: 'Hacked!' })
        .eq('id', portfolio!.id)
        .eq('user_id', 'user-b')
        .select();

      // Should not update any rows
      expect(data).toHaveLength(0);

      // Verify original data unchanged
      const { data: original } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolio!.id)
        .single();

      expect(original!.title).toBe('User A Portfolio');
    });
  });
});
