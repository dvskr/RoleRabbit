import { renderHook, act, waitFor } from '@testing-library/react';
import { useResumeData } from '../useResumeData';
import * as apiService from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useResumeData', () => {
  const mockResumeId = 'test-resume-id';
  const mockInitialData = {
    contact: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
    },
    summary: 'Experienced software engineer',
    experience: [],
    education: [],
    skills: { technical: ['JavaScript', 'React'] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Auto-save functionality', () => {
    it('should trigger auto-save after 5 seconds of inactivity', async () => {
      mockApiService.saveWorkingDraft = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make a change
      act(() => {
        result.current.updateField('contact.name', 'Jane Doe');
      });

      // Verify hasChanges is true
      expect(result.current.hasChanges).toBe(true);

      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for auto-save to complete
      await waitFor(() => {
        expect(mockApiService.saveWorkingDraft).toHaveBeenCalledWith(
          mockResumeId,
          expect.objectContaining({
            contact: expect.objectContaining({
              name: 'Jane Doe',
            }),
          })
        );
      });

      // Verify hasChanges is reset
      expect(result.current.hasChanges).toBe(false);
    });

    it('should not trigger auto-save if no changes made', async () => {
      mockApiService.saveWorkingDraft = jest.fn().mockResolvedValue({ success: true });

      renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Verify auto-save was not called
      expect(mockApiService.saveWorkingDraft).not.toHaveBeenCalled();
    });

    it('should debounce multiple rapid changes', async () => {
      mockApiService.saveWorkingDraft = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make multiple rapid changes
      act(() => {
        result.current.updateField('contact.name', 'Jane');
        jest.advanceTimersByTime(1000);
        result.current.updateField('contact.name', 'Jane Doe');
        jest.advanceTimersByTime(1000);
        result.current.updateField('contact.name', 'Jane Smith');
      });

      // Fast-forward to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Verify only one save was triggered with the final value
      await waitFor(() => {
        expect(mockApiService.saveWorkingDraft).toHaveBeenCalledTimes(1);
        expect(mockApiService.saveWorkingDraft).toHaveBeenCalledWith(
          mockResumeId,
          expect.objectContaining({
            contact: expect.objectContaining({
              name: 'Jane Smith',
            }),
          })
        );
      });
    });
  });

  describe('Undo/Redo functionality', () => {
    it('should support undo operation', () => {
      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make a change
      act(() => {
        result.current.updateField('contact.name', 'Jane Doe');
      });

      expect(result.current.data.contact.name).toBe('Jane Doe');
      expect(result.current.canUndo).toBe(true);

      // Undo the change
      act(() => {
        result.current.undo();
      });

      expect(result.current.data.contact.name).toBe('John Doe');
      expect(result.current.canUndo).toBe(false);
    });

    it('should support redo operation', () => {
      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make a change
      act(() => {
        result.current.updateField('contact.name', 'Jane Doe');
      });

      // Undo
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      // Redo
      act(() => {
        result.current.redo();
      });

      expect(result.current.data.contact.name).toBe('Jane Doe');
      expect(result.current.canRedo).toBe(false);
    });

    it('should maintain history limit', () => {
      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make 50 changes (assuming history limit is 50)
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.updateField('contact.name', `Name ${i}`);
        }
      });

      // Verify we can't undo more than the history limit
      let undoCount = 0;
      act(() => {
        while (result.current.canUndo) {
          result.current.undo();
          undoCount++;
        }
      });

      expect(undoCount).toBeLessThanOrEqual(50);
    });
  });

  describe('State persistence', () => {
    it('should use refs for latest state values', async () => {
      mockApiService.saveWorkingDraft = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      // Make rapid changes
      act(() => {
        result.current.updateField('contact.name', 'Change 1');
        result.current.updateField('contact.email', 'change1@example.com');
        result.current.updateField('contact.name', 'Change 2');
        result.current.updateField('contact.email', 'change2@example.com');
      });

      // Trigger auto-save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Verify the latest values were saved
      await waitFor(() => {
        expect(mockApiService.saveWorkingDraft).toHaveBeenCalledWith(
          mockResumeId,
          expect.objectContaining({
            contact: expect.objectContaining({
              name: 'Change 2',
              email: 'change2@example.com',
            }),
          })
        );
      });
    });
  });

  describe('Error handling', () => {
    it('should handle save errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockApiService.saveWorkingDraft = jest.fn().mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      act(() => {
        result.current.updateField('contact.name', 'Jane Doe');
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockApiService.saveWorkingDraft).toHaveBeenCalled();
      });

      // Verify error was logged
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Field updates', () => {
    it('should update nested fields correctly', () => {
      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      act(() => {
        result.current.updateField('contact.name', 'Jane Doe');
      });

      expect(result.current.data.contact.name).toBe('Jane Doe');
      expect(result.current.data.contact.email).toBe('john@example.com'); // Other fields unchanged
    });

    it('should update array fields correctly', () => {
      const { result } = renderHook(() => useResumeData(mockResumeId, mockInitialData));

      act(() => {
        result.current.updateField('skills.technical', ['JavaScript', 'React', 'TypeScript']);
      });

      expect(result.current.data.skills.technical).toEqual(['JavaScript', 'React', 'TypeScript']);
    });
  });
});
