import { useState, useEffect } from 'react';
import { ResumeData, CustomSection, SectionVisibility } from '../types/resume';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

// Resume data state hook
export const useResumeData = () => {
  const [resumeFileName, setResumeFileName] = useState('My_Resume');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
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
        skills: ['AWS', 'Cloud Architecture'],
        customFields: []
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

  // Load resume from API on mount
  useEffect(() => {
    const loadResume = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getResumes();
        if (response && response.resumes && response.resumes.length > 0) {
          const resume = response.resumes[0];
          try {
            const parsedData = typeof resume.data === 'string' 
              ? JSON.parse(resume.data) 
              : resume.data;
            setResumeData(parsedData);
            setCurrentResumeId(resume.id);
            setResumeFileName(resume.name);
          } catch (parseError) {
            logger.error('Failed to parse resume data:', parseError);
          }
        }
      } catch (error) {
        logger.error('Failed to load resume:', error);
        // Keep default data if load fails
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResume();
  }, []);

  // Auto-save every 30 seconds when there are changes
  useEffect(() => {
    if (!currentResumeId || !hasChanges) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        await apiService.updateResume(currentResumeId, {
          data: JSON.stringify(resumeData),
          lastUpdated: new Date().toISOString(),
        });
        setHasChanges(false);
      } catch (error) {
        logger.error('Auto-save failed:', error);
      }
    }, 30000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [resumeData, currentResumeId, hasChanges]);

  return {
    resumeFileName,
    setResumeFileName,
    currentResumeId,
    setCurrentResumeId,
    isLoading,
    hasChanges,
    setHasChanges,
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
