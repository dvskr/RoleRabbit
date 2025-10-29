import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook to detect long press gestures
 * 
 * @param callback - Callback function
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns Press handlers
 */
export function useLongPress(
  callback: () => void,
  delay: number = 400
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (event.target) {
      target.current = event.target;
    }
    timeout.current = setTimeout(() => {
      callback();
      setLongPressTriggered(true);
    }, delay);
  }, [callback, delay]);

  const clear = useCallback((event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
    timeout.current && clearTimeout(timeout.current);
    shouldTriggerClick && !longPressTriggered && callback();
    setLongPressTriggered(false);
  }, [callback, longPressTriggered]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: (e: React.MouseEvent) => clear(e, false),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e, false)
  };
}
