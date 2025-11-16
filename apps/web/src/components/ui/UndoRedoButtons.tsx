import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '../common/Button';

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = '',
}) => {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1.5 px-2.5"
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Undo</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-1.5 px-2.5"
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
        <span className="hidden sm:inline text-sm">Redo</span>
      </Button>
    </div>
  );
};

export default UndoRedoButtons;


