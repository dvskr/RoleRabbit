import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResumePreview } from '../ResumePreview';
import { ResumeData, SectionVisibility } from '../../../../types/resume';

// Mock the template classes helper
jest.mock('../../utils/templateClassesHelper', () => ({
  getTemplateClasses: jest.fn(() => ({
    container: 'bg-white',
    header: 'border-b border-gray-300',
    nameColor: 'text-gray-900',
    titleColor: 'text-gray-700',
    sectionColor: 'text-gray-900',
    accentColor: 'text-gray-700',
  })),
}));

describe('ResumePreview', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev',
    summary: 'Experienced software engineer',
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
    projects: [],
    certifications: [],
  };

  const mockSectionOrder = ['summary', 'skills', 'experience', 'education'];
  const mockSectionVisibility: SectionVisibility = {
    summary: true,
    skills: true,
    experience: true,
    education: true,
  };

  const defaultProps = {
    resumeFileName: 'resume.pdf',
    resumeData: mockResumeData,
    sectionOrder: mockSectionOrder,
    sectionVisibility: mockSectionVisibility,
    selectedTemplateId: 'template-1',
    fontFamily: 'arial',
    fontSize: '12pt',
    lineSpacing: '1.5',
    onExitPreview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders resume preview with header', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('Preview: resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('https://linkedin.com/in/johndoe')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/johndoe')).toBeInTheDocument();
    expect(screen.getByText('https://johndoe.dev')).toBeInTheDocument();
  });

  it('renders summary section when visible', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('Professional Summary')).toBeInTheDocument();
    expect(screen.getByText('Experienced software engineer')).toBeInTheDocument();
  });

  it('renders skills section', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders experience section', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText(/Tech Corp/)).toBeInTheDocument();
    expect(screen.getByText('Led team of 5 developers')).toBeInTheDocument();
  });

  it('renders education section', () => {
    render(<ResumePreview {...defaultProps} />);
    
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('BS Computer Science')).toBeInTheDocument();
    expect(screen.getByText('University')).toBeInTheDocument();
  });

  it('calls onExitPreview when exit button is clicked', () => {
    const onExitPreview = jest.fn();
    render(<ResumePreview {...defaultProps} onExitPreview={onExitPreview} />);
    
    const exitButton = screen.getByText('Exit Preview');
    fireEvent.click(exitButton);
    
    expect(onExitPreview).toHaveBeenCalledTimes(1);
  });

  it('does not render hidden sections', () => {
    const hiddenVisibility: SectionVisibility = {
      ...mockSectionVisibility,
      summary: false,
    };
    
    render(
      <ResumePreview
        {...defaultProps}
        sectionVisibility={hiddenVisibility}
      />
    );
    
    expect(screen.queryByText('Professional Summary')).not.toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('applies correct font family', () => {
    render(<ResumePreview {...defaultProps} fontFamily="times" />);
    
    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toHaveStyle({ fontFamily: 'Times New Roman' });
  });

  it('handles empty resume data gracefully', () => {
    const emptyResumeData: ResumeData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      website: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };
    
    render(
      <ResumePreview
        {...defaultProps}
        resumeData={emptyResumeData}
      />
    );
    
    expect(screen.getByText('Preview: resume.pdf')).toBeInTheDocument();
  });
});

