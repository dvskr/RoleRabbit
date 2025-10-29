import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';

export interface SidebarItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  items?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ items, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderItem = (item: SidebarItem, depth = 0) => {
    const Component = item.href ? Link : 'div';
    const props = item.href ? { href: item.href } : { onClick: item.onClick };

    return (
      <Component
        {...(props as any)}
        className={cn(
          'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
          isActive(item.href) && 'bg-blue-50 text-blue-600',
          !isActive(item.href) && 'hover:bg-gray-100',
          collapsed && 'justify-center px-2',
          depth > 0 && 'ml-4'
        )}
        title={collapsed ? item.label : undefined}
      >
        {item.icon && <span>{item.icon}</span>}
        {!collapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Component>
    );
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {onToggle && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onToggle}
            className="w-full text-left hover:bg-gray-100 rounded-lg p-2"
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item)}
            {item.items && !collapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.items.map((subItem, subIndex) => renderItem(subItem, 1))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
