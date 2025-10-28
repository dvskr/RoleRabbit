/**
 * Static Site Generator for Portfolio Websites
 * Generates static HTML/CSS/JS from portfolio data
 */

const fs = require('fs').promises;
const path = require('path');

class StaticSiteGenerator {
  /**
   * Generate static portfolio website
   */
  async generateWebsite(portfolioData, outputDir) {
    const { name, description, data, templateId } = portfolioData;
    
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Generate HTML
    const html = this.generateHTML(portfolioData);
    await fs.writeFile(path.join(outputDir, 'index.html'), html);
    
    // Generate CSS
    const css = this.generateCSS(templateId);
    await fs.writeFile(path.join(outputDir, 'styles.css'), css);
    
    // Generate JS
    const js = this.generateJS();
    await fs.writeFile(path.join(outputDir, 'script.js'), js);
    
    console.log(`Website generated in ${outputDir}`);
  }

  /**
   * Generate HTML structure
   */
  generateHTML(portfolioData) {
    const { name, description, data } = portfolioData;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>${name}</h1>
        <p>${description || ''}</p>
    </header>
    <main id="portfolio-content">
        ${this.generateSections(data.sections || [])}
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>`;
  }

  /**
   * Generate sections
   */
  generateSections(sections) {
    return sections.map(section => `
      <section id="${section.id}">
        <h2>${section.title}</h2>
        ${this.generateSectionContent(section)}
      </section>
    `).join('\n');
  }

  /**
   * Generate section content
   */
  generateSectionContent(section) {
    if (section.type === 'experience') {
      return section.items.map(item => `
        <div class="experience-item">
          <h3>${item.title} at ${item.company}</h3>
          <p>${item.description}</p>
        </div>
      `).join('\n');
    }
    
    if (section.type === 'projects') {
      return section.items.map(project => `
        <div class="project-item">
          <h3>${project.name}</h3>
          <p>${project.description}</p>
        </div>
      `).join('\n');
    }
    
    return '';
  }

  /**
   * Generate CSS
   */
  generateCSS(templateId) {
    const templates = {
      modern: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
        header { background: #4A90E2; color: white; padding: 2rem; text-align: center; }
        main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        section { margin-bottom: 3rem; }
        h2 { color: #4A90E2; margin-bottom: 1rem; }
      `,
      classic: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: "Times New Roman", serif; line-height: 1.8; color: #222; }
        header { border-bottom: 3px solid #000; padding: 2rem; }
        main { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        section { margin-bottom: 2rem; }
        h2 { border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
      `
    };

    return templates[templateId] || templates.modern;
  }

  /**
   * Generate JavaScript
   */
  generateJS() {
    return `
      // Portfolio website script
      console.log('Portfolio website loaded');
      
      // Add interactivity
      document.addEventListener('DOMContentLoaded', () => {
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      });
    `;
  }
}

module.exports = StaticSiteGenerator;

