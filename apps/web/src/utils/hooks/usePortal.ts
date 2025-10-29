import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function usePortal(id = 'portal-root') {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }

    setPortalRoot(element);

    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [id]);

  const Portal = ({ children }: { children: React.ReactNode }) => {
    if (!portalRoot) return null;
    return createPortal(children, portalRoot);
  };

  return Portal;
}

