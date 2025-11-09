'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Upload, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBaseResumes } from '../../hooks/useBaseResumes';
import { useToasts } from '../Toast';
import apiService from '../../services/apiService';

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
}

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  onResumeApplied,
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
    deleteResume
  } = useBaseResumes();

  // Local selection (defaults to currently active)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Track pending files that should be parsed on Apply
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | undefined>>({});
  useEffect(() => {
    if (!showImportModal) return;
    setSelectedId((prev) => prev || activeId || null);
  }, [showImportModal, activeId]);

  // File inputs for per-slot upload/replace
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const setFileRef = useCallback((slot: number) => (el: HTMLInputElement | null) => {
    fileInputRefs.current[slot] = el;
  }, []);

  const maxSlots = useMemo(() => limits?.maxSlots ?? 5, [limits?.maxSlots]);
  const filledCount = resumes?.length ?? 0;
  // When Apply is clicked with an empty slot, prompt for file and auto-apply after selection
  // Track the most recently staged resume id (helps when user clicks Apply quickly)
  const [lastStagedId, setLastStagedId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const handleChooseFile = useCallback((slot: number) => {
    const ref = fileInputRefs.current[slot];
    if (ref) ref.click();
  }, []);

  const pendingCount = useMemo(() => Object.keys(pendingFiles).length, [pendingFiles]);
  const canApply = useMemo(() => {
    if (selectedId) {
      return true;
    }
    if (pendingCount > 0) {
      return true;
    }
    return false;
  }, [selectedId, pendingCount]);

  const uploadToCreate = useCallback(async (file: File) => {
    const nameFromFile = file.name.replace(/\.[^.]+$/, '');
    try {
      // Create placeholder slot immediately (no parsing yet)
      const created = await createResume({
        name: nameFromFile,
        data: {}
      });
      if (created?.id) {
        // Mark this new slot as pending parse
        setPendingFiles(prev => ({ ...prev, [created.id]: file }));
        await refresh();
        setSelectedId(created.id);
        setLastStagedId(created.id);
        showToast('Uploaded. Will parse on Apply.', 'info', 4000);
    } else {
        showToast('Upload succeeded but creation failed', 'error', 6000);
      }
    } catch (createErr: any) {
      showToast(createErr?.message || 'Failed to create resume slot', 'error', 6000);
    }
  }, [createResume, refresh, showToast]);

  const markReplacePending = useCallback(async (resumeId: string, file: File) => {
    // Defer parsing until Apply; keep current data visible
    setPendingFiles(prev => ({ ...prev, [resumeId]: file }));
    // Ensure Apply targets the slot we just staged
    setSelectedId(resumeId);
    setLastStagedId(resumeId);
    showToast('File staged. Will parse on Apply.', 'info', 4000);
  }, [showToast]);

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
      await refresh();
      showToast('Resume parsed and updated', 'success', 3000);
      return response?.resume ?? null;
    } catch (err: any) {
      showToast(err?.message || 'Failed to parse and replace resume', 'error', 6000);
      throw err;
    }
  }, [refresh, showToast]);

  // Parse, create a new slot, activate it, and close
  const parseCreateAndActivate = useCallback(async (file: File) => {
    try {
      const parsed: any = await apiService.parseResumeFile(file);
      const structured =
        parsed?.structuredResume ||
        parsed?.structuredData ||
        parsed?.data ||
        parsed?.resume ||
        {};
      const nameFromFile = file.name.replace(/\.[^.]+$/, '');
      const created = await createResume({
        name: nameFromFile,
        data: structured,
        metadata: parsed?.metadata || {
          parseConfidence: parsed?.confidence ?? null,
          parseMethod: parsed?.method ?? null,
          fileHash: parsed?.fileHash ?? null
        }
      });
      if (created?.id) {
        await refresh();
        await activateResume(created.id);
        setSelectedId(created.id);
        showToast('Parsed and applied new resume', 'success', 4000);
    }
    } catch (err: any) {
      showToast(err?.message || 'Failed to parse and create resume', 'error', 6000);
    }
  }, [createResume, activateResume, refresh, showToast, setShowImportModal]);

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
  }, [markReplacePending, uploadToCreate, parseAndReplace, activateResume, parseCreateAndActivate, setShowImportModal]);

  // Select for apply (no immediate activation)
  const handleSelectForApply = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteResume(id);
      await refresh();
      showToast('Base resume deleted', 'success', 3000);
      // If the deleted one was selected, clear selection
      setSelectedId(prev => (prev === id ? null : prev));
      setPendingFiles(prev => {
        const { [id]: _omit, ...rest } = prev;
        return rest;
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
    const stagedIds = Object.keys(pendingFiles || {});
    let effectiveId = selectedId;
    const hasPendingForSelected = effectiveId ? pendingFiles[effectiveId] instanceof File : false;
    if (!hasPendingForSelected) {
      if (lastStagedId && pendingFiles[lastStagedId] instanceof File) {
        effectiveId = lastStagedId;
        setSelectedId(lastStagedId);
      } else if (stagedIds.length === 1) {
        effectiveId = stagedIds[0];
        setSelectedId(stagedIds[0]);
      }
    }
    if (!effectiveId) {
      showToast('Upload or select a resume slot before applying.', 'info', 4000);
      return;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.info('[ImportModal] Applying resume', {
        selectedId,
        effectiveId,
        pendingKeys: Object.keys(pendingFiles || {}),
        hasPending: Boolean(effectiveId && pendingFiles?.[effectiveId])
      });
    }
    setIsApplying(true);
    let updatedRecord: any = null;
    try {
      // If a file is pending for the selected resume, parse and update first
      const pending = pendingFiles[effectiveId];
      if (process.env.NODE_ENV !== 'production') {
        console.info('[ImportModal] Pending file info', {
          effectiveId,
          pendingType: pending ? pending.constructor?.name : null,
          pendingSize: pending instanceof File ? pending.size : null
        });
      }
      if (pending && pending instanceof File && pending.size > 0) {
        try {
          const parsed: any = await apiService.parseResumeFile(pending);
          if (process.env.NODE_ENV !== 'production') {
            console.info('[ImportModal] Parsed payload', parsed);
          }
          updatedRecord = await parseAndReplace(effectiveId, pending, parsed);
          setPendingFiles(prev => {
            const { [effectiveId]: _omit, ...rest } = prev;
            return rest;
          });
          await refresh();
        } catch (parseErr: any) {
          showToast(parseErr?.message || 'Failed to parse pending file', 'error', 6000);
          setIsApplying(false);
          return;
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.info('[ImportModal] No pending file; applying existing data', { effectiveId });
        }

        try {
          const fetched = await apiService.getBaseResume(effectiveId);
          updatedRecord = fetched?.resume ?? null;
          if (!updatedRecord) {
            showToast('No parsed data found for this slot yet. Upload a resume to parse it.', 'info', 5000);
            setIsApplying(false);
            return;
          }
          const dataObj: any = updatedRecord?.data || {};
          const hasContent =
            (dataObj.resumeData && Object.keys(dataObj.resumeData).length > 0) ||
            (Object.keys(dataObj || {}).length > 0);
          if (!hasContent) {
            showToast('Parsed data not found. Upload the resume again to re-parse.', 'info', 5000);
            setIsApplying(false);
            return;
          }
          // updatedRecord has content, continue to activate and apply
        } catch (fallbackErr: any) {
          showToast(fallbackErr?.message || 'Failed to load resume data. Please upload the file again.', 'error', 6000);
          setIsApplying(false);
          return;
        }
      }
      await activateResume(effectiveId);
      // Always fetch the latest record after activation to ensure we have fresh data
      let appliedRecord: any = null;
      try {
        const fetched = await apiService.getBaseResume(effectiveId);
        appliedRecord = fetched?.resume ?? null;
        if (process.env.NODE_ENV !== 'production') {
          console.info('[ImportModal] Fetched applied resume', { id: appliedRecord?.id, hasData: !!appliedRecord?.data });
        }
      } catch (fetchErr) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[ImportModal] Failed to fetch applied resume', fetchErr);
        }
        // Fallback to the updatedRecord if fetch fails
        appliedRecord = updatedRecord;
      }
      if (onResumeApplied) {
        try {
          if (process.env.NODE_ENV !== 'production') {
            console.info('[ImportModal] Calling onResumeApplied', { resumeId: effectiveId, hasRecord: !!appliedRecord });
          }
          onResumeApplied(effectiveId, appliedRecord ?? undefined);
        } catch (callbackErr) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[ImportModal] onResumeApplied callback threw an error', callbackErr);
          }
          showToast('Resume applied but failed to load into editor. Please refresh the page.', 'error', 6000);
        }
      }
      showToast('Applied base resume', 'success', 3000);
      setShowImportModal(false);
      setLastStagedId(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to apply base resume', 'error', 6000);
    } finally {
      setIsApplying(false);
    }
  }, [selectedId, lastStagedId, pendingFiles, resumes, parseAndReplace, refresh, activateResume, showToast, setShowImportModal, onResumeApplied, isApplying, showImportModal]);

  const renderSlot = (slotNumber: number) => {
    const resume = resumes.find(r => r.slotNumber === slotNumber);
    const isSelected = resume ? selectedId === resume.id : false;
    const borderColor = isSelected ? colors.activeBlueText : colors.border;
    const hoverBg = theme.mode === 'light' ? '#fafafa' : colors.hoverBackground;

    if (resume) {
      return (
        <div
          key={slotNumber}
          className="rounded-xl p-4 mb-3 flex items-start justify-between cursor-pointer"
          onClick={() => setSelectedId(resume.id)}
          style={{
            border: `2px solid ${borderColor}`,
            background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: colors.activeBlueText }}
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
              className="p-2 rounded-lg"
              title="Select for Apply"
              aria-label="Select for Apply"
              onClick={(e) => { e.stopPropagation(); handleSelectForApply(resume.id); }}
              style={{ color: colors.activeBlueText }}
            >
              <CheckCircle2 size={18} />
            </button>
            <button
              className="p-2 rounded-lg"
              title="Replace from file"
              aria-label="Replace from file"
              onClick={(e) => { e.stopPropagation(); handleChooseFile(slotNumber); }}
              style={{ color: colors.secondaryText }}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="p-2 rounded-lg"
              title="Delete"
              aria-label="Delete"
              onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
              style={{ color: colors.errorRed }}
            >
              <Trash2 size={18} />
            </button>
          </div>
          <input
            type="file"
            ref={setFileRef(slotNumber)}
            onChange={(e) => onFileChange(slotNumber, resume.id, e)}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
        </div>
      );
    }

    // Empty slot
    return (
      <div
        key={slotNumber}
        className="rounded-xl p-4 mb-3 flex items-center gap-3 cursor-pointer"
        onClick={() => handleChooseFile(slotNumber)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleChooseFile(slotNumber); }}
        role="button"
        tabIndex={0}
        style={{
          border: `2px dashed ${colors.border}`,
          background: theme.mode === 'light' ? '#fafafa' : colors.cardBackground
        }}
        title="Click to upload resume"
        aria-label={`Upload resume to slot ${slotNumber}`}
      >
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: theme.mode === 'light' ? '#e5e7eb' : colors.badgeNeutralBg }}
        >
          <Upload size={18} style={{ color: colors.secondaryText }} />
        </div>
        <div>
          <div className="font-medium" style={{ color: colors.secondaryText }}>
            Click to upload resume <span className="font-normal" style={{ color: colors.tertiaryText }}>(PDF, DOC, DOCX)</span>
          </div>
        </div>
        <input
          type="file"
          ref={setFileRef(slotNumber)}
          onChange={(e) => onFileChange(slotNumber, null, e)}
          accept=".pdf,.doc,.docx"
          className="hidden"
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
        
        <p className="mb-4 text-sm" style={{ color: colors.secondaryText }}>
          Upload up to {maxSlots} resumes. Activate one to use as your base resume.
        </p>

        {Array.from({ length: maxSlots }, (_, idx) => renderSlot(idx + 1))}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm" style={{ color: colors.tertiaryText }}>
              {filledCount} of {maxSlots} slots filled
            </div>
            {!canApply && (
              <div className="text-xs mt-1" style={{ color: colors.errorRed }}>
                Upload or select a resume slot before applying.
              </div>
            )}
          </div>
          <div className="flex gap-3">
                  <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 rounded-xl"
                    style={{
                background: theme.mode === 'light' ? '#f3f4f6' : colors.hoverBackground,
                color: colors.primaryText
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isApplying ? 'Parsing…' : 'Parse & Apply'}
                  </button>
            </div>
          </div>
        </div>
    </div>
  );
}