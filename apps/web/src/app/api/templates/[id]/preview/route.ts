/**
 * Template Preview API Route
 * Section 2.2: Template Management Endpoints
 *
 * POST /api/templates/:id/preview - Generate template preview with sample data
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioTemplate {
  id: string;
  htmlTemplate: string | null;
  cssTemplate: string | null;
  jsTemplate: string | null;
  isActive: boolean;
}

// ============================================================================
// MOCK DATABASE
// ============================================================================

const templates: PortfolioTemplate[] = [
  {
    id: 'tpl-1',
    htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{name}} - Portfolio</title>
  <style>{{styles}}</style>
</head>
<body>
  <header class="hero">
    <h1>{{hero.title}}</h1>
    <p>{{hero.subtitle}}</p>
  </header>
  <section class="about">
    <h2>About Me</h2>
    <p>{{about.bio}}</p>
  </section>
  <section class="projects">
    <h2>Projects</h2>
    {{#each projects}}
    <div class="project">
      <h3>{{this.name}}</h3>
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </section>
  <footer class="contact">
    <p>Contact: {{contact.email}}</p>
  </footer>
  <script>{{scripts}}</script>
</body>
</html>
    `,
    cssTemplate: `
      body { font-family: Inter, sans-serif; margin: 0; padding: 0; }
      .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }
      .hero h1 { font-size: 3rem; margin: 0; }
      .hero p { font-size: 1.5rem; }
      .about, .projects, .contact { padding: 60px 20px; max-width: 1200px; margin: 0 auto; }
      .project { margin: 20px 0; padding: 20px; border-left: 4px solid #667eea; }
      .contact { background: #f7fafc; text-align: center; }
    `,
    jsTemplate: `
      console.log('Portfolio loaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM ready');
      });
    `,
    isActive: true,
  },
];

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleData = {
  name: 'John Doe',
  hero: {
    title: 'John Doe',
    subtitle: 'Full Stack Developer',
    tagline: 'Building amazing web experiences',
  },
  about: {
    bio: 'I am a passionate full-stack developer with 5+ years of experience building web applications. I specialize in React, Node.js, and cloud technologies.',
  },
  experience: [
    {
      company: 'Tech Corp',
      role: 'Senior Developer',
      startDate: '2020-01-01',
      endDate: null,
      current: true,
      description: 'Leading development of cloud-based applications',
      technologies: ['React', 'Node.js', 'AWS'],
    },
  ],
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform with payment integration and inventory management.',
      technologies: ['React', 'Express', 'MongoDB'],
      link: 'https://example.com',
      featured: true,
    },
    {
      name: 'Task Management App',
      description: 'Collaborative task management tool with real-time updates.',
      technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
      link: 'https://example.com',
      featured: true,
    },
  ],
  skills: [
    { name: 'JavaScript', proficiency: 5, category: 'Programming' },
    { name: 'React', proficiency: 5, category: 'Frontend' },
    { name: 'Node.js', proficiency: 4, category: 'Backend' },
    { name: 'AWS', proficiency: 4, category: 'Cloud' },
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2014-09-01',
      endDate: '2018-06-01',
    },
  ],
  contact: {
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe' },
      { platform: 'github', url: 'https://github.com/johndoe' },
    ],
  },
};

// ============================================================================
// TEMPLATE RENDERING
// ============================================================================

/**
 * Simple template renderer (supports basic {{variable}} and {{#each}} syntax)
 * In production, use a proper template engine like Handlebars or Mustache
 */
function renderTemplate(template: string, data: any): string {
  let rendered = template;

  // Handle {{#each}} blocks
  const eachRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  rendered = rendered.replace(eachRegex, (match, arrayName, blockContent) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';

    return array
      .map((item) => {
        let itemContent = blockContent;
        // Replace {{this.property}}
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (_, prop) => {
          return item[prop] || '';
        });
        return itemContent;
      })
      .join('');
  });

  // Handle simple {{variable}} replacements
  rendered = rendered.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
    return value !== undefined && value !== null ? String(value) : '';
  });

  return rendered;
}

// ============================================================================
// POST /api/templates/:id/preview
// Requirement #12: Generate preview with sample data
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Parse optional custom data from request body
    let customData = sampleData;
    try {
      const body = await request.json();
      if (body.data) {
        customData = { ...sampleData, ...body.data };
      }
    } catch {
      // Use default sample data if no body provided
    }

    // TODO: Replace with actual database query
    // const template = await db.portfolioTemplate.findUnique({
    //   where: { id },
    //   select: {
    //     htmlTemplate: true,
    //     cssTemplate: true,
    //     jsTemplate: true,
    //     isActive: true,
    //   },
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

    if (!template.htmlTemplate) {
      return NextResponse.json(
        { error: 'Template has no HTML content' },
        { status: 400 }
      );
    }

    // Render template with sample data
    const renderedHtml = renderTemplate(template.htmlTemplate, {
      ...customData,
      styles: template.cssTemplate || '',
      scripts: template.jsTemplate || '',
    });

    // Return rendered HTML
    return new NextResponse(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Template-Id': id,
      },
    });

  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
