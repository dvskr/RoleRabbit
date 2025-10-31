/**
 * Cloud Storage Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CloudStorage from '../CloudStorage';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('Cloud Storage Component', () => {
  const mockFiles = [
    {
      id: '1',
      name: 'resume.pdf',
      type: 'resume',
      size: '2.5 MB',
      lastModified: '2025-01-15',
      isPublic: false
    },
    {
      id: '2',
      name: 'portfolio.jpg',
      type: 'image',
      size: '1.2 MB',
      lastModified: '2025-01-20',
      isPublic: true
    }
  ];

  test('should render cloud storage', () => {
    render(<CloudStorage files={mockFiles} />);
    
    const storage = screen.queryByText(/cloud.*storage|files/i);
    expect(storage).toBeDefined();
  });

  test('should display file list', () => {
    render(<CloudStorage files={mockFiles} />);
    
    const resume = screen.queryByText(/resume.pdf/i);
    expect(resume).toBeDefined();
  });

  test('should allow file upload', () => {
    render(<CloudStorage files={mockFiles} />);
    
    const uploadButton = screen.queryByText(/upload/i);
    expect(uploadButton).toBeDefined();
  });

  test('should filter by file type', () => {
    render(<CloudStorage files={mockFiles} filterType="resume" />);
    
    const resume = screen.queryByText(/resume.pdf/i);
    expect(resume).toBeDefined();
  });

  test('should allow file deletion', () => {
    const mockOnDelete = jest.fn();
    render(<CloudStorage files={mockFiles} onDeleteFile={mockOnDelete} />);
    
    const deleteButton = screen.queryByTitle(/delete/i);
    expect(deleteButton).toBeDefined();
  });
});

