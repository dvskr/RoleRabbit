/**
 * Tests for TemplateVariableInput Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateVariableInput from '../TemplateVariableInput';

describe('TemplateVariableInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Enter value'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input with placeholder', () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<TemplateVariableInput {...defaultProps} value="jobDescription" />);

    const input = screen.getByDisplayValue('jobDescription');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TemplateVariableInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    await user.type(input, 'test');

    expect(onChange).toHaveBeenCalled();
  });

  it('should show suggestions on focus', async () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
      expect(screen.getByText(/company/i)).toBeInTheDocument();
    });
  });

  it('should filter suggestions based on input', async () => {
    const user = userEvent.setup();
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    await user.type(input, 'job');

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
      expect(screen.getByText(/jobTitle/i)).toBeInTheDocument();
      expect(screen.queryByText(/company/i)).not.toBeInTheDocument();
    });
  });

  it('should select suggestion on click', async () => {
    const onChange = jest.fn();
    render(<TemplateVariableInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestion = screen.getByText(/jobDescription/i);
      fireEvent.click(suggestion.closest('button')!);
    });

    expect(onChange).toHaveBeenCalledWith('jobDescription');
  });

  it('should navigate suggestions with arrow keys', async () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    // Suggestions should still be visible
    expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
  });

  it('should select suggestion with Enter key', async () => {
    const onChange = jest.fn();
    render(<TemplateVariableInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalled();
  });

  it('should close suggestions with Escape key', async () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(/jobDescription/i)).not.toBeInTheDocument();
    });
  });

  it('should toggle suggestions with dropdown button', async () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      expect(screen.getByText(/jobDescription/i)).toBeInTheDocument();
    });

    fireEvent.click(dropdownButton);

    await waitFor(() => {
      expect(screen.queryByText(/jobDescription/i)).not.toBeInTheDocument();
    });
  });

  it('should display custom suggestions', async () => {
    const customSuggestions = [
      { value: 'customField', label: 'customField', description: 'Custom field', type: 'path' as const }
    ];

    render(
      <TemplateVariableInput
        {...defaultProps}
        suggestions={customSuggestions}
      />
    );

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText(/customField/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom field/i)).toBeInTheDocument();
    });
  });

  it('should show "no suggestions" message when no matches', async () => {
    const user = userEvent.setup();
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    await user.type(input, 'zzzznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/No suggestions found/i)).toBeInTheDocument();
    });
  });

  it('should differentiate between variable and path types', async () => {
    render(<TemplateVariableInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Enter value');
    fireEvent.focus(input);

    await waitFor(() => {
      const variableBadges = screen.getAllByText('variable');
      const pathBadges = screen.getAllByText('path');

      expect(variableBadges.length).toBeGreaterThan(0);
      expect(pathBadges.length).toBeGreaterThan(0);
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TemplateVariableInput
        {...defaultProps}
        className="custom-class"
      />
    );

    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-class');
  });
});
