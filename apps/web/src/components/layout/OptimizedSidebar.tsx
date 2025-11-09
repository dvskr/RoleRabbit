import React, { memo, useMemo, useCallback } from 'react';
import { 
  Home as HomeIcon, 
  User, 
  Cloud, 
  Edit, 
  Layout, 
  Briefcase, 
  MessageSquare, 
  Mail, 
  FileText, 
  Plus, 
  Upload
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { RabbitLogo, RabbitLogoWithText } from '../ui/RabbitLogo';

interface SidebarProps {
  onTabChange: (tab: string) => void;
  onShowNewResumeModal: () => void;
  onShowImportModal: () => void;
}

// Memoized navigation items to prevent unnecessary re-renders
const NavigationItems = memo(({ 
  activeTab, 
  sidebarCollapsed, 
  onTabChange 
}: {
  activeTab: string;
  sidebarCollapsed: boolean;
  onTabChange: (tab: string) => void;
}) => {
  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'storage', label: 'Cloud Storage', icon: Cloud },
    { id: 'editor', label: 'Resume Editor', icon: Edit },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'jobs', label: 'Job Tracker', icon: Briefcase },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'cover-letter', label: 'Cover Letter', icon: FileText }
  ], []);

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'
            } rounded-xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-black dark:to-black text-white shadow-lg shadow-blue-500/30 scale-102'
                : 'text-gray-700 hover:bg-white/60 hover:shadow-md dark:text-gray-200 dark:hover:bg-white/10'
            }`}
            title={sidebarCollapsed ? item.label : ''}
          >
            <Icon size={20} />
            {!sidebarCollapsed && <span className="font-semibold">{item.label}</span>}
          </button>
        );
      })}
    </>
  );
});

NavigationItems.displayName = 'NavigationItems';

// Memoized quick actions
const QuickActions = memo(({ 
  sidebarCollapsed, 
  onShowNewResumeModal, 
  onShowImportModal 
}: {
  sidebarCollapsed: boolean;
  onShowNewResumeModal: () => void;
  onShowImportModal: () => void;
}) => {
  const quickActions = useMemo(() => [
    {
      id: 'new-resume',
      label: 'New Resume',
      icon: Plus,
      action: onShowNewResumeModal,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'import',
      label: 'Import Resume',
      icon: Upload,
      action: onShowImportModal,
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ], [onShowNewResumeModal, onShowImportModal]);

  return (
    <div className={`${sidebarCollapsed ? 'p-2' : 'p-3'} border-t border-blue-200/20`}>
      <div className={`${sidebarCollapsed ? 'space-y-2' : 'space-y-2'}`}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
              } rounded-xl transition-all duration-300 ${action.color} text-white shadow-lg`}
              title={sidebarCollapsed ? action.label : ''}
            >
              <Icon size={20} />
              {!sidebarCollapsed && <span className="font-semibold">{action.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

// Main Sidebar component with performance optimizations
const Sidebar = memo<SidebarProps>(({ onTabChange, onShowNewResumeModal, onShowImportModal }) => {
  const { activeTab, sidebarCollapsed } = useAppStore((state) => ({
    activeTab: state.uiState.activeTab,
    sidebarCollapsed: state.uiState.sidebarCollapsed
  }));

  // Memoized class names to prevent recalculation
  const sidebarClasses = useMemo(() => 
    `${sidebarCollapsed ? 'w-16' : 'w-72'} bg-gradient-to-b from-blue-50/30 to-purple-50/30 dark:from-black/50 dark:to-black/70 backdrop-blur-xl border-r border-blue-200/30 dark:border-white/10 shadow-xl flex flex-col mt-2`,
    [sidebarCollapsed]
  );

  const headerClasses = useMemo(() =>
    `${sidebarCollapsed ? 'p-3' : 'p-4'} border-b border-blue-200/20 dark:border-white/10 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-black/40 dark:to-black/40`,
    [sidebarCollapsed]
  );

  const navClasses = useMemo(() =>
    `flex-1 ${sidebarCollapsed ? 'p-2' : 'p-3'} space-y-1 overflow-y-auto`,
    [sidebarCollapsed]
  );

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: string) => {
    onTabChange(tab);
  }, [onTabChange]);

  const handleShowNewResumeModal = useCallback(() => {
    onShowNewResumeModal();
  }, [onShowNewResumeModal]);

  const handleShowImportModal = useCallback(() => {
    onShowImportModal();
  }, [onShowImportModal]);

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center gap-3 mb-1">
            {sidebarCollapsed ? (
              <RabbitLogo size={100} animated={true} />
            ) : (
              <RabbitLogoWithText size={100} animated={true} textSize="xl" />
            )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className={navClasses}>
        <NavigationItems
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onTabChange={handleTabChange}
        />
      </nav>
      
      {/* Quick Actions */}
      <QuickActions
        sidebarCollapsed={sidebarCollapsed}
        onShowNewResumeModal={handleShowNewResumeModal}
        onShowImportModal={handleShowImportModal}
      />
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
