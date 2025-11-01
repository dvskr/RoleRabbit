'use client';

export function ThemeInitScript() {
  // This script runs synchronously before React hydration
  // to prevent theme flashing on page load
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('themeMode');
              if (!theme) {
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = prefersDark ? 'dark' : 'light';
              }
              if (theme === 'light' || theme === 'dark') {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}

