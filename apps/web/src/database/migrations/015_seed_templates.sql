-- ============================================================================
-- Migration: 015_seed_templates
-- Section 3.10: Seed Portfolio Templates (DB-054, DB-055, DB-056)
-- ============================================================================
-- Description: Seed portfolio_templates table with 4 initial templates
-- Run in: Supabase SQL Editor (run AFTER migration 014)
-- ============================================================================

-- ============================================================================
-- DB-054, DB-055, DB-056: Seed 4 initial templates
-- ============================================================================

-- Modern Template
INSERT INTO portfolio_templates (
  name,
  slug,
  description,
  category,
  thumbnail,
  preview_url,
  html_template,
  css_template,
  js_template,
  config,
  default_data,
  is_premium,
  is_active
) VALUES (
  'Modern',
  'modern',
  'Clean and modern portfolio with bold typography and minimalist design',
  'MODERN',
  '/templates/modern/thumbnail.jpg',
  '/templates/modern/preview',
  -- HTML Template
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{name}} - {{title}}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a href="#home" class="nav-link">Home</a>
        <a href="#about" class="nav-link">About</a>
        <a href="#experience" class="nav-link">Experience</a>
        <a href="#projects" class="nav-link">Projects</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
    </div>
  </header>

  <section id="home" class="hero">
    <div class="container">
      {{#if avatar}}
      <img src="{{avatar}}" alt="{{name}}" class="hero-avatar">
      {{/if}}
      <h1 class="hero-title">{{name}}</h1>
      <p class="hero-subtitle">{{title}}</p>
      {{#if tagline}}
      <p class="hero-tagline">{{tagline}}</p>
      {{/if}}
      <div class="hero-cta">
        <a href="#contact" class="btn btn-primary">Get in Touch</a>
        <a href="#projects" class="btn btn-secondary">View Work</a>
      </div>
    </div>
  </section>

  <section id="about" class="section">
    <div class="container">
      <h2 class="section-title">About Me</h2>
      <div class="about-content">
        <p class="about-bio">{{bio}}</p>
      </div>
    </div>
  </section>

  <section id="experience" class="section bg-light">
    <div class="container">
      <h2 class="section-title">Experience</h2>
      <div class="timeline">
        {{#each experience}}
        <div class="timeline-item">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <h3>{{title}}</h3>
            <p class="company">{{company}}</p>
            <p class="period">{{startDate}} - {{#if current}}Present{{else}}{{endDate}}{{/if}}</p>
            <p class="description">{{description}}</p>
          </div>
        </div>
        {{/each}}
      </div>
    </div>
  </section>

  <section id="projects" class="section">
    <div class="container">
      <h2 class="section-title">Projects</h2>
      <div class="projects-grid">
        {{#each projects}}
        <div class="project-card">
          {{#if image}}
          <img src="{{image}}" alt="{{name}}" class="project-image">
          {{/if}}
          <h3>{{name}}</h3>
          <p>{{description}}</p>
          {{#if url}}
          <a href="{{url}}" class="project-link">View Project →</a>
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>

  <section id="contact" class="section bg-dark">
    <div class="container">
      <h2 class="section-title">Get in Touch</h2>
      <div class="contact-info">
        {{#if email}}
        <p><a href="mailto:{{email}}">{{email}}</a></p>
        {{/if}}
        {{#if social.linkedin}}
        <a href="{{social.linkedin}}" class="social-link">LinkedIn</a>
        {{/if}}
        {{#if social.github}}
        <a href="{{social.github}}" class="social-link">GitHub</a>
        {{/if}}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p>&copy; {{year}} {{name}}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>',
  -- CSS Template
  ':root {
  --primary: #2563eb;
  --secondary: #64748b;
  --accent: #0ea5e9;
  --background: #ffffff;
  --text: #1e293b;
  --text-light: #64748b;
  --border: #e2e8f0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--background);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
}

.nav {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 0;
}

.nav-link {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary);
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 0;
}

.hero-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 2rem;
  border: 4px solid var(--primary);
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.hero-tagline {
  font-size: 1.125rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
}

.btn-secondary {
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
}

.section {
  padding: 6rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
}

.bg-light {
  background: #f8fafc;
}

.bg-dark {
  background: #0f172a;
  color: white;
}

.bg-dark .section-title {
  color: white;
}

.timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  position: relative;
  padding-left: 3rem;
  padding-bottom: 3rem;
  border-left: 2px solid var(--border);
}

.timeline-item:last-child {
  border-left: none;
}

.timeline-marker {
  position: absolute;
  left: -9px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary);
  border: 3px solid white;
}

.timeline-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.company {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.period {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.project-card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.project-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.project-card h3 {
  padding: 1.5rem 1.5rem 0.5rem;
  font-size: 1.25rem;
}

.project-card p {
  padding: 0 1.5rem 1rem;
  color: var(--text-light);
}

.project-link {
  display: inline-block;
  padding: 0 1.5rem 1.5rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.contact-info {
  text-align: center;
  font-size: 1.125rem;
}

.contact-info a {
  color: var(--accent);
  text-decoration: none;
  margin: 0 1rem;
}

.footer {
  background: #0f172a;
  color: white;
  text-align: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .nav {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}',
  -- JS Template
  'document.addEventListener("DOMContentLoaded", function() {
  // Smooth scrolling for anchor links
  document.querySelectorAll(''a[href^="#"]'').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Add current year to footer
  const yearElement = document.querySelector(".footer");
  if (yearElement) {
    yearElement.innerHTML = yearElement.innerHTML.replace("{{year}}", new Date().getFullYear());
  }

  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  document.querySelectorAll(".timeline-item, .project-card").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s, transform 0.6s";
    observer.observe(el);
  });
});',
  -- Config
  jsonb_build_object(
    'sections', ARRAY['hero', 'about', 'experience', 'projects', 'contact'],
    'colorSchemes', jsonb_build_array(
      jsonb_build_object('name', 'Blue', 'primary', '#2563eb', 'secondary', '#64748b', 'accent', '#0ea5e9', 'background', '#ffffff', 'text', '#1e293b'),
      jsonb_build_object('name', 'Purple', 'primary', '#7c3aed', 'secondary', '#64748b', 'accent', '#a78bfa', 'background', '#ffffff', 'text', '#1e293b'),
      jsonb_build_object('name', 'Green', 'primary', '#059669', 'secondary', '#64748b', 'accent', '#10b981', 'background', '#ffffff', 'text', '#1e293b')
    ),
    'fonts', jsonb_build_object('heading', 'Inter', 'body', 'Inter'),
    'layout', jsonb_build_object('maxWidth', '1200px', 'spacing', 'normal'),
    'features', jsonb_build_object('darkMode', false, 'animations', true, 'responsiveImages', true)
  ),
  -- Default Data
  jsonb_build_object(
    'about', jsonb_build_object('name', 'Your Name', 'title', 'Your Title', 'bio', 'Write a compelling bio about yourself here.'),
    'experience', jsonb_build_array(
      jsonb_build_object('title', 'Senior Developer', 'company', 'Tech Company', 'startDate', '2020-01', 'current', true, 'description', 'Led development of key features')
    ),
    'projects', jsonb_build_array(
      jsonb_build_object('name', 'Sample Project', 'description', 'A great project I worked on', 'url', 'https://example.com')
    ),
    'contact', jsonb_build_object('email', 'your.email@example.com')
  ),
  false, -- is_premium
  true   -- is_active
)
ON CONFLICT (slug) DO UPDATE SET
  html_template = EXCLUDED.html_template,
  css_template = EXCLUDED.css_template,
  js_template = EXCLUDED.js_template,
  config = EXCLUDED.config,
  updated_at = NOW();

-- Minimal Template
INSERT INTO portfolio_templates (
  name, slug, description, category, thumbnail, preview_url,
  html_template, css_template, js_template, config, default_data, is_premium, is_active
) VALUES (
  'Minimal',
  'minimal',
  'Minimalist portfolio with focus on content and white space',
  'MINIMAL',
  '/templates/minimal/thumbnail.jpg',
  '/templates/minimal/preview',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{{name}}</title><link rel="stylesheet" href="styles.css"></head><body><main><h1>{{name}}</h1><p class="subtitle">{{title}}</p><section><h2>About</h2><p>{{bio}}</p></section><section><h2>Work</h2>{{#each experience}}<div class="work-item"><h3>{{title}}</h3><p>{{company}}</p></div>{{/each}}</section></main></body></html>',
  'body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.8}h1{font-size:3rem;margin-bottom:0.5rem}h2{font-size:1.5rem;margin:3rem 0 1rem;border-bottom:1px solid #eee;padding-bottom:0.5rem}.subtitle{color:#666;font-size:1.25rem}.work-item{margin:2rem 0}',
  null,
  jsonb_build_object('sections', ARRAY['about', 'work'], 'colorSchemes', jsonb_build_array(jsonb_build_object('name', 'Classic', 'primary', '#000000', 'background', '#ffffff', 'text', '#333333'))),
  jsonb_build_object('about', jsonb_build_object('name', 'Your Name', 'title', 'Your Title', 'bio', 'Your bio here.')),
  false, true
)
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

-- Creative Template
INSERT INTO portfolio_templates (
  name, slug, description, category, thumbnail, preview_url,
  html_template, css_template, js_template, config, default_data, is_premium, is_active
) VALUES (
  'Creative',
  'creative',
  'Bold and creative portfolio with vibrant colors and unique layouts',
  'CREATIVE',
  '/templates/creative/thumbnail.jpg',
  '/templates/creative/preview',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{{name}}</title><link rel="stylesheet" href="styles.css"></head><body><div class="grid"><div class="hero"><h1>{{name}}</h1><p>{{tagline}}</p></div><div class="projects">{{#each projects}}<div class="project-card" style="background:{{color}}"><h3>{{name}}</h3><p>{{description}}</p></div>{{/each}}</div></div></body></html>',
  'body{margin:0;font-family:Arial,sans-serif}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;padding:1rem}.hero{grid-column:1/-1;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:4rem;text-align:center}.project-card{padding:2rem;color:white;min-height:200px}',
  null,
  jsonb_build_object('sections', ARRAY['hero', 'projects']),
  jsonb_build_object('about', jsonb_build_object('name', 'Your Name', 'tagline', 'Creative Professional')),
  false, true
)
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

-- Professional Template
INSERT INTO portfolio_templates (
  name, slug, description, category, thumbnail, preview_url,
  html_template, css_template, js_template, config, default_data, is_premium, is_active
) VALUES (
  'Professional',
  'professional',
  'Traditional professional portfolio perfect for corporate careers',
  'PROFESSIONAL',
  '/templates/professional/thumbnail.jpg',
  '/templates/professional/preview',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>{{name}} - {{title}}</title><link rel="stylesheet" href="styles.css"></head><body><header><div class="container"><h1>{{name}}</h1><p>{{title}}</p></div></header><section class="summary"><div class="container"><h2>Professional Summary</h2><p>{{bio}}</p></div></section><section class="experience"><div class="container"><h2>Experience</h2>{{#each experience}}<div class="exp-item"><h3>{{title}}</h3><p class="company">{{company}}</p><p class="period">{{startDate}} - {{#if current}}Present{{else}}{{endDate}}{{/if}}</p><p>{{description}}</p></div>{{/each}}</div></section></body></html>',
  'body{margin:0;font-family:"Segoe UI",Tahoma,sans-serif;color:#333;line-height:1.6}.container{max-width:900px;margin:0 auto;padding:0 2rem}header{background:#2c3e50;color:white;padding:3rem 0;text-align:center}header h1{margin:0;font-size:2.5rem}header p{margin:0.5rem 0 0;font-size:1.25rem;opacity:0.9}section{padding:3rem 0}h2{color:#2c3e50;border-bottom:3px solid #3498db;padding-bottom:0.5rem;margin-bottom:2rem}.exp-item{margin-bottom:2rem}.company{color:#3498db;font-weight:600;margin:0.5rem 0}.period{color:#7f8c8d;font-size:0.9rem;margin:0.5rem 0}',
  null,
  jsonb_build_object('sections', ARRAY['summary', 'experience'], 'colorSchemes', jsonb_build_array(jsonb_build_object('name', 'Corporate', 'primary', '#2c3e50', 'accent', '#3498db', 'background', '#ffffff', 'text', '#333333'))),
  jsonb_build_object('about', jsonb_build_object('name', 'Your Name', 'title', 'Professional Title', 'bio', 'Professional summary here.')),
  false, true
)
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

-- Log the seeding
DO $$
BEGIN
  RAISE NOTICE 'Seeded 4 portfolio templates: Modern, Minimal, Creative, Professional';
END $$;

-- ============================================================================
-- Update migrated portfolios to use default template
-- ============================================================================

UPDATE portfolios
SET template_id = (
  SELECT id FROM portfolio_templates
  WHERE slug = 'modern'
  LIMIT 1
)
WHERE template_id IS NULL
  AND created_at >= NOW() - INTERVAL '1 hour'; -- Only recently migrated portfolios

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Verify templates:
-- SELECT name, slug, category, is_active, usage_count
-- FROM portfolio_templates
-- ORDER BY created_at;
