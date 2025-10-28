/**
 * Portfolio API client
 */

import { apiService } from './apiService';

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  data: any;
  templateId: string;
  isPublished: boolean;
  subdomain?: string;
  customDomain?: string;
}

export const portfolioApi = {
  /**
   * Get all portfolios
   */
  async getAll(): Promise<Portfolio[]> {
    const response = await apiService.get('/portfolios');
    return response.portfolios;
  },

  /**
   * Get portfolio by ID
   */
  async getById(id: string): Promise<Portfolio> {
    const response = await apiService.get(`/portfolios/${id}`);
    return response.portfolio;
  },

  /**
   * Create portfolio
   */
  async create(portfolio: Partial<Portfolio>): Promise<Portfolio> {
    const response = await apiService.post('/portfolios', portfolio);
    return response.portfolio;
  },

  /**
   * Update portfolio
   */
  async update(id: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const response = await apiService.put(`/portfolios/${id}`, updates);
    return response.portfolio;
  },

  /**
   * Delete portfolio
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/portfolios/${id}`);
  },

  /**
   * Publish portfolio
   */
  async publish(id: string, config: { subdomain?: string; customDomain?: string }): Promise<Portfolio> {
    const response = await apiService.post(`/portfolios/${id}/publish`, config);
    return response.portfolio;
  }
};

