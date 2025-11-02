'use client';

import React, { useState } from 'react';
import { Briefcase, Star, Target, Trophy, CheckCircle, Plus, Trash2, Edit2, Save, X, FolderKanban, ExternalLink, Github, Heart, Users, BookOpen, Award, Building2, GraduationCap } from 'lucide-react';
import FormField from '../components/FormField';
import { UserData, WorkExperience, Project, VolunteerExperience, Recommendation, Publication, Patent, Organization, TestScore } from '../types/profile';
import { useTheme } from '../../../contexts/ThemeContext';

interface ProfessionalTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function ProfessionalTab({
  userData,
  isEditing,
  onUserDataChange
}: ProfessionalTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  // Normalize work experiences array
  const normalizeWorkExperiences = (experiences: any): WorkExperience[] => {
    if (!experiences) return [];
    if (Array.isArray(experiences)) {
      return experiences.map(exp => ({
        id: exp.id || `exp-${Date.now()}-${Math.random()}`,
        company: exp.company || '',
        role: exp.role || exp.title || '',
        client: exp.client || '',
        location: exp.location || '',
        startDate: exp.startDate || exp.start || '',
        endDate: exp.endDate || exp.end || '',
        isCurrent: exp.isCurrent || (exp.endDate === null || exp.endDate === ''),
        description: exp.description || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
        projectType: exp.projectType || exp.type || 'Full-time'
      }));
    }
    if (typeof experiences === 'string') {
      try {
        const parsed = JSON.parse(experiences);
        return normalizeWorkExperiences(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const workExperiences = normalizeWorkExperiences(userData.workExperiences);
  
  // Normalize projects array
  const normalizeProjects = (projects: any): Project[] => {
    if (!projects) return [];
    if (Array.isArray(projects)) {
      return projects.map(proj => ({
        id: proj.id || `proj-${Date.now()}-${Math.random()}`,
        title: proj.title || proj.name || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        link: proj.link || '',
        github: proj.github || '',
        media: Array.isArray(proj.media) ? proj.media : [],
        date: proj.date || ''
      }));
    }
    if (typeof projects === 'string') {
      try {
        const parsed = JSON.parse(projects);
        return normalizeProjects(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const projects = normalizeProjects(userData.projects);
  
  // Normalize other arrays
  const normalizeVolunteerExperiences = (experiences: any): VolunteerExperience[] => {
    if (!experiences) return [];
    if (Array.isArray(experiences)) {
      return experiences.map(exp => ({
        id: exp.id || `vol-${Date.now()}-${Math.random()}`,
        organization: exp.organization || '',
        role: exp.role || '',
        cause: exp.cause || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        isCurrent: exp.isCurrent || false,
        description: exp.description || '',
        hoursPerWeek: exp.hoursPerWeek,
        totalHours: exp.totalHours
      }));
    }
    if (typeof experiences === 'string') {
      try {
        const parsed = JSON.parse(experiences);
        return normalizeVolunteerExperiences(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizeRecommendations = (recommendations: any): Recommendation[] => {
    if (!recommendations) return [];
    if (Array.isArray(recommendations)) {
      return recommendations.map(rec => ({
        id: rec.id || `rec-${Date.now()}-${Math.random()}`,
        recommenderName: rec.recommenderName || '',
        recommenderTitle: rec.recommenderTitle || '',
        recommenderCompany: rec.recommenderCompany || '',
        recommenderRelationship: rec.recommenderRelationship || '',
        content: rec.content || '',
        date: rec.date || '',
        isPending: rec.isPending || false,
        skills: Array.isArray(rec.skills) ? rec.skills : []
      }));
    }
    if (typeof recommendations === 'string') {
      try {
        const parsed = JSON.parse(recommendations);
        return normalizeRecommendations(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizePublications = (publications: any): Publication[] => {
    if (!publications) return [];
    if (Array.isArray(publications)) {
      return publications.map(pub => ({
        id: pub.id || `pub-${Date.now()}-${Math.random()}`,
        title: pub.title || '',
        publisher: pub.publisher || '',
        publicationDate: pub.publicationDate || '',
        authors: Array.isArray(pub.authors) ? pub.authors : [],
        type: pub.type || 'Article',
        url: pub.url || '',
        description: pub.description || ''
      }));
    }
    if (typeof publications === 'string') {
      try {
        const parsed = JSON.parse(publications);
        return normalizePublications(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizePatents = (patents: any): Patent[] => {
    if (!patents) return [];
    if (Array.isArray(patents)) {
      return patents.map(pat => ({
        id: pat.id || `pat-${Date.now()}-${Math.random()}`,
        title: pat.title || '',
        patentNumber: pat.patentNumber || '',
        issueDate: pat.issueDate || '',
        inventors: Array.isArray(pat.inventors) ? pat.inventors : [],
        status: pat.status || 'Granted',
        url: pat.url || '',
        description: pat.description || ''
      }));
    }
    if (typeof patents === 'string') {
      try {
        const parsed = JSON.parse(patents);
        return normalizePatents(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizeOrganizations = (orgs: any): Organization[] => {
    if (!orgs) return [];
    if (Array.isArray(orgs)) {
      return orgs.map(org => ({
        id: org.id || `org-${Date.now()}-${Math.random()}`,
        name: org.name || '',
        type: org.type || 'Professional Association',
        role: org.role || '',
        startDate: org.startDate || '',
        endDate: org.endDate || '',
        isCurrent: org.isCurrent || false,
        description: org.description || ''
      }));
    }
    if (typeof orgs === 'string') {
      try {
        const parsed = JSON.parse(orgs);
        return normalizeOrganizations(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const normalizeTestScores = (scores: any): TestScore[] => {
    if (!scores) return [];
    if (Array.isArray(scores)) {
      return scores.map(score => ({
        id: score.id || `test-${Date.now()}-${Math.random()}`,
        testName: score.testName || '',
        score: score.score || '',
        percentile: score.percentile,
        testDate: score.testDate || '',
        expiresDate: score.expiresDate || '',
        description: score.description || ''
      }));
    }
    if (typeof scores === 'string') {
      try {
        const parsed = JSON.parse(scores);
        return normalizeTestScores(parsed);
      } catch {
        return [];
      }
    }
    return [];
  };
  
  const volunteerExperiences = normalizeVolunteerExperiences(userData.volunteerExperiences);
  const recommendations = normalizeRecommendations(userData.recommendations);
  const publications = normalizePublications(userData.publications);
  const patents = normalizePatents(userData.patents);
  const organizations = normalizeOrganizations(userData.organizations);
  const testScores = normalizeTestScores(userData.testScores);
  
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [newTech, setNewTech] = useState<string>('');
  const [newProjTech, setNewProjTech] = useState<{ [key: string]: string }>({});
  const [newExp, setNewExp] = useState<Partial<WorkExperience>>({
    company: '',
    role: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    achievements: [],
    technologies: [],
    projectType: 'Full-time'
  });
  
  const addWorkExperience = () => {
    const exp: WorkExperience = {
      id: `exp-${Date.now()}-${Math.random()}`,
      company: newExp.company || '',
      role: newExp.role || '',
      client: newExp.client || '',
      location: newExp.location || '',
      startDate: newExp.startDate || '',
      endDate: newExp.isCurrent ? '' : (newExp.endDate || ''),
      isCurrent: newExp.isCurrent || false,
      description: newExp.description || '',
      achievements: newExp.achievements || [],
      technologies: newExp.technologies || [],
      projectType: newExp.projectType || 'Full-time'
    };
    onUserDataChange({ workExperiences: [...workExperiences, exp] });
    setNewExp({
      company: '',
      role: '',
      client: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      achievements: [],
      technologies: [],
      projectType: 'Full-time'
    });
  };
  
  const updateWorkExperience = (id: string, updates: Partial<WorkExperience>) => {
    const updated = workExperiences.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onUserDataChange({ workExperiences: updated });
  };
  
  const deleteWorkExperience = (id: string) => {
    const updated = workExperiences.filter(exp => exp.id !== id);
    onUserDataChange({ workExperiences: updated });
  };
  
  // Project management functions
  const addProject = () => {
    const proj: Project = {
      id: `proj-${Date.now()}-${Math.random()}`,
      title: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      date: ''
    };
    onUserDataChange({ projects: [...projects, proj] });
    setEditingProjId(proj.id || null);
  };
  
  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(proj => 
      proj.id === id ? { ...proj, ...updates } : proj
    );
    onUserDataChange({ projects: updated });
  };
  
  const deleteProject = (id: string) => {
    const updated = projects.filter(proj => proj.id !== id);
    onUserDataChange({ projects: updated });
  };
  
  const addTechnologyToProject = (projectId: string) => {
    const tech = newProjTech[projectId]?.trim();
    if (tech) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        updateProject(projectId, {
          technologies: [...(project.technologies || []), tech]
        });
        setNewProjTech({ ...newProjTech, [projectId]: '' });
      }
    }
  };
  
  const removeTechnologyFromProject = (projectId: string, techIndex: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        technologies: project.technologies?.filter((_, i) => i !== techIndex) || []
      });
    }
  };
  
  // Volunteer Experience management
  const [editingVolId, setEditingVolId] = useState<string | null>(null);
  
  const addVolunteerExperience = () => {
    const vol: VolunteerExperience = {
      id: `vol-${Date.now()}-${Math.random()}`,
      organization: '',
      role: '',
      cause: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      hoursPerWeek: undefined,
      totalHours: undefined
    };
    onUserDataChange({ volunteerExperiences: [...volunteerExperiences, vol] });
    setEditingVolId(vol.id || null);
  };
  
  const updateVolunteerExperience = (id: string, updates: Partial<VolunteerExperience>) => {
    const updated = volunteerExperiences.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onUserDataChange({ volunteerExperiences: updated });
  };
  
  const deleteVolunteerExperience = (id: string) => {
    const updated = volunteerExperiences.filter(exp => exp.id !== id);
    onUserDataChange({ volunteerExperiences: updated });
  };
  
  // Recommendations management
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  
  const addRecommendation = () => {
    const rec: Recommendation = {
      id: `rec-${Date.now()}-${Math.random()}`,
      recommenderName: '',
      recommenderTitle: '',
      recommenderCompany: '',
      recommenderRelationship: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      isPending: false,
      skills: []
    };
    onUserDataChange({ recommendations: [...recommendations, rec] });
    setEditingRecId(rec.id || null);
  };
  
  const updateRecommendation = (id: string, updates: Partial<Recommendation>) => {
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, ...updates } : rec
    );
    onUserDataChange({ recommendations: updated });
  };
  
  const deleteRecommendation = (id: string) => {
    const updated = recommendations.filter(rec => rec.id !== id);
    onUserDataChange({ recommendations: updated });
  };
  
  // Publications management
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  
  const addPublication = () => {
    const pub: Publication = {
      id: `pub-${Date.now()}-${Math.random()}`,
      title: '',
      publisher: '',
      publicationDate: '',
      authors: [],
      type: 'Article',
      url: '',
      description: ''
    };
    onUserDataChange({ publications: [...publications, pub] });
    setEditingPubId(pub.id || null);
  };
  
  const updatePublication = (id: string, updates: Partial<Publication>) => {
    const updated = publications.map(pub => 
      pub.id === id ? { ...pub, ...updates } : pub
    );
    onUserDataChange({ publications: updated });
  };
  
  const deletePublication = (id: string) => {
    const updated = publications.filter(pub => pub.id !== id);
    onUserDataChange({ publications: updated });
  };
  
  // Patents management
  const [editingPatId, setEditingPatId] = useState<string | null>(null);
  
  const addPatent = () => {
    const pat: Patent = {
      id: `pat-${Date.now()}-${Math.random()}`,
      title: '',
      patentNumber: '',
      issueDate: '',
      inventors: [],
      status: 'Granted',
      url: '',
      description: ''
    };
    onUserDataChange({ patents: [...patents, pat] });
    setEditingPatId(pat.id || null);
  };
  
  const updatePatent = (id: string, updates: Partial<Patent>) => {
    const updated = patents.map(pat => 
      pat.id === id ? { ...pat, ...updates } : pat
    );
    onUserDataChange({ patents: updated });
  };
  
  const deletePatent = (id: string) => {
    const updated = patents.filter(pat => pat.id !== id);
    onUserDataChange({ patents: updated });
  };
  
  // Organizations management
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  
  const addOrganization = () => {
    const org: Organization = {
      id: `org-${Date.now()}-${Math.random()}`,
      name: '',
      type: 'Professional Association',
      role: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    };
    onUserDataChange({ organizations: [...organizations, org] });
    setEditingOrgId(org.id || null);
  };
  
  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    const updated = organizations.map(org => 
      org.id === id ? { ...org, ...updates } : org
    );
    onUserDataChange({ organizations: updated });
  };
  
  const deleteOrganization = (id: string) => {
    const updated = organizations.filter(org => org.id !== id);
    onUserDataChange({ organizations: updated });
  };
  
  // Test Scores management
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  
  const addTestScore = () => {
    const test: TestScore = {
      id: `test-${Date.now()}-${Math.random()}`,
      testName: '',
      score: '',
      percentile: undefined,
      testDate: '',
      expiresDate: '',
      description: ''
    };
    onUserDataChange({ testScores: [...testScores, test] });
    setEditingTestId(test.id || null);
  };
  
  const updateTestScore = (id: string, updates: Partial<TestScore>) => {
    const updated = testScores.map(test => 
      test.id === id ? { ...test, ...updates } : test
    );
    onUserDataChange({ testScores: updated });
  };
  
  const deleteTestScore = (id: string) => {
    const updated = testScores.filter(test => test.id !== id);
    onUserDataChange({ testScores: updated });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primaryText }}
        >
          Professional Information
        </h2>
        <p 
          style={{ color: colors.secondaryText }}
        >
          Manage your professional details and career information
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Professional Summary */}
        {userData.professionalSummary && (
          <div 
            className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={24} style={{ color: colors.primaryBlue }} />
              <h3 
                className="text-xl font-semibold"
                style={{ color: colors.primaryText }}
              >
                Professional Summary
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <h4 
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: colors.primaryText }}
                >
                  <Target size={16} />
                  Overview
                </h4>
                <p 
                  className="leading-relaxed"
                  style={{ color: colors.secondaryText }}
                >
                  {userData.professionalSummary.overview}
                </p>
              </div>

              {/* Key Strengths */}
              {userData.professionalSummary.keyStrengths && userData.professionalSummary.keyStrengths.length > 0 && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Star size={16} />
                    Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {userData.professionalSummary.keyStrengths.map((strength, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                          border: `1px solid ${colors.badgeInfoBorder}`,
                        }}
                      >
                        <CheckCircle size={14} />
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Focus */}
              {userData.professionalSummary.currentFocus && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Target size={16} />
                    Current Focus
                  </h4>
                  <p 
                    className="leading-relaxed"
                    style={{ color: colors.secondaryText }}
                  >
                    {userData.professionalSummary.currentFocus}
                  </p>
                </div>
              )}

              {/* Key Achievements */}
              {userData.professionalSummary.achievements && userData.professionalSummary.achievements.length > 0 && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: colors.primaryText }}
                  >
                    <Trophy size={16} />
                    Key Achievements
                  </h4>
                  <div className="space-y-3">
                    {userData.professionalSummary.achievements.map((achievement, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{
                          background: colors.badgeWarningBg,
                          border: `1px solid ${colors.badgeWarningBorder}`,
                        }}
                      >
                        <Trophy size={16} className="mt-0.5 flex-shrink-0" style={{ color: colors.badgeWarningText }} />
                        <p style={{ color: colors.primaryText }}>{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Looking For */}
              {userData.professionalSummary.lookingFor && (
                <div>
                  <h4 
                    className="text-sm font-semibold mb-2"
                    style={{ color: colors.primaryText }}
                  >
                    Looking For
                  </h4>
                  <p 
                    className="leading-relaxed"
                    style={{ color: colors.secondaryText }}
                  >
                    {userData.professionalSummary.lookingFor}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Role & Company */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Current Position
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Current Role"
              value={userData.currentRole}
              onChange={(value) => onUserDataChange({ currentRole: value })}
              disabled={!isEditing}
              placeholder="e.g., Senior Software Engineer"
            />
            <FormField
              label="Current Company"
              value={userData.currentCompany}
              onChange={(value) => onUserDataChange({ currentCompany: value })}
              disabled={!isEditing}
              placeholder="e.g., Tech Corp"
            />
          </div>
        </div>

        {/* Experience & Industry */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Experience & Background
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Experience Level
              </label>
              <select
                id="experience-select"
                name="experience"
                value={userData.experience}
                onChange={(e) => onUserDataChange({ experience: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                aria-label="Experience Level"
                title="Experience Level"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Industry
              </label>
              <select
                id="industry-select"
                name="industry"
                value={userData.industry}
                onChange={(e) => onUserDataChange({ industry: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                aria-label="Industry"
                title="Industry"
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
              </select>
            </div>
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Job Level
              </label>
              <select
                id="job-level-select"
                name="jobLevel"
                value={userData.jobLevel}
                onChange={(e) => onUserDataChange({ jobLevel: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                aria-label="Job Level"
                title="Job Level"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead/Principal</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Preferences */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h3 
            className="text-xl font-semibold mb-6"
            style={{ color: colors.primaryText }}
          >
            Compensation & Work Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Salary Expectation"
              value={userData.salaryExpectation}
              onChange={(value) => onUserDataChange({ salaryExpectation: value })}
              disabled={!isEditing}
              placeholder="e.g., $120,000 - $150,000"
            />
            <div className="space-y-2">
              <label 
                className="block text-sm font-semibold"
                style={{ color: colors.primaryText }}
              >
                Work Preference
              </label>
              <select
                id="work-preference-select"
                name="workPreference"
                value={userData.workPreference}
                onChange={(e) => onUserDataChange({ workPreference: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
                aria-label="Work Preference"
                title="Work Preference"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Experience History */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Briefcase size={24} style={{ color: colors.primaryBlue }} />
              Work Experience History
            </h3>
            {isEditing && (
              <button
                onClick={addWorkExperience}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus size={16} />
                Add Experience
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {workExperiences.map((exp, index) => (
              <div
                key={exp.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {exp.role}
                    </h4>
                    <p 
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.primaryBlue }}
                    >
                      {exp.company}
                    </p>
                    {exp.client && (
                      <p 
                        className="text-sm mb-2"
                        style={{ color: colors.secondaryText }}
                      >
                        Client: {exp.client}
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      {exp.location && (
                        <span>{exp.location}</span>
                      )}
                      <span>
                        {exp.startDate} - {exp.isCurrent ? 'Present' : (exp.endDate || 'Present')}
                      </span>
                      <span 
                        className="px-2 py-1 rounded"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                        }}
                      >
                        {exp.projectType}
                      </span>
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingExpId(editingExpId === exp.id ? null : exp.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeInfoBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label="Edit experience"
                        title="Edit experience"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteWorkExperience(exp.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label="Delete experience"
                        title="Delete experience"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingExpId === exp.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Role/Position"
                        value={exp.role}
                        onChange={(value) => updateWorkExperience(exp.id || '', { role: value })}
                        disabled={false}
                        placeholder="e.g., Senior Developer"
                      />
                      <FormField
                        label="Company"
                        value={exp.company}
                        onChange={(value) => updateWorkExperience(exp.id || '', { company: value })}
                        disabled={false}
                        placeholder="e.g., Tech Corp"
                      />
                      <FormField
                        label="Client (if applicable)"
                        value={exp.client || ''}
                        onChange={(value) => updateWorkExperience(exp.id || '', { client: value })}
                        disabled={false}
                        placeholder="Client name"
                      />
                      <FormField
                        label="Location"
                        value={exp.location || ''}
                        onChange={(value) => updateWorkExperience(exp.id || '', { location: value })}
                        disabled={false}
                        placeholder="City, Country"
                      />
                      <FormField
                        label="Start Date"
                        type="text"
                        value={exp.startDate}
                        onChange={(value) => updateWorkExperience(exp.id || '', { startDate: value })}
                        disabled={false}
                        placeholder="MM/YYYY"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                          Project Type
                        </label>
                        <select
                          id={`project-type-${exp.id}`}
                          name={`project-type-${exp.id}`}
                          value={exp.projectType}
                          onChange={(e) => updateWorkExperience(exp.id || '', { projectType: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Consulting">Consulting</option>
                          <option value="Client Project">Client Project</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          name={`current-${exp.id}`}
                          checked={exp.isCurrent}
                          onChange={(e) => updateWorkExperience(exp.id || '', { isCurrent: e.target.checked, endDate: e.target.checked ? '' : exp.endDate })}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-sm" style={{ color: colors.primaryText }}>
                          Current Position
                        </label>
                      </div>
                      {!exp.isCurrent && (
                        <FormField
                          label="End Date"
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(value) => updateWorkExperience(exp.id || '', { endDate: value })}
                          disabled={false}
                          placeholder="MM/YYYY"
                        />
                      )}
                    </div>
                    <FormField
                      label="Description"
                      type="textarea"
                      value={exp.description || ''}
                      onChange={(value) => updateWorkExperience(exp.id || '', { description: value })}
                      disabled={false}
                      rows={4}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                    <button
                      onClick={() => setEditingExpId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    {exp.description && (
                      <p 
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: colors.secondaryText }}
                      >
                        {exp.description}
                      </p>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: colors.badgeInfoBg,
                              color: colors.badgeInfoText,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            
            {workExperiences.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Briefcase size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No work experience added yet</p>
                {isEditing && (
                  <button
                    onClick={addWorkExperience}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Experience
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <FolderKanban size={24} style={{ color: colors.primaryBlue }} />
              Projects
            </h3>
            {isEditing && (
              <button
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Plus size={16} />
                Add Project
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {projects.map((proj, index) => (
              <div
                key={proj.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {proj.title || 'Untitled Project'}
                    </h4>
                    {proj.date && (
                      <p 
                        className="text-xs mb-2"
                        style={{ color: colors.tertiaryText }}
                      >
                        {proj.date}
                      </p>
                    )}
                    {proj.description && (
                      <p 
                        className="text-sm leading-relaxed mt-2"
                        style={{ color: colors.secondaryText }}
                      >
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {proj.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: colors.badgeInfoBg,
                              color: colors.badgeInfoText,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(proj.link || proj.github) && (
                      <div className="flex items-center gap-4 mt-3">
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm"
                            style={{ color: colors.primaryBlue }}
                          >
                            <ExternalLink size={14} />
                            Live Demo
                          </a>
                        )}
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm"
                            style={{ color: colors.primaryBlue }}
                          >
                            <Github size={14} />
                            GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProjId(editingProjId === proj.id ? null : proj.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeInfoBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label="Edit project"
                        title="Edit project"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteProject(proj.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        aria-label="Delete project"
                        title="Delete project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingProjId === proj.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Project Title"
                        value={proj.title}
                        onChange={(value) => updateProject(proj.id || '', { title: value })}
                        disabled={false}
                        placeholder="e.g., E-commerce Platform"
                      />
                      <FormField
                        label="Date"
                        type="text"
                        value={proj.date}
                        onChange={(value) => updateProject(proj.id || '', { date: value })}
                        disabled={false}
                        placeholder="MM/YYYY or Year"
                      />
                      <FormField
                        label="Project Link"
                        type="url"
                        value={proj.link || ''}
                        onChange={(value) => updateProject(proj.id || '', { link: value })}
                        disabled={false}
                        placeholder="https://example.com"
                      />
                      <FormField
                        label="GitHub Link"
                        type="url"
                        value={proj.github || ''}
                        onChange={(value) => updateProject(proj.id || '', { github: value })}
                        disabled={false}
                        placeholder="https://github.com/user/repo"
                      />
                    </div>
                    <FormField
                      label="Description"
                      type="textarea"
                      value={proj.description || ''}
                      onChange={(value) => updateProject(proj.id || '', { description: value })}
                      disabled={false}
                      rows={4}
                      placeholder="Describe your project..."
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                        Technologies
                      </label>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {proj.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 rounded-full text-xs flex items-center gap-2"
                              style={{
                                background: colors.badgeInfoBg,
                                color: colors.badgeInfoText,
                              }}
                            >
                              {tech}
                              <button
                                onClick={() => removeTechnologyFromProject(proj.id || '', techIndex)}
                                className="hover:opacity-70"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          id={`project-tech-${proj.id}`}
                          name={`project-tech-${proj.id}`}
                          type="text"
                          value={newProjTech[proj.id || ''] || ''}
                          onChange={(e) => setNewProjTech({ ...newProjTech, [proj.id || '']: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTechnologyToProject(proj.id || '');
                            }
                          }}
                          placeholder="Add technology..."
                          className="flex-1 px-4 py-2 rounded-xl"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        />
                        <button
                          onClick={() => addTechnologyToProject(proj.id || '')}
                          className="px-4 py-2 rounded-xl"
                          style={{
                            background: colors.primaryBlue,
                            color: 'white',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingProjId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {projects.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <FolderKanban size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No projects added yet</p>
                {isEditing && (
                  <button
                    onClick={addProject}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Volunteer Experience Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Heart size={24} style={{ color: colors.primaryBlue }} />
              Volunteer Experience
            </h3>
            {isEditing && (
              <button
                onClick={addVolunteerExperience}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Volunteer Work
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {volunteerExperiences.map((vol, index) => (
              <div
                key={vol.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {vol.role || 'Volunteer Role'}
                    </h4>
                    <p 
                      className="text-sm font-medium mb-1"
                      style={{ color: colors.primaryBlue }}
                    >
                      {vol.organization || 'Organization'}
                    </p>
                    {vol.cause && (
                      <p 
                        className="text-xs mb-2"
                        style={{ color: colors.secondaryText }}
                      >
                        Cause: {vol.cause}
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      {vol.location && <span>{vol.location}</span>}
                      <span>
                        {vol.startDate} - {vol.isCurrent ? 'Present' : (vol.endDate || 'Present')}
                      </span>
                      {vol.hoursPerWeek && <span>{vol.hoursPerWeek} hrs/week</span>}
                      {vol.totalHours && <span>{vol.totalHours} total hours</span>}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingVolId(editingVolId === vol.id ? null : vol.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteVolunteerExperience(vol.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingVolId === vol.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Role"
                        value={vol.role}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { role: value })}
                        placeholder="e.g., Volunteer Coordinator"
                      />
                      <FormField
                        label="Organization"
                        value={vol.organization}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { organization: value })}
                        placeholder="Organization name"
                      />
                      <FormField
                        label="Cause"
                        value={vol.cause || ''}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { cause: value })}
                        placeholder="e.g., Education, Environment"
                      />
                      <FormField
                        label="Location"
                        value={vol.location || ''}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { location: value })}
                        placeholder="City, Country"
                      />
                      <FormField
                        label="Start Date"
                        type="text"
                        value={vol.startDate}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { startDate: value })}
                        placeholder="MM/YYYY"
                      />
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          type="checkbox"
                          id={`vol-current-${vol.id}`}
                          name={`vol-current-${vol.id}`}
                          checked={vol.isCurrent}
                          onChange={(e) => updateVolunteerExperience(vol.id || '', { isCurrent: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`vol-current-${vol.id}`} className="text-sm" style={{ color: colors.primaryText }}>Current</label>
                      </div>
                      {!vol.isCurrent && (
                        <FormField
                          label="End Date"
                          type="text"
                          value={vol.endDate || ''}
                          onChange={(value) => updateVolunteerExperience(vol.id || '', { endDate: value })}
                          placeholder="MM/YYYY"
                        />
                      )}
                      <FormField
                        label="Hours per Week"
                        type="text"
                        value={vol.hoursPerWeek?.toString() || ''}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { hoursPerWeek: parseInt(value) || undefined })}
                        placeholder="e.g., 10"
                      />
                      <FormField
                        label="Total Hours"
                        type="text"
                        value={vol.totalHours?.toString() || ''}
                        onChange={(value) => updateVolunteerExperience(vol.id || '', { totalHours: parseInt(value) || undefined })}
                        placeholder="e.g., 500"
                      />
                    </div>
                    <FormField
                      label="Description"
                      type="textarea"
                      value={vol.description || ''}
                      onChange={(value) => updateVolunteerExperience(vol.id || '', { description: value })}
                      rows={4}
                      placeholder="Describe your volunteer work..."
                    />
                    <button
                      onClick={() => setEditingVolId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  vol.description && (
                    <p 
                      className="text-sm leading-relaxed mt-3"
                      style={{ color: colors.secondaryText }}
                    >
                      {vol.description}
                    </p>
                  )
                )}
              </div>
            ))}
            
            {volunteerExperiences.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Heart size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No volunteer experience added yet</p>
                {isEditing && (
                  <button
                    onClick={addVolunteerExperience}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Volunteer Experience
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Star size={24} style={{ color: colors.primaryBlue }} />
              Recommendations
            </h3>
            {isEditing && (
              <button
                onClick={addRecommendation}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Recommendation
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {rec.recommenderName || 'Recommender'}
                    </h4>
                    {rec.recommenderTitle && (
                      <p 
                        className="text-sm mb-1"
                        style={{ color: colors.secondaryText }}
                      >
                        {rec.recommenderTitle}
                        {rec.recommenderCompany && ` at ${rec.recommenderCompany}`}
                      </p>
                    )}
                    {rec.recommenderRelationship && (
                      <p 
                        className="text-xs mb-2"
                        style={{ color: colors.tertiaryText }}
                      >
                        {rec.recommenderRelationship}
                      </p>
                    )}
                    <p 
                      className="text-sm leading-relaxed mt-3 italic"
                      style={{ color: colors.secondaryText }}
                    >
                      "{rec.content || 'Recommendation text...'}"
                    </p>
                    {rec.skills && rec.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rec.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: colors.badgeInfoBg,
                              color: colors.badgeInfoText,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <p 
                      className="text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      {rec.date}
                    </p>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingRecId(editingRecId === rec.id ? null : rec.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteRecommendation(rec.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingRecId === rec.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Recommender Name"
                        value={rec.recommenderName}
                        onChange={(value) => updateRecommendation(rec.id || '', { recommenderName: value })}
                        placeholder="Full name"
                      />
                      <FormField
                        label="Recommender Title"
                        value={rec.recommenderTitle || ''}
                        onChange={(value) => updateRecommendation(rec.id || '', { recommenderTitle: value })}
                        placeholder="Job title"
                      />
                      <FormField
                        label="Company"
                        value={rec.recommenderCompany || ''}
                        onChange={(value) => updateRecommendation(rec.id || '', { recommenderCompany: value })}
                        placeholder="Company name"
                      />
                      <FormField
                        label="Relationship"
                        value={rec.recommenderRelationship || ''}
                        onChange={(value) => updateRecommendation(rec.id || '', { recommenderRelationship: value })}
                        placeholder="e.g., Manager, Colleague"
                      />
                      <FormField
                        label="Date"
                        type="text"
                        value={rec.date}
                        onChange={(value) => updateRecommendation(rec.id || '', { date: value })}
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <FormField
                      label="Recommendation Text"
                      type="textarea"
                      value={rec.content}
                      onChange={(value) => updateRecommendation(rec.id || '', { content: value })}
                      rows={5}
                      placeholder="Enter the recommendation text..."
                    />
                    <button
                      onClick={() => setEditingRecId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {recommendations.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Star size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No recommendations yet</p>
                {isEditing && (
                  <button
                    onClick={addRecommendation}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Recommendation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Publications Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <BookOpen size={24} style={{ color: colors.primaryBlue }} />
              Publications
            </h3>
            {isEditing && (
              <button
                onClick={addPublication}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Publication
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {publications.map((pub, index) => (
              <div
                key={pub.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {pub.title || 'Publication Title'}
                    </h4>
                    {pub.publisher && (
                      <p 
                        className="text-sm mb-1"
                        style={{ color: colors.primaryBlue }}
                      >
                        {pub.publisher}
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      <span>{pub.publicationDate}</span>
                      <span 
                        className="px-2 py-1 rounded"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                        }}
                      >
                        {pub.type}
                      </span>
                    </div>
                    {pub.authors && pub.authors.length > 0 && (
                      <p 
                        className="text-xs mt-2"
                        style={{ color: colors.secondaryText }}
                      >
                        Authors: {pub.authors.join(', ')}
                      </p>
                    )}
                    {pub.description && (
                      <p 
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: colors.secondaryText }}
                      >
                        {pub.description}
                      </p>
                    )}
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm mt-2"
                        style={{ color: colors.primaryBlue }}
                      >
                        <ExternalLink size={14} />
                        View Publication
                      </a>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPubId(editingPubId === pub.id ? null : pub.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deletePublication(pub.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingPubId === pub.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <FormField
                      label="Title"
                      value={pub.title}
                      onChange={(value) => updatePublication(pub.id || '', { title: value })}
                      placeholder="Publication title"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Publisher"
                        value={pub.publisher || ''}
                        onChange={(value) => updatePublication(pub.id || '', { publisher: value })}
                        placeholder="Publisher name"
                      />
                      <FormField
                        label="Publication Date"
                        type="text"
                        value={pub.publicationDate}
                        onChange={(value) => updatePublication(pub.id || '', { publicationDate: value })}
                        placeholder="YYYY-MM-DD"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                          Type
                        </label>
                        <select
                          id={`publication-type-${pub.id}`}
                          name={`publication-type-${pub.id}`}
                          value={pub.type}
                          onChange={(e) => updatePublication(pub.id || '', { type: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        >
                          <option value="Article">Article</option>
                          <option value="Paper">Paper</option>
                          <option value="Book">Book</option>
                          <option value="Chapter">Chapter</option>
                          <option value="Conference">Conference</option>
                          <option value="Journal">Journal</option>
                        </select>
                      </div>
                      <FormField
                        label="URL"
                        type="url"
                        value={pub.url || ''}
                        onChange={(value) => updatePublication(pub.id || '', { url: value })}
                        placeholder="https://..."
                      />
                    </div>
                    <FormField
                      label="Authors (comma-separated)"
                      value={pub.authors?.join(', ') || ''}
                      onChange={(value) => updatePublication(pub.id || '', { authors: value.split(',').map(a => a.trim()).filter(a => a) })}
                      placeholder="Author 1, Author 2, ..."
                    />
                    <FormField
                      label="Description"
                      type="textarea"
                      value={pub.description || ''}
                      onChange={(value) => updatePublication(pub.id || '', { description: value })}
                      rows={3}
                      placeholder="Brief description..."
                    />
                    <button
                      onClick={() => setEditingPubId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {publications.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <BookOpen size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No publications added yet</p>
                {isEditing && (
                  <button
                    onClick={addPublication}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Publication
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Patents Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Award size={24} style={{ color: colors.primaryBlue }} />
              Patents
            </h3>
            {isEditing && (
              <button
                onClick={addPatent}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Patent
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {patents.map((pat, index) => (
              <div
                key={pat.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {pat.title || 'Patent Title'}
                    </h4>
                    {pat.patentNumber && (
                      <p 
                        className="text-sm mb-1"
                        style={{ color: colors.primaryBlue }}
                      >
                        Patent #{pat.patentNumber}
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      <span>Issued: {pat.issueDate}</span>
                      <span 
                        className="px-2 py-1 rounded"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                        }}
                      >
                        {pat.status}
                      </span>
                    </div>
                    {pat.inventors && pat.inventors.length > 0 && (
                      <p 
                        className="text-xs mt-2"
                        style={{ color: colors.secondaryText }}
                      >
                        Inventors: {pat.inventors.join(', ')}
                      </p>
                    )}
                    {pat.description && (
                      <p 
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: colors.secondaryText }}
                      >
                        {pat.description}
                      </p>
                    )}
                    {pat.url && (
                      <a
                        href={pat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm mt-2"
                        style={{ color: colors.primaryBlue }}
                      >
                        <ExternalLink size={14} />
                        View Patent
                      </a>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPatId(editingPatId === pat.id ? null : pat.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deletePatent(pat.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingPatId === pat.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <FormField
                      label="Title"
                      value={pat.title}
                      onChange={(value) => updatePatent(pat.id || '', { title: value })}
                      placeholder="Patent title"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Patent Number"
                        value={pat.patentNumber || ''}
                        onChange={(value) => updatePatent(pat.id || '', { patentNumber: value })}
                        placeholder="US12345678"
                      />
                      <FormField
                        label="Issue Date"
                        type="text"
                        value={pat.issueDate}
                        onChange={(value) => updatePatent(pat.id || '', { issueDate: value })}
                        placeholder="YYYY-MM-DD"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                          Status
                        </label>
                        <select
                          id={`patent-status-${pat.id}`}
                          name={`patent-status-${pat.id}`}
                          value={pat.status}
                          onChange={(e) => updatePatent(pat.id || '', { status: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        >
                          <option value="Filed">Filed</option>
                          <option value="Pending">Pending</option>
                          <option value="Granted">Granted</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                      <FormField
                        label="URL"
                        type="url"
                        value={pat.url || ''}
                        onChange={(value) => updatePatent(pat.id || '', { url: value })}
                        placeholder="https://..."
                      />
                    </div>
                    <FormField
                      label="Inventors (comma-separated)"
                      value={pat.inventors?.join(', ') || ''}
                      onChange={(value) => updatePatent(pat.id || '', { inventors: value.split(',').map(i => i.trim()).filter(i => i) })}
                      placeholder="Inventor 1, Inventor 2, ..."
                    />
                    <FormField
                      label="Description"
                      type="textarea"
                      value={pat.description || ''}
                      onChange={(value) => updatePatent(pat.id || '', { description: value })}
                      rows={3}
                      placeholder="Brief description..."
                    />
                    <button
                      onClick={() => setEditingPatId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {patents.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Award size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No patents added yet</p>
                {isEditing && (
                  <button
                    onClick={addPatent}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Patent
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Organizations Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <Building2 size={24} style={{ color: colors.primaryBlue }} />
              Organizations & Associations
            </h3>
            {isEditing && (
              <button
                onClick={addOrganization}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Organization
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {organizations.map((org, index) => (
              <div
                key={org.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {org.name || 'Organization'}
                    </h4>
                    {org.role && (
                      <p 
                        className="text-sm mb-1"
                        style={{ color: colors.primaryBlue }}
                      >
                        {org.role}
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      <span 
                        className="px-2 py-1 rounded"
                        style={{
                          background: colors.badgeInfoBg,
                          color: colors.badgeInfoText,
                        }}
                      >
                        {org.type}
                      </span>
                      <span>
                        {org.startDate} - {org.isCurrent ? 'Present' : (org.endDate || 'Present')}
                      </span>
                    </div>
                    {org.description && (
                      <p 
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: colors.secondaryText }}
                      >
                        {org.description}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingOrgId(editingOrgId === org.id ? null : org.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteOrganization(org.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingOrgId === org.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Organization Name"
                        value={org.name}
                        onChange={(value) => updateOrganization(org.id || '', { name: value })}
                        placeholder="Organization name"
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: colors.primaryText }}>
                          Type
                        </label>
                        <select
                          id={`org-type-${org.id}`}
                          name={`org-type-${org.id}`}
                          value={org.type}
                          onChange={(e) => updateOrganization(org.id || '', { type: e.target.value as any })}
                          className="w-full px-4 py-3 rounded-xl"
                          style={{
                            background: colors.inputBackground,
                            border: `1px solid ${colors.border}`,
                            color: colors.primaryText,
                          }}
                        >
                          <option value="Professional Association">Professional Association</option>
                          <option value="Club">Club</option>
                          <option value="Society">Society</option>
                          <option value="Non-profit">Non-profit</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <FormField
                        label="Your Role"
                        value={org.role || ''}
                        onChange={(value) => updateOrganization(org.id || '', { role: value })}
                        placeholder="e.g., Member, Board Member"
                      />
                      <FormField
                        label="Start Date"
                        type="text"
                        value={org.startDate}
                        onChange={(value) => updateOrganization(org.id || '', { startDate: value })}
                        placeholder="MM/YYYY"
                      />
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          type="checkbox"
                          id={`org-current-${org.id}`}
                          name={`org-current-${org.id}`}
                          checked={org.isCurrent}
                          onChange={(e) => updateOrganization(org.id || '', { isCurrent: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`org-current-${org.id}`} className="text-sm" style={{ color: colors.primaryText }}>Current</label>
                        </div>
                      {!org.isCurrent && (
                        <FormField
                          label="End Date"
                          type="text"
                          value={org.endDate || ''}
                          onChange={(value) => updateOrganization(org.id || '', { endDate: value })}
                          placeholder="MM/YYYY"
                        />
                      )}
                    </div>
                    <FormField
                      label="Description"
                      type="textarea"
                      value={org.description || ''}
                      onChange={(value) => updateOrganization(org.id || '', { description: value })}
                      rows={3}
                      placeholder="Describe your involvement..."
                    />
                    <button
                      onClick={() => setEditingOrgId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {organizations.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <Building2 size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No organizations added yet</p>
                {isEditing && (
                  <button
                    onClick={addOrganization}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Organization
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Scores Section */}
        <div 
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          style={{
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-semibold flex items-center gap-2"
              style={{ color: colors.primaryText }}
            >
              <GraduationCap size={24} style={{ color: colors.primaryBlue }} />
              Test Scores
            </h3>
            {isEditing && (
              <button
                onClick={addTestScore}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: colors.primaryBlue,
                  color: 'white',
                }}
              >
                <Plus size={16} />
                Add Test Score
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {testScores.map((test, index) => (
              <div
                key={test.id || index}
                className="p-6 rounded-xl transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.primaryText }}
                    >
                      {test.testName || 'Test Name'}
                    </h4>
                    {test.score && (
                      <p 
                        className="text-xl font-bold mb-1"
                        style={{ color: colors.primaryBlue }}
                      >
                        Score: {test.score}
                      </p>
                    )}
                    {test.percentile !== undefined && (
                      <p 
                        className="text-sm mb-2"
                        style={{ color: colors.secondaryText }}
                      >
                        Percentile: {test.percentile}%
                      </p>
                    )}
                    <div 
                      className="flex items-center gap-4 text-xs mt-2"
                      style={{ color: colors.tertiaryText }}
                    >
                      <span>Test Date: {test.testDate}</span>
                      {test.expiresDate && <span>Expires: {test.expiresDate}</span>}
                    </div>
                    {test.description && (
                      <p 
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: colors.secondaryText }}
                      >
                        {test.description}
                      </p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTestId(editingTestId === test.id ? null : test.id || null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.primaryBlue }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTestScore(test.id || '')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.errorRed }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {editingTestId === test.id && isEditing ? (
                  <div className="space-y-4 mt-4 p-4 rounded-lg" style={{ background: colors.cardBackground }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Test Name"
                        value={test.testName}
                        onChange={(value) => updateTestScore(test.id || '', { testName: value })}
                        placeholder="e.g., SAT, GRE, GMAT, TOEFL"
                      />
                      <FormField
                        label="Score"
                        value={test.score || ''}
                        onChange={(value) => updateTestScore(test.id || '', { score: value })}
                        placeholder="e.g., 1600, 340, 750"
                      />
                      <FormField
                        label="Percentile"
                        type="text"
                        value={test.percentile?.toString() || ''}
                        onChange={(value) => updateTestScore(test.id || '', { percentile: parseInt(value) || undefined })}
                        placeholder="e.g., 95"
                      />
                      <FormField
                        label="Test Date"
                        type="text"
                        value={test.testDate}
                        onChange={(value) => updateTestScore(test.id || '', { testDate: value })}
                        placeholder="YYYY-MM-DD"
                      />
                      <FormField
                        label="Expires Date"
                        type="text"
                        value={test.expiresDate || ''}
                        onChange={(value) => updateTestScore(test.id || '', { expiresDate: value })}
                        placeholder="YYYY-MM-DD (optional)"
                      />
                    </div>
                    <FormField
                      label="Description"
                      type="textarea"
                      value={test.description || ''}
                      onChange={(value) => updateTestScore(test.id || '', { description: value })}
                      rows={2}
                      placeholder="Additional notes..."
                    />
                    <button
                      onClick={() => setEditingTestId(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg"
                      style={{
                        background: colors.primaryBlue,
                        color: 'white',
                      }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            
            {testScores.length === 0 && (
              <div 
                className="text-center py-8"
                style={{ color: colors.tertiaryText }}
              >
                <GraduationCap size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p>No test scores added yet</p>
                {isEditing && (
                  <button
                    onClick={addTestScore}
                    className="mt-4 px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: colors.primaryBlue,
                      color: 'white',
                    }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Test Score
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
