'use client';

/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, RefreshCw, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBaseResumes } from '../../hooks/useBaseResumes';
import { useToasts } from '../Toast';
import apiService from '../../services/apiService';
import type {
  ResumeApplyContext,
  ResumeApplySuccessPayload,
  ResumeApplyErrorPayload,
} from '../../hooks/useResumeApplyIndicator';

interface ImportModalProps {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  importMethod: string;
  setImportMethod: (method: string) => void;
  importJsonData?: string;
  setImportJsonData?: (data: string) => void;
  onImport?: () => void;
  onImportFromCloud?: () => void;
  onFileSelected?: (file: File) => Promise<boolean | void> | boolean | void;
  onCreateBlank?: () => Promise<boolean | void> | boolean | void;
  slotsUsed?: number;
  maxSlots?: number;
  onResumeApplied?: (resumeId: string, resumeRecord?: any) => void;
  onApplyStart?: (payload: ResumeApplyContext) => void;
  onApplySuccess?: (payload: ResumeApplySuccessPayload) => void;
  onApplyError?: (payload: ResumeApplyErrorPayload) => void;
  onApplyComplete?: (payload: ResumeApplyContext) => void;
}

type UseBaseResumesReturn = ReturnType<typeof useBaseResumes>;
type BaseResume = UseBaseResumesReturn['resumes'][number];

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  onResumeApplied,
  onApplyStart,
  onApplySuccess,
  onApplyError,
  onApplyComplete,
}: ImportModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { toasts, showToast, dismissToast } = useToasts();

  // Use the existing hook to load and manage base resumes
  const {
    resumes,
    activeId,
    limits,
    refresh,
    createResume,
    activateResume,
    deleteResume,
    upsertResume
  } = useBaseResumes();

  // Local selection (defaults to currently active)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Track pending files that should be parsed on Apply
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | undefined>>({});
  useEffect(() => {
    if (!showImportModal) {
      // Reset states when modal closes
      setActivatingId(null);
      return;
    }
    // Sync selectedId with activeId when modal opens
    setSelectedId((prev) => prev || activeId || null);
    // Refresh resumes to ensure latest active state
    refresh({ showSpinner: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImportModal, activeId]);

  // File inputs for per-slot upload/replace
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const setFileRef = useCallback((slot: number) => (el: HTMLInputElement | null) => {
    fileInputRefs.current[slot] = el;
  }, []);

  const maxSlots = useMemo(() => limits?.maxSlots ?? 5, [limits?.maxSlots]);

  const sortedResumes = useMemo(() => {
    if (!resumes) {
      return [];
    }
    return [...resumes].sort((a, b) => {
      const slotA = typeof a.slotNumber === 'number' && a.slotNumber > 0 ? a.slotNumber : Number.MAX_SAFE_INTEGER;
      const slotB = typeof b.slotNumber === 'number' && b.slotNumber > 0 ? b.slotNumber : Number.MAX_SAFE_INTEGER;
      if (slotA !== slotB) {
        return slotA - slotB;
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });
  }, [resumes]);

  const totalSlotsUsed = sortedResumes.length;
  const availableSlots = Math.max(maxSlots - totalSlotsUsed, 0);

  const getDisplaySlotNumber = useCallback((resume: BaseResume, index: number) => {
    if (typeof resume.slotNumber === 'number' && resume.slotNumber > 0) {
      return resume.slotNumber;
    }
    return index + 1;
  }, []);
  // When Apply is clicked with an empty slot, prompt for file and auto-apply after selection
  // Track the most recently staged resume id (helps when user clicks Apply quickly)
  const [lastStagedId, setLastStagedId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  // Track which resume is currently being activated (for loading state)
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const handleChooseFile = useCallback((slot: number) => {
    const ref = fileInputRefs.current[slot];
    if (ref) ref.click();
  }, []);

  const validateResumeData = useCallback((data: any): boolean => {
    const inspect = (value: any, depth = 0): boolean => {
      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === 'string') {
        if (!value.trim()) {
          return false;
        }
        if (depth > 2) {
          return true;
        }
        try {
          const parsed = JSON.parse(value);
          return inspect(parsed, depth + 1);
        } catch {
      return true;
    }
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === 'object') {
        if (value.resumeData && inspect(value.resumeData, depth + 1)) {
      return true;
    }
        return Object.keys(value).length > 0;
      }

      return false;
    };

    return inspect(data);
  }, []);

  const activeResume = useMemo(() => {
    if (!activeId) {
      return null;
    }
    return resumes.find((r) => r.id === activeId) || null;
  }, [resumes, activeId]);

  const targetResumeId = useMemo(() => {
    if (selectedId) {
      return selectedId;
    }
    return activeId || null;
  }, [selectedId, activeId]);

  const targetResume = useMemo(() => {
    if (!targetResumeId) {
      return null;
    }
    return resumes.find((r) => r.id === targetResumeId) || null;
  }, [resumes, targetResumeId]);

  const stagedFileForTarget = useMemo(() => {
    if (!targetResumeId) {
      return null;
    }
    const candidate = pendingFiles[targetResumeId];
    return candidate instanceof File ? candidate : null;
  }, [targetResumeId, pendingFiles]);

  const targetResumeHasData = useMemo(() => {
    if (!targetResume) {
      return false;
    }
    return validateResumeData(targetResume.data);
  }, [targetResume, validateResumeData]);

  const applyHelperMessage = useMemo(() => {
    if (!targetResumeId) {
      return 'Select or activate a resume slot before using Parse & Apply.';
    }
    if (!stagedFileForTarget && !targetResumeHasData) {
      return 'Upload a resume file or ensure the selected resume has data.';
    }
    return null;
  }, [targetResumeId, stagedFileForTarget, targetResumeHasData]);

  const uploadToCreate = useCallback(async (file: File) => {
    const nameFromFile = file.name.replace(/\.[^.]+$/, '');
    try {
      showToast('Uploading resume...', 'info', 2000);
      
      // 1. Upload file to storage first
      const uploadResult = await apiService.uploadFile(file, {
        name: nameFromFile,
        type: 'resume',
        isPublic: false
      });
      
      if (!uploadResult?.file) {
        throw new Error('File upload failed');
      }
      
      // 2. Create BaseResume linked to the uploaded file
      const created = await createResume({
        name: nameFromFile,
        data: {}, // Empty data - will be parsed on activation
        storageFileId: uploadResult.file.id,
        fileHash: uploadResult.file.fileHash
      });
      
      if (created?.id) {
        setSelectedId(created.id);
        setLastStagedId(created.id);
        showToast('Resume uploaded successfully!', 'success', 3000);
      } else {
        showToast('Upload succeeded but slot creation failed', 'error', 6000);
      }
    } catch (createErr: any) {
      showToast(createErr?.message || 'Failed to upload resume', 'error', 6000);
    }
  }, [createResume, showToast]);

  const markReplacePending = useCallback(async (resumeId: string, file: File) => {
    try {
      showToast('Uploading resume...', 'info', 2000);
      
      // 1. Upload file to storage
      const uploadResult = await apiService.uploadFile(file, {
        name: file.name.replace(/\.[^.]+$/, ''),
        type: 'resume',
        isPublic: false
      });
      
      if (!uploadResult?.file) {
        throw new Error('File upload failed');
      }
      
      // 2. Update BaseResume with new file reference
      await apiService.updateBaseResume(resumeId, {
        data: {}, // Clear data - will be re-parsed on activation
        storageFileId: uploadResult.file.id,
        fileHash: uploadResult.file.fileHash
      });
      
      setSelectedId(resumeId);
      setLastStagedId(resumeId);
      showToast('Resume uploaded successfully!', 'success', 3000);
      
      // Refresh to get updated resume
      await refresh({ showSpinner: false });
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload resume', 'error', 6000);
    }
  }, [showToast, refresh]);

  // Parse and replace data for an existing resume
  const parseAndReplace = useCallback(async (resumeId: string, file: File, preParsed?: any) => {
    try {
      const parsed: any = preParsed ?? (await apiService.parseResumeFile(file));
      const structured =
        parsed?.structuredResume ||
        parsed?.structuredData ||
        parsed?.data ||
        parsed?.resume ||
        {};
      const response = await apiService.updateBaseResume(resumeId, {
        data: structured,
        metadata: parsed?.metadata || {
          parseConfidence: parsed?.confidence ?? null,
          parseMethod: parsed?.method ?? null,
          fileHash: parsed?.fileHash ?? null
        }
      });
      if (response?.resume) {
        upsertResume(response.resume);
      }
      showToast('Resume parsed and updated', 'success', 3000);
      return response?.resume ?? null;
    } catch (err: any) {
      showToast(err?.message || 'Failed to parse and replace resume', 'error', 6000);
      throw err;
    }
  }, [upsertResume, showToast]);

  // Parse, create a new slot, activate it, and close
  // (removed unused callback)

  const onFileChange = useCallback(async (slot: number, resumeId: string | null, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so selecting the same file again still triggers change
    e.target.value = '';
    if (!file) return;
    if (resumeId) {
      // When replacing an existing slot, make sure it is the selected target
      if (selectedId !== resumeId) {
        setSelectedId(resumeId);
      }
      await markReplacePending(resumeId, file);
    } else {
      await uploadToCreate(file);
    }
  }, [selectedId, markReplacePending, uploadToCreate]);

  // Direct activation handler - only activates the resume (no parsing)
  const handleActivateResume = useCallback(async (resumeId: string) => {
    if (activatingId && activatingId !== resumeId) {
      showToast('Please wait for the current activation to finish.', 'info', 3000);
      return;
    }
    if (activatingId === resumeId) {
      return;
    }

    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) {
      showToast('Resume not found. Please refresh and try again.', 'error', 4000);
      return;
    }

    if (resume.isActive) {
      showToast('This resume is already active', 'info', 3000);
      return;
    }

    setActivatingId(resumeId);
    setSelectedId(resumeId);

    try {
      // Just activate the resume (no parsing)
      showToast('🔄 Activating resume...', 'info', 3000);
      await activateResume(resumeId);
      
      showToast('✅ Resume activated! Now click "Parse & Apply" to populate the editor.', 'success', 4000);
      await refresh();
    } catch (err: any) {
      showToast(err?.message || 'Failed to activate resume', 'error', 6000);
    } finally {
      setActivatingId(null);
    }
  }, [activatingId, resumes, activateResume, showToast, refresh]);

  // Parse & Apply handler - parses the active resume and populates editor
  const [parsingId, setParsingId] = useState<string | null>(null);
  
  const handleParseAndApply = useCallback(async (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) {
      showToast('Resume not found', 'error', 3000);
      return;
    }

    if (!resume.isActive) {
      showToast('Please activate this resume first before parsing', 'warning', 4000);
      return;
    }

    if (parsingId === resumeId) {
      return;
    }

    setParsingId(resumeId);

    try {
      showToast('🔄 Parsing resume...', 'info', 30000);
      
      // Parse the resume by calling the backend parse endpoint
      const response = await apiService.request(`/api/base-resumes/${resumeId}/parse`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to parse resume');
      }

      // Fetch the latest data
      const fetched = await apiService.getBaseResume(resumeId);
      const latestRecord = fetched?.resume;

      if (latestRecord) {
        upsertResume(latestRecord);
      }

      // Call the onResumeApplied callback to populate the editor
      if (onResumeApplied && latestRecord) {
        await onResumeApplied(resumeId, latestRecord);
      }

      // Close modal and show success
      setShowImportModal(false);
      dismissToast();
      showToast('✅ Resume parsed and applied to editor!', 'success', 4000);
    } catch (err: any) {
      dismissToast();
      showToast(err?.message || 'Failed to parse resume', 'error', 6000);
    } finally {
      setParsingId(null);
    }
  }, [resumes, parsingId, showToast, dismissToast, upsertResume, onResumeApplied, setShowImportModal]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteResume(id);
      await refresh();
      showToast('Base resume deleted', 'success', 3000);
      // If the deleted one was selected, clear selection
      setSelectedId(prev => (prev === id ? null : prev));
      setPendingFiles(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete resume', 'error', 6000);
    }
  }, [deleteResume, refresh, showToast]);

  const handleApply = useCallback(async () => {
    if (isApplying) {
      return;
    }
    if (!showImportModal) {
      showToast('Upload or select a resume slot before applying.', 'info', 4000);
      return;
    }

    if (!targetResumeId) {
      showToast('Select a resume slot first, then use Parse & Apply.', 'info', 5000);
      return;
    }

    const effectiveId = targetResumeId;
    const stagedFile = stagedFileForTarget;
    const hasPendingForTarget = Boolean(stagedFile);
    const hasExistingData = targetResumeHasData;
    const resumeContext = targetResume || activeResume || null;

    if (selectedId !== effectiveId) {
      setSelectedId(effectiveId);
    }

    if (hasPendingForTarget) {
      showToast('Parsing staged resume file and applying it to the editor...', 'info', 3000);
    } else if (hasExistingData) {
      showToast('Applying the selected resume data to the editor...', 'info', 3000);
    } else {
      showToast('Fetching the latest parsed resume data from the server...', 'info', 4000);
    }

    const applyContext: ResumeApplyContext = {
      resumeId: effectiveId,
      source: hasPendingForTarget ? 'file' : 'existing',
    };

    setIsApplying(true);
    onApplyStart?.(applyContext);

    let updatedRecord: any = hasExistingData ? resumeContext : null;

    try {
      if (hasPendingForTarget && stagedFile instanceof File && stagedFile.size > 0) {
        try {
          const parsed: any = await apiService.parseResumeFile(stagedFile);
          const updated = await parseAndReplace(effectiveId, stagedFile, parsed);
          if (updated) {
            updatedRecord = updated;
          }
        } catch (parseErr: any) {
          const message = parseErr?.message || 'Failed to parse pending file';
          showToast(message, 'error', 6000);
          onApplyError?.({ ...applyContext, message });
          return;
        }

        setPendingFiles(prev => {
          const next = { ...prev };
          delete next[effectiveId];
          return next;
        });
      } else {
        if (!updatedRecord) {
          try {
            const fetched = await apiService.getBaseResume(effectiveId);
            updatedRecord = fetched?.resume ?? null;
          } catch (fallbackErr: any) {
            const message = fallbackErr?.message || 'Failed to load resume data. Please upload the file again.';
            showToast(message, 'error', 6000);
            onApplyError?.({ ...applyContext, message });
            return;
          }
        }

        if (!updatedRecord || !validateResumeData(updatedRecord?.data)) {
          const message = 'No parsed resume data found for the active slot. Upload the resume again to parse it.';
          showToast(message, 'info', 5000);
          onApplyError?.({ ...applyContext, message });
          return;
        }
      }

      await activateResume(effectiveId);
      await refresh({ showSpinner: false });

      let appliedRecord: any = null;
      try {
        const fetched = await apiService.getBaseResume(effectiveId);
        appliedRecord = fetched?.resume ?? null;
      } catch (fetchErr: any) {
        appliedRecord = updatedRecord;
      }

      if (!appliedRecord || !validateResumeData(appliedRecord?.data)) {
        appliedRecord = updatedRecord;
      }

      if (appliedRecord) {
        upsertResume(appliedRecord);
      }

      if (onResumeApplied) {
        try {
          await onResumeApplied(effectiveId, appliedRecord ?? undefined);
        } catch (callbackErr) {
          const message = 'Resume applied but failed to load into editor. Please refresh the page.';
          showToast(message, 'error', 6000);
          onApplyError?.({ ...applyContext, message });
          return;
        }
      }

      showToast('Applied base resume', 'success', 3000);
      setShowImportModal(false);
      setLastStagedId(null);

      onApplySuccess?.({ ...applyContext, resumeRecord: appliedRecord ?? undefined });
    } catch (err: any) {
      const message = err?.message || 'Failed to apply base resume';
      showToast(message, 'error', 6000);
      onApplyError?.({ ...applyContext, message });
    } finally {
      onApplyComplete?.(applyContext);
      setIsApplying(false);
    }
  }, [
    isApplying,
    showImportModal,
    targetResumeId,
    stagedFileForTarget,
    targetResumeHasData,
    targetResume,
    activeResume,
    validateResumeData,
    selectedId,
    parseAndReplace,
    activateResume,
    showToast,
    setShowImportModal,
    refresh,
    onResumeApplied,
    upsertResume,
    onApplyStart,
    onApplySuccess,
    onApplyError,
    onApplyComplete,
  ]);

  const renderResumeSlot = (resume: BaseResume, index: number) => {
    const displayIndex = index + 1;
    const slotNumber = getDisplaySlotNumber(resume, index);
    const isOverflowSlot = displayIndex > maxSlots;
    const isSelected = selectedId === resume.id;
    const isActive = resume.isActive;
    const borderColor = isActive
      ? colors.successGreen
      : isSelected
        ? colors.activeBlueText
        : colors.border;
    const borderWidth = isActive ? '3px' : '2px';
    const overflowBadge =
      isOverflowSlot || (typeof resume.slotNumber === 'number' && resume.slotNumber > maxSlots);

    return (
      <div
        key={resume.id}
        data-testid={`resume-slot-${displayIndex}`}
        className="rounded-xl p-4 mb-3 flex items-start justify-between transition-all"
        style={{
          border: `${borderWidth} solid ${borderColor}`,
          background: isActive
            ? theme.mode === 'light'
              ? '#f0fdf4'
              : `${colors.badgeInfoBg}20`
            : theme.mode === 'light'
              ? '#ffffff'
              : colors.cardBackground,
          boxShadow: isActive ? `0 0 0 1px ${colors.successGreen}40` : 'none'
        }}
      >
        <div
          className="flex items-start gap-3 flex-1 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setSelectedId(resume.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSelectedId(resume.id);
            }
          }}
        >
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{
              background: overflowBadge ? colors.badgeWarningBg : colors.activeBlueText,
              color: overflowBadge ? colors.badgeWarningText : '#ffffff'
            }}
            title={`Slot ${slotNumber}`}
          >
            {slotNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold" style={{ color: colors.primaryText }}>
                {resume.name || `Resume ${slotNumber}`}
              </div>
              {resume.isActive && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: colors.badgeInfoBg,
                    color: colors.badgeInfoText,
                    border: `1px solid ${colors.badgeInfoBorder}`
                  }}
                >
                  Active
                </span>
              )}
              {overflowBadge && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: colors.badgeWarningBg,
                    color: colors.badgeWarningText,
                    border: `1px solid ${colors.badgeWarningBorder}`
                  }}
                >
                  Legacy Slot
                </span>
              )}
            </div>
            {resume.createdAt && (
              <div className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
                {new Date(resume.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative inline-flex items-center transition-all focus:outline-none"
            title={
              resume.isActive
                ? 'Currently active'
                : activatingId === resume.id
                  ? 'Activating...'
                  : 'Activate resume'
            }
            aria-label={resume.isActive ? 'Currently active' : 'Activate resume'}
            onClick={(e) => {
              e.stopPropagation();
              if (resume.isActive || activatingId === resume.id) {
                return;
              }
              handleActivateResume(resume.id);
            }}
            disabled={activatingId === resume.id}
            style={{
              opacity: activatingId === resume.id || resume.isActive ? 0.6 : 1,
              cursor: resume.isActive ? 'default' : 'pointer'
            }}
          >
            {activatingId === resume.id ? (
              <div className="w-11 h-6 flex items-center justify-center">
                <RefreshCw size={16} className="animate-spin" style={{ color: colors.activeBlueText }} />
              </div>
            ) : (
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                  resume.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{
                  backgroundColor: resume.isActive
                    ? colors.successGreen
                    : theme.mode === 'light'
                      ? '#d1d5db'
                      : '#4b5563'
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    resume.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
            )}
          </button>
          {resume.isActive && (
            <button
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              title={parsingId === resume.id ? 'Parsing...' : 'Parse & Apply to editor'}
              aria-label="Parse and apply resume"
              onClick={(e) => {
                e.stopPropagation();
                handleParseAndApply(resume.id);
              }}
              disabled={parsingId === resume.id}
              style={{
                background: parsingId === resume.id ? colors.border : colors.activeBlueText,
                color: '#ffffff',
                opacity: parsingId === resume.id ? 0.6 : 1,
                cursor: parsingId === resume.id ? 'default' : 'pointer'
              }}
            >
              {parsingId === resume.id ? (
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Parsing...</span>
                </div>
              ) : (
                'Parse & Apply'
              )}
            </button>
          )}
          <button
            className="p-2 rounded-lg"
            title="Replace from file"
            aria-label="Replace from file"
            onClick={(e) => {
              e.stopPropagation();
              handleChooseFile(displayIndex);
            }}
            style={{ color: colors.secondaryText }}
          >
            <RefreshCw size={18} />
          </button>
          <button
            className="p-2 rounded-lg"
            title="Delete"
            aria-label="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(resume.id);
            }}
            style={{ color: colors.errorRed }}
          >
            <Trash2 size={18} />
          </button>
        </div>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <input
          type="file"
          ref={setFileRef(displayIndex)}
          onChange={(e) => onFileChange(displayIndex, resume.id, e)}
          accept=".pdf,.doc,.docx"
          className="hidden"
          aria-hidden="true"
          aria-label="Hidden resume file input"
          tabIndex={-1}
        />
      </div>
    );
  };

  const renderEmptySlot = (index: number) => {
    const displayIndex = totalSlotsUsed + index + 1;

    return (
      <div
        key={`empty-slot-${displayIndex}`}
        data-testid={`resume-slot-${displayIndex}`}
        className="rounded-xl p-4 mb-3 flex items-center gap-3 cursor-pointer"
        onClick={() => handleChooseFile(displayIndex)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleChooseFile(displayIndex);
        }}
        role="button"
        tabIndex={0}
        style={{
          border: `2px dashed ${colors.border}`,
          background: theme.mode === 'light' ? '#fafafa' : colors.cardBackground
        }}
        title="Click to upload resume"
        aria-label={`Upload resume to slot ${displayIndex}`}
      >
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: theme.mode === 'light' ? '#e5e7eb' : colors.badgeNeutralBg }}
        >
          <Upload size={18} style={{ color: colors.secondaryText }} />
        </div>
        <div>
          <div className="font-medium" style={{ color: colors.secondaryText }}>
            Click to upload resume{' '}
            <span className="font-normal" style={{ color: colors.tertiaryText }}>
              (PDF, DOC, DOCX)
            </span>
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <input
          type="file"
          ref={setFileRef(displayIndex)}
          onChange={(e) => onFileChange(displayIndex, null, e)}
          accept=".pdf,.doc,.docx"
          className="hidden"
          aria-hidden="true"
          aria-label="Hidden resume file input"
          tabIndex={-1}
        />
      </div>
    );
  };

  if (!showImportModal) return null;

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)'
      }}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="mx-auto my-10 w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
        style={{ 
          background: theme.mode === 'light' ? '#ffffff' : colors.badgePurpleBg,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          maxHeight: '82vh',
          overflowY: 'auto'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{ background: `linear-gradient(to right, ${colors.successGreen}, ${colors.primaryBlue})` }}
            >
              <Upload className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.primaryText }}>Import Resume</h2>
          </div>
          <button
            onClick={() => setShowImportModal(false)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: colors.tertiaryText }}
            title="Close modal"
            aria-label="Close import modal"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-4 space-y-1 text-sm" style={{ color: colors.secondaryText }}>
          <p>Upload up to {maxSlots} resumes. Activate one to use as your base resume.</p>
          {totalSlotsUsed > maxSlots && (
            <p className="text-xs" style={{ color: colors.warningYellow }}>
              You currently have {totalSlotsUsed} resumes saved from a previous plan. You can still activate or delete them, but new uploads are limited to {maxSlots} slots until you upgrade or clear space.
            </p>
          )}
        </div>

        {sortedResumes.map((resume, idx) => renderResumeSlot(resume, idx))}
        {availableSlots > 0 &&
          Array.from({ length: availableSlots }, (_, idx) => renderEmptySlot(idx))}

        <div className="mt-4">
          <div className="text-sm" style={{ color: colors.tertiaryText }}>
            {totalSlotsUsed} of {maxSlots} slots filled
          </div>
          {applyHelperMessage && (
            <div className="text-xs mt-1" style={{ color: colors.errorRed }}>
              {applyHelperMessage}
            </div>
          )}
        </div>
        </div>
    </div>
  );
}