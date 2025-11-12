/**
 * Workflow History Hook
 * Provides undo/redo functionality for workflow builder
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface UseWorkflowHistoryOptions {
  maxHistory?: number;
}

export function useWorkflowHistory(options: UseWorkflowHistoryOptions = {}) {
  const { maxHistory = 50 } = options;

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Save current state to history
  const saveToHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    // Skip if this is triggered by undo/redo
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory((prev) => {
      // Remove any states after current index (when making new changes after undo)
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      });

      // Keep only last maxHistory states
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setCurrentIndex((prev) => {
      const newIndex = Math.min(prev + 1, maxHistory - 1);
      return newIndex;
    });
  }, [currentIndex, maxHistory]);

  // Undo to previous state
  const undo = useCallback((): HistoryState | null => {
    if (currentIndex <= 0) return null;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    isUndoRedoAction.current = true;
    return history[newIndex];
  }, [currentIndex, history]);

  // Redo to next state
  const redo = useCallback((): HistoryState | null => {
    if (currentIndex >= history.length - 1) return null;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    isUndoRedoAction.current = true;
    return history[newIndex];
  }, [currentIndex, history]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Initialize history with current state
  const initializeHistory = useCallback((nodes: Node[], edges: Edge[]) => {
    const initialState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
    setHistory([initialState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    initializeHistory,
    historySize: history.length,
    currentIndex
  };
}
