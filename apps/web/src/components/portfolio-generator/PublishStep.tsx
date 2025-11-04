'use client';

import React, { useState } from 'react';
import { Download, Globe, Share2, CheckCircle, Package, ExternalLink, Copy } from 'lucide-react';

interface PublishStepProps {
  portfolioData: any;
  onExport?: () => void;
}

export default function PublishStep({ portfolioData, onExport }: PublishStepProps) {
  const [hostingOption, setHostingOption] = useState<'export' | 'roleready' | 'custom'>('export');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [isExported, setIsExported] = useState(false);

  const handleExport = () => {
    if (!portfolioData) return;
    
    // Generate files
    const htmlContent = generatePortfolioHTML(portfolioData);
    const cssContent = generatePortfolioCSS(portfolioData);
    const jsContent = generatePortfolioJS();
    
    // Create ZIP-like structure
    const files = [
      { name: 'index.html', content: htmlContent },
      { name: 'style.css', content: cssContent },
      { name: 'script.js', content: jsContent }
    ];
    
    // Download files
    files.forEach(file => {
      const blob = new Blob([file.content], { type: file.name.endsWith('.html') ? 'text/html' : file.name.endsWith('.css') ? 'text/css' : 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
    
    setIsExported(true);
  };

  const generatePortfolioHTML = (data: any) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name || 'Portfolio'}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="portfolio">
        <!-- Header -->
        <section class="hero">
            <div class="container">
                ${data.profilePic ? `<img src="${data.profilePic}" alt="${data.name}" class="profile-pic">` : ''}
                <h1 class="title">${data.name || 'Your Name'}</h1>
                <p class="subtitle">${data.role || 'Your Title'}</p>
                <p class="bio">${data.professionalBio || data.bio || 'Your bio'}</p>
                
                <div class="social-links">
                    ${data.email ? `<a href="mailto:${data.email}">Email</a>` : ''}
                    ${data.github ? `<a href="${data.github}">GitHub</a>` : ''}
                    ${data.linkedin ? `<a href="${data.linkedin}">LinkedIn</a>` : ''}
                    ${data.website ? `<a href="${data.website}">Website</a>` : ''}
                </div>
            </div>
        </section>

        <!-- Projects -->
        <section class="projects">
            <div class="container">
                <h2>Projects</h2>
                <div class="project-grid">
                    ${data.projects?.map((project: any) => `
                        <div class="project-card">
                            <h3>${project.title || 'Project'}</h3>
                            <p>${project.description || ''}</p>
                            <div class="tech-tags">
                                ${project.technologies?.map((tech: string) => `<span class="tag">${tech}</span>`).join('') || ''}
                            </div>
                        </div>
                    `).join('') || '<p>No projects yet</p>'}
                </div>
            </div>
        </section>
    </div>

    <script src="script.js"></script>
</body>
</html>`;
  };

  const generatePortfolioCSS = (data: any) => {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0a;
    color: #fff;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-pic {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 0 auto 20px;
    border: 4px solid rgba(255, 255, 255, 0.3);
}

.title {
    font-size: 4rem;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    font-size: 1.5rem;
    color: #e0e0e0;
    margin-bottom: 20px;
}

.bio {
    max-width: 600px;
    margin: 0 auto 30px;
    color: #d0d0d0;
}

.social-links {
    display: flex;
    gap: 20px;
    justify-content: center;
}

.social-links a {
    color: white;
    text-decoration: none;
    padding: 10px 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    transition: all 0.3s;
}

.social-links a:hover {
    background: rgba(255, 255, 255, 0.1);
}

.projects {
    padding: 80px 0;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s;
}

.project-card:hover {
    transform: translateY(-5px);
}

.tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.tag {
    background: rgba(102, 126, 234, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
}`;
  };

  const generatePortfolioJS = () => {
    return `// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Fade in animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});`;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Portfolio is Ready!</h2>
            <p className="text-gray-600">Choose how you want to publish it</p>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4 mb-8">
            {/* Export ZIP */}
            <button
              onClick={() => setHostingOption('export')}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'export' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Download as ZIP</h3>
                  <p className="text-sm text-gray-600">Export all files for self-hosting</p>
                </div>
              </div>
            </button>

            {/* RoleReady Hosting */}
            <button
              onClick={() => setHostingOption('roleready')}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'roleready' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="text-purple-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Host on RoleReady</h3>
                  <p className="text-sm text-gray-600">Free hosting on our platform</p>
                </div>
              </div>
            </button>

            {/* Custom Domain */}
            <button
              onClick={() => setHostingOption('custom')}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Share2 className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Custom Domain</h3>
                  <p className="text-sm text-gray-600">Use your own domain</p>
                </div>
              </div>
            </button>
          </div>

          {/* Configuration */}
          {hostingOption === 'roleready' && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="yourname"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-600">.roleready.com</span>
              </div>
            </div>
          )}

          {hostingOption === 'custom' && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-600 mt-2">Configure DNS settings to point to our servers</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {hostingOption === 'export' ? (
              <button
                onClick={handleExport}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Download Portfolio Files
              </button>
            ) : hostingOption === 'roleready' ? (
              <button
                onClick={() => alert('Hosting on RoleReady - Coming soon!')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Globe size={20} />
                Publish to RoleReady
              </button>
            ) : (
              <button
                onClick={() => alert('Custom domain setup - Coming soon!')}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Configure Custom Domain
              </button>
            )}
            
            <button
              onClick={() => window.open('#', '_blank')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Preview Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

