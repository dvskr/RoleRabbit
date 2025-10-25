'use client';

import { useState, useCallback } from 'react';
import { 
  UserProfile, 
  SecuritySettings, 
  UserPreferences, 
  BillingInfo, 
  SupportTicket, 
  FeedbackForm, 
  JobApplication, 
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
  
  // Billing information
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    plan: 'premium',
    status: 'active',
    nextBillingDate: '2024-02-01',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa'
    },
    billingAddress: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    invoices: [
      {
        id: 'inv_001',
        date: '2024-01-01',
        amount: 29.99,
        status: 'paid',
        downloadUrl: '#'
      },
      {
        id: 'inv_002',
        date: '2023-12-01',
        amount: 29.99,
        status: 'paid',
        downloadUrl: '#'
      }
    ]
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
  
  // Job applications
  const [jobs, setJobs] = useState<JobApplication[]>([
    {
      id: 'job_001',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      status: 'interview',
      appliedDate: '2024-01-15',
      salary: '$120,000 - $150,000',
      description: 'Looking for a senior frontend developer with React experience',
      url: 'https://techcorp.com/jobs/senior-frontend',
      notes: 'Great company culture, remote friendly',
      priority: 'high',
      contact: {
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        phone: '+1 (555) 987-6543'
      }
    },
    {
      id: 'job_002',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      status: 'applied',
      appliedDate: '2024-01-10',
      salary: '$100,000 - $130,000',
      description: 'Full stack position with modern tech stack',
      url: 'https://startupxyz.com/careers',
      notes: 'Fast-growing startup, equity options',
      priority: 'medium'
    }
  ]);
  
  const [newJob, setNewJob] = useState<Partial<JobApplication>>({
    title: '',
    company: '',
    location: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    salary: '',
    description: '',
    url: '',
    notes: '',
    priority: 'medium'
  });
  
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobFilter, setJobFilter] = useState('all');
  
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
  
  const handleAddJob = useCallback(async (jobData: Partial<JobApplication>) => {
    const newJobData: JobApplication = {
      id: `job_${Date.now()}`,
      title: jobData.title || '',
      company: jobData.company || '',
      location: jobData.location || '',
      status: jobData.status || 'applied',
      appliedDate: jobData.appliedDate || new Date().toISOString().split('T')[0],
      salary: jobData.salary || '',
      description: jobData.description || '',
      url: jobData.url || '',
      notes: jobData.notes || '',
      priority: jobData.priority || 'medium',
      contact: jobData.contact
    };
    
    setJobs(prev => [...prev, newJobData]);
    setNewJob({
      title: '',
      company: '',
      location: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      salary: '',
      description: '',
      url: '',
      notes: '',
      priority: 'medium'
    });
    setShowAddJob(false);
    // TODO: Implement actual job addition logic
  }, []);
  
  const handleUpdateJob = useCallback(async (jobId: string, jobData: Partial<JobApplication>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...jobData } : job
    ));
    // TODO: Implement actual job update logic
  }, []);
  
  const handleDeleteJob = useCallback(async (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    // TODO: Implement actual job deletion logic
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
    billingInfo,
    supportTickets,
    feedbackForm,
    jobs,
    newJob,
    showAddJob,
    jobFilter,
    
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
    setBillingInfo,
    setSupportTickets,
    setFeedbackForm,
    setJobs,
    setNewJob,
    setShowAddJob,
    setJobFilter,
    
    // Actions
    handleLogin,
    handleSignup,
    handleLogout,
    handleSaveProfile,
    handleUpdateSecurity,
    handleUpdatePreferences,
    handleSubmitFeedback,
    handleAddJob,
    handleUpdateJob,
    handleDeleteJob
  };
};
