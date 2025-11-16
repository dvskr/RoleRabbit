# Resume Templates System Guide

**Last Updated:** November 15, 2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Template Structure](#template-structure)
3. [Available Templates](#available-templates)
4. [Adding New Templates](#adding-new-templates)
5. [Template Styling](#template-styling)
6. [Template Categories](#template-categories)
7. [Best Practices](#best-practices)
8. [Contributing](#contributing)

---

## Overview

The RoleReady Resume Builder includes 60+ professionally designed templates optimized for different industries, roles, and ATS systems.

**Key Features:**
- **ATS-Optimized**: Templates designed to pass Applicant Tracking Systems
- **Industry-Specific**: Tailored for tech, healthcare, finance, education, etc.
- **Responsive**: Looks great on all devices
- **Customizable**: Colors, fonts, spacing can be adjusted
- **Premium & Free**: Mix of free and premium templates

---

## Template Structure

### Template Metadata

Each template is defined in `apps/web/src/data/templates.ts`:

```typescript
interface ResumeTemplate {
  id: string;                    // Unique identifier (kebab-case)
  name: string;                  // Display name
  category: string;              // "ats", "creative", "executive", "academic"
  description: string;           // Short description
  isPremium: boolean;            // Requires PRO/PREMIUM subscription
  colorScheme: string;           // "blue", "green", "purple", etc.
  preview: string;               // Preview image URL
  features: string[];            // Key features
  difficulty: string;            // "beginner", "intermediate", "advanced"
  industry: string[];            // Target industries
  layout: string;                // "single-column", "two-column", "hybrid"
  rating: number;                // 0-5 stars
  downloads: number;             // Download count
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
  author: string;                // Template creator
  tags: string[];                // Searchable tags
}
```

### Example Template Definition

```typescript
{
  id: 'modern-professional',
  name: 'Modern Professional',
  category: 'ats',
  description: 'Clean, ATS-friendly template perfect for tech professionals',
  isPremium: false,
  colorScheme: 'blue',
  preview: '/templates/modern-professional.png',
  features: ['ATS-Optimized', 'Single Column', 'Professional'],
  difficulty: 'beginner',
  industry: ['Technology', 'Finance', 'Healthcare'],
  layout: 'single-column',
  rating: 4.8,
  downloads: 15234,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-11-01T00:00:00Z',
  author: 'RoleReady Team',
  tags: ['ats', 'professional', 'clean', 'modern', 'tech'],
}
```

---

## Available Templates

### ATS-Optimized Templates (Free)

1. **Modern Professional**
   - Single column, clean design
   - Perfect for tech roles
   - High ATS compatibility

2. **Classic ATS**
   - Traditional format
   - Maximum ATS compatibility
   - Suitable for all industries

3. **Minimal ATS**
   - Ultra-clean design
   - Focus on content
   - Great for entry-level

### Creative Templates (Premium)

1. **Creative Designer**
   - Two-column layout
   - Accent colors
   - Perfect for design roles

2. **Bold & Modern**
   - Eye-catching headers
   - Color accents
   - Great for marketing

### Executive Templates (Premium)

1. **Executive Pro**
   - Sophisticated design
   - Emphasis on leadership
   - Perfect for C-level

2. **Senior Manager**
   - Professional layout
   - Achievement-focused
   - Great for management roles

### Academic Templates (Free)

1. **Academic CV**
   - Publication-focused
   - Research emphasis
   - Perfect for academia

---

## Adding New Templates

### Step 1: Design the Template

1. Create a design mockup in Figma/Sketch
2. Ensure ATS compatibility (if applicable)
3. Test with sample resume data
4. Export preview image (1200x1600px, PNG)

### Step 2: Add Template Definition

Add to `apps/web/src/data/templates.ts`:

```typescript
export const resumeTemplates: ResumeTemplate[] = [
  // ... existing templates
  {
    id: 'your-template-id',
    name: 'Your Template Name',
    category: 'ats', // or 'creative', 'executive', 'academic'
    description: 'Brief description of your template',
    isPremium: false, // or true
    colorScheme: 'blue', // or 'green', 'purple', etc.
    preview: '/templates/your-template-id.png',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    difficulty: 'beginner', // or 'intermediate', 'advanced'
    industry: ['Technology', 'Finance'], // Target industries
    layout: 'single-column', // or 'two-column', 'hybrid'
    rating: 0, // Will be updated based on user ratings
    downloads: 0, // Will be tracked automatically
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Your Name',
    tags: ['tag1', 'tag2', 'tag3'], // Searchable tags
  },
];
```

### Step 3: Create Template Component

Create `apps/web/src/components/templates/YourTemplateId.tsx`:

```typescript
import React from 'react';
import { ResumeData } from '../../types/resume';

interface YourTemplateIdProps {
  data: ResumeData;
  formatting?: any;
}

const YourTemplateId: React.FC<YourTemplateIdProps> = ({ data, formatting }) => {
  return (
    <div className="resume-template your-template-id">
      {/* Contact Section */}
      <section className="contact-section">
        <h1>{data.contact.name}</h1>
        <p>{data.contact.title}</p>
        <div className="contact-info">
          <span>{data.contact.email}</span>
          <span>{data.contact.phone}</span>
          <span>{data.contact.location}</span>
        </div>
      </section>

      {/* Summary Section */}
      {data.summary && (
        <section className="summary-section">
          <h2>Professional Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <section className="experience-section">
          <h2>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <h3>{exp.role}</h3>
              <p className="company">{exp.company}</p>
              <p className="dates">
                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
              </p>
              <ul>
                {exp.bullets?.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Add more sections as needed */}
    </div>
  );
};

export default YourTemplateId;
```

### Step 4: Add Template Styles

Create `apps/web/src/styles/templates/your-template-id.css`:

```css
.resume-template.your-template-id {
  font-family: 'Inter', sans-serif;
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0.75in;
  background: white;
  color: #1e293b;
}

.your-template-id .contact-section {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #2563eb;
  padding-bottom: 1rem;
}

.your-template-id .contact-section h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.your-template-id .contact-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
}

.your-template-id section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.your-template-id .experience-item {
  margin-bottom: 1.5rem;
}

.your-template-id .experience-item h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.your-template-id .experience-item .company {
  font-weight: 500;
  color: #64748b;
}

.your-template-id .experience-item .dates {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.your-template-id ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.your-template-id li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* Print styles */
@media print {
  .your-template-id {
    padding: 0.5in;
  }
}
```

### Step 5: Register Template

Update `apps/web/src/components/templates/TemplateRenderer.tsx`:

```typescript
import YourTemplateId from './YourTemplateId';

const templateComponents: Record<string, React.FC<any>> = {
  'modern-professional': ModernProfessional,
  'classic-ats': ClassicATS,
  // ... other templates
  'your-template-id': YourTemplateId, // Add your template here
};
```

### Step 6: Test Template

1. Run the development server
2. Navigate to Resume Builder
3. Select your template from the gallery
4. Test with various resume data
5. Verify ATS compatibility (if applicable)
6. Test PDF export
7. Test on different screen sizes

---

## Template Styling

### Color Schemes

Predefined color schemes:

```typescript
const colorSchemes = {
  blue: {
    primary: '#2563eb',
    secondary: '#64748b',
    text: '#1e293b',
    background: '#ffffff',
  },
  green: {
    primary: '#10b981',
    secondary: '#6b7280',
    text: '#111827',
    background: '#ffffff',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#6b7280',
    text: '#1f2937',
    background: '#ffffff',
  },
  // Add more schemes as needed
};
```

### Typography

Recommended fonts:
- **Professional**: Inter, Roboto, Open Sans
- **Creative**: Poppins, Montserrat, Raleway
- **Traditional**: Georgia, Times New Roman, Garamond

Font size guidelines:
- Name: 24-32px
- Section headers: 16-20px
- Body text: 10-12px
- Contact info: 9-11px

### Spacing

Standard spacing:
- Page margins: 0.5-0.75 inches
- Section gaps: 16-24px
- Line height: 1.4-1.6
- Bullet spacing: 8-12px

---

## Template Categories

### 1. ATS-Optimized
- Single column layout
- Standard fonts
- No graphics/images
- Simple formatting
- High compatibility

### 2. Creative
- Two-column layouts
- Color accents
- Modern fonts
- Visual elements
- Lower ATS compatibility

### 3. Executive
- Sophisticated design
- Achievement focus
- Professional colors
- Clean layout
- Medium ATS compatibility

### 4. Academic
- Publication-focused
- Research emphasis
- Traditional format
- Detailed sections
- High ATS compatibility

---

## Best Practices

### DO:
✅ Use standard fonts (Arial, Calibri, Times New Roman, Georgia)  
✅ Keep layouts simple and clean  
✅ Use consistent spacing  
✅ Test with real resume data  
✅ Ensure readability at 100% zoom  
✅ Test PDF export quality  
✅ Verify ATS compatibility  
✅ Add proper semantic HTML  
✅ Include print styles  

### DON'T:
❌ Use images or graphics (for ATS templates)  
❌ Use tables for layout (ATS issues)  
❌ Use text boxes or columns (ATS issues)  
❌ Use headers/footers (ATS may ignore)  
❌ Use fancy fonts  
❌ Overcomplicate the design  
❌ Forget mobile responsiveness  
❌ Skip accessibility features  

---

## Contributing

### Community Templates

We welcome community contributions! To submit a template:

1. Fork the repository
2. Create a new branch: `git checkout -b template/your-template-name`
3. Add your template following the guide above
4. Test thoroughly
5. Submit a pull request

### Template Review Process

1. **Design Review**: Check aesthetics and usability
2. **Code Review**: Verify code quality and standards
3. **ATS Testing**: Test with ATS scanners (if applicable)
4. **Accessibility**: Verify WCAG compliance
5. **Performance**: Check rendering performance
6. **Approval**: Merge and publish

### Template Guidelines

- **Quality**: High-quality, professional design
- **Originality**: Original work, no plagiarism
- **Documentation**: Include usage instructions
- **Testing**: Thoroughly tested with various data
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Fast rendering (<100ms)

---

## API Integration

### Fetching Templates

```typescript
// Frontend
const response = await fetch('/api/resume-templates');
const { templates } = await response.json();
```

### Filtering Templates

```typescript
// By category
const atsTemplates = templates.filter(t => t.category === 'ats');

// By premium status
const freeTemplates = templates.filter(t => !t.isPremium);

// By industry
const techTemplates = templates.filter(t => 
  t.industry.includes('Technology')
);
```

### Applying Templates

```typescript
// Update resume metadata
await updateResume(resumeId, {
  metadata: {
    ...existingMetadata,
    templateId: 'modern-professional',
  },
});
```

---

## Troubleshooting

### Template Not Rendering

1. Check template ID matches in `templates.ts`
2. Verify component is registered in `TemplateRenderer.tsx`
3. Check for console errors
4. Verify data structure matches expected format

### ATS Compatibility Issues

1. Remove tables and text boxes
2. Use standard fonts
3. Simplify layout to single column
4. Remove images and graphics
5. Test with ATS scanner

### PDF Export Issues

1. Check print styles (`@media print`)
2. Verify page breaks
3. Test with different browsers
4. Check font embedding
5. Verify image quality

---

**End of Guide**

For questions or support, contact: templates@roleready.com


