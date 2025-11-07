import { useState, useEffect, useRef, useCallback } from 'react';
import type { SetStateAction } from 'react';
import { ResumeData, CustomSection, SectionVisibility, CustomField } from '../types/resume';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';
import { sanitizeResumeData, validateResumeData } from '../utils/validation';
import { formatErrorForDisplay } from '../utils/errorMessages';
import { offlineQueue } from '../utils/offlineQueue';
import { isOnline } from '../utils/retryHandler';

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

  const [resumeFileNameState, _setResumeFileName] = useState('');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastServerUpdatedAt, setLastServerUpdatedAt] = useState<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);

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
  
  // Refs to store latest state values for auto-save (to avoid dependency issues)
  const resumeDataRef = useRef(resumeDataState);
  const sectionOrderRef = useRef(sectionOrderState);
  const sectionVisibilityRef = useRef(sectionVisibilityState);
  const customSectionsRef = useRef(customSectionsState);
  const fontFamilyRef = useRef(fontFamilyState);
  const fontSizeRef = useRef(fontSizeState);
  const lineSpacingRef = useRef(lineSpacingState);
  const sectionSpacingRef = useRef(sectionSpacingState);
  const marginsRef = useRef(marginsState);
  const headingStyleRef = useRef(headingStyleState);
  const bulletStyleRef = useRef(bulletStyleState);
  const resumeFileNameRef = useRef(resumeFileNameState);
  const lastServerUpdatedAtRef = useRef(lastServerUpdatedAt);
  
  // Update refs when state changes
  useEffect(() => {
    resumeDataRef.current = resumeDataState;
  }, [resumeDataState]);
  useEffect(() => {
    sectionOrderRef.current = sectionOrderState;
  }, [sectionOrderState]);
  useEffect(() => {
    sectionVisibilityRef.current = sectionVisibilityState;
  }, [sectionVisibilityState]);
  useEffect(() => {
    customSectionsRef.current = customSectionsState;
  }, [customSectionsState]);
  useEffect(() => {
    fontFamilyRef.current = fontFamilyState;
  }, [fontFamilyState]);
  useEffect(() => {
    fontSizeRef.current = fontSizeState;
  }, [fontSizeState]);
  useEffect(() => {
    lineSpacingRef.current = lineSpacingState;
  }, [lineSpacingState]);
  useEffect(() => {
    sectionSpacingRef.current = sectionSpacingState;
  }, [sectionSpacingState]);
  useEffect(() => {
    marginsRef.current = marginsState;
  }, [marginsState]);
  useEffect(() => {
    headingStyleRef.current = headingStyleState;
  }, [headingStyleState]);
  useEffect(() => {
    bulletStyleRef.current = bulletStyleState;
  }, [bulletStyleState]);
  useEffect(() => {
    resumeFileNameRef.current = resumeFileNameState;
  }, [resumeFileNameState]);
  useEffect(() => {
    lastServerUpdatedAtRef.current = lastServerUpdatedAt;
  }, [lastServerUpdatedAt]);

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
        logger.info('Resume data changed, setting hasChanges=true', { 
          prevName: prev?.name, 
          nextName: next?.name,
          suppressTracking: suppressTrackingRef.current 
        });
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
    
    // Normalize all array fields to always be arrays
    if (!Array.isArray(resumeData.skills)) {
      resumeData.skills = [];
    }
    if (!Array.isArray(resumeData.experience)) {
      resumeData.experience = [];
    }
    if (!Array.isArray(resumeData.education)) {
      resumeData.education = [];
    }
    if (!Array.isArray(resumeData.projects)) {
      resumeData.projects = [];
    }
    if (!Array.isArray(resumeData.certifications)) {
      resumeData.certifications = [];
    }
    
    // Normalize nested arrays in experience items
    resumeData.experience.forEach((exp: any) => {
      if (exp && typeof exp === 'object') {
        if (!Array.isArray(exp.bullets)) exp.bullets = [];
        if (!Array.isArray(exp.environment)) exp.environment = [];
        if (!Array.isArray(exp.customFields)) exp.customFields = [];
      }
    });
    
    // Normalize nested arrays in project items
    resumeData.projects.forEach((proj: any) => {
      if (proj && typeof proj === 'object') {
        if (!Array.isArray(proj.bullets)) proj.bullets = [];
        if (!Array.isArray(proj.skills)) proj.skills = [];
        if (!Array.isArray(proj.customFields)) proj.customFields = [];
      }
    });
    
    // Normalize nested arrays in certification items
    resumeData.certifications.forEach((cert: any) => {
      if (cert && typeof cert === 'object') {
        if (!Array.isArray(cert.skills)) cert.skills = [];
        if (!Array.isArray(cert.customFields)) cert.customFields = [];
      }
    });
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
      const friendlyError = formatErrorForDisplay(error, {
        action: 'loading resume',
        feature: 'resume builder',
      });
      setSaveError(friendlyError);
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
          // No resumes exist - show empty state
          const snapshot = buildSnapshotFromStoredData({});
          applySnapshot(snapshot);
          runWithoutTracking(() => {
            _setResumeFileName('');
          });
          setCurrentResumeId(null);
          setLastServerUpdatedAt(null);
          setLastSavedAt(null);
        }
      } catch (error: any) {
        logger.error('Failed to load resume:', error);
        const friendlyError = formatErrorForDisplay(error, {
          action: 'loading resume',
          feature: 'resume builder',
        });
        setSaveError(friendlyError);
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to prevent infinite loop

  useEffect(() => {
    logger.debug('Auto-save effect triggered', { hasChanges, isSaving, currentResumeId });
    
    if (!hasChanges || isSaving) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return undefined;
    }

    logger.info('Starting auto-save timer (5 seconds)', { hasChanges, isSaving, currentResumeId });

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      logger.info('Auto-save timer fired, executing save...');
      autosaveTimerRef.current = null;

      // Prevent auto-save when validation fails (e.g., invalid email)
      const validation = validateResumeData(resumeDataRef.current);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        logger.warn('Auto-save validation failed', validation.errors);
        setSaveError(`Auto-save blocked: ${errorMessages}`);
        setHasChanges(true);
        return;
      }

      try {
        setIsSaving(true);
        setSaveError(null);

        // Use refs to get latest values without adding them to dependency array
        // Sanitize data before sending to prevent XSS attacks
        const rawPayload = {
          data: {
            resumeData: resumeDataRef.current,
            sectionOrder: sectionOrderRef.current,
            sectionVisibility: sectionVisibilityRef.current,
            customSections: customSectionsRef.current,
            formatting: {
              fontFamily: fontFamilyRef.current,
              fontSize: fontSizeRef.current,
              lineSpacing: lineSpacingRef.current,
              sectionSpacing: sectionSpacingRef.current,
              margins: marginsRef.current,
              headingStyle: headingStyleRef.current,
              bulletStyle: bulletStyleRef.current,
            },
          },
          lastKnownServerUpdatedAt: lastServerUpdatedAtRef.current,
        };
        
        // Sanitize all string fields in the payload to prevent XSS
        const payload = sanitizeResumeData(rawPayload);

        // Log payload details using logger for development debugging
        logger.debug('Auto-save payload', {
          hasResumeData: !!payload.data.resumeData,
          resumeDataKeys: payload.data.resumeData ? Object.keys(payload.data.resumeData) : [],
          name: payload.data.resumeData?.name,
          email: payload.data.resumeData?.email,
          phone: payload.data.resumeData?.phone,
          location: payload.data.resumeData?.location,
          summary: payload.data.resumeData?.summary ? `${payload.data.resumeData.summary.substring(0, 50)}...` : '(empty)',
          skillsType: Array.isArray(payload.data.resumeData?.skills) ? 'array' : typeof payload.data.resumeData?.skills,
          skillsCount: Array.isArray(payload.data.resumeData?.skills) ? payload.data.resumeData.skills.length : 0,
          experienceType: Array.isArray(payload.data.resumeData?.experience) ? 'array' : typeof payload.data.resumeData?.experience,
          experienceCount: Array.isArray(payload.data.resumeData?.experience) ? payload.data.resumeData.experience.length : 0,
          educationCount: Array.isArray(payload.data.resumeData?.education) ? payload.data.resumeData.education.length : 0,
          projectsCount: Array.isArray(payload.data.resumeData?.projects) ? payload.data.resumeData.projects.length : 0,
        });

        // Auto-save: create resume if it doesn't exist, otherwise update
        const currentId = currentResumeId; // Capture current value
        if (currentId) {
          // Update existing resume
          logger.info('Auto-saving existing resume:', { resumeId: currentId });
          try {
            const response = await apiService.autoSaveResume(currentId, payload);
            const savedResume = response?.resume;
            if (savedResume) {
              logger.info('Resume auto-saved successfully:', { id: savedResume.id, lastUpdated: savedResume.lastUpdated });
              setLastServerUpdatedAt(savedResume.lastUpdated || null);
              if (savedResume.lastUpdated) {
                setLastSavedAt(new Date(savedResume.lastUpdated));
              }
              setHasChanges(false);
              setHasConflict(false); // Clear conflict on successful save
            } else {
              logger.warn('Auto-save response missing resume data:', response);
            }
          } catch (conflictError: any) {
            // Handle 409 Conflict errors
            if (conflictError?.statusCode === 409) {
              logger.warn('Conflict detected during auto-save:', conflictError);
              setHasConflict(true);
              setSaveError('Resume was updated elsewhere. Please refresh to sync changes.');
            } else {
              throw conflictError; // Re-throw non-conflict errors
            }
          }
        } else {
          // Create new resume if it doesn't exist yet
          const fileName = resumeFileNameRef.current && resumeFileNameRef.current.trim().length > 0
            ? resumeFileNameRef.current.trim()
            : 'Untitled Resume';
          
          logger.info('Creating new resume during auto-save:', { fileName, hasData: !!payload.data });
          
          try {
            const response = await apiService.createResume({
              fileName,
              templateId: null,
              data: payload.data
            });
            
            logger.info('Create resume response:', { success: response?.success, hasResume: !!response?.resume });
            
            const savedResume = response?.resume;
            if (savedResume) {
              logger.info('Resume created successfully:', { id: savedResume.id, fileName: savedResume.fileName });
              setCurrentResumeId(savedResume.id);
              setLastServerUpdatedAt(savedResume.lastUpdated || null);
              if (savedResume.lastUpdated) {
                setLastSavedAt(new Date(savedResume.lastUpdated));
              }
              if (savedResume.fileName && savedResume.fileName !== resumeFileNameRef.current) {
                runWithoutTracking(() => {
                  _setResumeFileName(savedResume.fileName);
                });
              }
              setHasChanges(false);
            } else {
              logger.error('Create resume response missing resume data:', response);
              setSaveError('Failed to create resume: No resume data in response');
            }
          } catch (createError: any) {
            logger.error('Failed to create resume during auto-save:', createError);
            setSaveError(createError?.message || 'Failed to create resume');
            // Don't throw - let user continue editing
          }
        }
      } catch (error: any) {
        logger.error('Auto-save failed:', error);
        
        // If offline or network error, queue the save operation
        const isNetworkError = error?.message?.includes('Failed to fetch') || 
                              error?.message?.includes('NetworkError') ||
                              error?.statusCode === 0 ||
                              !isOnline();
        
        if (isNetworkError && currentId) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          offlineQueue.add(
            'save',
            `${apiBaseUrl}/api/resumes/${currentId}/autosave`,
            payload,
            { method: 'PUT' }
          );
          logger.info('Queued failed save operation for retry when online');
          setSaveError('Changes will be saved when connection is restored.');
        } else {
          const friendlyError = formatErrorForDisplay(error, {
            action: 'saving resume',
            feature: 'resume builder',
          });
          setSaveError(friendlyError);
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
    runWithoutTracking,
    setCurrentResumeId,
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
    hasConflict,
    setHasConflict,
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
