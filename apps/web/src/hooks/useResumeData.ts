import { useState, useEffect, useRef, useCallback } from 'react';
import type { SetStateAction } from 'react';
import { ResumeData, CustomSection, SectionVisibility, CustomField } from '../types/resume';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

const DEFAULT_SECTION_ORDER = ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  summary: true,
  skills: true,
  experience: true,
  education: true,
  projects: true,
  certifications: true,
};

const DEFAULT_FORMATTING = {
  fontFamily: 'arial',
  fontSize: 'ats11pt',
  lineSpacing: 'normal',
  sectionSpacing: 'medium',
  margins: 'normal',
  headingStyle: 'bold',
  bulletStyle: 'disc',
};

const AUTOSAVE_DEBOUNCE_MS = 5000;

const createDefaultResumeData = (): ResumeData => ({
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
      customFields: [],
    },
  ],
  education: [
    {
      id: 1,
      school: 'University of California',
      degree: 'Bachelor of Science in Computer Science',
      startDate: '2016',
      endDate: '2020',
      customFields: [],
    },
  ],
  projects: [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution',
      link: 'https://github.com/johndoe/ecommerce',
      bullets: ['Built with React and Node.js', 'Integrated payment processing', 'Implemented real-time notifications'],
      skills: ['React', 'Node.js', 'MongoDB'],
      customFields: [],
    },
  ],
  certifications: [
    {
      id: 1,
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      link: 'https://aws.amazon.com/certification/',
      skills: ['AWS', 'Cloud Architecture'],
      customFields: [],
    },
  ],
});

const cloneResumeData = (data: ResumeData): ResumeData => JSON.parse(JSON.stringify(data));

interface ResumeSnapshot {
  resumeData: ResumeData;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  customSections: CustomSection[];
  formatting: typeof DEFAULT_FORMATTING;
  customFields?: CustomField[];
}

interface UseResumeDataOptions {
  onResumeLoaded?: (payload: { resume: any; snapshot: ResumeSnapshot }) => void;
}

// Resume data state hook
export const useResumeData = (options: UseResumeDataOptions = {}) => {
  const { onResumeLoaded } = options;
  const suppressTrackingRef = useRef(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialResumeData = useRef(createDefaultResumeData()).current;

  const [resumeFileNameState, _setResumeFileName] = useState('My_Resume');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastServerUpdatedAt, setLastServerUpdatedAt] = useState<string | null>(null);

  const [fontFamilyState, _setFontFamily] = useState(DEFAULT_FORMATTING.fontFamily);
  const [fontSizeState, _setFontSize] = useState(DEFAULT_FORMATTING.fontSize);
  const [lineSpacingState, _setLineSpacing] = useState(DEFAULT_FORMATTING.lineSpacing);
  const [sectionSpacingState, _setSectionSpacing] = useState(DEFAULT_FORMATTING.sectionSpacing);
  const [marginsState, _setMargins] = useState(DEFAULT_FORMATTING.margins);
  const [headingStyleState, _setHeadingStyle] = useState(DEFAULT_FORMATTING.headingStyle);
  const [bulletStyleState, _setBulletStyle] = useState(DEFAULT_FORMATTING.bulletStyle);

  const [resumeDataState, _setResumeData] = useState<ResumeData>(() => cloneResumeData(initialResumeData));
  const [sectionOrderState, _setSectionOrder] = useState<string[]>(() => [...DEFAULT_SECTION_ORDER]);
  const [sectionVisibilityState, _setSectionVisibility] = useState<SectionVisibility>(() => ({ ...DEFAULT_SECTION_VISIBILITY }));
  const [customSectionsState, _setCustomSections] = useState<CustomSection[]>([]);

  const [history, setHistory] = useState<ResumeData[]>(() => [cloneResumeData(initialResumeData)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const runWithoutTracking = useCallback((fn: () => void) => {
    suppressTrackingRef.current = true;
    try {
      fn();
    } finally {
      suppressTrackingRef.current = false;
    }
  }, []);

  const setResumeFileName = useCallback((value: SetStateAction<string>) => {
    _setResumeFileName((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setFontFamily = useCallback((value: SetStateAction<string>) => {
    _setFontFamily((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setFontSize = useCallback((value: SetStateAction<string>) => {
    _setFontSize((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setLineSpacing = useCallback((value: SetStateAction<string>) => {
    _setLineSpacing((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setSectionSpacing = useCallback((value: SetStateAction<string>) => {
    _setSectionSpacing((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setMargins = useCallback((value: SetStateAction<string>) => {
    _setMargins((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setHeadingStyle = useCallback((value: SetStateAction<string>) => {
    _setHeadingStyle((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setBulletStyle = useCallback((value: SetStateAction<string>) => {
    _setBulletStyle((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string) => string)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setResumeData = useCallback((value: SetStateAction<ResumeData>) => {
    _setResumeData((prev) => {
      const next = typeof value === 'function' ? (value as (prev: ResumeData) => ResumeData)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setSectionOrder = useCallback((value: SetStateAction<string[]>) => {
    _setSectionOrder((prev) => {
      const next = typeof value === 'function' ? (value as (prev: string[]) => string[])(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setSectionVisibility = useCallback((value: SetStateAction<SectionVisibility>) => {
    _setSectionVisibility((prev) => {
      const next = typeof value === 'function' ? (value as (prev: SectionVisibility) => SectionVisibility)(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const setCustomSections = useCallback((value: SetStateAction<CustomSection[]>) => {
    _setCustomSections((prev) => {
      const next = typeof value === 'function' ? (value as (prev: CustomSection[]) => CustomSection[])(prev) : value;
      if (!suppressTrackingRef.current && next !== prev) {
        setHasChanges(true);
        setSaveError(null);
      }
      return next;
    });
  }, [setHasChanges, setSaveError]);

  const buildSnapshotFromStoredData = useCallback((stored: any): ResumeSnapshot => {
    const data = stored && typeof stored === 'object' ? stored : {};
    const resumeData = data.resumeData && typeof data.resumeData === 'object'
      ? cloneResumeData(data.resumeData)
      : cloneResumeData(createDefaultResumeData());
    const sectionOrder = Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0
      ? [...data.sectionOrder]
      : [...DEFAULT_SECTION_ORDER];
    const sectionVisibility = {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(data.sectionVisibility && typeof data.sectionVisibility === 'object' ? data.sectionVisibility : {}),
    };
    const customSections = Array.isArray(data.customSections)
      ? [...data.customSections]
      : [];
    const formattingSource = data.formatting && typeof data.formatting === 'object' ? data.formatting : {};
    const formatting = {
      fontFamily: formattingSource.fontFamily || DEFAULT_FORMATTING.fontFamily,
      fontSize: formattingSource.fontSize || DEFAULT_FORMATTING.fontSize,
      lineSpacing: formattingSource.lineSpacing || DEFAULT_FORMATTING.lineSpacing,
      sectionSpacing: formattingSource.sectionSpacing || DEFAULT_FORMATTING.sectionSpacing,
      margins: formattingSource.margins || DEFAULT_FORMATTING.margins,
      headingStyle: formattingSource.headingStyle || DEFAULT_FORMATTING.headingStyle,
      bulletStyle: formattingSource.bulletStyle || DEFAULT_FORMATTING.bulletStyle,
    } as typeof DEFAULT_FORMATTING;
    const customFields = Array.isArray(data.customFields) ? [...data.customFields] : [];

    return {
      resumeData,
      sectionOrder,
      sectionVisibility,
      customSections,
      formatting,
      customFields,
    };
  }, []);

  const applySnapshot = useCallback((snapshot: ResumeSnapshot) => {
    runWithoutTracking(() => {
      _setResumeData(cloneResumeData(snapshot.resumeData));
      _setSectionOrder([...snapshot.sectionOrder]);
      _setSectionVisibility({ ...snapshot.sectionVisibility });
      _setCustomSections([...snapshot.customSections]);
      _setFontFamily(snapshot.formatting.fontFamily);
      _setFontSize(snapshot.formatting.fontSize);
      _setLineSpacing(snapshot.formatting.lineSpacing);
      _setSectionSpacing(snapshot.formatting.sectionSpacing);
      _setMargins(snapshot.formatting.margins);
      _setHeadingStyle(snapshot.formatting.headingStyle);
      _setBulletStyle(snapshot.formatting.bulletStyle);
      setHistory([cloneResumeData(snapshot.resumeData)]);
      setHistoryIndex(0);
    });
    setHasChanges(false);
    setSaveError(null);
  }, [runWithoutTracking, setHasChanges, setSaveError]);

  const applyResumeRecord = useCallback((resumeRecord: any) => {
    if (!resumeRecord) {
      return null;
    }

    const snapshot = buildSnapshotFromStoredData(resumeRecord.data);
    applySnapshot(snapshot);
    runWithoutTracking(() => {
      _setResumeFileName(resumeRecord.fileName || resumeRecord.name || 'My_Resume');
    });
    setCurrentResumeId(resumeRecord.id || null);
    setLastServerUpdatedAt(resumeRecord.lastUpdated || null);
    setLastSavedAt(resumeRecord.lastUpdated ? new Date(resumeRecord.lastUpdated) : null);
    setHasChanges(false);
    return { resume: resumeRecord, snapshot };
  }, [
    applySnapshot,
    buildSnapshotFromStoredData,
    runWithoutTracking,
    setCurrentResumeId,
    setLastServerUpdatedAt,
    setLastSavedAt,
    setHasChanges,
  ]);

  const loadResumeById = useCallback(async (id: string) => {
    if (!id) {
      return null;
    }

    setIsLoading(true);
    try {
      const response = await apiService.getResume(id);
      if (response?.resume) {
        return applyResumeRecord(response.resume);
      }
      throw new Error('Resume not found');
    } catch (error: any) {
      logger.error('Failed to load resume by id:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load resume');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [applyResumeRecord, setSaveError]);

  useEffect(() => {
    const loadResume = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getResumes();
        if (response?.resumes?.length) {
          const resumeRecord = response.resumes[0];
          const applied = applyResumeRecord(resumeRecord);
          if (applied) {
            onResumeLoaded?.(applied);
          }
        } else {
          const snapshot = buildSnapshotFromStoredData({});
          applySnapshot(snapshot);
          runWithoutTracking(() => {
            _setResumeFileName('My_Resume');
          });
          setCurrentResumeId(null);
          setLastServerUpdatedAt(null);
          setLastSavedAt(null);
        }
      } catch (error) {
        logger.error('Failed to load resume:', error);
        setSaveError(error instanceof Error ? error.message : 'Failed to load resume');
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [applySnapshot, applyResumeRecord, buildSnapshotFromStoredData, runWithoutTracking, onResumeLoaded]);

  useEffect(() => {
    if (!hasChanges || !currentResumeId || isSaving) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return undefined;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      autosaveTimerRef.current = null;
      try {
        setIsSaving(true);
        setSaveError(null);

        const payload = {
          data: {
            resumeData: resumeDataState,
            sectionOrder: sectionOrderState,
            sectionVisibility: sectionVisibilityState,
            customSections: customSectionsState,
            formatting: {
              fontFamily: fontFamilyState,
              fontSize: fontSizeState,
              lineSpacing: lineSpacingState,
              sectionSpacing: sectionSpacingState,
              margins: marginsState,
              headingStyle: headingStyleState,
              bulletStyle: bulletStyleState,
            },
          },
          lastKnownServerUpdatedAt: lastServerUpdatedAt,
        };

        const response = await apiService.autoSaveResume(currentResumeId, payload);
        const savedResume = response?.resume;
        if (savedResume) {
          setLastServerUpdatedAt(savedResume.lastUpdated || null);
          if (savedResume.lastUpdated) {
            setLastSavedAt(new Date(savedResume.lastUpdated));
          }
          setHasChanges(false);
        }
      } catch (error: any) {
        logger.error('Auto-save failed:', error);
        if (error?.statusCode === 409) {
          setSaveError('Resume was updated elsewhere. Please reload to sync changes.');
        } else {
          setSaveError(error?.message || 'Auto-save failed');
        }
      } finally {
        setIsSaving(false);
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [
    hasChanges,
    currentResumeId,
    isSaving,
    resumeDataState,
    sectionOrderState,
    sectionVisibilityState,
    customSectionsState,
    fontFamilyState,
    fontSizeState,
    lineSpacingState,
    sectionSpacingState,
    marginsState,
    headingStyleState,
    bulletStyleState,
    lastServerUpdatedAt,
    setHasChanges,
    setIsSaving,
    setSaveError,
    setLastServerUpdatedAt,
    setLastSavedAt,
  ]);

  useEffect(() => () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  return {
    resumeFileName: resumeFileNameState,
    setResumeFileName,
    currentResumeId,
    setCurrentResumeId,
    isLoading,
    hasChanges,
    setHasChanges,
    isSaving,
    setIsSaving,
    saveError,
    setSaveError,
    lastSavedAt,
    setLastSavedAt,
    lastServerUpdatedAt,
    setLastServerUpdatedAt,
    fontFamily: fontFamilyState,
    setFontFamily,
    fontSize: fontSizeState,
    setFontSize,
    lineSpacing: lineSpacingState,
    setLineSpacing,
    sectionSpacing: sectionSpacingState,
    setSectionSpacing,
    margins: marginsState,
    setMargins,
    headingStyle: headingStyleState,
    setHeadingStyle,
    bulletStyle: bulletStyleState,
    setBulletStyle,
    resumeData: resumeDataState,
    setResumeData,
    sectionOrder: sectionOrderState,
    setSectionOrder,
    sectionVisibility: sectionVisibilityState,
    setSectionVisibility,
    customSections: customSectionsState,
    setCustomSections,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    loadResumeById,
    applyResumeRecord,
  };
};
