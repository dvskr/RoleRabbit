import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunitySettingsModal from '../CommunitySettingsModal';
import type { Community } from '../../../../types/discussion';

// Mock useTheme
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: {
        background: '#ffffff',
        primaryText: '#000000',
        secondaryText: '#666666',
        tertiaryText: '#999999',
        inputBackground: '#f5f5f5',
        border: '#e0e0e0',
        primaryBlue: '#0066cc',
        primaryBlueHover: '#0052a3',
        hoverBackground: '#f0f0f0'
      }
    }
  }))
}));

describe('CommunitySettingsModal', () => {
  const mockCommunity: Community = {
    id: '1',
    name: 'Test Community',
    description: 'Test Description',
    category: 'general',
    isPrivate: false,
    tags: ['tech'],
    rules: ['Be respectful'],
    memberCount: 10,
    postCount: 25,
    moderators: ['user1'],
    createdAt: '2024-01-01'
  };

  const defaultProps = {
    isOpen: true,
    community: mockCommunity,
    onClose: jest.fn(),
    onCommunityUpdate: jest.fn(),
    onSelectedCommunityUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open with community', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    expect(screen.getByText('Edit Community')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Community')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CommunitySettingsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Edit Community')).not.toBeInTheDocument();
  });

  it('does not render when community is null', () => {
    render(<CommunitySettingsModal {...defaultProps} community={null} />);
    expect(screen.queryByText('Edit Community')).not.toBeInTheDocument();
  });

  it('allows editing community name', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const nameInput = screen.getByDisplayValue('Test Community');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(defaultProps.onCommunityUpdate).toHaveBeenCalled();
    expect(defaultProps.onSelectedCommunityUpdate).toHaveBeenCalled();
  });

  it('allows editing description', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const descInput = screen.getByDisplayValue('Test Description');
    fireEvent.change(descInput, { target: { value: 'Updated Description' } });
    expect(defaultProps.onCommunityUpdate).toHaveBeenCalled();
  });

  it('allows changing category', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'tech' } });
    expect(defaultProps.onCommunityUpdate).toHaveBeenCalled();
  });

  it('allows toggling privacy', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const privacyCheckbox = screen.getByLabelText(/Private Community/i);
    fireEvent.click(privacyCheckbox);
    expect(defaultProps.onCommunityUpdate).toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('saves changes when save button is clicked', () => {
    render(<CommunitySettingsModal {...defaultProps} />);
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});

