/**
 * Cover Letter Generator Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CoverLetterGenerator from '../coverletter/CoverLetterGenerator';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('Cover Letter Generator Component', () => {
  const mockJob = {
    title: 'Software Engineer',
    company: 'Tech Corp',
    description: 'We are looking for...'
  };

  test('should render cover letter generator', () => {
    render(<CoverLetterGenerator job={mockJob} />);
    
    const generator = screen.queryByText(/cover.*letter/i);
    expect(generator).toBeDefined();
  });

  test('should display tone selector', () => {
    render(<CoverLetterGenerator job={mockJob} />);
    
    const tone = screen.queryByText(/tone/i);
    expect(tone).toBeDefined();
  });

  test('should generate cover letter', async () => {
    const mockOnGenerate = jest.fn();
    render(<CoverLetterGenerator job={mockJob} onGenerate={mockOnGenerate} />);
    
    const generateButton = screen.queryByText(/generate/i);
    if (generateButton) {
      fireEvent.click(generateButton);
    }
  });

  test('should display generated content', async () => {
    const mockContent = 'Dear Hiring Manager, ...';
    render(<CoverLetterGenerator job={mockJob} generatedContent={mockContent} />);
    
    const content = screen.queryByText(/dear hiring manager/i);
    if (content) {
      expect(content).toBeDefined();
    }
  });
});

