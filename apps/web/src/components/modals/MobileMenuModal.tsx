import React from 'react';
import { X } from 'lucide-react';

interface MobileMenuModalProps {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileMenuModal({
  showMobileMenu,
  setShowMobileMenu,
  activeTab,
  onTabChange
}: MobileMenuModalProps) {
  if (!showMobileMenu) return null;

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'editor', label: 'Resume Editor', icon: '📝' },
    { id: 'templates', label: 'Templates', icon: '📄' },
    { id: 'storage', label: 'Storage', icon: '☁️' },
    { id: 'tracker', label: 'Tracker', icon: '📊' },
    { id: 'discussion', label: 'Discussion', icon: '💬' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'cover-letter', label: 'Cover Letter', icon: '✉️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={() => setShowMobileMenu(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
