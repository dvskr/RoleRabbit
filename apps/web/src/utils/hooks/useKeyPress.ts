import { useEffect, useState } from 'react';

export function useKeyPress(targetKey: string) {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setIsPressed(true);
      }
    };

    const handleKeyUp = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setIsPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKey]);

  return isPressed;
}

// Hook for combination keys
export function useKeyCombo(keys: string[], callback: () => void) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newKeys = new Set(pressedKeys);
      newKeys.add(event.key);
      setPressedKeys(newKeys);

      if (keys.every(key => newKeys.has(key))) {
        event.preventDefault();
        callback();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const newKeys = new Set(pressedKeys);
      newKeys.delete(event.key);
      setPressedKeys(newKeys);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, pressedKeys, callback]);
}

