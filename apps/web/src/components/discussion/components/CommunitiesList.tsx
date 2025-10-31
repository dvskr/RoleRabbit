import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { Community } from '../../../types/discussion';
import CommunityCard from '../CommunityCard';

interface CommunitiesListProps {
  colors: any;
  filteredCommunities: Community[];
  joinedCommunities: string[];
  animatingCommunityId: string | null;
  onShowCreateCommunity: () => void;
  onJoinCommunity: (communityId: string) => void;
  onViewCommunity: (communityId: string) => void;
  onPostToCommunity: (communityId: string) => void;
  onEditCommunity: (community: Community) => void;
  onManageMembers: (community: Community) => void;
  onModerationTools: (community: Community) => void;
  onDeleteCommunity: (community: Community) => void;
}

export default function CommunitiesList({
  colors,
  filteredCommunities,
  joinedCommunities,
  animatingCommunityId,
  onShowCreateCommunity,
  onJoinCommunity,
  onViewCommunity,
  onPostToCommunity,
  onEditCommunity,
  onManageMembers,
  onModerationTools,
  onDeleteCommunity,
}: CommunitiesListProps) {
  return (
    <div className="space-y-6">
      {/* Professional Network Overview */}
      <div
        className="rounded-xl p-6 border"
        style={{
          background: `linear-gradient(to right, ${colors.primaryBlue}15, ${colors.badgePurpleBg}15)`,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: colors.primaryText }}>Professional Networks</h2>
            <p className="text-sm" style={{ color: colors.secondaryText }}>Join communities and connect with professionals</p>
          </div>
          <button
            onClick={onShowCreateCommunity}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
          >
            <Plus size={16} />
            Create Network
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCommunities.map(community => (
            <CommunityCard
              key={community.id}
              community={community}
              onJoin={onJoinCommunity}
              onView={onViewCommunity}
              onPost={onPostToCommunity}
              onEditCommunity={onEditCommunity}
              onManageMembers={onManageMembers}
              onModerationTools={onModerationTools}
              onDeleteCommunity={onDeleteCommunity}
              isJoined={joinedCommunities.includes(community.id)}
              isAnimating={animatingCommunityId === community.id}
            />
          ))}
        </div>
        
        {filteredCommunities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: colors.inputBackground }}>
              <MessageSquare size={20} style={{ color: colors.tertiaryText }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primaryText }}>No Professional Networks Found</h3>
            <p className="mb-4" style={{ color: colors.secondaryText }}>Create your first professional network to get started</p>
            <button
              onClick={onShowCreateCommunity}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                background: colors.primaryBlue,
                color: 'white',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
            >
              Create Network
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

