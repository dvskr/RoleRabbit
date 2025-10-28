/**
 * Analytics API client
 */

import { apiService } from './apiService';

export const analyticsApi = {
  /**
   * Get job analytics
   */
  async getJobAnalytics(jobId: string, dateRange: number = 30) {
    const response = await apiService.post(`/jobs/${jobId}/analytics`, { dateRange });
    return response.analytics;
  },

  /**
   * Get success metrics
   */
  async getSuccessMetrics(days: number = 30) {
    const response = await apiService.get('/jobs/analytics/summary', { days });
    return response.metrics;
  }
};

