-- ============================================================================
-- Migration: 002_create_portfolio_templates_table
-- Section 3.2: Portfolio Template Tables
-- ============================================================================
-- Description: Create portfolio_templates table with all columns, constraints, and indexes
-- Run in: Supabase SQL Editor (run AFTER 001_create_portfolios_table.sql)
-- ============================================================================

-- Create enum type for template category
-- Requirement #1: category enum
CREATE TYPE template_category AS ENUM (
  'PROFESSIONAL',
  'CREATIVE',
  'MINIMAL',
  'MODERN',
  'CLASSIC',
  'PORTFOLIO',
  'RESUME',
  'LANDING_PAGE',
  'BLOG',
  'OTHER'
);

-- ============================================================================
-- Create portfolio_templates table
-- Requirement #1: Create portfolio_templates table with all specified columns
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_templates (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic information (Requirement #1)
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT,

  -- Categorization (Requirement #1)
  category template_category NOT NULL DEFAULT 'OTHER',

  -- Media (Requirement #1)
  thumbnail VARCHAR(500),
  preview_url VARCHAR(500),

  -- Template content (Requirement #1)
  html_template TEXT NOT NULL,
  css_template TEXT NOT NULL,
  js_template TEXT,

  -- Configuration (Requirement #1)
  config JSONB DEFAULT '{}',
  default_data JSONB DEFAULT '{}',

  -- Premium status (Requirement #1)
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Usage tracking (Requirement #1)
  usage_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps (Requirement #1)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Add constraints
-- ============================================================================

-- Requirement #2: Unique constraint on name
ALTER TABLE portfolio_templates
  ADD CONSTRAINT unique_template_name UNIQUE (name);

-- Requirement #3: Unique constraint on slug
ALTER TABLE portfolio_templates
  ADD CONSTRAINT unique_template_slug UNIQUE (slug);

-- Additional constraints
ALTER TABLE portfolio_templates
  ADD CONSTRAINT valid_template_name
  CHECK (char_length(name) >= 1 AND char_length(name) <= 200);

ALTER TABLE portfolio_templates
  ADD CONSTRAINT valid_template_slug
  CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

ALTER TABLE portfolio_templates
  ADD CONSTRAINT valid_usage_count
  CHECK (usage_count >= 0);

-- ============================================================================
-- Add indexes
-- ============================================================================

-- Requirement #4: Index on category
CREATE INDEX idx_portfolio_templates_category
  ON portfolio_templates (category);

-- Requirement #5: Index on isActive (active templates only)
CREATE INDEX idx_portfolio_templates_active
  ON portfolio_templates (is_active)
  WHERE is_active = true;

-- Additional recommended indexes
CREATE INDEX idx_portfolio_templates_slug
  ON portfolio_templates (slug);

CREATE INDEX idx_portfolio_templates_is_premium
  ON portfolio_templates (is_premium);

CREATE INDEX idx_portfolio_templates_usage_count
  ON portfolio_templates (usage_count DESC);

CREATE INDEX idx_portfolio_templates_created_at
  ON portfolio_templates (created_at DESC);

-- ============================================================================
-- Create updated_at trigger
-- ============================================================================
CREATE TRIGGER update_portfolio_templates_updated_at
  BEFORE UPDATE ON portfolio_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Create function to increment usage count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolio_templates
  SET usage_count = usage_count + 1
  WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Add Row Level Security (RLS)
-- ============================================================================
ALTER TABLE portfolio_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
  ON portfolio_templates FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert templates
CREATE POLICY "Only admins can create templates"
  ON portfolio_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can update templates
CREATE POLICY "Only admins can update templates"
  ON portfolio_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Only admins can delete templates
CREATE POLICY "Only admins can delete templates"
  ON portfolio_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- Add comments for documentation
-- ============================================================================
COMMENT ON TABLE portfolio_templates IS 'Predefined templates for creating portfolios';
COMMENT ON COLUMN portfolio_templates.id IS 'Unique template identifier (UUID)';
COMMENT ON COLUMN portfolio_templates.name IS 'Template name (must be unique)';
COMMENT ON COLUMN portfolio_templates.slug IS 'URL-friendly identifier (must be unique)';
COMMENT ON COLUMN portfolio_templates.category IS 'Template category for filtering';
COMMENT ON COLUMN portfolio_templates.html_template IS 'HTML template with placeholders';
COMMENT ON COLUMN portfolio_templates.css_template IS 'CSS styles for the template';
COMMENT ON COLUMN portfolio_templates.js_template IS 'Optional JavaScript for interactivity';
COMMENT ON COLUMN portfolio_templates.config IS 'Template configuration (e.g., available sections, color schemes)';
COMMENT ON COLUMN portfolio_templates.default_data IS 'Default data structure for this template';
COMMENT ON COLUMN portfolio_templates.is_premium IS 'Whether this template requires premium subscription';
COMMENT ON COLUMN portfolio_templates.usage_count IS 'Number of portfolios using this template';

-- ============================================================================
-- Insert seed templates
-- ============================================================================
INSERT INTO portfolio_templates (name, slug, category, html_template, css_template, description, is_active)
VALUES
  (
    'Minimal Professional',
    'minimal-professional',
    'MINIMAL',
    '<!DOCTYPE html><html><head><title>{{name}}</title></head><body><header><h1>{{name}}</h1><p>{{title}}</p></header><main>{{content}}</main></body></html>',
    'body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; } header { text-align: center; margin-bottom: 3rem; }',
    'Clean and minimal professional portfolio template',
    true
  ),
  (
    'Modern Creative',
    'modern-creative',
    'MODERN',
    '<!DOCTYPE html><html><head><title>{{name}}</title></head><body><div class="container"><section class="hero">{{hero}}</section><section class="projects">{{projects}}</section></div></body></html>',
    '.container { max-width: 1200px; margin: 0 auto; } .hero { min-height: 100vh; display: flex; align-items: center; }',
    'Modern and creative portfolio with bold typography',
    true
  ),
  (
    'Classic Resume',
    'classic-resume',
    'RESUME',
    '<!DOCTYPE html><html><head><title>{{name}} - Resume</title></head><body><div class="resume"><section class="summary">{{summary}}</section><section class="experience">{{experience}}</section></div></body></html>',
    '.resume { max-width: 900px; margin: 0 auto; font-family: Georgia, serif; } section { margin: 2rem 0; }',
    'Traditional resume-style portfolio',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Verify migration
-- ============================================================================
-- SELECT COUNT(*) as template_count FROM portfolio_templates;
-- SELECT * FROM portfolio_templates ORDER BY created_at DESC;
