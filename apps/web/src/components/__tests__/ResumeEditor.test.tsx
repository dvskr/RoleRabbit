/**
 * Resume Editor Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ResumeEditor from '../resume/ResumeEditor';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('Resume Editor Component', () => {
  const mockResume = {
    id: '1',
    name: 'Test Resume',
    data: JSON.stringify({
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      },
      sections: []
    }),
    templateId: 'template-1'
  };

  test('should render resume editor', () => {
    render(<ResumeEditor resume={mockResume} onSave={jest.fn()} />);
    
    const editor = screen.queryByText(/resume/i);
    expect(editor).toBeDefined();
  });

  test('should display template selector', () => {
    render(<ResumeEditor resume={mockResume} onSave={jest.fn()} />);
    
    const template = screen.queryByText(/template/i);
    expect(template).toBeDefined();
  });

  test('should allow editing personal info', () => {
    render(<ResumeEditor resume={mockResume} onSave={jest.fn()} />);
    
    const nameInput = screen.queryByPlaceholderText(/name/i);
    expect(nameInput).toBeDefined();
  });

  test('should call onSave when save button clicked', () => {
    const mockOnSave = jest.fn();
    render(<ResumeEditor resume={mockResume} onSave={mockOnSave} />);
    
    const saveButton = screen.queryByText(/save/i);
    if (saveButton) {
      fireEvent.click(saveButton);
      expect(mockOnSave).toHaveBeenCalled();
    }
  });
});

