/**
 * TemplateContext - Centralized Template State Management
 *
 * This context provides a single source of truth for all template-related state,
 * eliminating duplication across hooks and components.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { resumeTemplates } from '../data/templates';
import { logger } from '../utils/logger';
import { isValidResumeTemplate } from '../utils/templateValidator';
import { getSuccessAnimationDuration } from '../utils/accessibility';
import type { ResumeTemplate } from '../data/templates';
import type { TemplateViewMode } from '../components/templates/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateState {
  // Selection State
  selectedTemplateId: string | null;

  // Added Templates (dashboard)
  addedTemplates: string[];
  maxAddedTemplates: number;

  // Favorites
  favorites: string[];

  // UI State
  showPreviewModal: boolean;
  showUploadModal: boolean;
  viewMode: TemplateViewMode;
  showFilters: boolean;
  isLoading: boolean;

  // Transient State
  addedTemplateId: string | null; // For success animation
  uploadedFile: File | null;
  error: string | null;
}

export interface TemplateContextValue extends TemplateState {
  // Selection Actions
  selectTemplate: (id: string | null) => void;

  // Added Templates Actions
  addTemplate: (templateId: string) => boolean;
  removeTemplate: (templateId: string) => void;

  // Favorites Actions
  toggleFavorite: (templateId: string) => void;
  isFavorite: (templateId: string) => boolean;

  // UI Actions
  setShowPreviewModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  setViewMode: (mode: TemplateViewMode) => void;
  setShowFilters: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;

  // Template Actions
  previewTemplate: (templateId: string) => void;
  useTemplate: (templateId: string, onAddToEditor?: (id: string) => void) => void;

  // File Upload
  setUploadedFile: (file: File | null) => void;

  // Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed Values
  selectedTemplate: ResumeTemplate | null;
  canAddMoreTemplates: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TemplateContext = createContext<TemplateContextValue | null>(null);

// ============================================================================
// LOCALSTORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  FAVORITES: 'template_favorites',
  ADDED_TEMPLATES: 'dashboard_added_templates',
  VIEW_MODE: 'template_view_mode',
} as const;

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const loadFromStorage = <T,>(key: string, defaultValue: T, validator?: (val: unknown) => boolean): T => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (validator ? validator(parsed) : true) {
        return parsed;
      }
      logger.warn(`Invalid data in localStorage for ${key}, using default`);
    }
  } catch (error) {
    logger.error(`Error loading from localStorage (${key}):`, error);
  }
  return defaultValue;
};

const saveToStorage = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`Error saving to localStorage (${key}):`, error);
  }
};

// Validators
const isStringArray = (val: unknown): val is string[] => {
  return Array.isArray(val) && val.every(item => typeof item === 'string');
};

const isValidViewMode = (val: unknown): val is TemplateViewMode => {
  return val === 'grid' || val === 'list';
};

// ============================================================================
// PROVIDER
// ============================================================================

export interface TemplateProviderProps {
  children: ReactNode;
  defaultTemplateId?: string | null;
  defaultAddedTemplates?: string[];
  maxAddedTemplates?: number;
}

export function TemplateProvider({
  children,
  defaultTemplateId = null,
  defaultAddedTemplates = [],
  maxAddedTemplates = 10,
}: TemplateProviderProps) {
  // State - Load from localStorage where appropriate
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(defaultTemplateId);
  const [addedTemplates, setAddedTemplates] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.ADDED_TEMPLATES, defaultAddedTemplates, isStringArray)
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.FAVORITES, [], isStringArray)
  );
  const [viewMode, setViewMode] = useState<TemplateViewMode>(() =>
    loadFromStorage(STORAGE_KEYS.VIEW_MODE, 'grid' as TemplateViewMode, isValidViewMode)
  );

  // UI State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Transient State
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ADDED_TEMPLATES, addedTemplates);
  }, [addedTemplates]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Computed Values
  const selectedTemplate = useMemo(() => {
    return selectedTemplateId
      ? resumeTemplates.find(t => t.id === selectedTemplateId) || null
      : null;
  }, [selectedTemplateId]);

  const canAddMoreTemplates = useMemo(() => {
    return addedTemplates.length < maxAddedTemplates;
  }, [addedTemplates.length, maxAddedTemplates]);

  // Selection Actions
  const selectTemplate = useCallback((id: string | null) => {
    setSelectedTemplateId(id);
    logger.debug('Selected template:', id);
  }, []);

  // Added Templates Actions
  const addTemplate = useCallback((templateId: string): boolean => {
    if (addedTemplates.includes(templateId)) {
      logger.debug('Template already added:', templateId);
      return false;
    }

    if (addedTemplates.length >= maxAddedTemplates) {
      setError(`Cannot add template: maximum limit of ${maxAddedTemplates} templates reached`);
      logger.warn(`Maximum template limit reached: ${maxAddedTemplates}`);
      return false;
    }

    setAddedTemplates(prev => [...prev, templateId]);
    logger.debug('Added template:', templateId);
    return true;
  }, [addedTemplates, maxAddedTemplates]);

  const removeTemplate = useCallback((templateId: string) => {
    setAddedTemplates(prev => prev.filter(id => id !== templateId));
    logger.debug('Removed template:', templateId);
  }, []);

  // Favorites Actions
  const toggleFavorite = useCallback((templateId: string) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
    logger.debug('Toggled favorite:', templateId);
  }, []);

  const isFavorite = useCallback((templateId: string) => {
    return favorites.includes(templateId);
  }, [favorites]);

  // Template Actions
  const previewTemplate = useCallback((templateId: string) => {
    const template = resumeTemplates.find(t => t.id === templateId);

    if (!template) {
      setError(`Template not found: ${templateId}`);
      logger.error('Template not found:', templateId);
      return;
    }

    if (!isValidResumeTemplate(template)) {
      setError('Invalid template data. Please try another template.');
      logger.error('Invalid template data for:', templateId);
      return;
    }

    setSelectedTemplateId(templateId);
    setShowPreviewModal(true);
    setError(null);
    logger.debug('Previewing template:', templateId);
  }, []);

  const useTemplate = useCallback((templateId: string, onAddToEditor?: (id: string) => void) => {
    const template = resumeTemplates.find(t => t.id === templateId);

    if (!template) {
      setError(`Template not found: ${templateId}`);
      logger.error('Template not found:', templateId);
      return;
    }

    if (!isValidResumeTemplate(template)) {
      setError('Invalid template data. Cannot add to editor.');
      logger.error('Invalid template data for:', templateId);
      return;
    }

    logger.debug('Using template:', templateId);

    if (onAddToEditor) {
      onAddToEditor(templateId);
    }

    // Set animation state
    setAddedTemplateId(templateId);
    setError(null);

    // Show success animation (respects user's reduced motion preference)
    setTimeout(() => {
      setAddedTemplateId(null);
    }, getSuccessAnimationDuration());
  }, []);

  // Error Handling
  const clearError = useCallback(() => setError(null), []);

  // Context Value
  const value: TemplateContextValue = {
    // State
    selectedTemplateId,
    addedTemplates,
    maxAddedTemplates,
    favorites,
    showPreviewModal,
    showUploadModal,
    viewMode,
    showFilters,
    isLoading,
    addedTemplateId,
    uploadedFile,
    error,

    // Selection Actions
    selectTemplate,

    // Added Templates Actions
    addTemplate,
    removeTemplate,

    // Favorites Actions
    toggleFavorite,
    isFavorite,

    // UI Actions
    setShowPreviewModal,
    setShowUploadModal,
    setViewMode,
    setShowFilters,
    setIsLoading,

    // Template Actions
    previewTemplate,
    useTemplate,

    // File Upload
    setUploadedFile,

    // Error Handling
    setError,
    clearError,

    // Computed Values
    selectedTemplate,
    canAddMoreTemplates,
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access template context
 * @throws {Error} if used outside TemplateProvider
 */
export function useTemplateContext(): TemplateContextValue {
  const context = useContext(TemplateContext);

  if (!context) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }

  return context;
}

// ============================================================================
// CONVENIENCE HOOKS (for backward compatibility and specific use cases)
// ============================================================================

/**
 * Hook for template selection state only
 */
export function useTemplateSelection() {
  const { selectedTemplateId, selectedTemplate, selectTemplate } = useTemplateContext();
  return { selectedTemplateId, selectedTemplate, selectTemplate };
}

/**
 * Hook for favorites state only
 */
export function useTemplateFavorites() {
  const { favorites, toggleFavorite, isFavorite } = useTemplateContext();
  return { favorites, toggleFavorite, isFavorite };
}

/**
 * Hook for added templates state only
 */
export function useAddedTemplates() {
  const { addedTemplates, addTemplate, removeTemplate, canAddMoreTemplates, maxAddedTemplates } = useTemplateContext();
  return { addedTemplates, addTemplate, removeTemplate, canAddMoreTemplates, maxAddedTemplates };
}
