import { useState, useEffect, RefObject } from 'react';

/**
 * Custom hook using Intersection Observer API
 * Detects when an element enters or leaves the viewport
 * 
 * @param ref - Ref to the element to observe
 * @param options - Intersection Observer options
 * @returns Whether the element is intersecting
 */
export function useIntersection(
  ref: RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
