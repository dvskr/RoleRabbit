'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '@/services/apiService';
import { logger } from '@/utils/logger';
import { useAuth } from './AuthContext';
import { UserData } from '@/components/profile/types/profile';

interface ProfileContextType {
  userData: UserData | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: Partial<UserData>) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load profile data when user is authenticated
  useEffect(() => {
    // Wait for auth to finish loading before attempting to load profile
    if (authLoading) {
      return;
    }

    const loadProfile = async () => {
      // Always reload on initial mount (page refresh)
      // Skip if we already have data and it's not the initial load
      if (!isInitialLoad && hasLoaded && userData) {
        setIsLoading(false);
        return;
      }

      // Mark as not initial load if we're going to fetch
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }

      // Only set loading to true if we're actually going to fetch
      setIsLoading(true);
      try {
        const response = await apiService.getUserProfile();
        if (response && response.user) {
          const userProfile = response.user as any;
          
          // Map API response to full UserData with all required fields and defaults
          const userDataWithDefaults: UserData = {
            // Basic Info - map from API or use defaults
            firstName: userProfile.firstName || userProfile.name?.split(' ')[0] || '',
            lastName: userProfile.lastName || userProfile.name?.split(' ').slice(1).join(' ') || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            location: userProfile.location || '',
            bio: userProfile.bio || userProfile.summary || '',
            profilePicture: userProfile.profilePicture || userProfile.avatar || null,
            
            // Professional Info
            currentRole: userProfile.currentRole || userProfile.title || '',
            currentCompany: userProfile.currentCompany || userProfile.company || '',
            experience: userProfile.experience || '',
            industry: userProfile.industry || '',
            jobLevel: userProfile.jobLevel || '',
            employmentType: userProfile.employmentType || '',
            availability: userProfile.availability || '',
            salaryExpectation: userProfile.salaryExpectation || '',
            workPreference: userProfile.workPreference || '',
            professionalSummary: userProfile.professionalSummary,
            
            // Skills & Expertise
            skills: userProfile.skills || [],
            certifications: userProfile.certifications || [],
            languages: userProfile.languages || [],
            
            // Education
            education: userProfile.education || [],
            
            // Career Goals
            careerGoals: userProfile.careerGoals || [],
            targetRoles: userProfile.targetRoles || [],
            targetCompanies: userProfile.targetCompanies || [],
            relocationWillingness: userProfile.relocationWillingness || '',
            
            // Portfolio & Links
            portfolio: userProfile.portfolio || userProfile.website || '',
            linkedin: userProfile.linkedin || '',
            github: userProfile.github || '',
            website: userProfile.website || '',
            socialLinks: userProfile.socialLinks || [],
            projects: userProfile.projects || [],
            achievements: userProfile.achievements || [],
            
            // Career Timeline
            careerTimeline: userProfile.careerTimeline || [],
            workExperiences: userProfile.workExperiences || [],
            volunteerExperiences: userProfile.volunteerExperiences || [],
            recommendations: userProfile.recommendations || [],
            publications: userProfile.publications || [],
            patents: userProfile.patents || [],
            organizations: userProfile.organizations || [],
            testScores: userProfile.testScores || [],
            personalEmail: userProfile.personalEmail || '',
            
            // Preferences
            emailNotifications: userProfile.emailNotifications ?? true,
            smsNotifications: userProfile.smsNotifications ?? false,
            privacyLevel: userProfile.privacyLevel || 'Professional',
            profileVisibility: userProfile.profileVisibility || 'Public',
            
            // Analytics
            profileViews: userProfile.profileViews || 0,
            successRate: userProfile.successRate || 0,
            profileCompleteness: userProfile.profileCompleteness || 0,
            skillMatchRate: userProfile.skillMatchRate || 0,
            avgResponseTime: userProfile.avgResponseTime || 0,
          };
          
          setUserData(userDataWithDefaults);
          setHasLoaded(true);
        }
      } catch (error) {
        logger.error('Failed to load user profile:', error);
        // Set hasLoaded to true even on error to prevent retry loops
        setHasLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      // User is authenticated - load profile (will check hasLoaded inside loadProfile)
      setIsLoading(true);
      loadProfile();
    } else if (!isAuthenticated && !authLoading) {
      // Clear profile data when user logs out (only if auth is done loading)
      setUserData(null);
      setHasLoaded(false);
      setIsInitialLoad(true);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  const refreshProfile = async () => {
    setHasLoaded(false);
    setIsLoading(true);
    try {
      const response = await apiService.getUserProfile();
      if (response && response.user) {
        const userProfile = response.user as any;
        
        // Map API response to full UserData with all required fields and defaults (same as loadProfile)
        const userDataWithDefaults: UserData = {
          firstName: userProfile.firstName || userProfile.name?.split(' ')[0] || '',
          lastName: userProfile.lastName || userProfile.name?.split(' ').slice(1).join(' ') || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          location: userProfile.location || '',
          bio: userProfile.bio || userProfile.summary || '',
          profilePicture: userProfile.profilePicture || userProfile.avatar || null,
          currentRole: userProfile.currentRole || userProfile.title || '',
          currentCompany: userProfile.currentCompany || userProfile.company || '',
          experience: userProfile.experience || '',
          industry: userProfile.industry || '',
          jobLevel: userProfile.jobLevel || '',
          employmentType: userProfile.employmentType || '',
          availability: userProfile.availability || '',
          salaryExpectation: userProfile.salaryExpectation || '',
          workPreference: userProfile.workPreference || '',
          professionalSummary: userProfile.professionalSummary,
          skills: userProfile.skills || [],
          certifications: userProfile.certifications || [],
          languages: userProfile.languages || [],
          education: userProfile.education || [],
          careerGoals: userProfile.careerGoals || [],
          targetRoles: userProfile.targetRoles || [],
          targetCompanies: userProfile.targetCompanies || [],
          relocationWillingness: userProfile.relocationWillingness || '',
          portfolio: userProfile.portfolio || userProfile.website || '',
          linkedin: userProfile.linkedin || '',
          github: userProfile.github || '',
          website: userProfile.website || '',
          socialLinks: userProfile.socialLinks || [],
          projects: userProfile.projects || [],
          achievements: userProfile.achievements || [],
          careerTimeline: userProfile.careerTimeline || [],
          workExperiences: userProfile.workExperiences || [],
          volunteerExperiences: userProfile.volunteerExperiences || [],
          recommendations: userProfile.recommendations || [],
          publications: userProfile.publications || [],
          patents: userProfile.patents || [],
          organizations: userProfile.organizations || [],
          testScores: userProfile.testScores || [],
          personalEmail: userProfile.personalEmail || '',
          emailNotifications: userProfile.emailNotifications ?? true,
          smsNotifications: userProfile.smsNotifications ?? false,
          privacyLevel: userProfile.privacyLevel || 'Professional',
          profileVisibility: userProfile.profileVisibility || 'Public',
          profileViews: userProfile.profileViews || 0,
          successRate: userProfile.successRate || 0,
          profileCompleteness: userProfile.profileCompleteness || 0,
          skillMatchRate: userProfile.skillMatchRate || 0,
          avgResponseTime: userProfile.avgResponseTime || 0,
        };
        
        setUserData(userDataWithDefaults);
        setHasLoaded(true);
      }
    } catch (error) {
      logger.error('Failed to refresh user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileData = (data: Partial<UserData>) => {
    // Guard: Only update if user is authenticated
    if (!isAuthenticated) {
      console.warn('Attempted to update profile data without authentication');
      return;
    }
    
    if (userData) {
      setUserData({ ...userData, ...data });
    }
  };

  const value = {
    userData,
    isLoading,
    refreshProfile,
    updateProfileData,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

