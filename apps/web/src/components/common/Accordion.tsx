import React, { useState } from 'react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (index: string) => {
    setOpenItems(prev => {
      if (allowMultiple) {
        return prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index];
      } else {
        return prev.includes(index) ? [] : [index];
      }
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index.toString());
        return (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleItem(index.toString())}
              className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-gray-500">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="px-4 py-3 border-t border-gray-200">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
