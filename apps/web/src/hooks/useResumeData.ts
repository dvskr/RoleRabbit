import { useState, useEffect, useRef, useCallback } from 'react';
import type { SetStateAction } from 'react';
import { ResumeData, CustomSection, SectionVisibility, CustomField } from '../types/resume';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';
import { sanitizeResumeData, validateResumeData } from '../utils/validation';
import { formatErrorForDisplay } from '../utils/errorMessages';
import { offlineQueue } from '../utils/offlineQueue';
import { isOnline } from '../utils/retryHandler';
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_FORMATTING,
  createDefaultResumeData
} from '../utils/resumeDefaults';
import {
  mapBaseResumeToEditor,
  mapEditorStateToBasePayload,
  ResumeSnapshot,
  BaseResumeRecord
} from '../utils/resumeMapper';

const AUTOSAVE_DEBOUNCE_MS = 5000;

const cloneResumeData = (data: ResumeData): ResumeData => JSON.parse(JSON.stringify(data));

interface UseResumeDataOptions {
  onResumeLoaded?: (payload: { resume: BaseResumeRecord | null | undefined; snapshot: ResumeSnapshot }) => void;
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
 
  const applyBaseResume = useCallback((record?: BaseResumeRecord | null) => {
    const snapshot = mapBaseResumeToEditor(record);
    applySnapshot(snapshot);
    runWithoutTracking(() => {
      _setResumeFileName(record?.name || 'My_Resume');
    });
    setCurrentResumeId(record?.id || null);
    setLastServerUpdatedAt(record?.updatedAt || null);
    setLastSavedAt(record?.updatedAt ? new Date(record.updatedAt) : null);
    setHasChanges(false);
    return { resume: record, snapshot };
  }, [
    applySnapshot,
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
      const response = await apiService.getBaseResume(id);
      if (response?.resume) {
        return applyBaseResume(response.resume as BaseResumeRecord);
      }
      throw new Error('Resume not found');
    } catch (error) {
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
  }, [applyBaseResume, setSaveError]);

  useEffect(() => {
    const loadResume = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getBaseResumes();
        if (response?.resumes?.length) {
          const resumeRecord = response.resumes[0] as BaseResumeRecord;
          const applied = applyBaseResume(resumeRecord);
          if (applied) {
            onResumeLoaded?.(applied);
          }
        } else {
          const snapshot = mapBaseResumeToEditor(null);
          applySnapshot(snapshot);
          runWithoutTracking(() => {
            _setResumeFileName('');
          });
          setCurrentResumeId(null);
          setLastServerUpdatedAt(null);
          setLastSavedAt(null);
        }
      } catch (error) {
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

        const editorState = {
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
            bulletStyle: bulletStyleRef.current
          },
          customFields: [] as CustomField[],
          name: resumeFileNameRef.current
        };

        const mappedPayload = mapEditorStateToBasePayload(editorState);
        const sanitizedPayload = sanitizeResumeData(mappedPayload);

        const currentId = currentResumeId;
        if (currentId) {
          logger.info('Auto-saving existing base resume', { baseResumeId: currentId });
          try {
            const response = await apiService.updateBaseResume(currentId, {
              ...sanitizedPayload,
              name: (sanitizedPayload.name || resumeFileNameRef.current || '').trim() || 'Untitled Resume',
              lastKnownServerUpdatedAt: lastServerUpdatedAtRef.current
            });
            const updatedResume = response?.resume as BaseResumeRecord | undefined;
            if (updatedResume) {
              setLastServerUpdatedAt(updatedResume.updatedAt || null);
              if (updatedResume.updatedAt) {
                setLastSavedAt(new Date(updatedResume.updatedAt));
              }
              setHasChanges(false);
              setHasConflict(false);
            }
          } catch (conflictError) {
            if (
              conflictError &&
              typeof conflictError === 'object' &&
              'statusCode' in conflictError &&
              (conflictError as { statusCode?: number }).statusCode === 409
            ) {
              logger.warn('Conflict detected during auto-save', conflictError);
              setHasConflict(true);
              setSaveError('Resume was updated elsewhere. Please refresh to sync changes.');
            } else {
              throw conflictError;
            }
          }
        } else {
          const fileName = resumeFileNameRef.current && resumeFileNameRef.current.trim().length > 0
            ? resumeFileNameRef.current.trim()
            : 'Untitled Resume';

          logger.info('Creating new base resume during auto-save', { fileName });
          try {
            const response = await apiService.createBaseResume({
              name: fileName,
              data: sanitizedPayload.data,
              metadata: sanitizedPayload.metadata,
              formatting: sanitizedPayload.formatting
            });
            const savedResume = response?.resume as BaseResumeRecord | undefined;
            if (savedResume) {
              setCurrentResumeId(savedResume.id);
              setLastServerUpdatedAt(savedResume.updatedAt || null);
              if (savedResume.updatedAt) {
                setLastSavedAt(new Date(savedResume.updatedAt));
              }
              if (savedResume.name && savedResume.name !== resumeFileNameRef.current) {
                runWithoutTracking(() => {
                  _setResumeFileName(savedResume.name || fileName);
                });
              }
              setHasChanges(false);
            } else {
              logger.error('Create base resume response missing resume data', response);
              setSaveError('Failed to create resume: No resume data in response.');
            }
          } catch (createError) {
            logger.error('Failed to create base resume during auto-save', createError);
            const friendlyError = formatErrorForDisplay(createError, {
              action: 'creating resume',
              feature: 'resume builder'
            });
            setSaveError(typeof friendlyError === 'string' ? friendlyError : 'Failed to create resume');
          }
        }
      } catch (error) {
        logger.error('Auto-save failed:', error);

        const isNetworkError =
          (typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as { message?: string }).message === 'string' &&
            ((error as { message: string }).message.includes('Failed to fetch') ||
              (error as { message: string }).message.includes('NetworkError')))
          ||
          (typeof error === 'object' &&
            error !== null &&
            'statusCode' in error &&
            (error as { statusCode?: number }).statusCode === 0)
          ||
          !isOnline();

        if (isNetworkError && currentResumeId) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          offlineQueue.add(
            'save',
            `${apiBaseUrl}/api/base-resumes/${currentResumeId}`,
            {
              ...sanitizedPayload,
              name: (sanitizedPayload.name || resumeFileNameRef.current || '').trim() || 'Untitled Resume'
            },
            { method: 'PATCH' }
          );
          logger.info('Queued failed save operation for retry when online');
          setSaveError('Changes will be saved when connection is restored.');
        } else {
          const friendlyError = formatErrorForDisplay(error, {
            action: 'saving resume',
            feature: 'resume builder'
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
    applyBaseResume,
  };
};
