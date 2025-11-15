/**
 * Skip Links Component
 * Section 1.8 requirement #18: Add skip links for keyboard navigation
 *
 * Provides "Skip to main content" link at the top of the page
 * for keyboard users to bypass navigation and go directly to main content
 */

'use client';

import React from 'react';

interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks = links || [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
  ];

  return (
    <div className="skip-links">
      {defaultLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
        >
          {link.label}
        </a>
      ))}
      <style jsx>{`
        .skip-links {
          position: relative;
          z-index: 9999;
        }

        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          font-weight: 600;
          border-radius: 0 0 4px 0;
          z-index: 100;
          transition: top 0.2s ease;
        }

        .skip-link:focus {
          top: 0;
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

/**
 * Main Content Wrapper
 * Add this around your main content area
 */
export function MainContent({ children, id = 'main-content' }: { children: React.ReactNode; id?: string }) {
  return (
    <main id={id} role="main" tabIndex={-1}>
      {children}
    </main>
  );
}

export default SkipLinks;
