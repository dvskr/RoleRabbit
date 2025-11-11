import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ImportModal from '../ImportModal';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { useBaseResumes } from '../../../hooks/useBaseResumes';
import apiService from '../../../services/apiService';

jest.mock('../../../hooks/useBaseResumes');
jest.mock('../../../services/apiService', () => ({
  __esModule: true,
  default: {
    parseResumeFile: jest.fn(),
    updateBaseResume: jest.fn(),
    getBaseResume: jest.fn(),
    activateBaseResume: jest.fn(),
    createBaseResume: jest.fn(),
    deleteBaseResume: jest.fn(),
    getBaseResumes: jest.fn(),
  },
}));

type UseBaseResumesMock = jest.MockedFunction<typeof useBaseResumes>;
type ApiServiceMock = jest.Mocked<typeof apiService>;

describe('ImportModal - Apply Flow', () => {
  const useBaseResumesMock = useBaseResumes as UseBaseResumesMock;
  const apiServiceMock = apiService as ApiServiceMock;

  const activateResume = jest.fn().mockResolvedValue(undefined);
  const refresh = jest.fn().mockResolvedValue(undefined);
  const createResume = jest.fn();
  const deleteResume = jest.fn();
  const upsertResume = jest.fn();

  const renderModal = (overrides: Partial<React.ComponentProps<typeof ImportModal>> = {}) => {
    return render(
      <ThemeProvider initialThemeMode="light">
        <ImportModal
          showImportModal
          setShowImportModal={jest.fn()}
          importMethod="file"
          setImportMethod={jest.fn()}
          importJsonData=""
          setImportJsonData={jest.fn()}
          onResumeApplied={overrides.onResumeApplied as any}
          onApplyStart={overrides.onApplyStart as any}
          onApplySuccess={overrides.onApplySuccess as any}
          onApplyError={overrides.onApplyError as any}
          onApplyComplete={overrides.onApplyComplete as any}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (apiServiceMock.parseResumeFile as jest.Mock).mockResolvedValue({});
    (apiServiceMock.updateBaseResume as jest.Mock).mockResolvedValue({});
    (apiServiceMock.getBaseResume as jest.Mock).mockResolvedValue({
      resume: {
        id: 'resume-1',
        data: { summary: 'Existing summary' },
      },
    });

  activateResume.mockResolvedValue(undefined);
  refresh.mockResolvedValue(undefined);
  createResume.mockResolvedValue(undefined);
  deleteResume.mockResolvedValue(undefined);
  upsertResume.mockResolvedValue(undefined);
});

  it('fires apply lifecycle callbacks when applying existing resume data', async () => {
    useBaseResumesMock.mockReturnValue({
      resumes: [
        {
          id: 'resume-1',
          slotNumber: 1,
          name: 'Resume 1',
          isActive: true,
          data: { summary: 'Existing summary' },
        },
      ],
      activeId: 'resume-1',
      limits: { maxSlots: 3 },
      refresh,
      createResume,
      activateResume,
      deleteResume,
      upsertResume,
      error: null,
      isLoading: false,
      setActiveId: jest.fn(),
    } as any);

    const onApplyStart = jest.fn();
    const onApplySuccess = jest.fn();
    const onApplyError = jest.fn();
    const onApplyComplete = jest.fn();
    const onResumeApplied = jest.fn().mockResolvedValue(undefined);

    renderModal({ onApplyStart, onApplySuccess, onApplyError, onApplyComplete, onResumeApplied });

    const applyButton = await screen.findByRole('button', { name: /Parse & Apply/i });
    fireEvent.click(applyButton);

    expect(onApplyStart).toHaveBeenCalledWith({ resumeId: 'resume-1', source: 'existing' });

    await waitFor(() => {
      expect(activateResume).toHaveBeenCalledWith('resume-1');
      expect(onResumeApplied).toHaveBeenCalled();
      expect(onApplySuccess).toHaveBeenCalledWith(
        expect.objectContaining({ resumeId: 'resume-1', source: 'existing' })
      );
    });

    expect(onApplyError).not.toHaveBeenCalled();
    expect(onApplyComplete).toHaveBeenCalledWith({ resumeId: 'resume-1', source: 'existing' });
  });

  it('allows activating resumes beyond the current plan limit', async () => {
    useBaseResumesMock.mockReturnValue({
      resumes: [
        {
          id: 'resume-1',
          slotNumber: 1,
          name: 'Resume 1',
          isActive: false,
          data: { summary: 'Summary 1' },
        },
        {
          id: 'resume-2',
          slotNumber: 2,
          name: 'Resume 2',
          isActive: true,
          data: { summary: 'Summary 2' },
        },
        {
          id: 'resume-3',
          slotNumber: 3,
          name: 'Resume 3',
          isActive: false,
          data: { summary: 'Summary 3' },
        },
        {
          id: 'resume-4',
          slotNumber: 4,
          name: 'Legacy Resume',
          isActive: false,
          data: { summary: 'Summary 4' },
        },
      ],
      activeId: 'resume-2',
      limits: { maxSlots: 3 },
      refresh,
      createResume,
      activateResume,
      deleteResume,
      upsertResume,
      error: null,
      isLoading: false,
      setActiveId: jest.fn(),
    } as any);

    (apiServiceMock.getBaseResume as jest.Mock).mockResolvedValue({
      resume: {
        id: 'resume-4',
        data: { summary: 'Summary 4' },
      },
    });

    renderModal();

    const legacySlot = screen.getByTestId('resume-slot-4');
    const activateLegacyButton = within(legacySlot).getByRole('button', { name: /Activate resume/i });

    fireEvent.click(activateLegacyButton);

    await waitFor(() => {
      expect(activateResume).toHaveBeenCalledWith('resume-4');
    });
  });
});
