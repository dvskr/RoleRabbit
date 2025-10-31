import { useState } from 'react';
import { ProfileVisibility, DEFAULT_PROFILE_VISIBILITY, DEFAULT_SHOW_CONTACT_INFO } from '../constants';

/**
 * Custom hook to manage privacy settings state
 */
export const usePrivacySettings = () => {
  const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>(
    DEFAULT_PROFILE_VISIBILITY
  );
  const [showContactInfo, setShowContactInfo] = useState(DEFAULT_SHOW_CONTACT_INFO);

  return {
    profileVisibility,
    showContactInfo,
    setProfileVisibility,
    setShowContactInfo,
  };
};

