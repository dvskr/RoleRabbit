import { useState } from 'react';
import { ResumeData, CustomSection, SectionVisibility } from '../types/resume';

// Resume data state hook
export const useResumeData = () => {
  const [resumeFileName, setResumeFileName] = useState('My_Resume');
  
  // Formatting state
  const [fontFamily, setFontFamily] = useState('arial');
  const [fontSize, setFontSize] = useState('ats11pt');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [sectionSpacing, setSectionSpacing] = useState('medium');
  const [margins, setMargins] = useState('normal');
  const [headingStyle, setHeadingStyle] = useState('bold');
  const [bulletStyle, setBulletStyle] = useState('disc');
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years of experience...',
    skills: ['Python', 'PySpark', 'SQL', 'Kafka', 'Schema Registry', 'Airflow'],
    experience: [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        period: '2020',
        endPeriod: 'Present',
        location: 'San Francisco, CA',
        bullets: ['Led development of microservices architecture', 'Improved system performance by 40%', 'Mentored junior developers'],
        environment: ['Python', 'Docker', 'Kubernetes'],
        customFields: []
      }
    ],
    education: [
      {
        id: 1,
        school: 'University of California',
        degree: 'Bachelor of Science in Computer Science',
        startDate: '2016',
        endDate: '2020',
        customFields: []
      }
    ],
    projects: [
      {
        id: 1,
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution',
        link: 'https://github.com/johndoe/ecommerce',
        bullets: ['Built with React and Node.js', 'Integrated payment processing', 'Implemented real-time notifications'],
        skills: ['React', 'Node.js', 'MongoDB'],
        customFields: []
      }
    ],
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        link: 'https://aws.amazon.com/certification/',
        skills: ['AWS', 'Cloud Architecture']
      }
    ]
  });

  // Section management
  const [sectionOrder, setSectionOrder] = useState(['summary', 'skills', 'experience', 'education', 'projects', 'certifications']);
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    summary: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true
  });
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  // Undo/Redo state
  const [history, setHistory] = useState<ResumeData[]>([resumeData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  return {
    resumeFileName,
    setResumeFileName,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing,
    setLineSpacing,
    sectionSpacing,
    setSectionSpacing,
    margins,
    setMargins,
    headingStyle,
    setHeadingStyle,
    bulletStyle,
    setBulletStyle,
    resumeData,
    setResumeData,
    sectionOrder,
    setSectionOrder,
    sectionVisibility,
    setSectionVisibility,
    customSections,
    setCustomSections,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex
  };
};
