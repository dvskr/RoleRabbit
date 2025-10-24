import React, { useCallback, useRef, useEffect } from 'react';
import { useAccessibilityContext } from '../providers/AccessibilityProvider';

// Accessible Navigation Component
interface AccessibleNavProps {
  items: Array<{
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
    current?: boolean;
    disabled?: boolean;
    children?: Array<{
      id: string;
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  items,
  orientation = 'horizontal',
  className = ''
}) => {
  const { registerItems, handleKeyDown, announceAction } = useAccessibilityContext();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (navRef.current) {
      const focusableItems = navRef.current.querySelectorAll('a, button');
      const itemsArray = Array.from(focusableItems) as HTMLElement[];
      registerItems(itemsArray);
      itemRefs.current = itemsArray;
    }
  }, [items, registerItems]);

  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('keydown', handleKeyDown);
      return () => nav.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const handleItemClick = useCallback((item: any) => {
    announceAction(`Navigated to ${item.label}`);
    item.onClick?.();
  }, [announceAction]);

  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-row space-x-1' 
    : 'flex flex-col space-y-1';

  return (
    <nav 
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className={`${orientationClasses} ${className}`}
    >
      {items.map((item) => (
        <div key={item.id} className="relative">
          {item.href ? (
            <a
              href={item.href}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${item.current 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-current={item.current ? 'page' : undefined}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
            >
              {item.label}
            </a>
          ) : (
            <button
              onClick={() => !item.disabled && handleItemClick(item)}
              disabled={item.disabled}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${item.current 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-current={item.current ? 'page' : undefined}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
            >
              {item.label}
            </button>
          )}
          
          {/* Submenu */}
          {item.children && item.children.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {item.children.map((child) => (
                <a
                  key={child.id}
                  href={child.href}
                  onClick={() => child.onClick?.()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

// Accessible Breadcrumb Component
interface AccessibleBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  className?: string;
}

export const AccessibleBreadcrumb: React.FC<AccessibleBreadcrumbProps> = ({
  items,
  className = ''
}) => {
  const { announceAction } = useAccessibilityContext();

  const handleBreadcrumbClick = useCallback((item: any) => {
    announceAction(`Navigated to ${item.label}`);
  }, [announceAction]);

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-2" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-400 mx-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            
            {item.current ? (
              <span 
                className="text-gray-500 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                onClick={() => handleBreadcrumbClick(item)}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Accessible Tab Component
interface AccessibleTabProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const AccessibleTab: React.FC<AccessibleTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const { registerItems, handleKeyDown, announceAction } = useAccessibilityContext();
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabListRef.current) {
      const tabButtons = tabListRef.current.querySelectorAll('[role="tab"]');
      const itemsArray = Array.from(tabButtons) as HTMLElement[];
      registerItems(itemsArray);
    }
  }, [tabs, registerItems]);

  useEffect(() => {
    const tabList = tabListRef.current;
    if (tabList) {
      tabList.addEventListener('keydown', handleKeyDown);
      return () => tabList.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  const handleTabClick = useCallback((tabId: string) => {
    announceAction(`Switched to ${tabs.find(t => t.id === tabId)?.label} tab`);
    onTabChange(tabId);
  }, [tabs, onTabChange, announceAction]);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab List */}
      <div 
        ref={tabListRef}
        role="tablist"
        aria-label="Tabs"
        className="flex border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            aria-disabled={tab.disabled}
            id={`tab-${tab.id}`}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            tabIndex={tab.disabled ? -1 : activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

// Accessible Menu Component
interface AccessibleMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
  }>;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  className?: string;
}

export const AccessibleMenu: React.FC<AccessibleMenuProps> = ({
  trigger,
  items,
  isOpen,
  onOpen,
  onClose,
  className = ''
}) => {
  const { registerItems, handleKeyDown, announceAction } = useAccessibilityContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuItems = menuRef.current.querySelectorAll('[role="menuitem"]');
      const itemsArray = Array.from(menuItems) as HTMLElement[];
      registerItems(itemsArray);
    }
  }, [isOpen, registerItems]);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu && isOpen) {
      menu.addEventListener('keydown', handleKeyDown);
      return () => menu.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleItemClick = useCallback((item: any) => {
    announceAction(`Selected ${item.label}`);
    item.onClick?.();
    onClose();
  }, [announceAction, onClose]);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={isOpen ? onClose : onOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {trigger}
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
        >
          {items.map((item) => (
            <div key={item.id}>
              {item.divider ? (
                <div className="border-t border-gray-200 my-1" />
              ) : item.href ? (
                <a
                  href={item.href}
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => handleItemClick(item)}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  role="menuitem"
                  onClick={() => !item.disabled && handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    block w-full text-left px-4 py-2 text-sm transition-colors
                    ${item.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  tabIndex={item.disabled ? -1 : 0}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

