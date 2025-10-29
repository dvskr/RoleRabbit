import React, { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '../../utils/hooks/useClickOutside';

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  options: DropdownOption[];
  trigger: React.ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  align?: 'left' | 'right';
  onSelect?: (option: DropdownOption) => void;
}

export function Dropdown({
  options,
  trigger,
  placement = 'bottom-start',
  align = 'left',
  onSelect
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    option.onClick?.();
    onSelect?.(option);
    setIsOpen(false);
  };

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1'
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${placementClasses[placement]} z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1`}
        >
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
                option.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
