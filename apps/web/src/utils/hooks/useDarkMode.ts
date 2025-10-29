import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const darkMode = stored ? stored === 'true' : prefersDark;
    setIsDark(darkMode);
    
    // Apply class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('darkMode', String(newValue));
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const enable = () => {
    setIsDark(true);
    localStorage.setItem('darkMode', 'true');
    document.documentElement.classList.add('dark');
  };

  const disable = () => {
    setIsDark(false);
    localStorage.setItem('darkMode', 'false');
    document.documentElement.classList.remove('dark');
  };

  return { isDark, toggle, enable, disable };
}

