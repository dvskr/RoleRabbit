/**
 * Tests for useUserProfile Hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useUserProfile } from '../useUserProfile';
import { UserProfile, SecuritySettings, UserPreferences, FeedbackForm, UserProfileTab } from '../../types/userProfile';

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default tab', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.activeTab).toBe('profile');
    });

    it('should initialize with login mode enabled', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.isLoginMode).toBe(true);
    });

    it('should initialize with password hidden', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.showPassword).toBe(false);
    });

    it('should initialize with editing disabled', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.isEditing).toBe(false);
    });

    it('should initialize with empty login form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.loginForm).toEqual({ email: '', password: '' });
    });

    it('should initialize with empty signup form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.signupForm).toEqual({ 
        name: '', 
        email: '', 
        password: '', 
        company: '' 
      });
    });

    it('should initialize with default profile form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.profileForm).toMatchObject({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Tech Corp',
        title: 'Software Engineer',
        location: 'San Francisco, CA',
      });
      expect(result.current.profileForm.skills).toEqual(['React', 'Node.js', 'TypeScript', 'Python', 'AWS']);
    });

    it('should initialize with default security form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.securityForm).toEqual({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,
        emailNotifications: true,
        smsNotifications: false,
        loginAlerts: true
      });
    });

    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.preferences).toMatchObject({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        emailFrequency: 'daily',
      });
      expect(result.current.preferences.notifications.email).toBe(true);
      expect(result.current.preferences.notifications.push).toBe(true);
      expect(result.current.preferences.privacy.profileVisibility).toBe('public');
    });

    it('should initialize with default support tickets', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.supportTickets).toHaveLength(2);
      expect(result.current.supportTickets[0].id).toBe('ticket_001');
      expect(result.current.supportTickets[1].id).toBe('ticket_002');
    });

    it('should initialize with empty feedback form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current.feedbackForm).toEqual({
        type: 'general',
        subject: '',
        description: '',
        priority: 'medium'
      });
    });
  });

  describe('Tab Management', () => {
    it('should change active tab', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setActiveTab('security');
      });
      
      expect(result.current.activeTab).toBe('security');
    });

    it('should handle all tab types', () => {
      const { result } = renderHook(() => useUserProfile());
      const tabs: UserProfileTab[] = ['profile', 'security', 'preferences', 'support', 'auth'];
      
      tabs.forEach(tab => {
        act(() => {
          result.current.setActiveTab(tab);
        });
        
        expect(result.current.activeTab).toBe(tab);
      });
    });
  });

  describe('Authentication State', () => {
    it('should toggle login mode', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setIsLoginMode(false);
      });
      
      expect(result.current.isLoginMode).toBe(false);
      
      act(() => {
        result.current.setIsLoginMode(true);
      });
      
      expect(result.current.isLoginMode).toBe(true);
    });

    it('should toggle password visibility', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setShowPassword(true);
      });
      
      expect(result.current.showPassword).toBe(true);
      
      act(() => {
        result.current.setShowPassword(false);
      });
      
      expect(result.current.showPassword).toBe(false);
    });

    it('should toggle editing state', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setIsEditing(true);
      });
      
      expect(result.current.isEditing).toBe(true);
      
      act(() => {
        result.current.setIsEditing(false);
      });
      
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('Form Management', () => {
    it('should update login form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setLoginForm({ email: 'test@example.com', password: 'password123' });
      });
      
      expect(result.current.loginForm).toEqual({ 
        email: 'test@example.com', 
        password: 'password123' 
      });
    });

    it('should update signup form', () => {
      const { result } = renderHook(() => useUserProfile());
      
      act(() => {
        result.current.setSignupForm({ 
          name: 'Jane Doe', 
          email: 'jane@example.com', 
          password: 'password123', 
          company: 'New Corp' 
        });
      });
      
      expect(result.current.signupForm).toEqual({ 
        name: 'Jane Doe', 
        email: 'jane@example.com', 
        password: 'password123', 
        company: 'New Corp' 
      });
    });

    it('should update profile form', () => {
      const { result } = renderHook(() => useUserProfile());
      const updatedProfile: UserProfile = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatar: 'avatar.jpg',
        company: 'New Corp',
        title: 'Senior Engineer',
        location: 'New York, NY',
        phone: '+1 (555) 999-9999',
        website: 'https://janedoe.dev',
        bio: 'Updated bio',
        skills: ['Vue', 'Angular'],
        education: 'MS Computer Science',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      act(() => {
        result.current.setProfileForm(updatedProfile);
      });
      
      expect(result.current.profileForm).toEqual(updatedProfile);
    });

    it('should update security form', () => {
      const { result } = renderHook(() => useUserProfile());
      const updatedSecurity: SecuritySettings = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
        confirmPassword: 'newpass',
        twoFactorEnabled: true,
        emailNotifications: false,
        smsNotifications: true,
        loginAlerts: false
      };
      
      act(() => {
        result.current.setSecurityForm(updatedSecurity);
      });
      
      expect(result.current.securityForm).toEqual(updatedSecurity);
    });

    it('should update preferences', () => {
      const { result } = renderHook(() => useUserProfile());
      const updatedPreferences: UserPreferences = {
        theme: 'dark',
        language: 'es',
        timezone: 'PST',
        dateFormat: 'DD/MM/YYYY',
        emailFrequency: 'weekly',
        notifications: {
          email: false,
          push: false,
          sms: true,
          marketing: true
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: true,
          showPhone: false,
          showLocation: false
        }
      };
      
      act(() => {
        result.current.setPreferences(updatedPreferences);
      });
      
      expect(result.current.preferences).toEqual(updatedPreferences);
    });

    it('should update support tickets', () => {
      const { result } = renderHook(() => useUserProfile());
      const newTicket = {
        id: 'ticket_003',
        subject: 'New Issue',
        description: 'New issue description',
        status: 'open' as const,
        priority: 'high' as const,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        category: 'technical' as const
      };
      
      act(() => {
        result.current.setSupportTickets([...result.current.supportTickets, newTicket]);
      });
      
      expect(result.current.supportTickets).toHaveLength(3);
      expect(result.current.supportTickets[2]).toEqual(newTicket);
    });

    it('should update feedback form', () => {
      const { result } = renderHook(() => useUserProfile());
      const feedback: FeedbackForm = {
        type: 'bug',
        subject: 'Bug Report',
        description: 'Found a bug',
        priority: 'high'
      };
      
      act(() => {
        result.current.setFeedbackForm(feedback);
      });
      
      expect(result.current.feedbackForm).toEqual(feedback);
    });
  });

  describe('Action Handlers', () => {
    it('should handle login', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      await act(async () => {
        await result.current.handleLogin('test@example.com', 'password123');
      });
      
      // The handler should complete without error
      expect(typeof result.current.handleLogin).toBe('function');
    });

    it('should handle signup', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      await act(async () => {
        await result.current.handleSignup('Jane Doe', 'jane@example.com', 'password123', 'Company');
      });
      
      // The handler should complete without error
      expect(typeof result.current.handleSignup).toBe('function');
    });

    it('should handle signup without company', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      await act(async () => {
        await result.current.handleSignup('Jane Doe', 'jane@example.com', 'password123');
      });
      
      // The handler should complete without error
      expect(typeof result.current.handleSignup).toBe('function');
    });

    it('should handle logout', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      await act(async () => {
        await result.current.handleLogout();
      });
      
      // The handler should complete without error
      expect(typeof result.current.handleLogout).toBe('function');
    });

    it('should handle save profile', async () => {
      const { result } = renderHook(() => useUserProfile());
      const updatedProfile: UserProfile = {
        id: '1',
        name: 'Updated Name',
        email: 'updated@example.com',
        avatar: '',
        company: 'Updated Corp',
        title: 'Updated Title',
        location: 'Updated Location',
        phone: '+1 (555) 111-1111',
        website: 'https://updated.dev',
        bio: 'Updated bio',
        skills: ['New Skill'],
        education: 'Updated Education',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };
      
      await act(async () => {
        await result.current.handleSaveProfile(updatedProfile);
      });
      
      expect(result.current.profileForm).toEqual(updatedProfile);
      expect(result.current.isEditing).toBe(false);
    });

    it('should handle update security', async () => {
      const { result } = renderHook(() => useUserProfile());
      const securityData: SecuritySettings = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
        confirmPassword: 'newpass',
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        loginAlerts: true
      };
      
      await act(async () => {
        await result.current.handleUpdateSecurity(securityData);
      });
      
      expect(result.current.securityForm).toEqual(securityData);
    });

    it('should handle update preferences', async () => {
      const { result } = renderHook(() => useUserProfile());
      const preferencesData: UserPreferences = {
        theme: 'dark',
        language: 'fr',
        timezone: 'EST',
        dateFormat: 'YYYY-MM-DD',
        emailFrequency: 'never',
        notifications: {
          email: false,
          push: false,
          sms: false,
          marketing: false
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
          showLocation: false
        }
      };
      
      await act(async () => {
        await result.current.handleUpdatePreferences(preferencesData);
      });
      
      expect(result.current.preferences).toEqual(preferencesData);
    });

    it('should handle submit feedback', async () => {
      const { result } = renderHook(() => useUserProfile());
      const feedbackData: FeedbackForm = {
        type: 'feature',
        subject: 'Feature Request',
        description: 'Please add this feature',
        priority: 'medium'
      };
      
      await act(async () => {
        await result.current.handleSubmitFeedback(feedbackData);
      });
      
      // Feedback form should be reset after submission
      expect(result.current.feedbackForm).toEqual({
        type: 'general',
        subject: '',
        description: '',
        priority: 'medium'
      });
    });
  });

  describe('Hook Return Values', () => {
    it('should return all required state values', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(result.current).toHaveProperty('activeTab');
      expect(result.current).toHaveProperty('isLoginMode');
      expect(result.current).toHaveProperty('showPassword');
      expect(result.current).toHaveProperty('isEditing');
      expect(result.current).toHaveProperty('loginForm');
      expect(result.current).toHaveProperty('signupForm');
      expect(result.current).toHaveProperty('profileForm');
      expect(result.current).toHaveProperty('securityForm');
      expect(result.current).toHaveProperty('preferences');
      expect(result.current).toHaveProperty('supportTickets');
      expect(result.current).toHaveProperty('feedbackForm');
    });

    it('should return all required setter functions', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(typeof result.current.setActiveTab).toBe('function');
      expect(typeof result.current.setIsLoginMode).toBe('function');
      expect(typeof result.current.setShowPassword).toBe('function');
      expect(typeof result.current.setIsEditing).toBe('function');
      expect(typeof result.current.setLoginForm).toBe('function');
      expect(typeof result.current.setSignupForm).toBe('function');
      expect(typeof result.current.setProfileForm).toBe('function');
      expect(typeof result.current.setSecurityForm).toBe('function');
      expect(typeof result.current.setPreferences).toBe('function');
      expect(typeof result.current.setSupportTickets).toBe('function');
      expect(typeof result.current.setFeedbackForm).toBe('function');
    });

    it('should return all required action handlers', () => {
      const { result } = renderHook(() => useUserProfile());
      
      expect(typeof result.current.handleLogin).toBe('function');
      expect(typeof result.current.handleSignup).toBe('function');
      expect(typeof result.current.handleLogout).toBe('function');
      expect(typeof result.current.handleSaveProfile).toBe('function');
      expect(typeof result.current.handleUpdateSecurity).toBe('function');
      expect(typeof result.current.handleUpdatePreferences).toBe('function');
      expect(typeof result.current.handleSubmitFeedback).toBe('function');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete profile editing workflow', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      // Start editing
      act(() => {
        result.current.setIsEditing(true);
      });
      expect(result.current.isEditing).toBe(true);
      
      // Update profile data
      const updatedProfile: UserProfile = {
        ...result.current.profileForm,
        name: 'Updated Name',
        bio: 'Updated bio'
      };
      
      act(() => {
        result.current.setProfileForm(updatedProfile);
      });
      
      // Save profile
      await act(async () => {
        await result.current.handleSaveProfile(updatedProfile);
      });
      
      expect(result.current.profileForm).toEqual(updatedProfile);
      expect(result.current.isEditing).toBe(false);
    });

    it('should handle tab switching and form updates', () => {
      const { result } = renderHook(() => useUserProfile());
      
      // Switch to security tab
      act(() => {
        result.current.setActiveTab('security');
      });
      expect(result.current.activeTab).toBe('security');
      
      // Update security form
      const securityUpdate: SecuritySettings = {
        ...result.current.securityForm,
        twoFactorEnabled: true
      };
      
      act(() => {
        result.current.setSecurityForm(securityUpdate);
      });
      expect(result.current.securityForm.twoFactorEnabled).toBe(true);
      
      // Switch to preferences tab
      act(() => {
        result.current.setActiveTab('preferences');
      });
      expect(result.current.activeTab).toBe('preferences');
      
      // Update preferences
      const preferencesUpdate: UserPreferences = {
        ...result.current.preferences,
        theme: 'dark'
      };
      
      act(() => {
        result.current.setPreferences(preferencesUpdate);
      });
      expect(result.current.preferences.theme).toBe('dark');
    });

    it('should handle authentication flow', async () => {
      const { result } = renderHook(() => useUserProfile());
      
      // Start in login mode
      expect(result.current.isLoginMode).toBe(true);
      
      // Fill login form
      act(() => {
        result.current.setLoginForm({ 
          email: 'test@example.com', 
          password: 'password123' 
        });
      });
      
      // Attempt login
      await act(async () => {
        await result.current.handleLogin('test@example.com', 'password123');
      });
      
      // Switch to signup mode
      act(() => {
        result.current.setIsLoginMode(false);
      });
      expect(result.current.isLoginMode).toBe(false);
      
      // Fill signup form
      act(() => {
        result.current.setSignupForm({ 
          name: 'New User', 
          email: 'newuser@example.com', 
          password: 'password123', 
          company: 'New Company' 
        });
      });
      
      // Attempt signup
      await act(async () => {
        await result.current.handleSignup('New User', 'newuser@example.com', 'password123', 'New Company');
      });
    });
  });
});

