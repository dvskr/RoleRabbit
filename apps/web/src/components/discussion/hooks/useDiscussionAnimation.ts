// Hook for managing animation states
import { useState, useCallback } from 'react';
import { ANIMATION_DURATION_MS } from '../constants';

export const useDiscussionAnimation = () => {
  const [animatingIcons, setAnimatingIcons] = useState<Record<string, string>>({});
  const [animatingCommunityId, setAnimatingCommunityId] = useState<string | null>(null);

  const animateIcon = useCallback((postId: string, action: string) => {
    setAnimatingIcons(prev => ({ ...prev, [postId]: action }));
    setTimeout(() => {
      setAnimatingIcons(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    }, ANIMATION_DURATION_MS);
  }, []);

  const animateCommunity = useCallback((communityId: string) => {
    setAnimatingCommunityId(communityId);
    setTimeout(() => setAnimatingCommunityId(null), ANIMATION_DURATION_MS);
  }, []);

  return {
    animatingIcons,
    animatingCommunityId,
    animateIcon,
    animateCommunity
  };
};

