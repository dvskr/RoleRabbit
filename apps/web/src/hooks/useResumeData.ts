import { useState, useCallback } from 'react';
import { ResumeData, Experience, Project, Education, Certification } from '../types/resume';

const initialResumeData: ResumeData = {
  name: 'SATHISH KUMAR',
  title: 'Data Engineer',
  email: 'dvskr.333@gmail.com',
  phone: '+1 (314) 325-9624',
  location: 'St. Louis, MO',
  linkedin: 'linkedin.com/in/dvskr',
  github: 'https://github.com/dvskr',
  website: 'www.your-site.com',
  summary: 'Data Engineer with more than 4 years of experience designing and scaling modern data platforms across manufacturing and healthcare.',
  skills: ['Python', 'PySpark', 'SQL', 'Kafka', 'Schema Registry', 'Airflow', 'Azure Data Factory', 'AWS Glue'],
  experience: [
    { 
      id: 1,
      company: 'Propper International', 
      role: 'Data Engineer',
      period: 'May 2023',
      endPeriod: 'Present',
      location: 'St. Louis, MO',
      skills: ['Azure Data Factory', 'Apache Airflow', 'Kafka', 'Spark', 'Snowflake', 'dbt'],
      bullets: [
        'Designed and managed ADF/Airflow pipelines integrating POS, e-commerce, and vendor feeds',
        'Re-engineered order processing from batch to Kafka + Spark streaming',
        'Migrated legacy SQL Server marts to Snowflake + dbt'
      ]
    },
    {
      id: 2,
      company: 'Globus Medical',
      role: 'Data Engineer',
      period: 'Jan 2021',
      endPeriod: 'Dec 2022',
      location: 'Hyderabad, India',
      skills: ['Apache Airflow', 'NiFi', 'Apache Spark', 'HL7', 'FHIR', 'Healthcare Standards'],
      bullets: [
        'Built Airflow/NiFi/Spark pipelines for structured and unstructured healthcare data',
        'Normalized HL7 v2/FHIR payloads and standardized ICD-10, CPT, LOINC, SNOMED codes'
      ]
    }
  ],
  projects: [
    {
      id: 1,
      name: 'Formula 1 Telemetry Lakehouse',
      subtitle: 'Personal Project',
      link: 'github.com/project',
      description: 'Databricks + Delta + ADF incremental processing',
      skills: ['Databricks', 'Delta Lake', 'Azure Data Factory', 'Python', 'Spark', 'Azure'],
      bullets: [
        'Built an end-to-end lakehouse processing 50 GB per race weekend for $5 in cloud cost'
      ]
    }
  ],
  education: [
    { 
      id: 1, 
      school: 'Southeast Missouri State University, USA',
      degree: 'M.S., Computer Science',
      startDate: 'Aug 2023',
      endDate: 'Present',
      gpa: '3.9',
      location: 'Cape Girardeau, MO'
    },
    {
      id: 2,
      school: 'Karunya Institute of Technology and Sciences, India',
      degree: 'B.Tech., Computer Science & Engineering',
      startDate: 'Aug 2015',
      endDate: 'May 2019',
      gpa: '3.7',
      location: 'Coimbatore, India'
    }
  ],
  certifications: [
    { id: 1, name: 'Neural Networks & Deep Learning', issuer: 'DeepLearning.AI', link: 'coursera.org/certificate', skills: ['Deep Learning', 'Neural Networks', 'TensorFlow', 'Keras'] },
    { id: 2, name: 'Python for Everybody', issuer: 'University of Michigan', link: 'coursera.org/certificate', skills: ['Python', 'Programming Fundamentals', 'Data Structures'] }
  ]
};

export function useResumeData() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const updateResumeData = useCallback((updates: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  }, []);

  const addExperience = useCallback((experience: Experience) => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...experience, id: Date.now() }]
    }));
  }, []);

  const updateExperience = useCallback((id: number, updates: Partial<Experience>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  }, []);

  const removeExperience = useCallback((id: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  }, []);

  const addProject = useCallback((project: Project) => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...project, id: Date.now() }]
    }));
  }, []);

  const updateProject = useCallback((id: number, updates: Partial<Project>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, ...updates } : proj
      )
    }));
  }, []);

  const removeProject = useCallback((id: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  }, []);

  const addEducation = useCallback((education: Education) => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { ...education, id: Date.now() }]
    }));
  }, []);

  const updateEducation = useCallback((id: number, updates: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  }, []);

  const removeEducation = useCallback((id: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  }, []);

  const addCertification = useCallback((certification: Certification) => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...certification, id: Date.now() }]
    }));
  }, []);

  const updateCertification = useCallback((id: number, updates: Partial<Certification>) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, ...updates } : cert
      )
    }));
  }, []);

  const removeCertification = useCallback((id: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  }, []);

  const addSkill = useCallback((skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
  }, []);

  const removeSkill = useCallback((skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  }, []);

  return {
    resumeData,
    updateResumeData,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addEducation,
    updateEducation,
    removeEducation,
    addCertification,
    updateCertification,
    removeCertification,
    addSkill,
    removeSkill
  };
}
