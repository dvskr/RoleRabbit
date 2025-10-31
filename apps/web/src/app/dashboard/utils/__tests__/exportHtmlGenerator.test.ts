import { generateResumeHTML } from '../exportHtmlGenerator';
import { ResumeData, SectionVisibility, CustomSection } from '../../../../types/resume';

describe('exportHtmlGenerator', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    summary: 'Experienced software engineer with 5+ years',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: [
      {
        position: 'Senior Developer',
        company: 'Tech Corp',
        period: '2020-2024',
        endPeriod: '2024',
        location: 'New York',
        bullets: ['Led team of 5 developers', 'Implemented new features'],
      },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'University',
        startDate: '2016',
        endDate: '2020',
      },
    ],
    projects: [
      {
        name: 'Project 1',
        description: 'A great project',
        bullets: ['Used React', 'Built with TypeScript'],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified',
        issuer: 'Amazon',
      },
    ],
  };

  const mockCustomSections: CustomSection[] = [
    {
      id: 'custom-1',
      name: 'Custom Section',
      content: 'Custom content here',
    },
  ];

  const mockSectionOrder = ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];
  const mockSectionVisibility: SectionVisibility = {
    summary: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true,
  };

  const defaultOptions = {
    resumeFileName: 'resume.pdf',
    resumeData: mockResumeData,
    customSections: mockCustomSections,
    sectionOrder: mockSectionOrder,
    sectionVisibility: mockSectionVisibility,
    selectedTemplateId: 'template-1',
    fontFamily: 'arial',
    fontSize: '12pt',
    lineSpacing: '1.5',
  };

  it('generates valid HTML document', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</html>');
  });

  it('includes resume file name in title', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('<title>resume.pdf</title>');
  });

  it('includes resume name and title in body', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('John Doe');
    expect(html).toContain('Software Engineer');
  });

  it('includes contact information', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('john@example.com');
    expect(html).toContain('123-456-7890');
    expect(html).toContain('New York, NY');
  });

  it('includes summary section when visible', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Professional Summary');
    expect(html).toContain('Experienced software engineer with 5+ years');
  });

  it('includes skills section', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Skills');
    expect(html).toContain('React');
    expect(html).toContain('TypeScript');
    expect(html).toContain('Node.js');
  });

  it('includes experience section with bullets', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Experience');
    expect(html).toContain('Senior Developer');
    expect(html).toContain('Tech Corp');
    expect(html).toContain('Led team of 5 developers');
  });

  it('includes education section', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Education');
    expect(html).toContain('BS Computer Science');
    expect(html).toContain('University');
  });

  it('includes projects section', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Projects');
    expect(html).toContain('Project 1');
    expect(html).toContain('A great project');
  });

  it('includes certifications section', () => {
    const html = generateResumeHTML(defaultOptions);
    
    expect(html).toContain('Certifications');
    expect(html).toContain('AWS Certified');
    expect(html).toContain('Amazon');
  });

  it('applies correct font family in styles', () => {
    const html = generateResumeHTML({
      ...defaultOptions,
      fontFamily: 'times',
    });
    
    expect(html).toContain("font-family: 'Times New Roman'");
  });

  it('applies correct font size and line spacing', () => {
    const html = generateResumeHTML({
      ...defaultOptions,
      fontSize: '14pt',
      lineSpacing: '2',
    });
    
    expect(html).toContain('font-size: 14pt');
    expect(html).toContain('line-height: 2');
  });

  it('excludes hidden sections', () => {
    const hiddenVisibility: SectionVisibility = {
      ...mockSectionVisibility,
      summary: false,
      skills: false,
    };
    
    const html = generateResumeHTML({
      ...defaultOptions,
      sectionVisibility: hiddenVisibility,
    });
    
    expect(html).not.toContain('Professional Summary');
    expect(html).not.toContain('Skills');
    expect(html).toContain('Experience'); // Other sections should still be visible
  });

  it('includes custom sections', () => {
    const sectionOrderWithCustom = [...mockSectionOrder, 'custom-1'];
    const sectionVisibilityWithCustom = {
      ...mockSectionVisibility,
      'custom-1': true,
    };
    
    const html = generateResumeHTML({
      ...defaultOptions,
      sectionOrder: sectionOrderWithCustom,
      sectionVisibility: sectionVisibilityWithCustom,
    });
    
    expect(html).toContain('Custom Section');
    expect(html).toContain('Custom content here');
  });

  it('handles empty resume data', () => {
    const emptyResumeData: ResumeData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
    
    const html = generateResumeHTML({
      ...defaultOptions,
      resumeData: emptyResumeData,
    });
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>resume.pdf</title>');
  });

  it('handles null template ID', () => {
    const html = generateResumeHTML({
      ...defaultOptions,
      selectedTemplateId: null,
    });
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('John Doe');
  });
});

