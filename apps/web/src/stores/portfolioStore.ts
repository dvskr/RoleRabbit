/**
 * Portfolio Store - Zustand Global State Management
 * Handles all portfolio state, caching, and persistence
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Portfolio,
  PortfolioTemplate,
  PortfolioVersion,
  CustomDomain,
  PortfolioShare,
  PortfolioAnalytics,
  PortfolioDeployment,
} from '../lib/api/portfolioApi';

// ========================================
// STATE TYPES
// ========================================

interface PortfolioState {
  // Portfolio List
  portfolios: Portfolio[];
  portfoliosLoading: boolean;
  portfoliosError: string | null;
  portfoliosTotalPages: number;
  portfoliosCurrentPage: number;

  // Active Portfolio
  activePortfolio: Portfolio | null;
  activePortfolioLoading: boolean;
  activePortfolioError: string | null;

  // Templates
  templates: PortfolioTemplate[];
  templatesLoading: boolean;
  templatesError: string | null;

  // Versions
  versions: Record<string, PortfolioVersion[]>; // keyed by portfolioId
  versionsLoading: boolean;
  versionsError: string | null;

  // Custom Domains
  domains: Record<string, CustomDomain[]>; // keyed by portfolioId
  domainsLoading: boolean;
  domainsError: string | null;

  // Share Links
  shares: Record<string, PortfolioShare[]>; // keyed by portfolioId
  sharesLoading: boolean;
  sharesError: string | null;

  // Analytics
  analytics: Record<string, PortfolioAnalytics[]>; // keyed by portfolioId
  analyticsLoading: boolean;
  analyticsError: string | null;

  // Deployments
  deployments: Record<string, PortfolioDeployment[]>; // keyed by portfolioId
  deploymentsLoading: boolean;
  deploymentsError: string | null;

  // UI State
  lastSavedAt: Record<string, Date>; // keyed by portfolioId
  unsavedChanges: Record<string, boolean>; // keyed by portfolioId
  autoSaveEnabled: boolean;

  // Filters
  filters: {
    isPublished?: boolean;
    isDraft?: boolean;
    sortBy: 'createdAt' | 'updatedAt' | 'name' | 'views';
    sortOrder: 'asc' | 'desc';
  };
}

interface PortfolioActions {
  // Portfolio List Actions
  setPortfolios: (portfolios: Portfolio[], total: number, page: number) => void;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolioInList: (id: string, updates: Partial<Portfolio>) => void;
  removePortfolio: (id: string) => void;
  setPortfoliosLoading: (loading: boolean) => void;
  setPortfoliosError: (error: string | null) => void;

  // Active Portfolio Actions
  setActivePortfolio: (portfolio: Portfolio | null) => void;
  updateActivePortfolio: (updates: Partial<Portfolio>) => void;
  setActivePortfolioLoading: (loading: boolean) => void;
  setActivePortfolioError: (error: string | null) => void;
  clearActivePortfolio: () => void;

  // Template Actions
  setTemplates: (templates: PortfolioTemplate[]) => void;
  setTemplatesLoading: (loading: boolean) => void;
  setTemplatesError: (error: string | null) => void;

  // Version Actions
  setVersions: (portfolioId: string, versions: PortfolioVersion[]) => void;
  addVersion: (portfolioId: string, version: PortfolioVersion) => void;
  setVersionsLoading: (loading: boolean) => void;
  setVersionsError: (error: string | null) => void;

  // Domain Actions
  setDomains: (portfolioId: string, domains: CustomDomain[]) => void;
  addDomain: (portfolioId: string, domain: CustomDomain) => void;
  removeDomain: (portfolioId: string, domainId: string) => void;
  updateDomain: (portfolioId: string, domainId: string, updates: Partial<CustomDomain>) => void;
  setDomainsLoading: (loading: boolean) => void;
  setDomainsError: (error: string | null) => void;

  // Share Actions
  setShares: (portfolioId: string, shares: PortfolioShare[]) => void;
  addShare: (portfolioId: string, share: PortfolioShare) => void;
  removeShare: (portfolioId: string, shareId: string) => void;
  setSharesLoading: (loading: boolean) => void;
  setSharesError: (error: string | null) => void;

  // Analytics Actions
  setAnalytics: (portfolioId: string, analytics: PortfolioAnalytics[]) => void;
  setAnalyticsLoading: (loading: boolean) => void;
  setAnalyticsError: (error: string | null) => void;

  // Deployment Actions
  setDeployments: (portfolioId: string, deployments: PortfolioDeployment[]) => void;
  addDeployment: (portfolioId: string, deployment: PortfolioDeployment) => void;
  updateDeployment: (portfolioId: string, deploymentId: string, updates: Partial<PortfolioDeployment>) => void;
  setDeploymentsLoading: (loading: boolean) => void;
  setDeploymentsError: (error: string | null) => void;

  // UI State Actions
  markSaved: (portfolioId: string) => void;
  markUnsaved: (portfolioId: string) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;

  // Filter Actions
  setFilters: (filters: Partial<PortfolioState['filters']>) => void;
  resetFilters: () => void;

  // Utility Actions
  reset: () => void;
  clearErrors: () => void;
}

type PortfolioStore = PortfolioState & PortfolioActions;

// ========================================
// INITIAL STATE
// ========================================

const initialState: PortfolioState = {
  // Portfolio List
  portfolios: [],
  portfoliosLoading: false,
  portfoliosError: null,
  portfoliosTotalPages: 0,
  portfoliosCurrentPage: 1,

  // Active Portfolio
  activePortfolio: null,
  activePortfolioLoading: false,
  activePortfolioError: null,

  // Templates
  templates: [],
  templatesLoading: false,
  templatesError: null,

  // Versions
  versions: {},
  versionsLoading: false,
  versionsError: null,

  // Custom Domains
  domains: {},
  domainsLoading: false,
  domainsError: null,

  // Share Links
  shares: {},
  sharesLoading: false,
  sharesError: null,

  // Analytics
  analytics: {},
  analyticsLoading: false,
  analyticsError: null,

  // Deployments
  deployments: {},
  deploymentsLoading: false,
  deploymentsError: null,

  // UI State
  lastSavedAt: {},
  unsavedChanges: {},
  autoSaveEnabled: true,

  // Filters
  filters: {
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
};

// ========================================
// ZUSTAND STORE
// ========================================

export const usePortfolioStore = create<PortfolioStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // ========================================
        // PORTFOLIO LIST ACTIONS
        // ========================================

        setPortfolios: (portfolios, total, page) =>
          set((state) => {
            state.portfolios = portfolios;
            state.portfoliosTotalPages = Math.ceil(total / 20); // Assuming 20 per page
            state.portfoliosCurrentPage = page;
            state.portfoliosError = null;
          }),

        addPortfolio: (portfolio) =>
          set((state) => {
            state.portfolios.unshift(portfolio);
          }),

        updatePortfolioInList: (id, updates) =>
          set((state) => {
            const index = state.portfolios.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.portfolios[index] = { ...state.portfolios[index], ...updates };
            }
            // Also update active portfolio if it matches
            if (state.activePortfolio?.id === id) {
              state.activePortfolio = { ...state.activePortfolio, ...updates };
            }
          }),

        removePortfolio: (id) =>
          set((state) => {
            state.portfolios = state.portfolios.filter((p) => p.id !== id);
            if (state.activePortfolio?.id === id) {
              state.activePortfolio = null;
            }
          }),

        setPortfoliosLoading: (loading) =>
          set((state) => {
            state.portfoliosLoading = loading;
          }),

        setPortfoliosError: (error) =>
          set((state) => {
            state.portfoliosError = error;
          }),

        // ========================================
        // ACTIVE PORTFOLIO ACTIONS
        // ========================================

        setActivePortfolio: (portfolio) =>
          set((state) => {
            state.activePortfolio = portfolio;
            state.activePortfolioError = null;
          }),

        updateActivePortfolio: (updates) =>
          set((state) => {
            if (state.activePortfolio) {
              state.activePortfolio = { ...state.activePortfolio, ...updates };
              // Mark as unsaved
              state.unsavedChanges[state.activePortfolio.id] = true;
            }
          }),

        setActivePortfolioLoading: (loading) =>
          set((state) => {
            state.activePortfolioLoading = loading;
          }),

        setActivePortfolioError: (error) =>
          set((state) => {
            state.activePortfolioError = error;
          }),

        clearActivePortfolio: () =>
          set((state) => {
            state.activePortfolio = null;
            state.activePortfolioError = null;
          }),

        // ========================================
        // TEMPLATE ACTIONS
        // ========================================

        setTemplates: (templates) =>
          set((state) => {
            state.templates = templates;
            state.templatesError = null;
          }),

        setTemplatesLoading: (loading) =>
          set((state) => {
            state.templatesLoading = loading;
          }),

        setTemplatesError: (error) =>
          set((state) => {
            state.templatesError = error;
          }),

        // ========================================
        // VERSION ACTIONS
        // ========================================

        setVersions: (portfolioId, versions) =>
          set((state) => {
            state.versions[portfolioId] = versions;
            state.versionsError = null;
          }),

        addVersion: (portfolioId, version) =>
          set((state) => {
            if (!state.versions[portfolioId]) {
              state.versions[portfolioId] = [];
            }
            state.versions[portfolioId].unshift(version);
          }),

        setVersionsLoading: (loading) =>
          set((state) => {
            state.versionsLoading = loading;
          }),

        setVersionsError: (error) =>
          set((state) => {
            state.versionsError = error;
          }),

        // ========================================
        // DOMAIN ACTIONS
        // ========================================

        setDomains: (portfolioId, domains) =>
          set((state) => {
            state.domains[portfolioId] = domains;
            state.domainsError = null;
          }),

        addDomain: (portfolioId, domain) =>
          set((state) => {
            if (!state.domains[portfolioId]) {
              state.domains[portfolioId] = [];
            }
            state.domains[portfolioId].push(domain);
          }),

        removeDomain: (portfolioId, domainId) =>
          set((state) => {
            if (state.domains[portfolioId]) {
              state.domains[portfolioId] = state.domains[portfolioId].filter((d) => d.id !== domainId);
            }
          }),

        updateDomain: (portfolioId, domainId, updates) =>
          set((state) => {
            if (state.domains[portfolioId]) {
              const index = state.domains[portfolioId].findIndex((d) => d.id === domainId);
              if (index !== -1) {
                state.domains[portfolioId][index] = { ...state.domains[portfolioId][index], ...updates };
              }
            }
          }),

        setDomainsLoading: (loading) =>
          set((state) => {
            state.domainsLoading = loading;
          }),

        setDomainsError: (error) =>
          set((state) => {
            state.domainsError = error;
          }),

        // ========================================
        // SHARE ACTIONS
        // ========================================

        setShares: (portfolioId, shares) =>
          set((state) => {
            state.shares[portfolioId] = shares;
            state.sharesError = null;
          }),

        addShare: (portfolioId, share) =>
          set((state) => {
            if (!state.shares[portfolioId]) {
              state.shares[portfolioId] = [];
            }
            state.shares[portfolioId].push(share);
          }),

        removeShare: (portfolioId, shareId) =>
          set((state) => {
            if (state.shares[portfolioId]) {
              state.shares[portfolioId] = state.shares[portfolioId].filter((s) => s.id !== shareId);
            }
          }),

        setSharesLoading: (loading) =>
          set((state) => {
            state.sharesLoading = loading;
          }),

        setSharesError: (error) =>
          set((state) => {
            state.sharesError = error;
          }),

        // ========================================
        // ANALYTICS ACTIONS
        // ========================================

        setAnalytics: (portfolioId, analytics) =>
          set((state) => {
            state.analytics[portfolioId] = analytics;
            state.analyticsError = null;
          }),

        setAnalyticsLoading: (loading) =>
          set((state) => {
            state.analyticsLoading = loading;
          }),

        setAnalyticsError: (error) =>
          set((state) => {
            state.analyticsError = error;
          }),

        // ========================================
        // DEPLOYMENT ACTIONS
        // ========================================

        setDeployments: (portfolioId, deployments) =>
          set((state) => {
            state.deployments[portfolioId] = deployments;
            state.deploymentsError = null;
          }),

        addDeployment: (portfolioId, deployment) =>
          set((state) => {
            if (!state.deployments[portfolioId]) {
              state.deployments[portfolioId] = [];
            }
            state.deployments[portfolioId].unshift(deployment);
          }),

        updateDeployment: (portfolioId, deploymentId, updates) =>
          set((state) => {
            if (state.deployments[portfolioId]) {
              const index = state.deployments[portfolioId].findIndex((d) => d.id === deploymentId);
              if (index !== -1) {
                state.deployments[portfolioId][index] = {
                  ...state.deployments[portfolioId][index],
                  ...updates,
                };
              }
            }
          }),

        setDeploymentsLoading: (loading) =>
          set((state) => {
            state.deploymentsLoading = loading;
          }),

        setDeploymentsError: (error) =>
          set((state) => {
            state.deploymentsError = error;
          }),

        // ========================================
        // UI STATE ACTIONS
        // ========================================

        markSaved: (portfolioId) =>
          set((state) => {
            state.lastSavedAt[portfolioId] = new Date();
            state.unsavedChanges[portfolioId] = false;
          }),

        markUnsaved: (portfolioId) =>
          set((state) => {
            state.unsavedChanges[portfolioId] = true;
          }),

        setAutoSaveEnabled: (enabled) =>
          set((state) => {
            state.autoSaveEnabled = enabled;
          }),

        // ========================================
        // FILTER ACTIONS
        // ========================================

        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          }),

        resetFilters: () =>
          set((state) => {
            state.filters = initialState.filters;
          }),

        // ========================================
        // UTILITY ACTIONS
        // ========================================

        reset: () => set(initialState),

        clearErrors: () =>
          set((state) => {
            state.portfoliosError = null;
            state.activePortfolioError = null;
            state.templatesError = null;
            state.versionsError = null;
            state.domainsError = null;
            state.sharesError = null;
            state.analyticsError = null;
            state.deploymentsError = null;
          }),
      })),
      {
        name: 'portfolio-storage',
        partialize: (state) => ({
          // Only persist certain fields
          portfolios: state.portfolios,
          activePortfolio: state.activePortfolio,
          templates: state.templates,
          filters: state.filters,
          lastSavedAt: state.lastSavedAt,
          unsavedChanges: state.unsavedChanges,
          autoSaveEnabled: state.autoSaveEnabled,
        }),
      }
    ),
    { name: 'PortfolioStore' }
  )
);

// ========================================
// SELECTORS (for better performance)
// ========================================

export const selectPortfolios = (state: PortfolioStore) => state.portfolios;
export const selectActivePortfolio = (state: PortfolioStore) => state.activePortfolio;
export const selectTemplates = (state: PortfolioStore) => state.templates;
export const selectPortfoliosLoading = (state: PortfolioStore) => state.portfoliosLoading;
export const selectActivePortfolioLoading = (state: PortfolioStore) => state.activePortfolioLoading;
export const selectHasUnsavedChanges = (portfolioId: string) => (state: PortfolioStore) =>
  state.unsavedChanges[portfolioId] || false;
export const selectLastSavedAt = (portfolioId: string) => (state: PortfolioStore) =>
  state.lastSavedAt[portfolioId];
export const selectVersions = (portfolioId: string) => (state: PortfolioStore) =>
  state.versions[portfolioId] || [];
export const selectDomains = (portfolioId: string) => (state: PortfolioStore) =>
  state.domains[portfolioId] || [];
export const selectShares = (portfolioId: string) => (state: PortfolioStore) =>
  state.shares[portfolioId] || [];
export const selectAnalytics = (portfolioId: string) => (state: PortfolioStore) =>
  state.analytics[portfolioId] || [];
export const selectDeployments = (portfolioId: string) => (state: PortfolioStore) =>
  state.deployments[portfolioId] || [];
