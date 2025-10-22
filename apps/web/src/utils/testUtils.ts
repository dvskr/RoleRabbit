// Component Testing Utilities
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock data for testing
export const mockResumeData = {
  personalInfo: {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.com'
  },
  summary: 'Experienced software engineer with 5+ years of experience.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  experience: [
    {
      id: 1,
      company: 'Tech Corp',
      role: 'Senior Software Engineer',
      period: 'Jan 2020',
      endPeriod: 'Present',
      location: 'San Francisco, CA',
      skills: ['React', 'Node.js'],
      bullets: ['Led development of web applications', 'Mentored junior developers']
    }
  ],
  projects: [
    {
      id: 1,
      name: 'E-commerce Platform',
      subtitle: 'Full-stack web application',
      link: 'https://example.com',
      description: 'Built a complete e-commerce solution',
      skills: ['React', 'Node.js', 'MongoDB'],
      bullets: ['Implemented payment processing', 'Optimized performance']
    }
  ],
  education: [
    {
      id: 1,
      school: 'University of California',
      degree: 'Bachelor of Science in Computer Science',
      startDate: 'Sep 2015',
      endDate: 'May 2019',
      gpa: '3.8',
      location: 'Berkeley, CA'
    }
  ],
  certifications: [
    {
      id: 1,
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      link: 'https://aws.amazon.com/certification',
      skills: ['AWS', 'Cloud Computing']
    }
  ]
};

// Test utilities
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

export const createMockHandler = () => jest.fn();

// Component test templates
export const testComponentRendering = (Component: React.ComponentType<any>, props: any = {}) => {
  it('renders without crashing', () => {
    renderWithProviders(<Component {...props} />);
    expect(screen.getByRole('main') || screen.getByTestId('component')).toBeInTheDocument();
  });
};

export const testUserInteraction = (
  Component: React.ComponentType<any>,
  props: any,
  interaction: () => void,
  expectedResult: () => void
) => {
  it('handles user interaction correctly', () => {
    renderWithProviders(<Component {...props} />);
    interaction();
    expectedResult();
  });
};

// Performance testing utilities
export const measureRenderTime = (Component: React.ComponentType<any>, props: any = {}) => {
  const start = performance.now();
  renderWithProviders(<Component {...props} />);
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const testAccessibility = (Component: React.ComponentType<any>, props: any = {}) => {
  it('meets accessibility standards', async () => {
    const { container } = renderWithProviders(<Component {...props} />);
    
    // Check for proper ARIA labels
    const elementsWithAriaLabels = container.querySelectorAll('[aria-label]');
    expect(elementsWithAriaLabels.length).toBeGreaterThan(0);
    
    // Check for proper heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      expect(headings[0].tagName).toBe('H1');
    }
  });
};

// Mock functions for testing
export const mockFunctions = {
  onUpdateResumeData: jest.fn(),
  onAddExperience: jest.fn(),
  onUpdateExperience: jest.fn(),
  onRemoveExperience: jest.fn(),
  onAddProject: jest.fn(),
  onUpdateProject: jest.fn(),
  onRemoveProject: jest.fn(),
  onAddEducation: jest.fn(),
  onUpdateEducation: jest.fn(),
  onRemoveEducation: jest.fn(),
  onAddCertification: jest.fn(),
  onUpdateCertification: jest.fn(),
  onRemoveCertification: jest.fn(),
  onAddSkill: jest.fn(),
  onRemoveSkill: jest.fn(),
  handleTabChange: jest.fn(),
  toggleSidebar: jest.fn(),
  showNotification: jest.fn()
};

// Test data generators
export const generateMockExperience = (overrides: any = {}) => ({
  id: Math.random(),
  company: 'Test Company',
  role: 'Test Role',
  period: 'Jan 2020',
  endPeriod: 'Present',
  location: 'Test Location',
  skills: ['Test Skill'],
  bullets: ['Test bullet point'],
  ...overrides
});

export const generateMockProject = (overrides: any = {}) => ({
  id: Math.random(),
  name: 'Test Project',
  subtitle: 'Test Subtitle',
  link: 'https://test.com',
  description: 'Test description',
  skills: ['Test Skill'],
  bullets: ['Test bullet point'],
  ...overrides
});

export const generateMockEducation = (overrides: any = {}) => ({
  id: Math.random(),
  school: 'Test University',
  degree: 'Test Degree',
  startDate: 'Sep 2015',
  endDate: 'May 2019',
  gpa: '3.8',
  location: 'Test Location',
  ...overrides
});

export const generateMockCertification = (overrides: any = {}) => ({
  id: Math.random(),
  name: 'Test Certification',
  issuer: 'Test Issuer',
  link: 'https://test.com',
  skills: ['Test Skill'],
  ...overrides
});
