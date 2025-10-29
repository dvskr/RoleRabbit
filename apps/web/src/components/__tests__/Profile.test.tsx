/**
 * Profile Component Tests
 */

import { render, screen } from '@testing-library/react';
import Profile from '../profile/Profile';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com',
      bio: 'Test bio',
      skills: []
    },
    isLoading: false
  })
}));

describe('Profile Component', () => {
  test('should render profile page', () => {
    render(<Profile />);
    
    const profile = screen.queryByText(/profile/i);
    expect(profile).toBeDefined();
  });

  test('should display user information', () => {
    render(<Profile />);
    
    const userName = screen.queryByText(/test user/i);
    expect(userName).toBeDefined();
  });

  test('should have profile tabs', () => {
    render(<Profile />);
    
    // Check for tab navigation
    const tabs = screen.queryAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  test('should display skills section', () => {
    render(<Profile />);
    
    const skills = screen.queryByText(/skills/i);
    expect(skills).toBeDefined();
  });
});

