import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TailoredDiffViewer from '../TailoredDiffViewer';
import { copyToClipboard } from '../../../../utils/clipboard';

jest.mock('../../../../utils/clipboard', () => ({
  copyToClipboard: jest.fn()
}));

describe('TailoredDiffViewer', () => {
  const diff = [
    {
      path: 'summary',
      before: 'Experienced developer.',
      after: 'Experienced developer with 8 years in React and Node.js.',
      confidence: 0.92
    },
    {
      path: 'experience[0].bullets[0]',
      before: 'Built features',
      after: 'Architected AI-driven features with measurable KPIs'
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders diff entries with collapsible details', () => {
    render(<TailoredDiffViewer diff={diff} />);

    // Summary path rendered
    expect(screen.getByText('summary')).toBeInTheDocument();

    // details collapsed initially -> button shows 'Show details'
    expect(screen.getByText('Show details')).toBeInTheDocument();

    fireEvent.click(screen.getByText('summary'));

    expect(screen.getByText('Hide details')).toBeInTheDocument();
    expect(screen.getByText(/Experienced developer with 8 years/)).toBeVisible();
    expect(screen.getByText(/Experienced developer./)).toBeVisible();
  });

  it('copies before/after text when copy buttons clicked', () => {
    render(<TailoredDiffViewer diff={diff} />);

    fireEvent.click(screen.getByText('summary'));

    const copyButtons = screen.getAllByText('Copy');
    fireEvent.click(copyButtons[0]);
    fireEvent.click(copyButtons[1]);

    expect(copyToClipboard).toHaveBeenCalledTimes(2);
    expect(copyToClipboard).toHaveBeenCalledWith('Experienced developer.');
    expect(copyToClipboard).toHaveBeenCalledWith('Experienced developer with 8 years in React and Node.js.');
  });

  it('truncates rendered entries when maxVisible is provided', () => {
    render(<TailoredDiffViewer diff={diff} maxVisible={1} />);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.queryByText('experience[0].bullets[0]')).not.toBeInTheDocument();
    expect(screen.getByText('+1 additional edits stored in the tailored version.')).toBeInTheDocument();
  });
});
