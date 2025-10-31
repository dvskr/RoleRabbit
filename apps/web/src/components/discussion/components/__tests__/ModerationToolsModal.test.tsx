import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModerationToolsModal from '../ModerationToolsModal';
import type { Community } from '../../../../types/discussion';

// Mock useTheme
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: {
        background: '#ffffff',
        primaryText: '#000000',
        tertiaryText: '#999999',
        border: '#e0e0e0',
        cardBackground: '#ffffff',
        primaryBlue: '#0066cc',
        primaryBlueHover: '#0052a3',
        badgeErrorText: '#ff0000'
      }
    }
  }))
}));

describe('ModerationToolsModal', () => {
  const mockCommunity: Community = {
    id: '1',
    name: 'Test Community',
    description: 'Test Description',
    category: 'general',
    isPrivate: false,
    tags: [],
    rules: [],
    memberCount: 10,
    postCount: 25,
    moderators: ['user1'],
    createdAt: '2024-01-01'
  };

  const defaultProps = {
    isOpen: true,
    community: mockCommunity,
    onClose: jest.fn(),
    onApprovePost: jest.fn(),
    onRemovePost: jest.fn(),
    onReviewPost: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with community', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    expect(screen.getByText(/Moderation Tools - Test Community/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ModerationToolsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Moderation Tools/i)).not.toBeInTheDocument();
  });

  it('does not render when community is null', () => {
    render(<ModerationToolsModal {...defaultProps} community={null} />);
    expect(screen.queryByText(/Moderation Tools/i)).not.toBeInTheDocument();
  });

  it('displays moderation tabs', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    expect(screen.getByText(/Reported Posts/i)).toBeInTheDocument();
    expect(screen.getByText(/Flagged Content/i)).toBeInTheDocument();
    expect(screen.getByText(/Member Violations/i)).toBeInTheDocument();
    expect(screen.getByText(/Rules/i)).toBeInTheDocument();
  });

  it('displays reported posts', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    expect(screen.getByText(/Post: "Need Help with Resume"/i)).toBeInTheDocument();
    expect(screen.getByText(/Post: "Job Interview Tips"/i)).toBeInTheDocument();
  });

  it('displays quick actions', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    expect(screen.getByText(/Automod Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Ban Members/i)).toBeInTheDocument();
    expect(screen.getByText(/Clean Up Posts/i)).toBeInTheDocument();
  });

  it('calls onApprovePost when approve button is clicked', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    const approveButtons = screen.getAllByText('Approve');
    if (approveButtons.length > 0) {
      fireEvent.click(approveButtons[0]);
      expect(defaultProps.onApprovePost).toHaveBeenCalledWith('post1');
    }
  });

  it('calls onRemovePost when remove button is clicked', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    const removeButtons = screen.getAllByText('Remove');
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(defaultProps.onRemovePost).toHaveBeenCalledWith('post1');
    }
  });

  it('calls onReviewPost when review button is clicked', () => {
    render(<ModerationToolsModal {...defaultProps} />);
    const reviewButtons = screen.getAllByText('Review');
    if (reviewButtons.length > 0) {
      fireEvent.click(reviewButtons[0]);
      expect(defaultProps.onReviewPost).toHaveBeenCalledWith('post2');
    }
  });
});

