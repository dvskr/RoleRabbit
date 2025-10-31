import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCommunityModal from '../CreateCommunityModal';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { NewCommunity } from '../../types';

// Mock useTheme
jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    theme: {
      colors: {
        cardBackground: '#ffffff',
        primaryText: '#000000',
        secondaryText: '#666666',
        tertiaryText: '#999999',
        inputBackground: '#f5f5f5',
        border: '#e0e0e0',
        primaryBlue: '#0066cc',
        primaryBlueHover: '#0052a3',
        activeBlueText: '#0066cc',
        badgeErrorText: '#ff0000',
        hoverBackground: '#f0f0f0'
      }
    }
  }))
}));

describe('CreateCommunityModal', () => {
  const mockNewCommunity: NewCommunity = {
    name: '',
    description: '',
    category: 'general',
    isPrivate: false,
    tags: [],
    rules: []
  };

  const defaultProps = {
    isOpen: true,
    newCommunity: mockNewCommunity,
    onClose: jest.fn(),
    onCommunityChange: jest.fn(),
    onCreateCommunity: jest.fn((community: any) => ({
      id: 'test-id',
      ...community,
      memberCount: 1,
      postCount: 0,
      moderators: ['current-user'],
      createdAt: new Date().toISOString()
    })),
    onJoinCommunity: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'Create Community' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CreateCommunityModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Create Community')).not.toBeInTheDocument();
  });

  it('allows entering community name', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText(/Enter community name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Community' } });
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });

  it('allows entering description', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const descInput = screen.getByPlaceholderText(/Describe your community/i);
    fireEvent.change(descInput, { target: { value: 'Test Description' } });
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables create button when name or description is empty', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: 'Create Community' });
    expect(createButton).toBeDisabled();
  });

  it('enables create button when name and description are filled', () => {
    const filledCommunity: NewCommunity = {
      ...mockNewCommunity,
      name: 'Test Community',
      description: 'Test Description'
    };
    render(<CreateCommunityModal {...defaultProps} newCommunity={filledCommunity} />);
    const createButton = screen.getByRole('button', { name: 'Create Community' });
    expect(createButton).not.toBeDisabled();
  });

  it('allows adding tags', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const tagInput = screen.getByPlaceholderText('Add a tag');
    fireEvent.change(tagInput, { target: { value: 'tech' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });

  it('allows adding rules', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const ruleInput = screen.getByPlaceholderText('Add a rule');
    fireEvent.change(ruleInput, { target: { value: 'Be respectful' } });
    fireEvent.keyPress(ruleInput, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });

  it('handles category selection', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'tech' } });
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });

  it('handles privacy toggle', () => {
    render(<CreateCommunityModal {...defaultProps} />);
    const privacyCheckbox = screen.getByLabelText(/Private Community/i);
    fireEvent.click(privacyCheckbox);
    expect(defaultProps.onCommunityChange).toHaveBeenCalled();
  });
});

