/**
 * Job Board Auto Apply API Hook
 * Provides hooks for AI Auto Apply functionality
 */

import { useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { logger } from '../utils/logger';

export interface JobBoardCredential {
  id: string;
  userId: string;
  platform: 'LINKEDIN' | 'INDEED' | 'GLASSDOOR' | 'ZIPRECRUITER' | 'MONSTER' | 'DICE' | 'OTHER';
  email: string;
  isActive: boolean;
  verificationStatus: string;
  isConnected: boolean;
  lastVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  userId: string;
  credentialId: string | null;
  jobTitle: string;
  company: string;
  jobUrl: string | null;
  jobDescription: string | null;
  platform: string;
  status: 'DRAFT' | 'SUBMITTED' | 'VIEWED' | 'IN_REVIEW' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'ACCEPTED' | 'WITHDRAWN';
  appliedAt: string | null;
  isAutoApplied: boolean;
  applicationMethod: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  submitted: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: string;
  byPlatform: Record<string, number>;
  recentActivity: JobApplication[];
}

export interface ApplyToJobData {
  credentialId: string;
  jobUrl: string;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  userData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  resumeFileId?: string;
}

export interface BulkApplicationData {
  applications: Array<{
    jobUrl: string;
    platform: string;
    credentialId: string;
    jobTitle: string;
    company: string;
    jobDescription?: string;
  }>;
}

export function useJobBoardApi() {
  const [credentials, setCredentials] = useState<JobBoardCredential[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load credentials
  const loadCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.get<{ credentials: JobBoardCredential[] }>('/api/job-board/credentials');
      setCredentials(data.credentials || []);
    } catch (err: any) {
      logger.error('Failed to load credentials:', err);
      setError(err.message || 'Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add credential
  const addCredential = useCallback(async (
    platform: string,
    email: string,
    password: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.post<{ credential: JobBoardCredential }>('/api/job-board/credentials', {
        platform,
        email,
        password
      });
      await loadCredentials();
      return data.credential;
    } catch (err: any) {
      logger.error('Failed to add credential:', err);
      setError(err.message || 'Failed to add credential');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCredentials]);

  // Update credential
  const updateCredential = useCallback(async (
    id: string,
    updates: { email?: string; password?: string; isActive?: boolean }
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.put<{ credential: JobBoardCredential }>(
        `/api/job-board/credentials/${id}`,
        updates
      );
      await loadCredentials();
      return data.credential;
    } catch (err: any) {
      logger.error('Failed to update credential:', err);
      setError(err.message || 'Failed to update credential');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCredentials]);

  // Delete credential
  const deleteCredential = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.delete(`/api/job-board/credentials/${id}`);
      await loadCredentials();
    } catch (err: any) {
      logger.error('Failed to delete credential:', err);
      setError(err.message || 'Failed to delete credential');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCredentials]);

  // Test credential
  const testCredential = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.post<{ success: boolean; message: string }>(
        `/api/job-board/credentials/${id}/verify`,
        {}
      );
      await loadCredentials();
      return data;
    } catch (err: any) {
      logger.error('Failed to test credential:', err);
      setError(err.message || 'Failed to test credential');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCredentials]);

  // Load applications
  const loadApplications = useCallback(async (filters?: {
    status?: string;
    platform?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.platform) queryParams.append('platform', filters.platform);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const data = await apiService.get<{ applications: JobApplication[] }>(
        `/api/job-board/applications?${queryParams.toString()}`
      );
      setApplications(data.applications || []);
    } catch (err: any) {
      logger.error('Failed to load applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.get<{ stats: ApplicationStats }>('/api/job-board/applications/stats');
      setStats(data.stats);
    } catch (err: any) {
      logger.error('Failed to load stats:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply to single job (LinkedIn)
  const applyToLinkedInJob = useCallback(async (data: ApplyToJobData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<{
        success: boolean;
        message: string;
        application: JobApplication;
        automationResult: any;
      }>('/api/job-board/linkedin/easy-apply', data);
      await loadApplications();
      await loadStats();
      return result;
    } catch (err: any) {
      logger.error('Failed to apply to LinkedIn job:', err);
      setError(err.message || 'Failed to apply to job');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadApplications, loadStats]);

  // Apply to single job (Indeed)
  const applyToIndeedJob = useCallback(async (data: ApplyToJobData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<{
        success: boolean;
        message: string;
        application: JobApplication;
        automationResult: any;
      }>('/api/job-board/indeed/quick-apply', data);
      await loadApplications();
      await loadStats();
      return result;
    } catch (err: any) {
      logger.error('Failed to apply to Indeed job:', err);
      setError(err.message || 'Failed to apply to job');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadApplications, loadStats]);

  // Bulk apply to jobs
  const bulkApplyToJobs = useCallback(async (data: BulkApplicationData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.post<{
        success: boolean;
        total: number;
        successful: number;
        failed: number;
        results: any[];
      }>('/api/ai-agent/apply-to-jobs-bulk', data);
      await loadApplications();
      await loadStats();
      return result;
    } catch (err: any) {
      logger.error('Failed to bulk apply to jobs:', err);
      setError(err.message || 'Failed to bulk apply');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadApplications, loadStats]);

  // Update application status
  const updateApplicationStatus = useCallback(async (
    id: string,
    status: string,
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.put(`/api/job-board/applications/${id}/status`, { status, notes });
      await loadApplications();
      await loadStats();
    } catch (err: any) {
      logger.error('Failed to update application status:', err);
      setError(err.message || 'Failed to update status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadApplications, loadStats]);

  // Load initial data
  useEffect(() => {
    loadCredentials();
    loadApplications();
    loadStats();
  }, [loadCredentials, loadApplications, loadStats]);

  return {
    // State
    credentials,
    applications,
    stats,
    isLoading,
    error,

    // Credential methods
    loadCredentials,
    addCredential,
    updateCredential,
    deleteCredential,
    testCredential,

    // Application methods
    loadApplications,
    loadStats,
    applyToLinkedInJob,
    applyToIndeedJob,
    bulkApplyToJobs,
    updateApplicationStatus
  };
}
