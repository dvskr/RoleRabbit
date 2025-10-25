'use client';

import React from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  X, 
  LogOut,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserProfileModalProps } from '../types/userProfile';
import {
  ProfileTab,
  SecurityTab,
  PreferencesTab,
  BillingTab,
  SupportTab,
  JobTrackerTab
} from './userProfile';

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  
  const {
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
  } = useUserProfile();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const handleLoginSubmit = async () => {
    await handleLogin(loginForm.email, loginForm.password);
    setLoginForm({ email: '', password: '' });
  };

  const handleSignupSubmit = async () => {
    await handleSignup(signupForm.name, signupForm.email, signupForm.password, signupForm.company);
    setSignupForm({ name: '', email: '', password: '', company: '' });
  };

  const handleLogoutClick = async () => {
    await handleLogout();
    onClose();
  };

  const renderAuthTab = () => (
    <div className="space-y-6">
      {/* Auth Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {isLoginMode ? (
            <Lock size={32} className="text-white" />
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {isLoginMode 
            ? 'Sign in to your account to continue' 
            : 'Join us and start building your career'
          }
        </p>
      </div>

      {/* Auth Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
          <button
          onClick={() => setIsLoginMode(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isLoginMode 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign In
          </button>
          <button
          onClick={() => setIsLoginMode(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            !isLoginMode 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign Up
          </button>
        </div>

      {/* Login Form */}
      {isLoginMode ? (
        <div className="space-y-4">
      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

          <button
            onClick={handleLoginSubmit}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
            </button>

          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Forgot your password?
            </button>
          </div>
            </div>
      ) : (
        /* Signup Form */
        <div className="space-y-4">
              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
              type="text"
              value={signupForm.name}
              onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
        </div>

              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                type="email"
                value={signupForm.email}
                onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
          </div>
        </div>

              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                <input 
              type="text"
              value={signupForm.company}
              onChange={(e) => setSignupForm(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your company name"
            />
        </div>

              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={signupForm.password}
                onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
            onClick={handleSignupSubmit}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
            Create Account
        </button>

          <div className="text-center text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
            </div>
                    </div>
                  )}
                </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onSave={handleSaveProfile}
          />
        );
      case 'security':
        return (
          <SecurityTab
            securityForm={securityForm}
            setSecurityForm={setSecurityForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onUpdate={handleUpdateSecurity}
          />
        );
      case 'preferences':
        return (
          <PreferencesTab
            preferences={preferences}
            setPreferences={setPreferences}
            onUpdate={handleUpdatePreferences}
          />
        );
      case 'billing':
        return (
          <BillingTab
            billingInfo={billingInfo}
            setBillingInfo={setBillingInfo}
            onUpdate={handleUpdatePreferences}
          />
        );
      case 'support':
        return (
          <SupportTab
            supportTickets={supportTickets}
            setSupportTickets={setSupportTickets}
            feedbackForm={feedbackForm}
            setFeedbackForm={setFeedbackForm}
            onSubmitFeedback={handleSubmitFeedback}
          />
        );
      case 'jobs':
        return (
          <JobTrackerTab
            jobs={jobs}
            setJobs={setJobs}
            newJob={newJob}
            setNewJob={setNewJob}
            showAddJob={showAddJob}
            setShowAddJob={setShowAddJob}
            jobFilter={jobFilter}
            setJobFilter={setJobFilter}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-600">
                {isAuthenticated ? `Welcome, ${user?.name || 'User'}` : 'Manage your account'}
              </p>
                  </div>
                </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleLogoutClick}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            )}
                <button
                  onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
              <X size={24} />
                </button>
          </div>
              </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
                  {tabs.map((tab) => {
                const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                    <IconComponent size={18} />
                    <span>{tab.label}</span>
                      </button>
                    );
                  })}
                  
              {/* Job Tracker Tab */}
                    <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'jobs'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Settings size={18} />
                <span>Job Tracker</span>
                  </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'auth' ? renderAuthTab() : renderActiveTab()}
                    </div>
                  </div>
                        </div>
                        </div>
    </div>
  );
}
