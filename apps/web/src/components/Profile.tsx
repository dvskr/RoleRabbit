/**
 * Profile - Main presentation component for user profile
 * Uses ProfileContainer for all logic and state management
 * Focuses purely on rendering UI
 */

'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProfileErrorBoundary from './profile/ProfileErrorBoundary';
import { ProfileContainer, ProfileContainerRenderProps } from './profile/ProfileContainer';
import {
  ProfileHeader,
  ProfileSidebar,
  ProfileTab,
  ProfessionalTab,
  SkillsTab,
  PreferencesTab,
  BillingTab,
  SupportTab,
} from './profile/index';

/**
 * Profile component - Presentation layer
 * All logic is handled by ProfileContainer
 */
function Profile() {
  const { theme } = useTheme();
  const colors = theme.colors;
  
    return (
    <ProfileErrorBoundary>
      <ProfileContainer>
        {({
          activeTab,
          isEditing,
          isLoading,
          isSaving,
          isSaved,
          saveMessage,
          displayData,
          profileCompleteness,
          setActiveTab,
          handleUserDataChange,
          handleChangePhoto,
          handleSave,
          handleEdit,
          handleCancel,
          clearSaveMessage,
          tabs,
          isAuthenticated
        }: ProfileContainerRenderProps) => {
          // Show loading state
          if (isLoading) {
            return (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
          // Guard: Only allow authenticated users to access profile
    if (!isAuthenticated) {
    return (
              <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
                  <p className="text-lg mb-4" style={{ color: colors.errorRed }}>
                    You must be signed in to access your profile.
                  </p>
        </div>
      </div>
    );
  }

          // Render tab content based on active tab
  const renderTabContent = () => {
    const commonProps = {
      userData: displayData,
      isEditing,
      onUserDataChange: handleUserDataChange
    };

    switch (activeTab) {
      case 'profile':
        return <ProfileTab {...commonProps} onChangePhoto={handleChangePhoto} />;
      case 'professional':
        return <ProfessionalTab {...commonProps} />;
      case 'skills':
        return <SkillsTab {...commonProps} />;
      case 'preferences':
        return <PreferencesTab {...commonProps} />;
      case 'billing':
        return <BillingTab {...commonProps} />;
      case 'support':
        return <SupportTab />;
      default:
        return (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">This section is coming soon...</p>
                  </div>
        );
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Error Message Only (Success shown in button) */}
      {saveMessage && saveMessage.type === 'error' && (
        <div 
          className="mx-4 mt-4 p-4 rounded-xl shadow-lg flex items-center justify-between bg-red-50 border border-red-200"
        >
          <p className="text-sm font-medium text-red-800">
            {saveMessage.text}
          </p>
          <button
                    onClick={clearSaveMessage}
            className="ml-4 text-lg font-bold text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Enhanced Header */}
      <ProfileHeader
        isEditing={isEditing}
        isSaving={isSaving}
        isSaved={isSaved}
        profileCompleteness={profileCompleteness}
                onEdit={handleEdit}
                onCancel={handleCancel}
        onSave={handleSave}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Enhanced Sidebar with Proper Spacing */}
        <ProfileSidebar
          activeTab={activeTab}
          tabs={tabs}
          onTabChange={setActiveTab}
        />

        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 px-6">
            <div className="w-full">
              {renderTabContent()}
                      </div>
          </div>
        </div>
      </div>
    </div>
          );
        }}
      </ProfileContainer>
    </ProfileErrorBoundary>
  );
}

export default Profile;
