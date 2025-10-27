import { WebsiteConfig, Section } from '../../types/portfolio';
import JSZip from 'jszip';

export function generatePortfolioHTML(config: WebsiteConfig, portfolioData?: any): string {
  const sections = config.sections || [];
  const theme = config.theme || { templateId: 'minimal', primaryColor: '#3b82f6', colors: ['#3b82f6'] };

  const sectionsHTML = sections
    .filter(section => section.enabled)
    .map(section => generateSectionHTML(section, theme))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <style>
        ${generateCSS(theme, sections)}
    </style>
</head>
<body>
    <div class="portfolio-container">
        ${sectionsHTML}
    </div>
    <footer class="portfolio-footer">
        <p>&copy; ${new Date().getFullYear()} My Portfolio. All rights reserved.</p>
    </footer>
    <script>
        ${generateJavaScript()}
    </script>
</body>
</html>`;
}

function generateSectionHTML(section: Section, theme: any): string {
  const templateId = theme.templateId || 'minimal';
  
  switch (section.type) {
    case 'hero':
      // Different hero layouts based on template
      if (templateId === 'split-hero') {
        return `
<section class="hero-section split-hero">
    <div class="hero-split">
        <div class="hero-left">
            <h1>${section.config.headline || 'Welcome'}</h1>
            <p class="hero-subtitle">${section.config.subheading || 'A passionate developer'}</p>
        </div>
        <div class="hero-right">
            <div class="hero-visual">Portfolio</div>
        </div>
    </div>
    <div class="hero-cta">
        <button class="btn-primary">${section.config.ctaText || 'Contact Me'}</button>
        <button class="btn-secondary">${section.config.secondaryCta || 'View Resume'}</button>
    </div>
</section>`;
      }
      
      if (templateId === 'glassmorphism') {
        return `
<section class="hero-section glass-hero">
    <div class="glass-overlay">
        <h1>${section.config.headline || 'Welcome'}</h1>
        <p class="hero-subtitle">${section.config.subheading || 'A passionate developer'}</p>
        <div class="hero-cta">
            <button class="btn-glass">${section.config.ctaText || 'Contact Me'}</button>
        </div>
    </div>
</section>`;
      }
      
      if (templateId === 'neobrutalism') {
        return `
<section class="hero-section brutal-hero">
    <div class="brutal-box">
        <h1 class="brutal-text">${section.config.headline || 'DOE'}</h1>
        <p>${section.config.subheading || 'Developer'}</p>
        <button class="btn-brutal">${section.config.ctaText || 'Contact'}</button>
    </div>
</section>`;
      }
      
      return `
<section class="hero-section">
    <div class="hero-content">
        <h1>${section.config.headline || 'Welcome to My Portfolio'}</h1>
        <p class="hero-subtitle">${section.config.subheading || 'A passionate developer'}</p>
        <div class="hero-cta">
            <button class="btn-primary">${section.config.ctaText || 'Contact Me'}</button>
            <button class="btn-secondary">${section.config.secondaryCta || 'View Resume'}</button>
        </div>
    </div>
</section>`;

    case 'about':
      return `
<section class="about-section">
    <div class="container">
        <h2>${section.config.title || 'About Me'}</h2>
        <p>${section.config.description || 'Your story here...'}</p>
    </div>
</section>`;

    case 'experience':
      const expItems = (section.config.items || []).map((item: any) => `
<div class="experience-item">
    <h3>${item.position || 'Position'}</h3>
    <p class="company">${item.company || 'Company'} • ${item.date || 'Date'}</p>
    <p>${item.description || 'Description'}</p>
</div>`).join('');
      return `
<section class="experience-section">
    <div class="container">
        <h2>${section.config.title || 'Work Experience'}</h2>
        <div class="experience-list">${expItems}</div>
    </div>
</section>`;

    case 'projects':
      const projectItems = (section.config.items || []).map((project: any) => `
<div class="project-card">
    <h3>${project.name || 'Project Name'}</h3>
    <p>${project.description || 'Description'}</p>
    ${project.url ? `<a href="${project.url}" target="_blank" class="project-link">View Project</a>` : ''}
</div>`).join('');
      return `
<section class="projects-section">
    <div class="container">
        <h2>${section.config.title || 'Featured Projects'}</h2>
        <div class="projects-grid">${projectItems}</div>
    </div>
</section>`;

    case 'skills':
      const skillsList = (section.config.items || []).map((skill: string) => `
<span class="skill-tag">${skill}</span>`).join('');
      return `
<section class="skills-section">
    <div class="container">
        <h2>${section.config.title || 'Technical Skills'}</h2>
        <div class="skills-list">${skillsList}</div>
    </div>
</section>`;

    case 'education':
      const eduItems = (section.config.items || []).map((edu: any) => `
<div class="education-item">
    <h3>${edu.degree || 'Degree'}</h3>
    <p>${edu.institution || 'Institution'} • ${edu.year || 'Year'}</p>
</div>`).join('');
      return `
<section class="education-section">
    <div class="container">
        <h2>${section.config.title || 'Education'}</h2>
        <div class="education-list">${eduItems}</div>
    </div>
</section>`;

    case 'contact':
      const socialLinks = (section.config.socialLinks || []).map((link: any) => `
<a href="${link.url || '#'}" target="_blank" class="social-link">${link.label || 'Link'}</a>`).join('');
      return `
<section class="contact-section">
    <div class="container">
        <h2>${section.config.title || 'Get In Touch'}</h2>
        <p>${section.config.email ? `Contact me at: ${section.config.email}` : 'Let\'s work together!'}</p>
        <div class="social-links">${socialLinks}</div>
    </div>
</section>`;

    default:
      return '';
  }
}

function generateCSS(theme: any, sections: Section[]): string {
  const primaryColor = theme.primaryColor || '#3b82f6';
  const darkMode = theme.darkMode || false;

  return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: ${darkMode ? '#f9fafb' : '#1f2937'};
    background: ${darkMode ? '#111827' : '#ffffff'};
}

.portfolio-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Hero Section */
.hero-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${primaryColor} 0%, ${theme.colors?.[1] || primaryColor} 100%);
    color: white;
    text-align: center;
}

.hero-content h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 800;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.95;
}

.hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

/* Buttons */
.btn-primary, .btn-secondary {
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    font-size: 1rem;
}

.btn-primary {
    background: white;
    color: ${primaryColor};
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.btn-secondary:hover {
    background: white;
    color: ${primaryColor};
}

/* Sections */
section {
    padding: 80px 0;
    border-bottom: 1px solid ${darkMode ? '#374151' : '#e5e7eb'};
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
}

h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: ${darkMode ? '#f9fafb' : '#1f2937'};
    text-align: center;
}

/* About Section */
.about-section {
    background: ${darkMode ? '#1f2937' : '#f9fafb'};
}

.about-section p {
    font-size: 1.2rem;
    line-height: 1.8;
    color: ${darkMode ? '#d1d5db' : '#4b5563'};
    max-width: 800px;
    margin: 0 auto;
}

/* Experience Section */
.experience-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.experience-item {
    padding: 2rem;
    background: ${darkMode ? '#1f2937' : '#ffffff'};
    border-radius: 12px;
    border-left: 4px solid ${primaryColor};
}

.experience-item h3 {
    color: ${primaryColor};
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}

.experience-item .company {
    color: ${darkMode ? '#9ca3af' : '#6b7280'};
    margin-bottom: 1rem;
}

/* Projects Section */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    padding: 2rem;
    background: ${darkMode ? '#1f2937' : '#ffffff'};
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
}

.project-link {
    display: inline-block;
    margin-top: 1rem;
    color: ${primaryColor};
    text-decoration: none;
    font-weight: 600;
}

/* Skills Section */
.skills-section {
    background: ${darkMode ? '#1f2937' : '#f9fafb'};
}

.skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
}

.skill-tag {
    padding: 8px 16px;
    background: ${primaryColor};
    color: white;
    border-radius: 20px;
    font-weight: 500;
}

/* Education Section */
.education-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.education-item {
    padding: 1.5rem;
    background: ${darkMode ? '#1f2937' : '#ffffff'};
    border-radius: 8px;
    border-left: 4px solid ${theme.colors?.[1] || primaryColor};
}

/* Contact Section */
.contact-section {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${theme.colors?.[1] || primaryColor} 100%);
    color: white;
    text-align: center;
}

.contact-section h2 {
    color: white;
}

.contact-section p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.social-links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.social-link {
    padding: 12px 24px;
    background: white;
    color: ${primaryColor};
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.3s;
}

.social-link:hover {
    transform: translateY(-2px);
}

/* Footer */
.portfolio-footer {
    padding: 3rem 0;
    background: ${darkMode ? '#0f172a' : '#f3f4f6'};
    text-align: center;
    color: ${darkMode ? '#9ca3af' : '#6b7280'};
    border-top: 1px solid ${darkMode ? '#374151' : '#e5e7eb'};
}

/* Responsive */
/* Template-specific layouts */
.split-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    padding: 4rem;
}
.hero-left h1 { font-size: 4rem; text-align: left; }
.hero-right { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 20px; }
.hero-visual { font-size: 6rem; font-weight: 900; opacity: 0.3; }

.glass-hero {
    position: relative;
    background: linear-gradient(135deg, ${primaryColor} 0%, ${theme.colors?.[1] || primaryColor} 100%);
}
.glass-overlay {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 3rem;
    margin: 2rem;
}
.btn-glass {
    background: rgba(255,255,255,0.2);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
}

.brutal-hero {
    background: #fbbf24 !important;
    padding: 4rem !important;
}
.brutal-box {
    background: white;
    border: 8px solid black;
    padding: 4rem;
    box-shadow: 20px 20px 0px black;
}
.brutal-text {
    font-size: 6rem !important;
    font-weight: 900 !important;
    color: black !important;
    text-transform: uppercase;
}
.btn-brutal {
    background: #fbbf24;
    color: black;
    border: 6px solid black;
    padding: 1rem 2rem;
    font-weight: 900;
    font-size: 1.2rem;
    text-transform: uppercase;
    box-shadow: 8px 8px 0px black;
}

@media (max-width: 768px) {
    .hero-content h1 {
        font-size: 2.5rem;
    }
    
    .hero-cta {
        flex-direction: column;
    }
    
    .projects-grid {
        grid-template-columns: 1fr;
    }
    
    .split-hero {
        grid-template-columns: 1fr;
    }
}
`;
}

function generateJavaScript(): string {
  return `
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

// Contact form functionality (if needed)
console.log('Portfolio loaded successfully');
`;
}

/**
 * Generate complete portfolio package (HTML + CSS + JS as separate files in ZIP)
 */
export async function downloadPortfolio(config: WebsiteConfig, portfolioData?: any): Promise<void> {
  const html = generatePortfolioHTML(config, portfolioData);
  const css = generateCSS(config.theme || { templateId: 'minimal', primaryColor: '#3b82f6', colors: ['#3b82f6'] }, config.sections || []);
  const js = generateJavaScript();
  
  // Create separate files
  const files = [
    { name: 'index.html', content: html },
    { name: 'styles.css', content: css },
    { name: 'script.js', content: js },
    { name: 'README.md', content: generateReadme() }
  ];
  
  // Create ZIP file
  await createZipFile(files, 'portfolio-website');
}

/**
 * Create a ZIP file from multiple files
 */
async function createZipFile(files: Array<{ name: string; content: string }>, zipName: string): Promise<void> {
  try {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipName}-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Portfolio ZIP file downloaded successfully as ${zipName}.zip`);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    // Fallback: Download files individually
    alert('ZIP creation failed, downloading files individually...');
    files.forEach(file => {
      const blob = new Blob([file.content], { 
        type: file.name.endsWith('.html') ? 'text/html' : 
              file.name.endsWith('.css') ? 'text/css' : 
              file.name.endsWith('.js') ? 'text/javascript' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    
    alert('Portfolio files downloaded! Extract and upload to your web hosting provider.\n\nRecommended: GitHub Pages, Netlify, Vercel, or Cloudflare Pages.');
  }
}

/**
 * Generate README file for the portfolio
 */
function generateReadme(): string {
  return `# Portfolio Website

This portfolio was generated using RoleReady.

## 📁 Files

- \`index.html\` - Main HTML file
- \`styles.css\` - Stylesheet
- \`script.js\` - JavaScript functionality

## 🚀 Deployment

### Option 1: GitHub Pages (Free)
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Enable GitHub Pages in repository settings
4. Your portfolio will be live at \`https://yourusername.github.io/repository-name\`

### Option 2: Netlify (Free)
1. Go to https://netlify.com
2. Drag and drop this folder to deploy
3. Your portfolio will be live instantly!

### Option 3: Vercel (Free)
1. Go to https://vercel.com
2. Import this folder
3. Deploy with one click

### Option 4: Any Web Hosting
Upload these files to your web hosting provider via FTP or file manager.

## 📝 Customization

You can edit any of these files directly to customize your portfolio:
- Change colors and styles in \`styles.css\`
- Modify content and layout in \`index.html\`
- Add interactivity in \`script.js\`

## 🎨 How It Works

This is a static website with no backend required. All content is included in the HTML file, making it easy to host anywhere.

Enjoy your new portfolio!

Generated by RoleReady - The Complete Career Management Platform
`;
}

