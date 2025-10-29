import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child as React.ReactElement, {
            className: `${(child as React.ReactElement).props.className || ''} rounded-l-md border-r-0`
          });
        }
        if (index === React.Children.count(children) - 1) {
          return React.cloneElement(child as React.ReactElement, {
            className: `${(child as React.ReactElement).props.className || ''} rounded-r-md border-l-0`
          });
        }
        return React.cloneElement(child as React.ReactElement, {
          className: `${(child as React.ReactElement).props.className || ''} border-l-0 border-r-0`
        });
      })}
    </div>
  );
}

