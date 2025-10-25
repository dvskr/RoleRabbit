'use client';

import React, { useState } from 'react';
import { Palette, Moon, Sun, Monitor, Settings, Eye, EyeOff, X, Check } from 'lucide-react';

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  density: 'comfortable' | 'compact' | 'spacious';
  layout: 'grid' | 'list' | 'compact';
}

interface ThemeCustomizerProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  onClose: () => void;
}

export function ThemeCustomizer({ currentTheme, onThemeChange, onClose }: ThemeCustomizerProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(currentTheme);
  const [customColors, setCustomColors] = useState(currentTheme.colors);

  const predefinedThemes: ThemeConfig[] = [
    {
      id: 'light',
      name: 'Light Theme',
      description: 'Clean and bright interface',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        accent: '#10B981'
      },
      density: 'comfortable',
      layout: 'grid'
    },
    {
      id: 'dark',
      name: 'Dark Theme',
      description: 'Easy on the eyes for night use',
      colors: {
        primary: '#60A5FA',
        secondary: '#9CA3AF',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        accent: '#34D399'
      },
      density: 'comfortable',
      layout: 'grid'
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      description: 'Calming blue tones',
      colors: {
        primary: '#0EA5E9',
        secondary: '#64748B',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#0F172A',
        accent: '#06B6D4'
      },
      density: 'comfortable',
      layout: 'grid'
    },
    {
      id: 'green',
      name: 'Forest Green',
      description: 'Natural green theme',
      colors: {
        primary: '#059669',
        secondary: '#6B7280',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#064E3B',
        accent: '#10B981'
      },
      density: 'comfortable',
      layout: 'grid'
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      description: 'Elegant purple theme',
      colors: {
        primary: '#7C3AED',
        secondary: '#6B7280',
        background: '#FAF5FF',
        surface: '#FFFFFF',
        text: '#581C87',
        accent: '#A855F7'
      },
      density: 'comfortable',
      layout: 'grid'
    },
    {
      id: 'compact',
      name: 'Compact Mode',
      description: 'Maximum information density',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        accent: '#10B981'
      },
      density: 'compact',
      layout: 'compact'
    }
  ];

  const densityOptions = [
    { value: 'comfortable', label: 'Comfortable', description: 'More spacing, easier to read', icon: Monitor },
    { value: 'compact', label: 'Compact', description: 'Dense layout, more information', icon: Settings },
    { value: 'spacious', label: 'Spacious', description: 'Lots of white space, minimal', icon: Eye }
  ];

  const layoutOptions = [
    { value: 'grid', label: 'Grid Layout', description: 'Card-based grid system' },
    { value: 'list', label: 'List Layout', description: 'Vertical list format' },
    { value: 'compact', label: 'Compact Layout', description: 'Minimal space usage' }
  ];

  const applyTheme = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
  };

  const applyCustomTheme = () => {
    const customTheme: ThemeConfig = {
      ...selectedTheme,
      colors: customColors
    };
    onThemeChange(customTheme);
    onClose();
  };

  const resetToDefault = () => {
    const defaultTheme = predefinedThemes[0];
    setSelectedTheme(defaultTheme);
    setCustomColors(defaultTheme.colors);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Theme Customization</h2>
                <p className="text-purple-100">Personalize your dashboard appearance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Predefined Themes</h3>
              <div className="grid grid-cols-1 gap-3">
                {predefinedThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedTheme.id === theme.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded-lg shadow-sm"
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-lg shadow-sm"
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded-lg shadow-sm"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{theme.name}</div>
                        <div className="text-sm text-gray-600">{theme.description}</div>
                      </div>
                      {selectedTheme.id === theme.id && (
                        <div className="p-1 bg-purple-500 rounded-full text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Colors</h3>
              <div className="space-y-4">
                {Object.entries(customColors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>

              {/* Layout Options */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Layout Density</h4>
                <div className="space-y-3">
                  {densityOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="density"
                        value={option.value}
                        checked={selectedTheme.density === option.value}
                        onChange={(e) => setSelectedTheme(prev => ({ ...prev, density: e.target.value as any }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <option.icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Layout Type */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Layout Type</h4>
                <div className="space-y-3">
                  {layoutOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="layout"
                        value={option.value}
                        checked={selectedTheme.layout === option.value}
                        onChange={(e) => setSelectedTheme(prev => ({ ...prev, layout: e.target.value as any }))}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div
              className="p-6 rounded-xl border-2 border-gray-200"
              style={{
                backgroundColor: customColors.background,
                color: customColors.text
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg border shadow-sm"
                  style={{
                    backgroundColor: customColors.surface,
                    borderColor: customColors.secondary + '20'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: customColors.primary }}
                    />
                    <h4 className="font-semibold">Sample Widget</h4>
                  </div>
                  <p className="text-sm opacity-75 mb-3">This is how your dashboard will look</p>
                  <div className="flex gap-2">
                    <div
                      className="px-3 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: customColors.accent + '20',
                        color: customColors.accent
                      }}
                    >
                      Sample Tag
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg border shadow-sm"
                  style={{
                    backgroundColor: customColors.surface,
                    borderColor: customColors.secondary + '20'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: customColors.secondary }}
                    />
                    <h4 className="font-semibold">Another Widget</h4>
                  </div>
                  <p className="text-sm opacity-75">Preview your custom theme</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={resetToDefault}
            className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyCustomTheme}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}