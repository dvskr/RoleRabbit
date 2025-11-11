import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIPanelRedesigned from '../AIPanelRedesigned';
import type { TailorResult } from '../../../../types/ai';
import type { ResumeData } from '../../../../types/resume';

jest.mock('../../../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      mode: 'light',
      colors: {
        border: '#e5e7eb',
        cardBackground: '#ffffff',
        hoverBackground: '#f3f4f6',
        inputBackground: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        activeBlueText: '#2563eb',
      },
    },
  }),
}));

const baseResume: ResumeData = {
  name: 'Alex Doe',
  title: 'Engineer',
  email: 'alex@example.com',
  phone: '123-456-7890',
  location: 'Remote',
  linkedin: '',
  github: '',
  website: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

const baseTailorResult: TailorResult = {
  tailoredResume: baseResume,
  diff: [],
  warnings: [],
  recommendedKeywords: [],
  ats: null,
  confidence: null,
  mode: 'PARTIAL',
  tailoredVersionId: 'tv-1',
};

const renderPanel = (overrides: Partial<React.ComponentProps<typeof AIPanelRedesigned>> = {}) => {
  const defaultProps: React.ComponentProps<typeof AIPanelRedesigned> = {
    showRightPanel: true,
    setShowRightPanel: jest.fn(),
    jobDescription: 'Some job description',
    setJobDescription: jest.fn(),
    isAnalyzing: false,
    matchScore: null,
    showATSScore: false,
    matchedKeywords: [],
    missingKeywords: [],
    aiRecommendations: [],
    tailorEditMode: 'PARTIAL',
    setTailorEditMode: jest.fn(),
    selectedTone: 'professional',
    setSelectedTone: jest.fn(),
    selectedLength: 'thorough',
    setSelectedLength: jest.fn(),
    resumeData: baseResume,
    onAnalyzeJobDescription: jest.fn(),
    tailorResult: baseTailorResult,
    setTailorResult: jest.fn(),
    isTailoring: false,
    onTailorResume: jest.fn(),
    onGenerateCoverLetter: jest.fn(),
    onGeneratePortfolio: jest.fn(),
    isGeneratingCoverLetter: false,
    isGeneratingPortfolio: false,
    onConfirmTailorChanges: jest.fn().mockResolvedValue(true),
    isSavingResume: false,
  };

  const props = { ...defaultProps, ...overrides };
  const view = render(<AIPanelRedesigned {...props} />);
  return { view, props };
};

describe('AIPanelRedesigned', () => {
  it('calls confirm handler and reruns ATS on apply success', async () => {
    const onConfirmTailorChanges = jest.fn().mockResolvedValue(true);
    const onAnalyzeJobDescription = jest.fn().mockResolvedValue(undefined);

    renderPanel({
      onConfirmTailorChanges,
      onAnalyzeJobDescription,
    });

    fireEvent.click(screen.getByRole('button', { name: /apply changes/i }));

    await waitFor(() => {
      expect(onConfirmTailorChanges).toHaveBeenCalledTimes(1);
      expect(onAnalyzeJobDescription).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when confirm handler reports failure', async () => {
    renderPanel({
      onConfirmTailorChanges: jest.fn().mockResolvedValue(false),
    });

    fireEvent.click(screen.getByRole('button', { name: /apply changes/i }));

    expect(
      await screen.findByText(/failed to save tailored changes/i)
    ).toBeInTheDocument();
  });

  it('disables apply button and shows saving indicator while saving', () => {
    renderPanel({
      isSavingResume: true,
    });

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
  });

  it('renders diff preview when toggled', () => {
    const tailorResultWithDiff: TailorResult = {
      ...baseTailorResult,
      diff: [
        {
          path: 'summary',
          before: 'Seasoned engineer with X',
          after: 'Principal engineer delivering Y',
          confidence: 0.82,
        },
      ],
    };

    renderPanel({
      tailorResult: tailorResultWithDiff,
    });

    const toggleButton = screen.getByRole('button', { name: /view detailed changes/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('Seasoned engineer with X')).toBeInTheDocument();
    expect(screen.getByText('Principal engineer delivering Y')).toBeInTheDocument();
    expect(screen.getByText(/82%/)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /hide detailed changes/i })).toBeInTheDocument();
  });
});