import React, { memo, useMemo, useCallback, useState } from 'react';
import { 
  Menu, 
  Bell, 
  Settings, 
  User, 
  Search,
  Sparkles,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface HeaderProps {
  onToggleSidebar: () => void;
  onShowSettings: () => void;
  onShowProfile: () => void;
  onShowNotifications: () => void;
}

// Memoized notification badge
const NotificationBadge = memo(({ count }: { count: number }) => {
  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </div>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

// Memoized user menu
const UserMenu = memo(({ 
  user, 
  onShowProfile, 
  onLogout 
}: { 
  user: any; 
  onShowProfile: () => void; 
  onLogout: () => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleProfileClick = useCallback(() => {
    onShowProfile();
    setIsOpen(false);
  }, [onShowProfile]);

  const handleLogoutClick = useCallback(() => {
    onLogout();
    setIsOpen(false);
  }, [onLogout]);

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user?.firstName || 'User'}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <User size={16} />
            Profile
          </button>
          <button
            onClick={handleLogoutClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
});

UserMenu.displayName = 'UserMenu';

// Main Header component with performance optimizations
const Header = memo<HeaderProps>(({ 
  onToggleSidebar, 
  onShowSettings, 
  onShowProfile, 
  onShowNotifications 
}) => {
  const { user, theme, notifications } = useAppStore((state) => ({
    user: state.user,
    theme: state.uiState.theme,
    notifications: state.uiState.notifications
  }));

  const { setTheme } = useAppStore((state) => ({
    setTheme: state.setTheme
  }));

  // Memoized values
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );

  const headerClasses = useMemo(() =>
    'h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-4 shadow-sm',
    []
  );

  // Memoized callbacks
  const handleToggleSidebar = useCallback(() => {
    onToggleSidebar();
  }, [onToggleSidebar]);

  const handleShowSettings = useCallback(() => {
    onShowSettings();
  }, [onShowSettings]);

  const handleShowProfile = useCallback(() => {
    onShowProfile();
  }, [onShowProfile]);

  const handleShowNotifications = useCallback(() => {
    onShowNotifications();
  }, [onShowNotifications]);

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const handleLogout = useCallback(() => {
    // Implement logout logic
    console.log('Logout clicked');
  }, []);

  return (
    <header className={headerClasses}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RoleReady
          </h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resumes, templates, jobs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={handleToggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-gray-600" />
          ) : (
            <Sun size={20} className="text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={handleShowNotifications}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-600" />
          <NotificationBadge count={unreadCount} />
        </button>

        {/* Settings */}
        <button
          onClick={handleShowSettings}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} className="text-gray-600" />
        </button>

        {/* User Menu */}
        <UserMenu
          user={user}
          onShowProfile={handleShowProfile}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
