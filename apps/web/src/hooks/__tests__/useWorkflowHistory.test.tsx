/**
 * Tests for useWorkflowHistory Hook
 */

import { renderHook, act } from '@testing-library/react';
import { useWorkflowHistory } from '../useWorkflowHistory';
import { Node, Edge } from '@xyflow/react';

describe('useWorkflowHistory', () => {
  const mockNodes: Node[] = [
    { id: 'node-1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
    { id: 'node-2', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Node 2' } }
  ];

  const mockEdges: Edge[] = [
    { id: 'edge-1', source: 'node-1', target: 'node-2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWorkflowHistory());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.historySize).toBe(0);
    expect(result.current.currentIndex).toBe(-1);
  });

  it('should have all required functions', () => {
    const { result } = renderHook(() => useWorkflowHistory());

    expect(typeof result.current.saveToHistory).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.redo).toBe('function');
    expect(typeof result.current.clearHistory).toBe('function');
    expect(typeof result.current.initializeHistory).toBe('function');
  });

  describe('initializeHistory', () => {
    it('should initialize history with initial state', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      expect(result.current.historySize).toBe(1);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('saveToHistory', () => {
    it('should save state to history', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      const newNodes = [...mockNodes, { id: 'node-3', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'Node 3' } }];

      act(() => {
        result.current.saveToHistory(newNodes, mockEdges);
      });

      expect(result.current.historySize).toBe(2);
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should respect maxHistory limit', () => {
      const { result } = renderHook(() => useWorkflowHistory({ maxHistory: 3 }));

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      // Add 3 more states (total would be 4, but max is 3)
      for (let i = 0; i < 3; i++) {
        const newNodes = [...mockNodes, { id: `node-${i + 3}`, type: 'custom', position: { x: i * 100, y: i * 100 }, data: { label: `Node ${i + 3}` } }];
        act(() => {
          result.current.saveToHistory(newNodes, mockEdges);
        });
      }

      expect(result.current.historySize).toBe(3);
    });
  });

  describe('undo', () => {
    it('should undo to previous state', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      const newNodes = [...mockNodes, { id: 'node-3', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'Node 3' } }];

      act(() => {
        result.current.saveToHistory(newNodes, mockEdges);
      });

      expect(result.current.canUndo).toBe(true);

      let previousState: any;
      act(() => {
        previousState = result.current.undo();
      });

      expect(previousState).not.toBeNull();
      expect(previousState?.nodes).toHaveLength(2);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('should return null when no undo available', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      let previousState: any;
      act(() => {
        previousState = result.current.undo();
      });

      expect(previousState).toBeNull();
    });
  });

  describe('redo', () => {
    it('should redo to next state', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      const newNodes = [...mockNodes, { id: 'node-3', type: 'custom', position: { x: 200, y: 200 }, data: { label: 'Node 3' } }];

      act(() => {
        result.current.saveToHistory(newNodes, mockEdges);
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      let nextState: any;
      act(() => {
        nextState = result.current.redo();
      });

      expect(nextState).not.toBeNull();
      expect(nextState?.nodes).toHaveLength(3);
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should return null when no redo available', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      let nextState: any;
      act(() => {
        nextState = result.current.redo();
      });

      expect(nextState).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
        result.current.saveToHistory([...mockNodes], mockEdges);
      });

      expect(result.current.historySize).toBeGreaterThan(0);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.historySize).toBe(0);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('history navigation', () => {
    it('should handle multiple undo and redo operations', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      // Add 3 states
      for (let i = 1; i <= 3; i++) {
        const newNodes = [...mockNodes, { id: `node-${i + 2}`, type: 'custom', position: { x: i * 100, y: i * 100 }, data: { label: `Node ${i + 2}` } }];
        act(() => {
          result.current.saveToHistory(newNodes, mockEdges);
        });
      }

      expect(result.current.historySize).toBe(4);
      expect(result.current.currentIndex).toBe(3);

      // Undo twice
      act(() => {
        result.current.undo();
        result.current.undo();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);

      // Redo once
      act(() => {
        result.current.redo();
      });

      expect(result.current.currentIndex).toBe(2);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(true);
    });

    it('should remove redo history when saving after undo', () => {
      const { result } = renderHook(() => useWorkflowHistory());

      act(() => {
        result.current.initializeHistory(mockNodes, mockEdges);
      });

      // Add 2 states
      for (let i = 1; i <= 2; i++) {
        const newNodes = [...mockNodes, { id: `node-${i + 2}`, type: 'custom', position: { x: i * 100, y: i * 100 }, data: { label: `Node ${i + 2}` } }];
        act(() => {
          result.current.saveToHistory(newNodes, mockEdges);
        });
      }

      expect(result.current.historySize).toBe(3);

      // Undo once
      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      // Save new state (should remove redo history)
      const newNodes = [...mockNodes, { id: 'node-new', type: 'custom', position: { x: 300, y: 300 }, data: { label: 'New Node' } }];
      act(() => {
        result.current.saveToHistory(newNodes, mockEdges);
      });

      expect(result.current.canRedo).toBe(false);
      expect(result.current.historySize).toBe(3);
    });
  });
});
