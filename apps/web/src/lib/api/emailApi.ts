/**
 * Email API client
 */

import { apiService } from './apiService';

export interface Email {
  id: string;
  to: string;
  subject: string;
  body: string;
  type: string;
  status: string;
  sentDate?: string;
}

export const emailApi = {
  /**
   * Get all emails
   */
  async getAll(): Promise<Email[]> {
    const response = await apiService.get('/emails');
    return response.emails;
  },

  /**
   * Create email campaign
   */
  async create(email: Partial<Email>): Promise<Email> {
    const response = await apiService.post('/emails', email);
    return response.email;
  },

  /**
   * Send email
   */
  async send(id: string): Promise<Email> {
    const response = await apiService.post(`/emails/${id}/send`);
    return response.email;
  },

  /**
   * Get campaign analytics
   */
  async getAnalytics(): Promise<{
    total: number;
    sent: number;
    opened: number;
    openRate: string;
  }> {
    const response = await apiService.get('/emails/analytics');
    return response.analytics;
  }
};

