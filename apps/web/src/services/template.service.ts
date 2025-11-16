/**
 * Template Service
 * Section 2.11: Service Layer Implementation
 *
 * Requirements #6-8: TemplateService class
 */

import { TemplateNotFoundError, ValidationError } from '@/lib/errors';
import { Portfolio, PortfolioData } from './portfolio.service';

/**
 * Template structure
 */
export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  layout: string;
  isPremium: boolean;
  isPublished: boolean;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  sections: TemplateSectionConfig[];
  customCss?: string;
}

export interface TemplateSectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  required: boolean;
  order: number;
  title?: string;
}

/**
 * Mock templates database
 */
const templates: Template[] = [];

/**
 * Template Service
 * Requirement #6: Create TemplateService class with 4 methods
 */
export class TemplateService {
  /**
   * Get template by ID
   */
  async findById(templateId: string): Promise<Template | null> {
    // TODO: In production, query database
    // return await db.template.findUnique({
    //   where: { id: templateId, isPublished: true },
    // });

    const template = templates.find(
      (t) => t.id === templateId && t.isPublished
    );

    return template || null;
  }

  /**
   * List all published templates
   */
  async findAll(filters?: {
    category?: string;
    isPremium?: boolean;
  }): Promise<Template[]> {
    let results = templates.filter((t) => t.isPublished);

    if (filters?.category) {
      results = results.filter((t) => t.category === filters.category);
    }

    if (filters?.isPremium !== undefined) {
      results = results.filter((t) => t.isPremium === filters.isPremium);
    }

    return results;
  }

  /**
   * Requirement #7: Render template with portfolio data
   * Replace template placeholders with portfolio data using template engine
   */
  async render(template: Template, portfolioData: PortfolioData): Promise<string> {
    // TODO: In production, use Handlebars or Mustache
    // import Handlebars from 'handlebars';
    // const compiledTemplate = Handlebars.compile(template.htmlContent);
    // return compiledTemplate(portfolioData);

    // For now, simple placeholder replacement
    let html = this.getTemplateHtml(template);

    // Replace placeholders with actual data
    html = this.replacePlaceholders(html, portfolioData);

    return html;
  }

  /**
   * Requirement #8: Validate portfolio data completeness
   * Check if portfolio.data has all sections required by template.config
   */
  async validateDataCompleteness(
    template: Template,
    portfolioData: PortfolioData
  ): Promise<{
    isValid: boolean;
    missingFields: string[];
  }> {
    const missingFields: string[] = [];

    // Get required sections from template config
    const requiredSections = template.sections.filter((s) => s.required);

    for (const section of requiredSections) {
      const sectionData = this.getSectionData(portfolioData, section.type);

      if (!sectionData) {
        missingFields.push(section.type);
        continue;
      }

      // Check if section has data
      if (Array.isArray(sectionData) && sectionData.length === 0) {
        missingFields.push(`${section.type} (empty array)`);
      } else if (
        typeof sectionData === 'object' &&
        Object.keys(sectionData).length === 0
      ) {
        missingFields.push(`${section.type} (empty object)`);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Apply template to portfolio
   */
  async applyToPortfolio(
    templateId: string,
    portfolioData: PortfolioData
  ): Promise<{
    renderedHtml: string;
    isDataComplete: boolean;
    missingFields: string[];
  }> {
    const template = await this.findById(templateId);

    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    // Validate data completeness
    const validation = await this.validateDataCompleteness(
      template,
      portfolioData
    );

    // Render template
    const renderedHtml = await this.render(template, portfolioData);

    return {
      renderedHtml,
      isDataComplete: validation.isValid,
      missingFields: validation.missingFields,
    };
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Get template HTML content
   */
  private getTemplateHtml(template: Template): string {
    // TODO: In production, load from database or file system
    // return template.htmlContent;

    // Mock template HTML with placeholders
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>{{about.fullName}} - Portfolio</title>
          <style>
            body {
              font-family: ${template.theme.fontFamily};
              background-color: ${template.theme.backgroundColor};
              color: ${template.theme.textColor};
            }
            .header {
              background-color: ${template.theme.primaryColor};
            }
            ${template.customCss || ''}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>{{about.fullName}}</h1>
            <p>{{about.title}}</p>
          </div>
          <section class="about">
            <h2>About</h2>
            <p>{{about.bio}}</p>
          </section>
          <section class="contact">
            <h2>Contact</h2>
            <p>Email: {{contact.email}}</p>
            <p>Phone: {{contact.phone}}</p>
          </section>
          <section class="projects">
            <h2>Projects</h2>
            {{#each projects}}
              <div class="project">
                <h3>{{title}}</h3>
                <p>{{description}}</p>
              </div>
            {{/each}}
          </section>
        </body>
      </html>
    `;
  }

  /**
   * Replace placeholders with portfolio data
   * Requirement #7: Template engine placeholder replacement
   */
  private replacePlaceholders(
    html: string,
    portfolioData: PortfolioData
  ): string {
    let result = html;

    // Replace simple placeholders: {{about.fullName}}
    result = result.replace(/\{\{about\.fullName\}\}/g, portfolioData.about?.fullName || '');
    result = result.replace(/\{\{about\.title\}\}/g, portfolioData.about?.title || '');
    result = result.replace(/\{\{about\.bio\}\}/g, portfolioData.about?.bio || '');
    result = result.replace(/\{\{contact\.email\}\}/g, portfolioData.contact?.email || '');
    result = result.replace(/\{\{contact\.phone\}\}/g, portfolioData.contact?.phone || '');

    // Replace array sections (simplified - production would use Handlebars)
    if (portfolioData.projects && portfolioData.projects.length > 0) {
      const projectsHtml = portfolioData.projects
        .map(
          (project) => `
            <div class="project">
              <h3>${project.title}</h3>
              <p>${project.description || ''}</p>
            </div>
          `
        )
        .join('');

      result = result.replace(
        /\{\{#each projects\}\}[\s\S]*?\{\{\/each\}\}/g,
        projectsHtml
      );
    } else {
      result = result.replace(/\{\{#each projects\}\}[\s\S]*?\{\{\/each\}\}/g, '');
    }

    // TODO: In production, use proper template engine
    // import Handlebars from 'handlebars';
    // const template = Handlebars.compile(html);
    // return template(portfolioData);

    return result;
  }

  /**
   * Get section data from portfolio
   */
  private getSectionData(
    portfolioData: PortfolioData,
    sectionType: string
  ): any {
    const sectionMap: Record<string, keyof PortfolioData> = {
      about: 'about',
      contact: 'contact',
      experience: 'experience',
      education: 'education',
      skills: 'skills',
      projects: 'projects',
      certifications: 'certifications',
    };

    const key = sectionMap[sectionType];
    return key ? portfolioData[key] : null;
  }
}
