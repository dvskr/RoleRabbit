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
}

export default function ImportModal({
  showImportModal,
  setShowImportModal,
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
    if (showImportModal) {
      setSelectedId(activeId || null);
    }
  }, [showImportModal, activeId]);

  // File inputs for per-slot upload/replace
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const setFileRef = useCallback((slot: number) => (el: HTMLInputElement | null) => {
    fileInputRefs.current[slot] = el;
  }, []);

  const maxSlots = useMemo(() => limits?.maxSlots ?? 5, [limits?.maxSlots]);
  const filledCount = resumes?.length ?? 0;

  const handleChooseFile = useCallback((slot: number) => {
    const ref = fileInputRefs.current[slot];
    if (ref) ref.click();
  }, []);

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
    showToast('File staged. Will parse on Apply.', 'info', 4000);
  }, [showToast]);

  const onFileChange = useCallback(async (slot: number, resumeId: string | null, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so selecting the same file again still triggers change
    e.target.value = '';
    if (!file) return;
    if (resumeId) {
      await markReplacePending(resumeId, file);
    } else {
      await uploadToCreate(file);
    }
  }, [uploadToCreate, markReplacePending]);

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
    if (!selectedId) {
      showToast('Please select a resume to apply', 'info', 3000);
      return;
    }
    try {
      // If a file is pending for the selected resume, parse and update first
      const pending = pendingFiles[selectedId];
      if (pending) {
        try {
          const parsed: any = await apiService.parseResumeFile(pending);
          const updates: any = { data: parsed?.structuredData || parsed?.data || {} };
          await apiService.updateBaseResume(selectedId, updates);
          setPendingFiles(prev => {
            const { [selectedId]: _omit, ...rest } = prev;
            return rest;
          });
          await refresh();
          showToast('Parsed and updated resume', 'success', 3000);
        } catch (parseErr: any) {
          showToast(parseErr?.message || 'Could not parse file. Applying without changes.', 'info', 5000);
        }
      }
      await activateResume(selectedId);
      showToast('Applied base resume', 'success', 3000);
      setShowImportModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to apply base resume', 'error', 6000);
    }
  }, [selectedId, pendingFiles, activateResume, showToast, setShowImportModal, refresh]);

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
          <div className="text-sm" style={{ color: colors.tertiaryText }}>
            {filledCount} of {maxSlots} slots filled
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
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-white"
              style={{ background: colors.primaryBlue }}
            >
              Apply Base Resume
                  </button>
            </div>
          </div>
        </div>
    </div>
  );
}