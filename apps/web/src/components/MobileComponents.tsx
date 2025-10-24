import React, { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from 'lucide-react';

interface TouchGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  className?: string;
}

export const TouchGesture: React.FC<TouchGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onPan,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    onSwipedUp: () => onSwipeUp?.(),
    onSwipedDown: () => onSwipeDown?.(),
    trackMouse: true
  });

  const bind = useDrag(({ active, movement: [mx, my], pinching }) => {
    if (pinching && onPinch) {
      onPinch(1); // Default scale for pinch
      setScale(1);
    } else if (active && onPan) {
      onPan(mx, my);
      setPosition({ x: mx, y: my });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  });

  return (
    <div
      {...swipeHandlers}
      {...bind()}
      className={`touch-gesture ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Mobile-optimized Sidebar with swipe gestures
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(({ active, movement: [mx], last, velocity: [vx] }) => {
    if (active) {
      setDragOffset(mx);
    } else if (last) {
      // If dragged more than 100px or with high velocity, close
      if (mx > 100 || vx > 0.5) {
        onClose();
      }
      setDragOffset(0);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: dragOffset }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            {...bind()}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            style={{ touchAction: 'none' }}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile-optimized Modal with swipe to close
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(({ active, movement: [mx, my], last, velocity: [vx, vy] }) => {
    if (active) {
      setDragOffset(my);
    } else if (last) {
      // If dragged down more than 100px or with high velocity, close
      if (my > 100 || vy > 0.5) {
        onClose();
      }
      setDragOffset(0);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ y: '100%' }}
            animate={{ y: dragOffset }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            {...bind()}
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl z-50 max-h-[90vh] ${className}`}
            style={{ touchAction: 'none' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile-optimized Tab Swiper
interface MobileTabSwiperProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileTabSwiper: React.FC<MobileTabSwiperProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
      if (nextIndex !== activeIndex) {
        onTabChange(tabs[nextIndex].id);
      }
    },
    onSwipedRight: () => {
      const prevIndex = Math.max(activeIndex - 1, 0);
      if (prevIndex !== activeIndex) {
        onTabChange(tabs[prevIndex].id);
      }
    }
  });

  return (
    <div className={`mobile-tab-swiper ${className}`}>
      {/* Tab Indicators */}
      <div className="flex justify-center gap-2 p-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              tab.id === activeTab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Swipeable Content */}
      <div
        ref={containerRef}
        {...swipeHandlers}
        className="relative overflow-hidden"
      >
        <motion.div
          className="flex"
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="w-full flex-shrink-0"
              style={{ minHeight: '400px' }}
            >
              {tab.content}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Swipe Instructions */}
      <div className="flex justify-center gap-4 p-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          <span>Swipe to navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Swipe</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized Drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  position,
  children,
  className = ''
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const getDragDirection = () => {
    switch (position) {
      case 'left': return 'x';
      case 'right': return 'x';
      case 'top': return 'y';
      case 'bottom': return 'y';
      default: return 'x';
    }
  };

  const bind = useDrag(({ active, movement: [mx, my], last, velocity: [vx, vy] }) => {
    const isHorizontal = position === 'left' || position === 'right';
    const delta = isHorizontal ? mx : my;
    const velocity = isHorizontal ? vx : vy;
    const threshold = isHorizontal ? 100 : 100;

    if (active) {
      setDragOffset(delta);
    } else if (last) {
      // Close if dragged beyond threshold or with high velocity
      if (Math.abs(delta) > threshold || Math.abs(velocity) > 0.5) {
        onClose();
      }
      setDragOffset(0);
    }
  });

  const getInitialPosition = () => {
    switch (position) {
      case 'left': return { x: '-100%', y: 0 };
      case 'right': return { x: '100%', y: 0 };
      case 'top': return { x: 0, y: '-100%' };
      case 'bottom': return { x: 0, y: '100%' };
      default: return { x: '-100%', y: 0 };
    }
  };

  const getAnimatePosition = () => {
    switch (position) {
      case 'left': return { x: dragOffset, y: 0 };
      case 'right': return { x: dragOffset, y: 0 };
      case 'top': return { x: 0, y: dragOffset };
      case 'bottom': return { x: 0, y: dragOffset };
      default: return { x: dragOffset, y: 0 };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'left': return 'left-0 top-0 h-full w-80';
      case 'right': return 'right-0 top-0 h-full w-80';
      case 'top': return 'top-0 left-0 w-full h-80';
      case 'bottom': return 'bottom-0 left-0 w-full h-80';
      default: return 'left-0 top-0 h-full w-80';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={getInitialPosition()}
            animate={getAnimatePosition()}
            exit={getInitialPosition()}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            {...bind()}
            className={`fixed bg-white shadow-xl z-50 ${getPositionClasses()} ${className}`}
            style={{ touchAction: 'none' }}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Drawer</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile-optimized Button with haptic feedback
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  hapticFeedback?: boolean;
  children: React.ReactNode;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  hapticFeedback = true,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50); // 50ms vibration
    }
    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

