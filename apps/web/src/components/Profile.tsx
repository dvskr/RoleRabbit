'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Briefcase,
  Award,
  BarChart3,
  LogOut
} from 'lucide-react';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

import {
  ProfileHeader,
  ProfileSidebar,
  ProfileTab,
  ProfessionalTab,
  SkillsTab,
  PreferencesTab,
  SupportTab,
  UserData,
  ProfileTabConfig
} from './profile/index';
import type { Skill, Education } from './profile/types/profile';
type Language = { name: string; proficiency: string };

const ARRAY_FIELD_KEYS: Array<keyof UserData | string> = [
  'skills',
  'certifications',
  'languages',
  'education',
  'careerGoals',
  'targetRoles',
  'targetCompanies',
  'socialLinks',
  'projects',
  'achievements',
  'careerTimeline',
  'workExperiences',
  'volunteerExperiences',
  'recommendations',
  'publications',
  'patents',
  'organizations',
  'testScores'
];

const VALID_WORK_EXPERIENCE_TYPES = [
  'Client Project',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Consulting',
  'Internship'
];

const normalizeToArray = <T = any>(value: any): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return normalizeToArray<T>(parsed);
    } catch {
      return [];
    }
  }
  if (value instanceof Set) {
    return Array.from(value.values()) as T[];
  }
  if (value instanceof Map) {
    return Array.from(value.values()) as T[];
  }
  if (typeof value === 'object') {
    // Handle objects with numeric string keys (e.g., {"0": {...}, "1": {...}})
    // Sort by numeric key to maintain order
    const keys = Object.keys(value);
    const hasNumericKeys = keys.every(key => /^\d+$/.test(key));
    if (hasNumericKeys && keys.length > 0) {
      // Sort by numeric key to maintain order
      const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
      return sortedKeys.map(key => (value as any)[key]).filter((item) => item !== undefined && item !== null) as T[];
    }
    return Object.values(value).filter((item) => item !== undefined && item !== null) as T[];
  }
  return [];
};

const sanitizeWorkExperiences = (experiences: any, options?: { keepDrafts?: boolean }): any[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(experiences);

  return (normalizedArray as any[])
    .map((exp) => {
      if (!exp || typeof exp !== 'object') {
        return null;
      }

      const idSource = exp.id ?? exp._id ?? exp.uuid ?? exp.tempId;
      const id = typeof idSource === 'string' ? idSource : typeof idSource === 'number' ? String(idSource) : undefined;

      const company = typeof exp?.company === 'string' ? exp.company.trim() : '';
      const role = typeof exp?.role === 'string' ? exp.role.trim() : (typeof exp?.title === 'string' ? exp.title.trim() : '');
      const location = typeof exp?.location === 'string' ? exp.location.trim() : '';
      const startDate = typeof exp?.startDate === 'string' ? exp.startDate.trim() : (typeof exp?.start === 'string' ? exp.start.trim() : '');
      const rawEndDate = exp?.endDate ?? exp?.end ?? '';
      const endDate = typeof rawEndDate === 'string' ? rawEndDate.trim() : '';

      let isCurrent = Boolean(exp?.isCurrent || exp?.current || exp?.present);
      if (!isCurrent && endDate) {
        const normalizedEnd = endDate.toLowerCase();
        if (['present', 'current', 'ongoing'].includes(normalizedEnd)) {
          isCurrent = true;
        }
      }

      const normalizedProjectType = (() => {
        if (typeof exp?.projectType === 'string') {
          const match = VALID_WORK_EXPERIENCE_TYPES.find(
            (type) => type.toLowerCase() === exp.projectType.toLowerCase()
          );
          if (match) {
            return match;
          }
        }
        if (typeof exp?.type === 'string') {
          const match = VALID_WORK_EXPERIENCE_TYPES.find(
            (type) => type.toLowerCase() === exp.type.toLowerCase()
          );
          if (match) {
            return match;
          }
        }
        return 'Full-time';
      })();

      const description = typeof exp?.description === 'string' ? exp.description : '';

      const sanitized = {
        ...(id ? { id } : {}),
        company,
        role,
        location,
        startDate,
        endDate: isCurrent ? '' : endDate,
        isCurrent,
        description,
        projectType: normalizedProjectType,
      };

      const hasContent =
        !!sanitized.isCurrent ||
        [sanitized.company, sanitized.role, sanitized.location, sanitized.startDate, sanitized.endDate, description].some(
          (field) => typeof field === 'string' && field.trim().length > 0
        );

      if (!hasContent) {
        if (keepDrafts && (id || exp?.__keepDraft)) {
          return sanitized;
        }
        return null;
      }

      return sanitized;
    })
    .filter(Boolean);
};

export const sanitizeSkills = (skills: any, options?: { keepDrafts?: boolean }): Skill[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(skills);
  const seen = new Set<string>();

  const toStringSafe = (value: any): string => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  };

  const sanitized: Skill[] = [];

  (normalizedArray as any[]).forEach((skill, index) => {
    if (!skill) {
      if (keepDrafts) {
        sanitized.push({
          name: '',
          yearsOfExperience: undefined,
          verified: false,
        });
      }
      return;
    }

    if (typeof skill === 'string') {
      const raw = toStringSafe(skill);
      const trimmedKey = raw.trim().toLowerCase();

      if (!trimmedKey) {
        if (keepDrafts) {
          sanitized.push({
            name: raw,
            yearsOfExperience: undefined,
            verified: false,
          });
        }
        return;
      }

      if (seen.has(trimmedKey)) {
        return;
      }
      seen.add(trimmedKey);

      sanitized.push({
        name: keepDrafts ? raw : raw.trim(),
        yearsOfExperience: undefined,
        verified: false,
      });
      return;
    }

    if (typeof skill !== 'object') {
      return;
    }

    const rawName = toStringSafe(skill.name ?? '');
    const trimmedName = rawName.trim();

    if (!trimmedName) {
      if (keepDrafts) {
        sanitized.push({
          name: rawName,
          yearsOfExperience: undefined,
          verified: Boolean(skill?.verified),
        });
      }
      return;
    }

    const key = trimmedName.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    let yearsOfExperience: number | undefined;
    if (skill?.yearsOfExperience !== undefined && skill?.yearsOfExperience !== null && skill?.yearsOfExperience !== '') {
      const parsedYears = Number(skill.yearsOfExperience);
      if (Number.isFinite(parsedYears)) {
        yearsOfExperience = parsedYears;
      }
    }

    sanitized.push({
      name: keepDrafts ? rawName : trimmedName,
      yearsOfExperience,
      verified: Boolean(skill?.verified),
    });
  });

  if (!keepDrafts) {
    return sanitized.map((skill) => ({
      name: skill.name.trim(),
      yearsOfExperience: skill.yearsOfExperience,
      verified: Boolean(skill.verified),
    }));
  }

  return sanitized;
};

const sanitizeLanguages = (languages: any, options?: { keepDrafts?: boolean }): Language[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(languages);
  const seen = new Set<string>();

  const toStringSafe = (value: any): string => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  };

  return (normalizedArray as any[])
    .map((lang, index) => {
      if (!lang) {
        if (keepDrafts) {
          return { name: '', proficiency: 'Native' } as Language;
        }
        return null;
      }

      if (typeof lang === 'string') {
        const raw = toStringSafe(lang);
        const key = raw.trim().toLowerCase();

        if (!key) {
          if (keepDrafts) {
            return { name: raw, proficiency: 'Native' } as Language;
          }
          return null;
        }

        if (seen.has(key)) {
          return null;
        }
        seen.add(key);

        return {
          name: keepDrafts ? raw : raw.trim(),
          proficiency: 'Native',
        } as Language;
      }

      if (typeof lang !== 'object') {
        return null;
      }

      const rawName = toStringSafe(lang.name ?? '');
      const trimmedName = rawName.trim();

      if (!trimmedName) {
        if (keepDrafts) {
          return {
            name: rawName,
            proficiency: toStringSafe(lang.proficiency ?? 'Native'),
          } as Language;
        }
        return null;
      }

      const key = trimmedName.toLowerCase();
      if (seen.has(key)) {
        return null;
      }
      seen.add(key);

      const rawProficiency = toStringSafe(lang.proficiency ?? 'Native');

      return {
        name: keepDrafts ? rawName : trimmedName,
        proficiency: keepDrafts ? rawProficiency : (rawProficiency.trim() || 'Native'),
      } as Language;
    })
    .filter(Boolean) as Language[];
};

const sanitizeEducation = (educationInput: any, options?: { keepDrafts?: boolean }): Education[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray<Education | any>(educationInput);

  const formatString = (value: any, shouldTrim: boolean): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return shouldTrim ? value.trim() : value;
    }

    return String(value);
  };

  const hasMeaningfulContent = (value: any): boolean => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  };

  return (normalizedArray as any[])
    .map((edu, index) => {
      if (!edu || typeof edu !== 'object') {
        if (keepDrafts) {
          return {
            id: `temp-edu-${index}`,
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            honors: '',
            location: '',
            description: '',
          } as Education;
        }

        return null;
      }

      const idSource = edu.id ?? edu._id ?? edu.uuid ?? edu.tempId ?? edu.educationId;
      const id = typeof idSource === 'string'
        ? idSource
        : (idSource !== undefined && idSource !== null ? String(idSource) : undefined);

      const hasContent = [
        edu.institution,
        edu.degree,
        edu.field,
        edu.startDate ?? edu.start,
        edu.endDate ?? edu.graduationDate ?? edu.completionDate,
        edu.gpa,
        edu.honors ?? edu.awards,
        edu.location,
        edu.description ?? edu.summary,
      ].some(hasMeaningfulContent);

      const sanitized: Education = {
        ...(id ? { id } : {}),
        institution: formatString(edu.institution ?? edu.school ?? edu.university ?? '', !keepDrafts),
        degree: formatString(edu.degree ?? edu.program ?? '', !keepDrafts),
        field: formatString(edu.field ?? edu.major ?? '', !keepDrafts),
        startDate: formatString(edu.startDate ?? edu.start ?? '', !keepDrafts),
        endDate: formatString(edu.endDate ?? edu.graduationDate ?? edu.completionDate ?? '', !keepDrafts),
        gpa: formatString(edu.gpa ?? '', !keepDrafts),
        honors: formatString(edu.honors ?? edu.awards ?? '', !keepDrafts),
        location: formatString(edu.location ?? '', !keepDrafts),
        description: formatString(edu.description ?? edu.summary ?? '', !keepDrafts),
      };

      if (!hasContent) {
        if (keepDrafts && (id || edu.__keepDraft)) {
          return {
            ...sanitized,
            id: id ?? `temp-edu-${index}`,
            __keepDraft: true,
          } as Education & { __keepDraft?: boolean };
        }

        return null;
      }

      if (!keepDrafts) {
        sanitized.institution = sanitized.institution.trim();
        sanitized.degree = sanitized.degree.trim();
        sanitized.field = sanitized.field.trim();
        sanitized.startDate = sanitized.startDate.trim();
        sanitized.endDate = sanitized.endDate.trim();
        sanitized.gpa = sanitized.gpa.trim();
        sanitized.honors = sanitized.honors.trim();
        sanitized.location = sanitized.location.trim();
        sanitized.description = sanitized.description.trim();
      }

      return sanitized;
    })
    .filter(Boolean) as Education[];
};

const sanitizeProjects = (projects: any, options?: { keepDrafts?: boolean }): any[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(projects);

  const toStringSafe = (value: any): string => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  };

  return (normalizedArray as any[])
    .map((proj, index) => {
      if (!proj) {
        if (keepDrafts) {
          return {
            id: `proj-${Date.now()}-${index}`,
            title: '',
            description: '',
            technologies: [],
            date: '',
            link: '',
            github: ''
          };
        }
        return null;
      }

      const id = proj?.id || proj?._id || proj?.uuid || proj?.tempId || (keepDrafts ? `proj-${Date.now()}-${index}` : undefined);
      
      const title = toStringSafe(proj.title || '');
      const description = toStringSafe(proj.description || '');
      const date = toStringSafe(proj.date || '');
      const link = toStringSafe(proj.link || '');
      const github = toStringSafe(proj.github || '');
      
      // Handle technologies - can be array or comma-separated string
      let technologies: string[] = [];
      if (Array.isArray(proj.technologies)) {
        technologies = proj.technologies.map((t: any) => toStringSafe(t)).filter((t: string) => t.length > 0);
      } else if (typeof proj.technologies === 'string') {
        technologies = proj.technologies.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
      }

      // Check if project has any content
      // For saving (keepDrafts: false), require at least title OR description OR technologies
      // Don't filter out projects that have any meaningful content
      const hasContent = !keepDrafts 
        ? (title.trim().length > 0 || description.trim().length > 0 || technologies.length > 0 || date.trim().length > 0 || link.trim().length > 0 || github.trim().length > 0)
        : true; // Keep all projects during editing

      if (!hasContent && !keepDrafts) {
        // Only filter out completely empty projects
        return null;
      }

      const sanitized: any = {
        ...(id ? { id } : {}),
        title: keepDrafts ? title : title.trim(),
        description: keepDrafts ? description : description.trim(),
        technologies: technologies,
        date: keepDrafts ? date : date.trim(),
        link: keepDrafts ? link : link.trim(),
        github: keepDrafts ? github : github.trim()
      };

      // If not keeping drafts, trim all string fields
      if (!keepDrafts) {
        sanitized.title = sanitized.title.trim();
        sanitized.description = sanitized.description.trim();
        sanitized.date = sanitized.date.trim();
        sanitized.link = sanitized.link.trim();
        sanitized.github = sanitized.github.trim();
      }

      return sanitized;
    })
    .filter(Boolean);
};

const sanitizeCertifications = (certifications: any, options?: { keepDrafts?: boolean }): any[] => {
  const keepDrafts = options?.keepDrafts ?? true;
  const normalizedArray = normalizeToArray(certifications);

  const toStringSafe = (value: any): string => {
    if (value === null || value === undefined) return '';
    return typeof value === 'string' ? value : String(value);
  };

  const allowedFields = {
    issuer: true,
    date: true,
    expiryDate: true,
    credentialUrl: true,
  } as const;

  return (normalizedArray as any[])
    .map((cert, index) => {
      if (!cert) {
        if (keepDrafts) {
          return {
            id: `temp-cert-${index}`,
            name: '',
            issuer: '',
            date: '',
            expiryDate: '',
            credentialUrl: '',
            verified: false,
          };
        }
        return null;
      }

      if (typeof cert === 'string') {
        const raw = toStringSafe(cert);
        const trimmedName = raw.trim();

        if (!trimmedName) {
          if (keepDrafts) {
            return {
              name: raw,
              issuer: '',
              date: '',
              expiryDate: '',
              credentialUrl: '',
              verified: false,
            };
          }
          return null;
        }

        return {
          name: keepDrafts ? raw : trimmedName,
          issuer: '',
          date: '',
          expiryDate: '',
          credentialUrl: '',
          verified: false,
        };
      }

      if (typeof cert !== 'object') {
        return null;
      }

      const idSource = cert.id ?? cert._id ?? cert.uuid ?? cert.tempId;
      const id = typeof idSource === 'string' ? idSource : (idSource !== undefined ? String(idSource) : undefined);

      const rawName = toStringSafe(cert.name ?? cert.title ?? '');
      const trimmedName = rawName.trim();

      if (!trimmedName) {
        if (keepDrafts) {
          const draft: any = {
            ...(id ? { id } : {}),
            name: rawName,
            issuer: toStringSafe(cert.issuer ?? ''),
            date: toStringSafe(cert.date ?? ''),
            expiryDate: toStringSafe(cert.expiryDate ?? ''),
            credentialUrl: toStringSafe(cert.credentialUrl ?? cert.url ?? ''),
            verified: Boolean(cert?.verified),
            __keepDraft: true,
          };
          return draft;
        }
        return null;
      }

      const sanitized: any = {
        ...(id ? { id } : {}),
        name: keepDrafts ? rawName : trimmedName,
        issuer: keepDrafts ? toStringSafe(cert.issuer ?? '') : toStringSafe(cert.issuer ?? '').trim(),
        date: keepDrafts ? toStringSafe(cert.date ?? '') : toStringSafe(cert.date ?? '').trim(),
        expiryDate: keepDrafts ? toStringSafe(cert.expiryDate ?? '') : toStringSafe(cert.expiryDate ?? '').trim(),
        credentialUrl: keepDrafts ? toStringSafe(cert.credentialUrl ?? cert.url ?? '') : toStringSafe(cert.credentialUrl ?? cert.url ?? '').trim(),
        verified: Boolean(cert?.verified),
      };

      if (!keepDrafts) {
        sanitized.name = sanitized.name.trim();
        sanitized.issuer = sanitized.issuer.trim();
        sanitized.date = sanitized.date.trim();
        sanitized.expiryDate = sanitized.expiryDate.trim();
        sanitized.credentialUrl = sanitized.credentialUrl.trim();
      }

      return sanitized;
    })
    .filter(Boolean);
};

export default function Profile() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { userData: contextUserData, isLoading: contextLoading, refreshProfile, updateProfileData } = useProfile();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Guard: Only allow authenticated users to access profile
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: colors.errorRed }}>
            You must be signed in to access your profile.
          </p>
        </div>
      </div>
    );
  }
  
  // Persist active tab across page refreshes
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('profileActiveTab');
      return savedTab || 'profile';
    }
    return 'profile';
  });
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab);
    }
  }, [activeTab]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Use profile data from context (loaded once at app startup)
  const userData = contextUserData;
  const isLoading = contextLoading;
  
  // Local state for editing - allows immediate updates while typing
  const [localProfileData, setLocalProfileData] = useState<UserData | null>(null);

  const tabs: ProfileTabConfig[] = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills and Education', icon: Award },
    { id: 'preferences', label: 'Preferences & Security', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  // Create default empty data for first-time users
  const defaultUserData: UserData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  professionalBio: '',
    profilePicture: null,
    currentRole: '',
    currentCompany: '',
    experience: '',
    industry: '',
    jobLevel: '',
    employmentType: '',
    availability: '',
    salaryExpectation: '',
    workPreference: '',
    skills: [],
    certifications: [],
    languages: [],
    education: [],
    careerGoals: [],
    targetRoles: [],
    targetCompanies: [],
    relocationWillingness: '',
    portfolio: '',
    linkedin: '',
    github: '',
    website: '',
    socialLinks: [],
    projects: [],
    achievements: [],
      careerTimeline: [],
      workExperiences: [],
      volunteerExperiences: [],
      recommendations: [],
      publications: [],
      patents: [],
      organizations: [],
      testScores: [],
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    profileViews: 0,
    successRate: 0,
    profileCompleteness: 0,
    skillMatchRate: 0,
    avgResponseTime: 0,
  };

  // Use local state if editing, otherwise use context data or defaults
  // Initialize local state when userData loads or when entering edit mode
  useEffect(() => {
    // CRITICAL: Don't update localProfileData during save operation or after save
    // This prevents data from vanishing when updateProfileData is called
    if (isSaving || isSaved) {
      logger.debug('useEffect skipped - isSaving or isSaved flag is set');
      return;
    }
    
    // Always sync with context data when available
    if (userData) {
      // Only sync when NOT editing to preserve user's unsaved changes
      // Initialize if missing, but don't overwrite if user is actively editing
      if (!localProfileData) {
        // First time load - initialize
        logger.debug('Initializing localProfileData from userData');
        setLocalProfileData(userData);
      } else if (!isEditing) {
        // Only sync when not editing to get latest data from server
        // But ONLY if localProfileData doesn't have more work experiences
        // This prevents clearing data that was just saved
        const localWorkExpCount = localProfileData.workExperiences?.length || 0;
        const contextWorkExpCount = userData.workExperiences?.length || 0;
        
        logger.debug('useEffect sync check:', {
          isEditing,
          localWorkExpCount,
          contextWorkExpCount,
          willSkip: localWorkExpCount > contextWorkExpCount
        });
        
        // CRITICAL: Never overwrite if local has more items (user just saved)
        // Also check if arrays actually differ to avoid unnecessary updates
        if (localWorkExpCount > contextWorkExpCount) {
          // Local has more data - don't overwrite (user just saved)
          logger.debug('Skipping sync - local has more work experiences');
          return;
        }
        
        // Only update if context has more or equal data, and data is actually different
        const hasChanges = JSON.stringify(localProfileData.workExperiences) !== JSON.stringify(userData.workExperiences) ||
                          JSON.stringify(localProfileData.education) !== JSON.stringify(userData.education) ||
                          JSON.stringify(localProfileData.certifications) !== JSON.stringify(userData.certifications);
        
        if (hasChanges && localWorkExpCount <= contextWorkExpCount) {
          logger.debug('Syncing localProfileData with userData');
          setLocalProfileData(userData);
        }
      }
      // When editing, preserve localProfileData to keep user's unsaved changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, isEditing, isSaving, isSaved]);

  // Use localProfileData if available during editing to prevent flashing
  // CRITICAL: Ensure arrays are always defined (never undefined/null)
  const getDisplayData = (): UserData => {
    if (isEditing) {
      if (localProfileData !== null && localProfileData !== undefined) {
        // Ensure arrays exist - if they're missing, use defaults or empty arrays
        return {
          ...defaultUserData,
          ...localProfileData,
          workExperiences: sanitizeWorkExperiences(localProfileData.workExperiences),
          education: sanitizeEducation(localProfileData.education),
          certifications: sanitizeCertifications(localProfileData.certifications),
          skills: sanitizeSkills(localProfileData.skills),
          languages: sanitizeLanguages(localProfileData.languages),
          projects: normalizeToArray(localProfileData.projects),
          achievements: normalizeToArray(localProfileData.achievements),
          socialLinks: normalizeToArray(localProfileData.socialLinks),
          careerGoals: normalizeToArray(localProfileData.careerGoals),
          targetRoles: normalizeToArray(localProfileData.targetRoles),
          targetCompanies: normalizeToArray(localProfileData.targetCompanies),
          careerTimeline: normalizeToArray(localProfileData.careerTimeline),
          volunteerExperiences: normalizeToArray(localProfileData.volunteerExperiences),
          recommendations: normalizeToArray(localProfileData.recommendations),
          publications: normalizeToArray(localProfileData.publications),
          patents: normalizeToArray(localProfileData.patents),
          organizations: normalizeToArray(localProfileData.organizations),
          testScores: normalizeToArray(localProfileData.testScores),
        };
      }
      // Fallback to userData if localProfileData is null
      if (userData) {
        return {
          ...defaultUserData,
          ...userData,
          workExperiences: sanitizeWorkExperiences(userData.workExperiences),
          education: sanitizeEducation(userData.education),
          certifications: sanitizeCertifications(userData.certifications),
          skills: sanitizeSkills(userData.skills),
          languages: sanitizeLanguages(userData.languages),
          projects: normalizeToArray(userData.projects),
          achievements: normalizeToArray(userData.achievements),
          socialLinks: normalizeToArray(userData.socialLinks),
          careerGoals: normalizeToArray(userData.careerGoals),
          targetRoles: normalizeToArray(userData.targetRoles),
          targetCompanies: normalizeToArray(userData.targetCompanies),
          careerTimeline: normalizeToArray(userData.careerTimeline),
          volunteerExperiences: normalizeToArray(userData.volunteerExperiences),
          recommendations: normalizeToArray(userData.recommendations),
          publications: normalizeToArray(userData.publications),
          patents: normalizeToArray(userData.patents),
          organizations: normalizeToArray(userData.organizations),
          testScores: normalizeToArray(userData.testScores),
        };
      }
      return defaultUserData;
    }
    // Not editing - use userData from context
    if (userData) {
      return {
        ...defaultUserData,
        ...userData,
        workExperiences: sanitizeWorkExperiences(userData.workExperiences),
        education: sanitizeEducation(userData.education),
        certifications: sanitizeCertifications(userData.certifications),
        skills: sanitizeSkills(userData.skills),
        languages: sanitizeLanguages(userData.languages),
        projects: normalizeToArray(userData.projects),
        achievements: normalizeToArray(userData.achievements),
        socialLinks: normalizeToArray(userData.socialLinks),
        careerGoals: normalizeToArray(userData.careerGoals),
        targetRoles: normalizeToArray(userData.targetRoles),
        targetCompanies: normalizeToArray(userData.targetCompanies),
        careerTimeline: normalizeToArray(userData.careerTimeline),
        volunteerExperiences: normalizeToArray(userData.volunteerExperiences),
        recommendations: normalizeToArray(userData.recommendations),
        publications: normalizeToArray(userData.publications),
        patents: normalizeToArray(userData.patents),
        organizations: normalizeToArray(userData.organizations),
        testScores: normalizeToArray(userData.testScores),
      };
    }
    return defaultUserData;
  };
  
  const displayData = getDisplayData();
  
  // Debug logging for displayData
  logger.debug('Profile - displayData workExperiences:', {
    isEditing,
    hasLocalProfileData: !!localProfileData,
    localWorkExpCount: localProfileData?.workExperiences?.length || 0,
    userDataWorkExpCount: userData?.workExperiences?.length || 0,
    displayWorkExpCount: displayData.workExperiences?.length || 0,
    displayWorkExperiences: displayData.workExperiences,
    localWorkExperiences: localProfileData?.workExperiences,
    userDataWorkExperiences: userData?.workExperiences,
    displayDataKeys: Object.keys(displayData),
    displayDataHasWorkExp: 'workExperiences' in displayData
  });

  // Calculate profile completeness
  const calculateCompleteness = (): number => {
    const data = displayData;
    let completed = 0;
    
    // Helper function to safely parse JSON arrays
    const safeParseArray = (data: any): any[] => normalizeToArray(data);
    
    // Personal Information (8 points)
    const personalInfo = {
      firstName: !!data.firstName,
      lastName: !!data.lastName,
      email: !!data.email,
      phone: !!data.phone,
      location: !!data.location,
      bio: !!(((data.professionalBio ?? data.bio) || '').length > 50),
      profilePicture: !!data.profilePicture,
      currentRole: !!data.currentRole
    };
    const personalCompleted = Object.values(personalInfo).filter(Boolean).length;
    completed += personalCompleted;
    
    // Skills (1 point if at least 3 skills)
    const skills = safeParseArray(data.skills);
    if (skills.length >= 3) completed++;
    
    // Certifications (1 point if at least 1)
    const certs = safeParseArray(data.certifications);
    if (certs.length >= 1) completed++;
    
    // Languages (1 point if at least 1)
    const languages = safeParseArray(data.languages);
    if (languages.length >= 1) completed++;
    
    // Work Experience (1 point if at least 1)
    const workExp = safeParseArray(data.workExperiences);
    if (workExp.length >= 1) completed++;
    
    // Projects (1 point if at least 1)
    const projects = safeParseArray(data.projects);
    if (projects.length >= 1) completed++;
    
    
    // Education (1 point if present)
    const education = safeParseArray(data.education);
    if (education.length >= 1) completed++;
    
    // Social Links (1 point if at least 1)
    const socialLinks = safeParseArray(data.socialLinks);
    if (socialLinks.length >= 1) completed++;
    
    // Total: 8 (personal) + 8 (other sections) = 16 points max
    const total = 16;
    return Math.round((completed / total) * 100);
  };

  const profileCompleteness = calculateCompleteness();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      // Save user profile via API using displayData (which has latest local edits)
      // CRITICAL: Use displayData as it reflects the current UI state
      const dataToSave = displayData;
      
      logger.debug('=== SAVE OPERATION START ===');
      logger.debug('displayData workExperiences:', displayData.workExperiences);
      logger.debug('displayData workExperiences count:', displayData.workExperiences?.length || 0);
      logger.debug('localProfileData workExperiences:', localProfileData?.workExperiences);
      logger.debug('localProfileData workExperiences count:', localProfileData?.workExperiences?.length || 0);
      
      // Clean up data before sending - remove null/undefined values and ensure arrays are arrays
      // Also exclude large base64 profile pictures (those should be uploaded separately)
      // Exclude email field - login email cannot be changed
      // Exclude id and userId fields - these cannot be modified
      const cleanedData: Partial<UserData> = {};
      Object.keys(dataToSave).forEach(key => {
        const value = (dataToSave as any)[key];
        // Skip email field - login email cannot be changed
        if (key === 'email') {
          return;
        }
        // Skip id and userId fields - these cannot be modified
        if (key === 'id' || key === 'userId') {
          return;
        }
        // Skip profile picture if it's a large base64 string (upload separately)
        if (key === 'profilePicture' && typeof value === 'string' && value.startsWith('data:') && value.length > 10000) {
          // Profile picture will be uploaded separately, skip from general update
          return;
        }
        // CRITICAL: Always include arrays, even if empty (they need to be sent to API to replace existing data)
        if (ARRAY_FIELD_KEYS.includes(key)) {
          if (key === 'workExperiences') {
            const sanitizedExperiences = sanitizeWorkExperiences(value, { keepDrafts: false });
            cleanedData[key as keyof UserData] = sanitizedExperiences as any;
          } else if (key === 'education') {
            const sanitizedEducation = sanitizeEducation(value, { keepDrafts: false });
            cleanedData[key as keyof UserData] = sanitizedEducation as any;
          } else if (key === 'skills') {
            const sanitizedSkills = sanitizeSkills(value, { keepDrafts: false });
            cleanedData[key as keyof UserData] = sanitizedSkills as any;
          } else if (key === 'languages') {
            const sanitizedLanguages = sanitizeLanguages(value, { keepDrafts: false });
            cleanedData[key as keyof UserData] = sanitizedLanguages as any;
          } else if (key === 'certifications') {
            const sanitizedCerts = sanitizeCertifications(value, { keepDrafts: false });
            cleanedData[key as keyof UserData] = sanitizedCerts as any;
          } else if (key === 'projects') {
            logger.debug('=== PROJECTS SANITIZATION ===');
            logger.debug('Projects before sanitization:', value);
            logger.debug('Projects type:', typeof value, Array.isArray(value));
            logger.debug('Projects length:', value?.length);
            const sanitizedProjects = sanitizeProjects(value, { keepDrafts: false });
            logger.debug('Projects after sanitization:', sanitizedProjects);
            logger.debug('Sanitized projects count:', sanitizedProjects.length);
            cleanedData[key as keyof UserData] = sanitizedProjects as any;
          } else {
            const normalizedArray = normalizeToArray(value);
            cleanedData[key as keyof UserData] = normalizedArray as any;
          }
        } else if (value !== null && value !== undefined) {
          // Handle objects and primitives
          if (typeof value === 'object' && !Array.isArray(value)) {
            cleanedData[key as keyof UserData] = value as any;
          } else {
            cleanedData[key as keyof UserData] = value as any;
          }
        }
      });
      
      logger.debug('=== CLEANED DATA TO SEND ===');
      logger.debug('workExperiences in cleanedData:', cleanedData.workExperiences);
      logger.debug('workExperiences count:', cleanedData.workExperiences?.length || 0);
      logger.debug('projects in cleanedData:', cleanedData.projects);
      logger.debug('projects count:', cleanedData.projects?.length || 0);
      logger.debug('projects type:', typeof cleanedData.projects, Array.isArray(cleanedData.projects));
      logger.debug('All cleanedData keys:', Object.keys(cleanedData));
      
      const response = await apiService.updateUserProfile(cleanedData);
      logger.debug('=== API RESPONSE RECEIVED ===');
      logger.debug('Profile saved successfully via API');
      logger.debug('API Response:', response);
      logger.debug('Response workExperiences:', response?.user?.workExperiences);
      logger.debug('Response workExperiences count:', response?.user?.workExperiences?.length || 0);
      logger.debug('Response projects:', response?.user?.projects);
      logger.debug('Response projects count:', response?.user?.projects?.length || 0);
      logger.debug('Response profile.projects:', response?.user?.profile?.projects);
      logger.debug('Response profile.projects count:', response?.user?.profile?.projects?.length || 0);
      
      // Update local state with the response data (which includes nested arrays from DB)
      if (response && response.user) {
        const savedUserData = response.user as any;
        logger.debug('Saved user data from API:', {
          workExperiences: savedUserData.workExperiences,
          workExperiencesCount: savedUserData.workExperiences?.length || 0,
          profile: savedUserData.profile,
          profileWorkExperiences: savedUserData.profile?.workExperiences
        });
        
        // Extract data from API response structure
        // API returns: { user: { profile: { workExperiences: [...] }, workExperiences: [...], ... } }
        // The API response has workExperiences at both top level (user) and nested (user.profile)
        // We need to extract from the correct location based on API structure
        const profileData = savedUserData.profile || {};
        
        // Extract arrays - check both locations (top level and nested in profile)
        const apiWorkExperiences = savedUserData.workExperiences || profileData.workExperiences || [];
        const apiEducation = savedUserData.education || profileData.education || [];
        const apiCertifications = savedUserData.certifications || profileData.certifications || [];
        const apiSocialLinks = savedUserData.socialLinks || profileData.socialLinks || [];
        const apiProjects = savedUserData.projects || profileData.projects || [];
        const apiAchievements = savedUserData.achievements || profileData.achievements || [];
        const apiSkills = savedUserData.skills || profileData.skills || [];
        
        logger.debug('Extracted API data:', {
          workExperiences: apiWorkExperiences,
          workExperiencesCount: apiWorkExperiences.length,
          savedUserDataKeys: Object.keys(savedUserData),
          profileDataKeys: Object.keys(profileData),
          savedUserDataWorkExp: savedUserData.workExperiences,
          profileDataWorkExp: profileData.workExperiences
        });
        
        // Use the saved data from API response - it has the latest from DB
        // Merge with localProfileData to preserve any fields not in response
        // IMPORTANT: Spread savedUserData first, then override with arrays from correct location
        const updatedLocalData = localProfileData ? {
          ...localProfileData,
          ...savedUserData,
          ...profileData, // Spread profile data for fields like firstName, lastName, etc.
          // CRITICAL: Use arrays from API response (they come from DB)
          // Explicitly set arrays to ensure they're not lost in the spread
          workExperiences: apiWorkExperiences,
          education: apiEducation,
          certifications: apiCertifications,
          socialLinks: apiSocialLinks,
          projects: apiProjects,
          achievements: apiAchievements,
          skills: apiSkills,
        } : {
          ...savedUserData,
          ...profileData,
          workExperiences: apiWorkExperiences,
          education: apiEducation,
          certifications: apiCertifications,
          socialLinks: apiSocialLinks,
          projects: apiProjects,
          achievements: apiAchievements,
          skills: apiSkills,
        };
        
        logger.debug('Updated local data:', {
          workExperiences: updatedLocalData.workExperiences,
          workExperiencesCount: updatedLocalData.workExperiences?.length || 0
        });
        
        // CRITICAL: Set local state FIRST to prevent flashing
        setLocalProfileData(updatedLocalData);
        
        // Update context with COMPLETE saved data from API response
        // CRITICAL: Pass the entire updatedLocalData, not just arrays, to ensure context has full data
        // This prevents the useEffect from overwriting with stale context data
        updateProfileData(updatedLocalData);
        
        logger.debug('Context updated with saved data:', {
          workExperiences: updatedLocalData.workExperiences?.length || 0,
          education: updatedLocalData.education?.length || 0,
          certifications: updatedLocalData.certifications?.length || 0
        });
      } else {
        // Fallback: update with cleanedData if no response
        const updatedLocalData = localProfileData ? { ...localProfileData, ...cleanedData } : localProfileData;
        if (updatedLocalData) {
          setLocalProfileData(updatedLocalData);
          updateProfileData(cleanedData);
        }
      }
      
      // DON'T call refreshProfile() here - it causes flashing and overwrites local state
      // The API response already contains the saved data from DB
      
      // Update all states in one batch using React's automatic batching
      setIsSaving(false);
      setIsSaved(true);
      
      // Reset saved status after 3 seconds - faster transition back to "Save" button
      // This gives enough time to show "Saved" feedback but allows quick re-saving
      setTimeout(() => {
        setIsSaved(false);
        logger.debug('isSaved flag cleared');
      }, 3000); // Reduced to 3s for faster transition
    } catch (error: any) {
      logger.error('Failed to save profile:', error);
      setIsSaving(false);
      
      // Provide more helpful error message
      let errorMessage = 'Failed to save profile. Please try again.';
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Cannot connect to server. Please ensure the API server is running on http://localhost:3001';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSaveMessage({ 
        type: 'error', 
        text: errorMessage
      });
      // Clear message after 5 seconds
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleUserDataChange = (data: Partial<UserData>) => {
    // Guard: Only allow authenticated users to modify profile data
    if (!isAuthenticated) {
      setSaveMessage({ 
        type: 'error', 
        text: 'You must be signed in to modify your profile.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }
    
    // Reset saved state when user makes changes - button should change back to "Save"
    if (isSaved) {
      setIsSaved(false);
      logger.debug('isSaved reset to false - user made changes');
    }
    
    logger.debug('=== handleUserDataChange called ===');
    logger.debug('Received data:', data);
    logger.debug('workExperiences in data:', data.workExperiences);
    logger.debug('workExperiences count:', data.workExperiences?.length || 0);
    
    const normalizedChange: Partial<UserData> = {};
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (key === 'workExperiences') {
        const sanitizedExperiences = sanitizeWorkExperiences(value);
        (normalizedChange as any)[key] = sanitizedExperiences;
        logger.debug(`Sanitized work experiences field ${key}:`, sanitizedExperiences);
      } else if (key === 'education') {
        const sanitizedEdu = sanitizeEducation(value);
        (normalizedChange as any)[key] = sanitizedEdu;
        logger.debug(`Sanitized education field ${key}:`, sanitizedEdu);
      } else if (key === 'skills') {
        const sanitizedSkills = sanitizeSkills(value);
        (normalizedChange as any)[key] = sanitizedSkills;
        logger.debug(`Sanitized skills field ${key}:`, sanitizedSkills);
      } else if (key === 'languages') {
        const sanitizedLanguages = sanitizeLanguages(value);
        (normalizedChange as any)[key] = sanitizedLanguages;
        logger.debug(`Sanitized languages field ${key}:`, sanitizedLanguages);
      } else if (key === 'certifications') {
        const sanitizedCerts = sanitizeCertifications(value);
        (normalizedChange as any)[key] = sanitizedCerts;
        logger.debug(`Sanitized certifications field ${key}:`, sanitizedCerts);
      } else if (ARRAY_FIELD_KEYS.includes(key)) {
        const normalizedArray = normalizeToArray(value);
        (normalizedChange as any)[key] = normalizedArray;
        logger.debug(`Normalized array field ${key}:`, normalizedArray);
      } else {
        (normalizedChange as any)[key] = value;
      }
    });

    // Update local state immediately for responsive typing
    if (localProfileData) {
      const updatedData = { ...localProfileData };
      Object.keys(normalizedChange).forEach((key) => {
        (updatedData as any)[key] = (normalizedChange as any)[key];
      });

      // CRITICAL: Ensure arrays are always defined (never undefined/null)
      // This prevents workExperiences from being lost
      const safeUpdatedData = {
        ...updatedData,
        workExperiences: sanitizeWorkExperiences(updatedData.workExperiences),
        education: sanitizeEducation(updatedData.education),
        certifications: sanitizeCertifications(updatedData.certifications),
        skills: sanitizeSkills(updatedData.skills),
        languages: sanitizeLanguages(updatedData.languages),
        projects: normalizeToArray(updatedData.projects),
        achievements: normalizeToArray(updatedData.achievements),
        socialLinks: normalizeToArray(updatedData.socialLinks),
        careerGoals: normalizeToArray(updatedData.careerGoals),
        targetRoles: normalizeToArray(updatedData.targetRoles),
        targetCompanies: normalizeToArray(updatedData.targetCompanies),
        careerTimeline: normalizeToArray(updatedData.careerTimeline),
        volunteerExperiences: normalizeToArray(updatedData.volunteerExperiences),
        recommendations: normalizeToArray(updatedData.recommendations),
        publications: normalizeToArray(updatedData.publications),
        patents: normalizeToArray(updatedData.patents),
        organizations: normalizeToArray(updatedData.organizations),
        testScores: normalizeToArray(updatedData.testScores),
      };

      logger.debug('Updated localProfileData workExperiences:', safeUpdatedData.workExperiences);
      logger.debug('Updated localProfileData workExperiences count:', safeUpdatedData.workExperiences?.length || 0);
      logger.debug('Safe updated data keys:', Object.keys(safeUpdatedData));

      setLocalProfileData(safeUpdatedData);
    } else {
      // Initialize local state if it doesn't exist
      const currentData = userData || defaultUserData;
      const resolveArrayField = (field: keyof UserData) => {
        if ((normalizedChange as any)[field] !== undefined) {
          if (field === 'workExperiences') {
            return sanitizeWorkExperiences((normalizedChange as any)[field]);
          }
          if (field === 'education') {
            return sanitizeEducation((normalizedChange as any)[field]);
          }
          if (field === 'skills') {
            return sanitizeSkills((normalizedChange as any)[field]);
          }
          if (field === 'languages') {
            return sanitizeLanguages((normalizedChange as any)[field]);
          }
          if (field === 'certifications') {
            return sanitizeCertifications((normalizedChange as any)[field]);
          }
          return normalizeToArray((normalizedChange as any)[field]);
        }
        if (field === 'workExperiences') {
          return sanitizeWorkExperiences((currentData as any)[field]);
        }
        if (field === 'education') {
          return sanitizeEducation((currentData as any)[field]);
        }
        if (field === 'skills') {
          return sanitizeSkills((currentData as any)[field]);
        }
        if (field === 'languages') {
          return sanitizeLanguages((currentData as any)[field]);
        }
        if (field === 'certifications') {
          return sanitizeCertifications((currentData as any)[field]);
        }
        return normalizeToArray((currentData as any)[field]);
      };

      const newData = {
        ...currentData,
        ...normalizedChange,
        workExperiences: resolveArrayField('workExperiences'),
        education: resolveArrayField('education'),
        certifications: resolveArrayField('certifications'),
        skills: resolveArrayField('skills'),
        languages: resolveArrayField('languages'),
        projects: resolveArrayField('projects'),
        achievements: resolveArrayField('achievements'),
        socialLinks: resolveArrayField('socialLinks'),
        careerGoals: resolveArrayField('careerGoals'),
        targetRoles: resolveArrayField('targetRoles'),
        targetCompanies: resolveArrayField('targetCompanies'),
        careerTimeline: resolveArrayField('careerTimeline'),
        volunteerExperiences: resolveArrayField('volunteerExperiences'),
        recommendations: resolveArrayField('recommendations'),
        publications: resolveArrayField('publications'),
        patents: resolveArrayField('patents'),
        organizations: resolveArrayField('organizations'),
        testScores: resolveArrayField('testScores'),
      };
      logger.debug('Initializing localProfileData with workExperiences:', newData.workExperiences);
      logger.debug('Initializing localProfileData workExperiences count:', newData.workExperiences?.length || 0);
      setLocalProfileData(newData);
    }

    // Also update context for consistency (but don't rely on it for local edits)
    const contextUpdate: Partial<UserData> = {};
    Object.keys(normalizedChange).forEach((key) => {
      if (key === 'workExperiences') {
        (contextUpdate as any)[key] = sanitizeWorkExperiences((normalizedChange as any)[key]);
      } else if (key === 'education') {
        (contextUpdate as any)[key] = sanitizeEducation((normalizedChange as any)[key]);
      } else if (key === 'skills') {
        (contextUpdate as any)[key] = sanitizeSkills((normalizedChange as any)[key]);
      } else if (key === 'languages') {
        (contextUpdate as any)[key] = sanitizeLanguages((normalizedChange as any)[key]);
      } else if (key === 'certifications') {
        (contextUpdate as any)[key] = sanitizeCertifications((normalizedChange as any)[key]);
      } else {
        (contextUpdate as any)[key] = (normalizedChange as any)[key];
      }
    });
    if (Object.keys(contextUpdate).length > 0) {
      updateProfileData(contextUpdate);
    }
  };

  const handleChangePhoto = async (newPictureUrl: string | null) => {
    try {
      // Update the profile picture in local state
      updateProfileData({ profilePicture: newPictureUrl });
      // Refresh profile to get the latest data
      await refreshProfile();
      const message = newPictureUrl ? 'Profile picture updated successfully!' : 'Profile picture removed successfully!';
      setSaveMessage({ type: 'success', text: message });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      logger.error('Failed to update profile picture:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Failed to update profile picture. Please try again.' 
      });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Show loading state only when actually loading
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const commonProps = {
      userData: displayData,
      isEditing,
      onUserDataChange: handleUserDataChange
    };

    switch (activeTab) {
      case 'profile':
        return <ProfileTab {...commonProps} onChangePhoto={handleChangePhoto} />;
      case 'professional':
        return <ProfessionalTab {...commonProps} />;
      case 'skills':
        return <SkillsTab {...commonProps} />;
      case 'preferences':
        return <PreferencesTab {...commonProps} />;
      case 'support':
        return <SupportTab />;
      default:
        return (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">This section is coming soon...</p>
                  </div>
        );
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Error Message Only (Success shown in button) */}
      {saveMessage && saveMessage.type === 'error' && (
        <div 
          className="mx-4 mt-4 p-4 rounded-xl shadow-lg flex items-center justify-between bg-red-50 border border-red-200"
        >
          <p className="text-sm font-medium text-red-800">
            {saveMessage.text}
          </p>
          <button
            onClick={() => setSaveMessage(null)}
            className="ml-4 text-lg font-bold text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        isSaved={isSaved}
        profileCompleteness={profileCompleteness}
        onEdit={() => {
          setIsEditing(true);
          setIsSaved(false); // Reset saved state when entering edit mode
          setIsSaving(false); // Reset saving state
          // Initialize local state when entering edit mode
          if (userData) {
            setLocalProfileData(userData);
          }
        }}
        onCancel={() => {
          setIsEditing(false);
          setIsSaved(false); // Reset saved state when canceling
          setIsSaving(false); // Reset saving state
          // Reset local state to match context when canceling (no refresh needed - just discard changes)
          setLocalProfileData(null);
        }}
        onSave={handleSave}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Enhanced Sidebar with Proper Spacing */}
        <ProfileSidebar
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={setActiveTab}
        />

        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              {renderTabContent()}
                      </div>
          </div>
        </div>
      </div>
    </div>
  );
}
