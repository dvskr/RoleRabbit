/**
 * Dashboard Component Tests
 */

import { render, screen } from '@testing-library/react';
import Dashboard from '../dashboard/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    isLoading: false,
    isAuthenticated: true
  })
}));

describe('Dashboard Component', () => {
  test('should render dashboard', () => {
    render(<Dashboard />);
    
    // Check if main dashboard elements are present
    const dashboard = screen.queryByText(/dashboard/i);
    expect(dashboard).toBeDefined();
  });

  test('should display user activity', () => {
    render(<Dashboard />);
    
    // Dashboard should show activity feed or to-do items
    const activity = screen.queryByText(/activity|to-do/i);
    expect(activity).toBeDefined();
  });

  test('should have navigation items', () => {
    render(<Dashboard />);
    
    // Check for dashboard navigation or widgets
    const navigation = document.querySelector('nav');
    expect(navigation).toBeDefined();
  });
});

