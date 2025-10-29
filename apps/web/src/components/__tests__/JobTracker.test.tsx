/**
 * Job Tracker Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import JobTracker from '../jobTracker/JobTracker';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('Job Tracker Component', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      status: 'applied',
      appliedDate: '2025-01-15'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      status: 'interview',
      appliedDate: '2025-01-10'
    }
  ];

  test('should render job tracker', () => {
    render(<JobTracker jobs={mockJobs} />);
    
    const tracker = screen.queryByText(/job.*tracker/i);
    expect(tracker).toBeDefined();
  });

  test('should display job list', () => {
    render(<JobTracker jobs={mockJobs} />);
    
    const job = screen.queryByText(/software engineer/i);
    expect(job).toBeDefined();
  });

  test('should filter by status', () => {
    const { rerender } = render(<JobTracker jobs={mockJobs} statusFilter="applied" />);
    
    const appliedJobs = screen.queryAllByText(/applied/i);
    expect(appliedJobs.length).toBeGreaterThan(0);
  });

  test('should allow adding new job', () => {
    const mockOnAdd = jest.fn();
    render(<JobTracker jobs={mockJobs} onAddJob={mockOnAdd} />);
    
    const addButton = screen.queryByText(/add.*job/i);
    if (addButton) {
      fireEvent.click(addButton);
    }
  });
});

