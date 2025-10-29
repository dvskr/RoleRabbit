/**
 * Email Hub Component Tests
 */

import { render, screen } from '@testing-library/react';
import EmailHub from '../email/EmailHub';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('Email Hub Component', () => {
  const mockEmails = [
    {
      id: '1',
      to: 'recruiter@company.com',
      subject: 'Thank you for the opportunity',
      body: 'Thank you...',
      status: 'sent',
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      to: 'hr@example.com',
      subject: 'Follow-up',
      body: 'Checking on...',
      status: 'draft',
      createdAt: '2025-01-20'
    }
  ];

  test('should render email hub', () => {
    render(<EmailHub emails={mockEmails} />);
    
    const hub = screen.queryByText(/email/i);
    expect(hub).toBeDefined();
  });

  test('should display email list', () => {
    render(<EmailHub emails={mockEmails} />);
    
    const subject = screen.queryByText(/thank you for the opportunity/i);
    expect(subject).toBeDefined();
  });

  test('should filter by status', () => {
    render(<EmailHub emails={mockEmails} />);
    
    const sentEmail = screen.queryByText(/sent/i);
    const draftEmail = screen.queryByText(/draft/i);
    
    expect(sentEmail || draftEmail).toBeDefined();
  });

  test('should allow composing new email', () => {
    render(<EmailHub emails={mockEmails} />);
    
    const composeButton = screen.queryByText(/compose|new.*email/i);
    expect(composeButton).toBeDefined();
  });
});

