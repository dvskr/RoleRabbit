import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage event listeners
 * 
 * @param eventName - Event name
 * @param handler - Event handler
 * @param element - Element to attach listener to (default: window)
 */
export function useEventListener<T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element: Window | HTMLElement = window
) {
  const savedHandler = useRef<typeof handler>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) => {
      if (savedHandler.current) {
        savedHandler.current(event as WindowEventMap[T]);
      }
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
