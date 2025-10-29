import React, { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../utils/hooks/useClickOutside';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
  disabled?: boolean;
}

export function ContextMenu({ items, children, disabled = false }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Adjust if menu goes off screen
      if (position.x + rect.width > viewport.width) {
        setPosition(prev => ({ ...prev, x: viewport.width - rect.width - 10 }));
      }
      if (position.y + rect.height > viewport.height) {
        setPosition(prev => ({ ...prev, y: viewport.height - rect.height - 10 }));
      }
    }
  }, [isOpen, position]);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{ left: position.x, top: position.y }}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && <div className="my-1 border-t border-gray-200" />}
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-gray-100 ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
}

