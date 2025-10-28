/**
 * File Upload API client
 */

import { apiService } from './apiService';

export interface CloudFile {
  id: string;
  name: string;
  type: string;
  size: number;
  contentType: string;
  folder?: string;
  isPublic: boolean;
  createdAt: string;
}

export const fileApi = {
  /**
   * Upload file
   */
  async upload(file: File, folder?: string): Promise<CloudFile> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    
    const response = await apiService.post('/files/upload', formData);
    return response.file;
  },

  /**
   * Get files
   */
  async getAll(): Promise<CloudFile[]> {
    const response = await apiService.get('/files');
    return response.files;
  },

  /**
   * Get file by ID
   */
  async getById(id: string): Promise<CloudFile> {
    const response = await apiService.get(`/files/${id}`);
    return response.file;
  },

  /**
   * Delete file
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/files/${id}`);
  }
};

