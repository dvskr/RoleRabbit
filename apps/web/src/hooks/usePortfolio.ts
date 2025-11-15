/**
 * usePortfolio - Unified Custom Hook
 * Handles all portfolio state, API calls, and side effects
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePortfolioStore, selectActivePortfolio, selectHasUnsavedChanges } from '../stores/portfolioStore';
import portfolioApi, {
  type CreatePortfolioRequest,
  type UpdatePortfolioRequest,
  type PublishPortfolioRequest,
  type CreateShareLinkRequest,
  type ApiError,
} from '../lib/api/portfolioApi';
import { logger } from '../utils/logger';
import { toast } from 'react-hot-toast';

// ========================================
// HOOK OPTIONS
// ========================================

interface UsePortfolioOptions {
  portfolioId?: string;
  autoLoad?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number; // milliseconds
}

// ========================================
// HOOK
// ========================================

export const usePortfolio = (options: UsePortfolioOptions = {}) => {
  const {
    portfolioId,
    autoLoad = false,
    autoSave = true,
    autoSaveDelay = 30000, // 30 seconds
  } = options;

  // ========================================
  // ZUSTAND STORE
  // ========================================

  const store = usePortfolioStore();
  const {
    // State
    portfolios,
    portfoliosLoading,
    portfoliosError,
    activePortfolio,
    activePortfolioLoading,
    activePortfolioError,
    templates,
    templatesLoading,
    templatesError,
    versions,
    versionsLoading,
    domains,
    domainsLoading,
    shares,
    sharesLoading,
    analytics,
    analyticsLoading,
    deployments,
    deploymentsLoading,
    filters,
    autoSaveEnabled,

    // Actions
    setPortfolios,
    addPortfolio,
    updatePortfolioInList,
    removePortfolio,
    setPortfoliosLoading,
    setPortfoliosError,
    setActivePortfolio,
    updateActivePortfolio,
    setActivePortfolioLoading,
    setActivePortfolioError,
    clearActivePortfolio,
    setTemplates,
    setTemplatesLoading,
    setTemplatesError,
    setVersions,
    addVersion,
    setVersionsLoading,
    setDomains,
    addDomain,
    removeDomain as removeDomainFromStore,
    updateDomain as updateDomainInStore,
    setDomainsLoading,
    setShares,
    addShare,
    removeShare as removeShareFromStore,
    setSharesLoading,
    setAnalytics,
    setAnalyticsLoading,
    setDeployments,
    addDeployment,
    updateDeployment as updateDeploymentInStore,
    setDeploymentsLoading,
    markSaved,
    markUnsaved,
    setAutoSaveEnabled,
    setFilters,
    resetFilters,
    clearErrors,
  } = store;

  // ========================================
  // AUTO-SAVE LOGIC
  // ========================================

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChanges = portfolioId ? selectHasUnsavedChanges(portfolioId)(store) : false;

  useEffect(() => {
    if (!autoSave || !autoSaveEnabled || !portfolioId || !hasUnsavedChanges || !activePortfolio) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        logger.info(`Auto-saving portfolio ${portfolioId}...`);
        await updatePortfolio(portfolioId, {
          data: activePortfolio.data,
          name: activePortfolio.name,
          description: activePortfolio.description,
        });
        logger.info(`Auto-save successful for portfolio ${portfolioId}`);
      } catch (error) {
        logger.error('Auto-save failed:', error);
        // Don't show toast for auto-save failures to avoid annoying user
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveEnabled, portfolioId, hasUnsavedChanges, activePortfolio, autoSaveDelay]);

  // ========================================
  // AUTO-LOAD LOGIC
  // ========================================

  useEffect(() => {
    if (autoLoad) {
      if (portfolioId) {
        loadPortfolio(portfolioId);
      } else {
        loadPortfolios();
      }
    }
  }, [autoLoad, portfolioId]);

  // ========================================
  // PORTFOLIO CRUD OPERATIONS
  // ========================================

  const loadPortfolios = useCallback(async (params?: {
    page?: number;
    limit?: number;
    isPublished?: boolean;
    isDraft?: boolean;
  }) => {
    try {
      setPortfoliosLoading(true);
      setPortfoliosError(null);

      const response = await portfolioApi.getAll({
        ...params,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      setPortfolios(response.portfolios, response.total, response.page);
      return response.portfolios;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load portfolios';
      setPortfoliosError(errorMessage);
      logger.error('Failed to load portfolios:', error);
      throw error;
    } finally {
      setPortfoliosLoading(false);
    }
  }, [filters, setPortfolios, setPortfoliosLoading, setPortfoliosError]);

  const loadPortfolio = useCallback(async (id: string) => {
    try {
      setActivePortfolioLoading(true);
      setActivePortfolioError(null);

      const response = await portfolioApi.getById(id);
      setActivePortfolio(response.portfolio);
      updatePortfolioInList(id, response.portfolio);

      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load portfolio';
      setActivePortfolioError(errorMessage);
      logger.error('Failed to load portfolio:', error);
      throw error;
    } finally {
      setActivePortfolioLoading(false);
    }
  }, [setActivePortfolio, setActivePortfolioLoading, setActivePortfolioError, updatePortfolioInList]);

  const createPortfolio = useCallback(async (data: CreatePortfolioRequest) => {
    try {
      setPortfoliosLoading(true);
      setPortfoliosError(null);

      const response = await portfolioApi.create(data);
      addPortfolio(response.portfolio);
      setActivePortfolio(response.portfolio);

      toast.success('Portfolio created successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create portfolio';
      setPortfoliosError(errorMessage);
      toast.error(errorMessage);
      logger.error('Failed to create portfolio:', error);
      throw error;
    } finally {
      setPortfoliosLoading(false);
    }
  }, [addPortfolio, setActivePortfolio, setPortfoliosLoading, setPortfoliosError]);

  const updatePortfolio = useCallback(async (id: string, data: UpdatePortfolioRequest) => {
    try {
      const response = await portfolioApi.update(id, data);

      updatePortfolioInList(id, response.portfolio);
      if (activePortfolio?.id === id) {
        setActivePortfolio(response.portfolio);
      }
      markSaved(id);

      // Silent update, no toast
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update portfolio';
      logger.error('Failed to update portfolio:', error);
      throw error;
    }
  }, [activePortfolio, updatePortfolioInList, setActivePortfolio, markSaved]);

  const savePortfolio = useCallback(async (id: string, showToast = true) => {
    try {
      if (!activePortfolio || activePortfolio.id !== id) {
        throw new Error('No active portfolio to save');
      }

      const response = await portfolioApi.update(id, {
        name: activePortfolio.name,
        description: activePortfolio.description,
        data: activePortfolio.data,
      });

      updatePortfolioInList(id, response.portfolio);
      setActivePortfolio(response.portfolio);
      markSaved(id);

      if (showToast) {
        toast.success('Portfolio saved successfully!');
      }

      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save portfolio';
      if (showToast) {
        toast.error(errorMessage);
      }
      logger.error('Failed to save portfolio:', error);
      throw error;
    }
  }, [activePortfolio, updatePortfolioInList, setActivePortfolio, markSaved]);

  const deletePortfolio = useCallback(async (id: string) => {
    try {
      await portfolioApi.delete(id);
      removePortfolio(id);

      if (activePortfolio?.id === id) {
        clearActivePortfolio();
      }

      toast.success('Portfolio deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete portfolio';
      toast.error(errorMessage);
      logger.error('Failed to delete portfolio:', error);
      throw error;
    }
  }, [activePortfolio, removePortfolio, clearActivePortfolio]);

  const duplicatePortfolio = useCallback(async (id: string, name?: string) => {
    try {
      setPortfoliosLoading(true);
      const response = await portfolioApi.duplicate(id, name);
      addPortfolio(response.portfolio);
      toast.success('Portfolio duplicated successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to duplicate portfolio';
      toast.error(errorMessage);
      logger.error('Failed to duplicate portfolio:', error);
      throw error;
    } finally {
      setPortfoliosLoading(false);
    }
  }, [addPortfolio, setPortfoliosLoading]);

  // ========================================
  // PUBLISHING & DEPLOYMENT
  // ========================================

  const publishPortfolio = useCallback(async (id: string, config: PublishPortfolioRequest) => {
    try {
      setActivePortfolioLoading(true);
      const response = await portfolioApi.publish(id, config);

      updatePortfolioInList(id, response.portfolio);
      if (activePortfolio?.id === id) {
        setActivePortfolio(response.portfolio);
      }

      toast.success('Portfolio published successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to publish portfolio';
      toast.error(errorMessage);
      logger.error('Failed to publish portfolio:', error);
      throw error;
    } finally {
      setActivePortfolioLoading(false);
    }
  }, [activePortfolio, updatePortfolioInList, setActivePortfolio, setActivePortfolioLoading]);

  const unpublishPortfolio = useCallback(async (id: string) => {
    try {
      const response = await portfolioApi.unpublish(id);

      updatePortfolioInList(id, response.portfolio);
      if (activePortfolio?.id === id) {
        setActivePortfolio(response.portfolio);
      }

      toast.success('Portfolio unpublished successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unpublish portfolio';
      toast.error(errorMessage);
      logger.error('Failed to unpublish portfolio:', error);
      throw error;
    }
  }, [activePortfolio, updatePortfolioInList, setActivePortfolio]);

  const deployPortfolio = useCallback(async (id: string, config?: PublishPortfolioRequest) => {
    try {
      setDeploymentsLoading(true);
      const response = await portfolioApi.deploy(id, config);

      toast.success('Deployment started! This may take a few moments...');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start deployment';
      toast.error(errorMessage);
      logger.error('Failed to deploy portfolio:', error);
      throw error;
    } finally {
      setDeploymentsLoading(false);
    }
  }, [setDeploymentsLoading]);

  const checkSubdomainAvailability = useCallback(async (subdomain: string) => {
    try {
      const response = await portfolioApi.checkSubdomain(subdomain);
      return response.available;
    } catch (error: any) {
      logger.error('Failed to check subdomain:', error);
      return false;
    }
  }, []);

  // ========================================
  // TEMPLATES
  // ========================================

  const loadTemplates = useCallback(async (category?: string) => {
    try {
      setTemplatesLoading(true);
      setTemplatesError(null);

      const response = await portfolioApi.getTemplates(category);
      setTemplates(response.templates);

      return response.templates;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load templates';
      setTemplatesError(errorMessage);
      logger.error('Failed to load templates:', error);
      throw error;
    } finally {
      setTemplatesLoading(false);
    }
  }, [setTemplates, setTemplatesLoading, setTemplatesError]);

  // ========================================
  // DATA IMPORT
  // ========================================

  const importFromProfile = useCallback(async (id: string) => {
    try {
      setActivePortfolioLoading(true);
      const response = await portfolioApi.importFromProfile(id);

      updatePortfolioInList(id, response.portfolio);
      setActivePortfolio(response.portfolio);
      markUnsaved(id);

      toast.success('Profile data imported successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to import profile data';
      toast.error(errorMessage);
      logger.error('Failed to import from profile:', error);
      throw error;
    } finally {
      setActivePortfolioLoading(false);
    }
  }, [updatePortfolioInList, setActivePortfolio, setActivePortfolioLoading, markUnsaved]);

  const importFromResume = useCallback(async (id: string, resumeId: string) => {
    try {
      setActivePortfolioLoading(true);
      const response = await portfolioApi.importFromResume(id, resumeId);

      updatePortfolioInList(id, response.portfolio);
      setActivePortfolio(response.portfolio);
      markUnsaved(id);

      toast.success('Resume data imported successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to import resume data';
      toast.error(errorMessage);
      logger.error('Failed to import from resume:', error);
      throw error;
    } finally {
      setActivePortfolioLoading(false);
    }
  }, [updatePortfolioInList, setActivePortfolio, setActivePortfolioLoading, markUnsaved]);

  // ========================================
  // VERSION CONTROL
  // ========================================

  const loadVersions = useCallback(async (id: string) => {
    try {
      setVersionsLoading(true);
      const response = await portfolioApi.getVersions(id);
      setVersions(id, response.versions);
      return response.versions;
    } catch (error: any) {
      logger.error('Failed to load versions:', error);
      throw error;
    } finally {
      setVersionsLoading(false);
    }
  }, [setVersions, setVersionsLoading]);

  const createVersion = useCallback(async (id: string, name?: string) => {
    try {
      const response = await portfolioApi.createVersion(id, name);
      addVersion(id, response.version);
      toast.success('Version created successfully!');
      return response.version;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create version';
      toast.error(errorMessage);
      logger.error('Failed to create version:', error);
      throw error;
    }
  }, [addVersion]);

  const restoreVersion = useCallback(async (id: string, versionId: string) => {
    try {
      setActivePortfolioLoading(true);
      const response = await portfolioApi.restoreVersion(id, versionId);

      updatePortfolioInList(id, response.portfolio);
      setActivePortfolio(response.portfolio);

      toast.success('Version restored successfully!');
      return response.portfolio;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to restore version';
      toast.error(errorMessage);
      logger.error('Failed to restore version:', error);
      throw error;
    } finally {
      setActivePortfolioLoading(false);
    }
  }, [updatePortfolioInList, setActivePortfolio, setActivePortfolioLoading]);

  // ========================================
  // CUSTOM DOMAINS
  // ========================================

  const loadDomains = useCallback(async (id: string) => {
    try {
      setDomainsLoading(true);
      const response = await portfolioApi.getDomains(id);
      setDomains(id, response.domains);
      return response.domains;
    } catch (error: any) {
      logger.error('Failed to load domains:', error);
      throw error;
    } finally {
      setDomainsLoading(false);
    }
  }, [setDomains, setDomainsLoading]);

  const addCustomDomain = useCallback(async (id: string, domain: string) => {
    try {
      const response = await portfolioApi.addCustomDomain(id, domain);
      addDomain(id, response);
      toast.success('Custom domain added! Please verify DNS records.');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add custom domain';
      toast.error(errorMessage);
      logger.error('Failed to add domain:', error);
      throw error;
    }
  }, [addDomain]);

  const verifyCustomDomain = useCallback(async (id: string, domainId: string) => {
    try {
      const response = await portfolioApi.verifyDomain(id, domainId);
      updateDomainInStore(id, domainId, response);

      if (response.isVerified) {
        toast.success('Domain verified successfully!');
      } else {
        toast.error('Domain verification failed. Please check DNS records.');
      }

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify domain';
      toast.error(errorMessage);
      logger.error('Failed to verify domain:', error);
      throw error;
    }
  }, [updateDomainInStore]);

  const removeCustomDomain = useCallback(async (id: string, domainId: string) => {
    try {
      await portfolioApi.removeDomain(id, domainId);
      removeDomainFromStore(id, domainId);
      toast.success('Custom domain removed successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to remove domain';
      toast.error(errorMessage);
      logger.error('Failed to remove domain:', error);
      throw error;
    }
  }, [removeDomainFromStore]);

  // ========================================
  // SHARE LINKS
  // ========================================

  const loadShareLinks = useCallback(async (id: string) => {
    try {
      setSharesLoading(true);
      const response = await portfolioApi.getShareLinks(id);
      setShares(id, response.shares);
      return response.shares;
    } catch (error: any) {
      logger.error('Failed to load share links:', error);
      throw error;
    } finally {
      setSharesLoading(false);
    }
  }, [setShares, setSharesLoading]);

  const createShareLink = useCallback(async (id: string, options?: CreateShareLinkRequest) => {
    try {
      const response = await portfolioApi.createShareLink(id, options);
      addShare(id, response.shareLink);
      toast.success('Share link created successfully!');
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create share link';
      toast.error(errorMessage);
      logger.error('Failed to create share link:', error);
      throw error;
    }
  }, [addShare]);

  const revokeShareLink = useCallback(async (id: string, shareId: string) => {
    try {
      await portfolioApi.revokeShareLink(id, shareId);
      removeShareFromStore(id, shareId);
      toast.success('Share link revoked successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to revoke share link';
      toast.error(errorMessage);
      logger.error('Failed to revoke share link:', error);
      throw error;
    }
  }, [removeShareFromStore]);

  // ========================================
  // ANALYTICS
  // ========================================

  const loadAnalytics = useCallback(async (id: string, params?: { startDate?: string; endDate?: string }) => {
    try {
      setAnalyticsLoading(true);
      const response = await portfolioApi.getAnalytics(id, params);
      setAnalytics(id, response.analytics);
      return response;
    } catch (error: any) {
      logger.error('Failed to load analytics:', error);
      throw error;
    } finally {
      setAnalyticsLoading(false);
    }
  }, [setAnalytics, setAnalyticsLoading]);

  // ========================================
  // EXPORT
  // ========================================

  const exportAsZIP = useCallback(async (id: string) => {
    try {
      const blob = await portfolioApi.exportZIP(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Portfolio exported successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export portfolio';
      toast.error(errorMessage);
      logger.error('Failed to export as ZIP:', error);
      throw error;
    }
  }, []);

  const exportAsPDF = useCallback(async (id: string) => {
    try {
      const blob = await portfolioApi.exportPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Portfolio exported as PDF successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to export as PDF';
      toast.error(errorMessage);
      logger.error('Failed to export as PDF:', error);
      throw error;
    }
  }, []);

  // ========================================
  // LOCAL STATE UPDATES
  // ========================================

  const updateActivePortfolioData = useCallback((updates: Partial<typeof activePortfolio>) => {
    if (activePortfolio) {
      updateActivePortfolio(updates);
      if (activePortfolio.id) {
        markUnsaved(activePortfolio.id);
      }
    }
  }, [activePortfolio, updateActivePortfolio, markUnsaved]);

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      // Cancel all pending requests on unmount
      portfolioApi.cancelAllRequests();

      // Clear auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ========================================
  // RETURN VALUES
  // ========================================

  return {
    // State
    portfolios,
    portfoliosLoading,
    portfoliosError,
    activePortfolio,
    activePortfolioLoading,
    activePortfolioError,
    templates,
    templatesLoading,
    templatesError,
    versions: portfolioId ? versions[portfolioId] || [] : [],
    versionsLoading,
    domains: portfolioId ? domains[portfolioId] || [] : [],
    domainsLoading,
    shares: portfolioId ? shares[portfolioId] || [] : [],
    sharesLoading,
    analytics: portfolioId ? analytics[portfolioId] || [] : [],
    analyticsLoading,
    deployments: portfolioId ? deployments[portfolioId] || [] : [],
    deploymentsLoading,
    hasUnsavedChanges,
    filters,

    // CRUD Operations
    loadPortfolios,
    loadPortfolio,
    createPortfolio,
    updatePortfolio,
    savePortfolio,
    deletePortfolio,
    duplicatePortfolio,

    // Publishing
    publishPortfolio,
    unpublishPortfolio,
    deployPortfolio,
    checkSubdomainAvailability,

    // Templates
    loadTemplates,

    // Data Import
    importFromProfile,
    importFromResume,

    // Version Control
    loadVersions,
    createVersion,
    restoreVersion,

    // Custom Domains
    loadDomains,
    addCustomDomain,
    verifyCustomDomain,
    removeCustomDomain,

    // Share Links
    loadShareLinks,
    createShareLink,
    revokeShareLink,

    // Analytics
    loadAnalytics,

    // Export
    exportAsZIP,
    exportAsPDF,

    // Local Updates
    updateActivePortfolioData,
    setActivePortfolio,
    clearActivePortfolio,

    // Utilities
    setFilters,
    resetFilters,
    clearErrors,
    setAutoSaveEnabled,
    cancelAllRequests: portfolioApi.cancelAllRequests.bind(portfolioApi),
  };
};

export default usePortfolio;
