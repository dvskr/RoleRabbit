/**
 * Unit Tests for useBaseResumes Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useBaseResumes } from '../useBaseResumes';
import * as apiService from '../../services/apiService';

jest.mock('../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useBaseResumes', () => {
  const mockUserId = 'user-123';
  
  const mockResumes = [
    {
      id: 'resume-1',
      userId: mockUserId,
      name: 'Software Engineer Resume',
      slotNumber: 1,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'resume-2',
      userId: mockUserId,
      name: 'Data Scientist Resume',
      slotNumber: 2,
      isActive: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // FETCHING TESTS
  // ============================================================================

  describe('Fetching resumes', () => {
    it('should fetch resumes on mount', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledWith(mockUserId);
      expect(result.current.resumes).toEqual(mockResumes);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch resumes');
      mockApiService.getBaseResumes = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error.message);
      expect(result.current.resumes).toEqual([]);
    });

    it('should refetch when userId changes', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);

      const { result, rerender } = renderHook(
        ({ userId }) => useBaseResumes(userId),
        { initialProps: { userId: 'user-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledWith('user-1');

      // Change userId
      rerender({ userId: 'user-2' });

      await waitFor(() => {
        expect(mockApiService.getBaseResumes).toHaveBeenCalledWith('user-2');
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // CREATE RESUME TESTS
  // ============================================================================

  describe('Creating resumes', () => {
    it('should create a new resume', async () => {
      const newResume = {
        id: 'resume-3',
        userId: mockUserId,
        name: 'New Resume',
        slotNumber: 3,
        isActive: false,
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z'
      };

      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockResolvedValue(newResume);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createResume({
          name: 'New Resume',
          slotNumber: 3
        });
      });

      expect(mockApiService.createBaseResume).toHaveBeenCalledWith({
        userId: mockUserId,
        name: 'New Resume',
        slotNumber: 3
      });

      // Should add resume to list
      expect(result.current.resumes).toContainEqual(newResume);
    });

    it('should show optimistic update when creating resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: 'resume-3',
          name: 'New Resume',
          slotNumber: 3
        }), 1000))
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.resumes.length;

      act(() => {
        result.current.createResume({
          name: 'New Resume',
          slotNumber: 3
        });
      });

      // Should immediately add optimistic resume
      expect(result.current.resumes.length).toBe(initialCount + 1);
      expect(result.current.resumes.some(r => r.name === 'New Resume')).toBe(true);
    });

    it('should rollback optimistic update on error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockRejectedValue(
        new Error('Slot limit reached')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.resumes.length;

      await act(async () => {
        try {
          await result.current.createResume({
            name: 'New Resume',
            slotNumber: 6
          });
        } catch (error) {
          // Expected to fail
        }
      });

      // Should rollback to original count
      expect(result.current.resumes.length).toBe(initialCount);
    });

    it('should handle slot limit error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockRejectedValue(
        new Error('Maximum slot limit (5) reached')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createResume({
            name: 'Sixth Resume',
            slotNumber: 6
          });
        } catch (error) {
          expect(error.message).toContain('slot limit');
        }
      });
    });
  });

  // ============================================================================
  // DELETE RESUME TESTS
  // ============================================================================

  describe('Deleting resumes', () => {
    it('should delete a resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];

      await act(async () => {
        await result.current.deleteResume(resumeToDelete.id);
      });

      expect(mockApiService.deleteBaseResume).toHaveBeenCalledWith(resumeToDelete.id);

      // Should remove resume from list
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeUndefined();
    });

    it('should show optimistic update when deleting', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];
      const initialCount = result.current.resumes.length;

      act(() => {
        result.current.deleteResume(resumeToDelete.id);
      });

      // Should immediately remove from list
      expect(result.current.resumes.length).toBe(initialCount - 1);
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeUndefined();
    });

    it('should rollback delete on error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];
      const initialCount = result.current.resumes.length;

      await act(async () => {
        try {
          await result.current.deleteResume(resumeToDelete.id);
        } catch (error) {
          // Expected to fail
        }
      });

      // Should restore resume to list
      expect(result.current.resumes.length).toBe(initialCount);
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeDefined();
    });
  });

  // ============================================================================
  // ACTIVATE RESUME TESTS
  // ============================================================================

  describe('Activating resumes', () => {
    it('should activate a resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.activateBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToActivate = mockResumes[1]; // Currently inactive

      await act(async () => {
        await result.current.activateResume(resumeToActivate.id);
      });

      expect(mockApiService.activateBaseResume).toHaveBeenCalledWith(resumeToActivate.id);

      // Should update isActive flag
      const activated = result.current.resumes.find(r => r.id === resumeToActivate.id);
      expect(activated?.isActive).toBe(true);
    });

    it('should deactivate other resumes when activating one', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.activateBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToActivate = mockResumes[1];

      await act(async () => {
        await result.current.activateResume(resumeToActivate.id);
      });

      // Previously active resume should be deactivated
      const previouslyActive = result.current.resumes.find(r => r.id === mockResumes[0].id);
      expect(previouslyActive?.isActive).toBe(false);

      // New resume should be active
      const newlyActive = result.current.resumes.find(r => r.id === resumeToActivate.id);
      expect(newlyActive?.isActive).toBe(true);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApiService.getBaseResumes = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.resumes).toEqual([]);
    });

    it('should retry failed requests', async () => {
      let callCount = 0;
      mockApiService.getBaseResumes = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve(mockResumes);
      });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledTimes(3);
      expect(result.current.resumes).toEqual(mockResumes);
    });

    it('should clear error on successful retry', async () => {
      mockApiService.getBaseResumes = jest.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockResumes);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Trigger refetch
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.resumes).toEqual(mockResumes);
    });
  });
});

 * Unit Tests for useBaseResumes Hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useBaseResumes } from '../useBaseResumes';
import * as apiService from '../../services/apiService';

jest.mock('../../services/apiService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useBaseResumes', () => {
  const mockUserId = 'user-123';
  
  const mockResumes = [
    {
      id: 'resume-1',
      userId: mockUserId,
      name: 'Software Engineer Resume',
      slotNumber: 1,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: 'resume-2',
      userId: mockUserId,
      name: 'Data Scientist Resume',
      slotNumber: 2,
      isActive: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // FETCHING TESTS
  // ============================================================================

  describe('Fetching resumes', () => {
    it('should fetch resumes on mount', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledWith(mockUserId);
      expect(result.current.resumes).toEqual(mockResumes);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch resumes');
      mockApiService.getBaseResumes = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error.message);
      expect(result.current.resumes).toEqual([]);
    });

    it('should refetch when userId changes', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);

      const { result, rerender } = renderHook(
        ({ userId }) => useBaseResumes(userId),
        { initialProps: { userId: 'user-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledWith('user-1');

      // Change userId
      rerender({ userId: 'user-2' });

      await waitFor(() => {
        expect(mockApiService.getBaseResumes).toHaveBeenCalledWith('user-2');
      });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================================
  // CREATE RESUME TESTS
  // ============================================================================

  describe('Creating resumes', () => {
    it('should create a new resume', async () => {
      const newResume = {
        id: 'resume-3',
        userId: mockUserId,
        name: 'New Resume',
        slotNumber: 3,
        isActive: false,
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z'
      };

      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockResolvedValue(newResume);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createResume({
          name: 'New Resume',
          slotNumber: 3
        });
      });

      expect(mockApiService.createBaseResume).toHaveBeenCalledWith({
        userId: mockUserId,
        name: 'New Resume',
        slotNumber: 3
      });

      // Should add resume to list
      expect(result.current.resumes).toContainEqual(newResume);
    });

    it('should show optimistic update when creating resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: 'resume-3',
          name: 'New Resume',
          slotNumber: 3
        }), 1000))
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.resumes.length;

      act(() => {
        result.current.createResume({
          name: 'New Resume',
          slotNumber: 3
        });
      });

      // Should immediately add optimistic resume
      expect(result.current.resumes.length).toBe(initialCount + 1);
      expect(result.current.resumes.some(r => r.name === 'New Resume')).toBe(true);
    });

    it('should rollback optimistic update on error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockRejectedValue(
        new Error('Slot limit reached')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.resumes.length;

      await act(async () => {
        try {
          await result.current.createResume({
            name: 'New Resume',
            slotNumber: 6
          });
        } catch (error) {
          // Expected to fail
        }
      });

      // Should rollback to original count
      expect(result.current.resumes.length).toBe(initialCount);
    });

    it('should handle slot limit error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.createBaseResume = jest.fn().mockRejectedValue(
        new Error('Maximum slot limit (5) reached')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.createResume({
            name: 'Sixth Resume',
            slotNumber: 6
          });
        } catch (error) {
          expect(error.message).toContain('slot limit');
        }
      });
    });
  });

  // ============================================================================
  // DELETE RESUME TESTS
  // ============================================================================

  describe('Deleting resumes', () => {
    it('should delete a resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];

      await act(async () => {
        await result.current.deleteResume(resumeToDelete.id);
      });

      expect(mockApiService.deleteBaseResume).toHaveBeenCalledWith(resumeToDelete.id);

      // Should remove resume from list
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeUndefined();
    });

    it('should show optimistic update when deleting', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];
      const initialCount = result.current.resumes.length;

      act(() => {
        result.current.deleteResume(resumeToDelete.id);
      });

      // Should immediately remove from list
      expect(result.current.resumes.length).toBe(initialCount - 1);
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeUndefined();
    });

    it('should rollback delete on error', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.deleteBaseResume = jest.fn().mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToDelete = mockResumes[0];
      const initialCount = result.current.resumes.length;

      await act(async () => {
        try {
          await result.current.deleteResume(resumeToDelete.id);
        } catch (error) {
          // Expected to fail
        }
      });

      // Should restore resume to list
      expect(result.current.resumes.length).toBe(initialCount);
      expect(result.current.resumes.find(r => r.id === resumeToDelete.id)).toBeDefined();
    });
  });

  // ============================================================================
  // ACTIVATE RESUME TESTS
  // ============================================================================

  describe('Activating resumes', () => {
    it('should activate a resume', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.activateBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToActivate = mockResumes[1]; // Currently inactive

      await act(async () => {
        await result.current.activateResume(resumeToActivate.id);
      });

      expect(mockApiService.activateBaseResume).toHaveBeenCalledWith(resumeToActivate.id);

      // Should update isActive flag
      const activated = result.current.resumes.find(r => r.id === resumeToActivate.id);
      expect(activated?.isActive).toBe(true);
    });

    it('should deactivate other resumes when activating one', async () => {
      mockApiService.getBaseResumes = jest.fn().mockResolvedValue(mockResumes);
      mockApiService.activateBaseResume = jest.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const resumeToActivate = mockResumes[1];

      await act(async () => {
        await result.current.activateResume(resumeToActivate.id);
      });

      // Previously active resume should be deactivated
      const previouslyActive = result.current.resumes.find(r => r.id === mockResumes[0].id);
      expect(previouslyActive?.isActive).toBe(false);

      // New resume should be active
      const newlyActive = result.current.resumes.find(r => r.id === resumeToActivate.id);
      expect(newlyActive?.isActive).toBe(true);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApiService.getBaseResumes = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.resumes).toEqual([]);
    });

    it('should retry failed requests', async () => {
      let callCount = 0;
      mockApiService.getBaseResumes = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve(mockResumes);
      });

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      expect(mockApiService.getBaseResumes).toHaveBeenCalledTimes(3);
      expect(result.current.resumes).toEqual(mockResumes);
    });

    it('should clear error on successful retry', async () => {
      mockApiService.getBaseResumes = jest.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockResumes);

      const { result } = renderHook(() => useBaseResumes(mockUserId));

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Trigger refetch
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.resumes).toEqual(mockResumes);
    });
  });
});

