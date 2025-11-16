/**
 * Test Fixtures: Portfolio Templates (Section 5.5)
 *
 * Sample templates with HTML/CSS/JS
 */

export const testTemplates = {
  modernProfessional: {
    id: 'template-modern-1',
    name: 'Modern Professional',
    description: 'Clean and modern design perfect for developers and designers',
    category: 'professional',
    isPremium: false,
    previewUrl: 'https://example.com/templates/modern-preview.png',
    demoUrl: 'https://demo.rolerabbit.com/modern',
    structure: {
      sections: ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'],
      layout: 'single-page',
    },
    styles: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937',
        accent: '#F59E0B',
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono',
      },
      spacing: {
        section: '80px',
        element: '24px',
      },
    },
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - {{subtitle}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="#" class="logo">{{initials}}</a>
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#experience">Experience</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="hero" class="hero">
        <div class="container">
            <h1 class="hero-title">{{title}}</h1>
            <p class="hero-subtitle">{{subtitle}}</p>
            <p class="hero-tagline">{{tagline}}</p>
            <a href="#contact" class="cta-button">Get In Touch</a>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <h2>About Me</h2>
            <div class="about-content">
                <img src="{{profileImage}}" alt="{{title}}" class="profile-image">
                <div class="about-text">
                    <p>{{aboutText}}</p>
                </div>
            </div>
        </div>
    </section>

    {{#each sections}}
        <section id="{{type}}" class="section-{{type}}">
            <div class="container">
                {{{content}}}
            </div>
        </section>
    {{/each}}

    <footer class="footer">
        <div class="container">
            <p>&copy; {{year}} {{title}}. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>
    `.trim(),
    css: `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #3B82F6;
    --secondary: #10B981;
    --background: #FFFFFF;
    --text: #1F2937;
    --accent: #F59E0B;
}

body {
    font-family: 'Inter', sans-serif;
    color: var(--text);
    background: var(--background);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    padding: 16px 0;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary);
    text-decoration: none;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 32px;
}

.nav-links a {
    color: var(--text);
    text-decoration: none;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--primary);
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 80px;
}

.hero-title {
    font-size: 64px;
    font-weight: 700;
    margin-bottom: 16px;
}

.hero-subtitle {
    font-size: 24px;
    color: var(--primary);
    margin-bottom: 16px;
}

.hero-tagline {
    font-size: 18px;
    color: #6B7280;
    margin-bottom: 32px;
}

.cta-button {
    display: inline-block;
    padding: 16px 32px;
    background: var(--primary);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

section {
    padding: 80px 0;
}

h2 {
    font-size: 48px;
    margin-bottom: 48px;
    text-align: center;
}

.about-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 48px;
    align-items: center;
}

.profile-image {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 40px;
    }

    .about-content {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .profile-image {
        width: 200px;
        height: 200px;
        margin: 0 auto;
    }
}
    `.trim(),
    javascript: `
// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
    `.trim(),
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },

  minimalCreative: {
    id: 'template-minimal-1',
    name: 'Minimal Creative',
    description: 'Elegant minimal design for creatives and designers',
    category: 'creative',
    isPremium: true,
    previewUrl: 'https://example.com/templates/minimal-preview.png',
    demoUrl: 'https://demo.rolerabbit.com/minimal',
    structure: {
      sections: ['hero', 'projects', 'contact'],
      layout: 'single-page',
    },
    styles: {
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        background: '#FAFAFA',
        text: '#111827',
      },
      fonts: {
        heading: 'Poppins',
        body: 'Poppins',
      },
    },
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main>
        {{#each sections}}
            <section class="{{type}}">
                {{{content}}}
            </section>
        {{/each}}
    </main>
</body>
</html>`,
    css: `body { font-family: 'Poppins', sans-serif; background: #FAFAFA; }`,
    javascript: `// Minimal interactions`,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
};

export const getTestTemplate = (name: keyof typeof testTemplates) => testTemplates[name];
export const getAllTestTemplates = () => Object.values(testTemplates);
