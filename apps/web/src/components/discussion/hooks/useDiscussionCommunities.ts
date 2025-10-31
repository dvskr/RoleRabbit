// Hook for managing community-related state and actions
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from '../../../utils/performance';
import { filterCommunitiesByQuery } from '../discussionHelpers';
import { DEBOUNCE_DELAY_MS } from '../constants';
import type { Community } from '../../../types/discussion';

export const useDiscussionCommunities = (
  communities: Community[],
  setCommunities: (updater: any) => void
) => {
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [debouncedCommunitySearchQuery, setDebouncedCommunitySearchQuery] = useState('');
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [animatingCommunityId, setAnimatingCommunityId] = useState<string | null>(null);
  
  // Debounce community search
  const debouncedSetCommunitySearch = useCallback(
    debounce((value: string) => {
      setDebouncedCommunitySearchQuery(value);
    }, DEBOUNCE_DELAY_MS),
    []
  );

  // Load saved joined communities on mount
  useEffect(() => {
    const joined = JSON.parse(localStorage.getItem('joinedCommunities') || '[]');
    setJoinedCommunities(joined);
  }, []);

  // Filtered communities for post creation (joined first, then search results)
  const filteredCommunitiesForPost = useMemo(() => {
    return filterCommunitiesByQuery(
      communities,
      debouncedCommunitySearchQuery,
      joinedCommunities
    );
  }, [communities, debouncedCommunitySearchQuery, joinedCommunities]);

  const handleJoinCommunity = useCallback((communityId: string) => {
    const isJoined = joinedCommunities.includes(communityId);
    
    // Animate
    setAnimatingCommunityId(communityId);
    setTimeout(() => setAnimatingCommunityId(null), 600);
    
    if (isJoined) {
      // Leave community
      const updated = joinedCommunities.filter(id => id !== communityId);
      setJoinedCommunities(updated);
      localStorage.setItem('joinedCommunities', JSON.stringify(updated));
      
      // Update community member count
      setCommunities((prev: Community[]) => prev.map(c => {
        if (c.id === communityId) {
          return { ...c, memberCount: Math.max(0, c.memberCount - 1) };
        }
        return c;
      }));
    } else {
      // Join community
      const updated = [...joinedCommunities, communityId];
      setJoinedCommunities(updated);
      localStorage.setItem('joinedCommunities', JSON.stringify(updated));
      
      // Update community member count
      setCommunities((prev: Community[]) => prev.map(c => {
        if (c.id === communityId) {
          return { ...c, memberCount: c.memberCount + 1 };
        }
        return c;
      }));
    }
  }, [joinedCommunities, setCommunities]);

  const handleViewCommunity = useCallback((
    communityId: string,
    updateFilters: (filters: any) => void,
    setActiveTab: (tab: string) => void
  ) => {
    const community = communities.find(c => c.id === communityId);
    if (community) {
      updateFilters({ selectedCommunity: community.name });
      setActiveTab('all'); // Switch to posts tab to see filtered posts
    }
  }, [communities]);

  const handlePostToCommunity = useCallback((
    communityId: string,
    setNewPost: (updater: any) => void,
    setShowCreatePost: (show: boolean) => void
  ) => {
    const community = communities.find(c => c.id === communityId);
    if (community) {
      // Pre-select the community in the new post
      setNewPost((prev: any) => ({ ...prev, community: community.id }));
      // Open the create post modal
      setShowCreatePost(true);
      // Auto-join if not already joined
      if (!joinedCommunities.includes(communityId)) {
        handleJoinCommunity(communityId);
      }
    }
  }, [communities, joinedCommunities, handleJoinCommunity]);

  const removeJoinedCommunity = useCallback((communityId: string) => {
    const updated = joinedCommunities.filter(id => id !== communityId);
    setJoinedCommunities(updated);
    localStorage.setItem('joinedCommunities', JSON.stringify(updated));
  }, [joinedCommunities]);

  return {
    joinedCommunities,
    setJoinedCommunities,
    communitySearchQuery,
    setCommunitySearchQuery,
    debouncedCommunitySearchQuery,
    debouncedSetCommunitySearch,
    showCommunityDropdown,
    setShowCommunityDropdown,
    animatingCommunityId,
    filteredCommunitiesForPost,
    handleJoinCommunity,
    handleViewCommunity,
    handlePostToCommunity,
    removeJoinedCommunity
  };
};

