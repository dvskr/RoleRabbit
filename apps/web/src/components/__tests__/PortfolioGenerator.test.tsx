/**
 * Portfolio Generator Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioGenerator from '../portfolio-generator/PortfolioGenerator';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software Engineer'
    },
    isLoading: false
  })
}));

describe('Portfolio Generator Component', () => {
  const mockUserData = {
    name: 'John Doe',
    bio: 'Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: [],
    projects: []
  };

  test('should render portfolio generator', () => {
    render(<PortfolioGenerator userData={mockUserData} />);
    
    const generator = screen.queryByText(/portfolio.*generator/i);
    expect(generator).toBeDefined();
  });

  test('should display template selector', () => {
    render(<PortfolioGenerator userData={mockUserData} />);
    
    const templates = screen.queryByText(/template|select.*template/i);
    expect(templates).toBeDefined();
  });

  test('should allow customizing sections', () => {
    render(<PortfolioGenerator userData={mockUserData} />);
    
    const customize = screen.queryByText(/customize|sections/i);
    expect(customize).toBeDefined();
  });

  test('should generate preview', () => {
    const mockOnGenerate = jest.fn();
    render(<PortfolioGenerator userData={mockUserData} onGenerate={mockOnGenerate} />);
    
    const preview = screen.queryByText(/preview/i);
    expect(preview).toBeDefined();
  });

  test('should allow publishing', () => {
    const mockOnPublish = jest.fn();
    render(<PortfolioGenerator userData={mockUserData} onPublish={mockOnPublish} />);
    
    const publishButton = screen.queryByText(/publish/i);
    expect(publishButton).toBeDefined();
  });
});

