'use client';

import { useState, useCallback } from 'react';
import { 
  UserProfile, 
  SecuritySettings, 
  UserPreferences, 
  SupportTicket, 
  FeedbackForm, 
  UserProfileTab 
} from '../types/userProfile';

export const useUserProfile = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState<UserProfileTab>('profile');
  
  // Authentication state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    company: '' 
  });
  
  // Profile form
  const [profileForm, setProfileForm] = useState<UserProfile>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
    company: 'Tech Corp',
    title: 'Software Engineer',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.dev',
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    experience: '5+ years',
    education: 'BS Computer Science',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  });
  
  // Security settings
  const [securityForm, setSecurityForm] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });
  
  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    emailFrequency: 'daily',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true
    }
  });
  
  // Support tickets
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'ticket_001',
      subject: 'Password reset issue',
      description: 'Unable to reset password via email',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      category: 'technical'
    },
    {
      id: 'ticket_002',
      subject: 'Feature request: Dark mode',
      description: 'Would love to see a dark mode option',
      status: 'open',
      priority: 'low',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z',
      category: 'feature'
    }
  ]);
  
  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    type: 'general',
    subject: '',
    description: '',
    priority: 'medium'
  });
  
  // Action handlers
  const handleLogin = useCallback(async (email: string, password: string) => {
    console.log('Login attempt:', email);
    // TODO: Implement actual login logic
  }, []);
  
  const handleSignup = useCallback(async (name: string, email: string, password: string, company?: string) => {
    console.log('Signup attempt:', { name, email, company });
    // TODO: Implement actual signup logic
  }, []);
  
  const handleLogout = useCallback(async () => {
    console.log('Logout');
    // TODO: Implement actual logout logic
  }, []);
  
  const handleSaveProfile = useCallback(async (profileData: UserProfile) => {
    console.log('Saving profile:', profileData);
    setProfileForm(profileData);
    setIsEditing(false);
    // TODO: Implement actual save logic
  }, []);
  
  const handleUpdateSecurity = useCallback(async (securityData: SecuritySettings) => {
    console.log('Updating security settings:', securityData);
    setSecurityForm(securityData);
    // TODO: Implement actual security update logic
  }, []);
  
  const handleUpdatePreferences = useCallback(async (preferencesData: UserPreferences) => {
    console.log('Updating preferences:', preferencesData);
    setPreferences(preferencesData);
    // TODO: Implement actual preferences update logic
  }, []);
  
  const handleSubmitFeedback = useCallback(async (feedbackData: FeedbackForm) => {
    console.log('Submitting feedback:', feedbackData);
    setFeedbackForm({
      type: 'general',
      subject: '',
      description: '',
      priority: 'medium'
    });
    // TODO: Implement actual feedback submission logic
  }, []);
  
  return {
    // State
    activeTab,
    isLoginMode,
    showPassword,
    isEditing,
    loginForm,
    signupForm,
    profileForm,
    securityForm,
    preferences,
    supportTickets,
    feedbackForm,
    
    // Setters
    setActiveTab,
    setIsLoginMode,
    setShowPassword,
    setIsEditing,
    setLoginForm,
    setSignupForm,
    setProfileForm,
    setSecurityForm,
    setPreferences,
    setSupportTickets,
    setFeedbackForm,
    
    // Actions
    handleLogin,
    handleSignup,
    handleLogout,
    handleSaveProfile,
    handleUpdateSecurity,
    handleUpdatePreferences,
    handleSubmitFeedback
  };
};
