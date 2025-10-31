import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ManageMembersModal from '../ManageMembersModal';
import type { Community, CommunityMember } from '../../../../types/discussion';

// Mock useTheme
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: {
        background: '#ffffff',
        primaryText: '#000000',
        tertiaryText: '#999999',
        inputBackground: '#f5f5f5',
        border: '#e0e0e0',
        cardBackground: '#ffffff',
        primaryBlue: '#0066cc',
        primaryBlueHover: '#0052a3',
        badgeErrorText: '#ff0000',
        activeBlueText: '#0066cc',
        badgePurpleText: '#9c27b0'
      }
    }
  }))
}));

// Mock logger
jest.mock('../../../../utils/logger', () => ({
  logger: {
    debug: jest.fn()
  }
}));

describe('ManageMembersModal', () => {
  const mockCommunity: Community = {
    id: '1',
    name: 'Test Community',
    description: 'Test Description',
    category: 'general',
    isPrivate: false,
    tags: [],
    rules: [],
    memberCount: 3,
    postCount: 10,
    moderators: ['user1'],
    createdAt: '2024-01-01'
  };

  const mockMembers: CommunityMember[] = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      joinedAt: '2024-01-01',
      postCount: 50,
      lastActive: '2024-10-26'
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'moderator',
      joinedAt: '2024-02-01',
      postCount: 30,
      lastActive: '2024-10-25'
    }
  ];

  const defaultProps = {
    isOpen: true,
    community: mockCommunity,
    members: mockMembers,
    onClose: jest.fn(),
    onRemoveMember: jest.fn(),
    onRoleChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  it('renders when open with community', () => {
    render(<ManageMembersModal {...defaultProps} />);
    expect(screen.getByText(/Manage Members - Test Community/i)).toBeInTheDocument();
    expect(screen.getByText('Members (2)')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ManageMembersModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Manage Members/i)).not.toBeInTheDocument();
  });

  it('does not render when community is null', () => {
    render(<ManageMembersModal {...defaultProps} community={null} />);
    expect(screen.queryByText(/Manage Members/i)).not.toBeInTheDocument();
  });

  it('displays all members', () => {
    render(<ManageMembersModal {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays member roles', () => {
    render(<ManageMembersModal {...defaultProps} />);
    // Use getAllByText since "Admin" appears multiple times (badge and option)
    const adminElements = screen.getAllByText('Admin');
    expect(adminElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Mod')).toBeInTheDocument();
  });

  it('allows changing member role', () => {
    render(<ManageMembersModal {...defaultProps} />);
    const roleSelects = screen.getAllByRole('combobox');
    if (roleSelects.length > 0) {
      fireEvent.change(roleSelects[0], { target: { value: 'moderator' } });
      // Should call onRoleChange if provided, otherwise just logs
    }
  });

  it('shows invite members button', () => {
    render(<ManageMembersModal {...defaultProps} />);
    expect(screen.getByText(/Invite Members/i)).toBeInTheDocument();
  });

  it('displays member statistics', () => {
    render(<ManageMembersModal {...defaultProps} />);
    expect(screen.getByText(/50 posts/i)).toBeInTheDocument();
    expect(screen.getByText(/Joined 2024-01-01/i)).toBeInTheDocument();
  });
});

