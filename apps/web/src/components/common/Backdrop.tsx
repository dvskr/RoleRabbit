import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface BackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function Backdrop({ isOpen, onClose, children, className }: BackdropProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center',
        className
      )}
      onClick={onClose}
    >
      {children}
    </div>
  );
}

