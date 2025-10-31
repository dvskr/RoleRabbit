'use client';

import React from 'react';
import TemplateLibrary from '../components/TemplateLibrary';
import { useTheme } from '../../../contexts/ThemeContext';

export default function TemplatesTab() {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  return (
    <div className="h-full" style={{ background: colors.background }}>
      <TemplateLibrary />
    </div>
  );
}
