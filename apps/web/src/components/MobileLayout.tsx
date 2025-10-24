import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { MobileSidebar, MobileModal, MobileTabSwiper, MobileButton } from './MobileComponents';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const { uiState, setActiveTab } = useAppStore();
  const { activeTab } = uiState;

  // Detect mobile device and screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Navigation tabs for mobile
  const mobileTabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'templates', label: 'Templates', icon: '📄' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`mobile-layout ${className}`}>
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="w-6 h-6" />
          </MobileButton>

          {/* App Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">RoleReady</h1>
          </div>

          {/* Fullscreen Button */}
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="p-2"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </MobileButton>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex overflow-x-auto px-4 pb-2">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-20 min-h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Navigation</h3>
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quick Actions</h3>
              <MobileButton
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setSidebarOpen(false)}
              >
                New Resume
              </MobileButton>
              <MobileButton
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setSidebarOpen(false)}
              >
                Import Resume
              </MobileButton>
            </div>
          </div>
        </div>
      </MobileSidebar>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="flex items-center justify-around py-2">
          {mobileTabs.slice(0, 4).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Orientation Warning */}
      <AnimatePresence>
        {orientation === 'landscape' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-40 bg-yellow-100 border border-yellow-300 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-yellow-800">
              <span className="text-lg">📱</span>
              <span className="text-sm font-medium">
                For the best experience, please rotate your device to portrait mode.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile-optimized Card Component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  swipeActions?: {
    left?: { label: string; action: () => void; color: string };
    right?: { label: string; action: () => void; color: string };
  };
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  onClick,
  swipeActions
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (swipeActions?.[direction]) {
      swipeActions[direction]!.action();
    }
  };

  return (
    <motion.div
      className={`mobile-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      whileTap={{ scale: 0.98 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(_, info) => {
        setSwipeOffset(info.offset.x);
        setIsSwipeActive(Math.abs(info.offset.x) > 50);
      }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          handleSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
        setSwipeOffset(0);
        setIsSwipeActive(false);
      }}
      onClick={onClick}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        touchAction: 'pan-x'
      }}
    >
      {/* Swipe Action Indicators */}
      <AnimatePresence>
        {isSwipeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {swipeOffset > 50 && swipeActions?.right && (
              <div
                className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center"
                style={{ backgroundColor: swipeActions.right.color }}
              >
                <span className="text-white text-sm font-medium">
                  {swipeActions.right.label}
                </span>
              </div>
            )}
            {swipeOffset < -50 && swipeActions?.left && (
              <div
                className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center"
                style={{ backgroundColor: swipeActions.left.color }}
              >
                <span className="text-white text-sm font-medium">
                  {swipeActions.left.label}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  );
};

// Mobile-optimized Input Component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mobile-input">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-3 text-base border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized List Component
interface MobileListProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    swipeActions?: {
      left?: { label: string; action: () => void; color: string };
      right?: { label: string; action: () => void; color: string };
    };
  }>;
  className?: string;
}

export const MobileList: React.FC<MobileListProps> = ({
  items,
  className = ''
}) => {
  return (
    <div className={`mobile-list space-y-2 ${className}`}>
      {items.map((item) => (
        <MobileCard
          key={item.id}
          onClick={item.onClick}
          swipeActions={item.swipeActions}
          className="p-4"
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {item.icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {item.subtitle}
                </p>
              )}
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </MobileCard>
      ))}
    </div>
  );
};

