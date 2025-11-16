/**
 * Customization Panel Component
 * Requirements #20-22: Color picker, font selector, spacing controls, section reordering, custom sections
 */

'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp,
  Sliders,
  PlusCircle,
} from 'lucide-react';

export interface PortfolioSection {
  id: string;
  type: 'hero' | 'about' | 'skills' | 'experience' | 'projects' | 'contact' | 'custom';
  title: string;
  visible: boolean;
  order: number;
  customContent?: string;
}

export interface ThemeCustomization {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    sectionGap: number;
    containerPadding: number;
    elementSpacing: number;
  };
  borderRadius: number;
}

interface CustomizationPanelProps {
  sections: PortfolioSection[];
  theme: ThemeCustomization;
  onUpdateSections: (sections: PortfolioSection[]) => void;
  onUpdateTheme: (theme: ThemeCustomization) => void;
  onPreview?: () => void;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', category: 'Sans Serif' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans Serif' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans Serif' },
  { value: 'Lato', label: 'Lato', category: 'Sans Serif' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans Serif' },
  { value: 'Poppins', label: 'Poppins', category: 'Sans Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif' },
  { value: 'Fira Code', label: 'Fira Code', category: 'Monospace' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Monospace' },
];

const PRESET_COLORS = {
  primary: ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4'],
  secondary: ['#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'],
  accent: ['#FBBF24', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#6366F1', '#3B82F6'],
};

type ActiveTab = 'theme' | 'layout' | 'sections';

/**
 * Customization Panel Component
 */
export function CustomizationPanel({
  sections,
  theme,
  onUpdateSections,
  onUpdateTheme,
  onPreview,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('theme');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Toggle section visibility
  const toggleVisibility = (sectionId: string) => {
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onUpdateSections(updated);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.type !== 'custom') {
      alert('Only custom sections can be deleted');
      return;
    }
    const updated = sections.filter((s) => s.id !== sectionId);
    onUpdateSections(updated);
  };

  // Add custom section
  const addCustomSection = () => {
    if (!newSectionTitle.trim()) return;

    const newSection: PortfolioSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: newSectionTitle,
      visible: true,
      order: sections.length,
      customContent: '',
    };

    onUpdateSections([...sections, newSection]);
    setNewSectionTitle('');
  };

  // Drag and drop handlers
  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;

    const draggedIdx = sections.findIndex((s) => s.id === draggedSection);
    const targetIdx = sections.findIndex((s) => s.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const reordered = [...sections];
    const [removed] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    // Update order property
    const updated = reordered.map((s, idx) => ({ ...s, order: idx }));
    onUpdateSections(updated);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  // Update theme colors
  const updateColor = (key: keyof ThemeCustomization['colors'], value: string) => {
    onUpdateTheme({
      ...theme,
      colors: { ...theme.colors, [key]: value },
    });
  };

  // Update fonts
  const updateFont = (key: keyof ThemeCustomization['fonts'], value: string) => {
    onUpdateTheme({
      ...theme,
      fonts: { ...theme.fonts, [key]: value },
    });
  };

  // Update spacing
  const updateSpacing = (key: keyof ThemeCustomization['spacing'], value: number) => {
    onUpdateTheme({
      ...theme,
      spacing: { ...theme.spacing, [key]: value },
    });
  };

  // Update border radius
  const updateBorderRadius = (value: number) => {
    onUpdateTheme({
      ...theme,
      borderRadius: value,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customize Portfolio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalize your portfolio design and layout
          </p>
        </div>
        {onPreview && (
          <button
            onClick={onPreview}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Eye size={18} />
            Preview
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'theme'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Palette className="inline mr-2" size={18} />
            Theme
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'layout'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Sliders className="inline mr-2" size={18} />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'sections'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Layout className="inline mr-2" size={18} />
            Sections
          </button>
        </div>
      </div>

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-8">
          {/* Colors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette size={20} />
              Color Palette
            </h3>

            <div className="space-y-4">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.colors.primary}
                    onChange={(e) => updateColor('primary', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {PRESET_COLORS.primary.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateColor('primary', color)}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.colors.secondary}
                    onChange={(e) => updateColor('secondary', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                    placeholder="#1F2937"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {PRESET_COLORS.secondary.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateColor('secondary', color)}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.colors.accent}
                    onChange={(e) => updateColor('accent', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.colors.accent}
                    onChange={(e) => updateColor('accent', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                    placeholder="#F59E0B"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {PRESET_COLORS.accent.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateColor('accent', color)}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Type size={20} />
              Typography
            </h3>

            <div className="space-y-4">
              {/* Heading Font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Heading Font
                </label>
                <select
                  value={theme.fonts.heading}
                  onChange={(e) => updateFont('heading', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  style={{ fontFamily: theme.fonts.heading }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label} ({font.category})
                    </option>
                  ))}
                </select>
                <p className="text-2xl mt-3" style={{ fontFamily: theme.fonts.heading }}>
                  The Quick Brown Fox Jumps
                </p>
              </div>

              {/* Body Font */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Font
                </label>
                <select
                  value={theme.fonts.body}
                  onChange={(e) => updateFont('body', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  style={{ fontFamily: theme.fonts.body }}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label} ({font.category})
                    </option>
                  ))}
                </select>
                <p className="text-base mt-3" style={{ fontFamily: theme.fonts.body }}>
                  This is a sample paragraph text to preview how the body font will look in your portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-8">
          {/* Spacing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sliders size={20} />
              Spacing
            </h3>

            <div className="space-y-6">
              {/* Section Gap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section Gap
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.spacing.sectionGap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="128"
                  step="8"
                  value={theme.spacing.sectionGap}
                  onChange={(e) => updateSpacing('sectionGap', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Compact</span>
                  <span>Spacious</span>
                </div>
              </div>

              {/* Container Padding */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Container Padding
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.spacing.containerPadding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="64"
                  step="4"
                  value={theme.spacing.containerPadding}
                  onChange={(e) => updateSpacing('containerPadding', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Tight</span>
                  <span>Loose</span>
                </div>
              </div>

              {/* Element Spacing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Element Spacing
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.spacing.elementSpacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  step="2"
                  value={theme.spacing.elementSpacing}
                  onChange={(e) => updateSpacing('elementSpacing', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Dense</span>
                  <span>Airy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Border Radius
            </h3>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Corner Roundness
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {theme.borderRadius}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={theme.borderRadius}
                onChange={(e) => updateBorderRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sharp</span>
                <span>Rounded</span>
              </div>
              <div className="mt-4 flex gap-4">
                <div
                  className="w-20 h-20 bg-blue-600"
                  style={{ borderRadius: `${theme.borderRadius}px` }}
                />
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  Preview of border radius on elements
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Add Custom Section */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Add Custom Section
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addCustomSection();
                }}
                placeholder="Section title..."
                className="flex-1 px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={addCustomSection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Section List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Manage Sections
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag to reorder sections, toggle visibility, or delete custom sections
            </p>

            <div className="space-y-2">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(section.id)}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                      draggedSection === section.id
                        ? 'border-blue-500 opacity-50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="p-4 flex items-center gap-3">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-gray-400">
                        <GripVertical size={20} />
                      </div>

                      {/* Section Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {section.title}
                          </h4>
                          {section.type === 'custom' && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Order: {section.order + 1}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVisibility(section.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            section.visible
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={section.visible ? 'Hide section' : 'Show section'}
                        >
                          {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>

                        <button
                          onClick={() => toggleSection(section.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Section settings"
                        >
                          {expandedSections.has(section.id) ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>

                        {section.type === 'custom' && (
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete section"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedSections.has(section.id) && (
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p className="mb-2">
                            <strong>Type:</strong> {section.type}
                          </p>
                          <p className="mb-2">
                            <strong>Visible:</strong> {section.visible ? 'Yes' : 'No'}
                          </p>
                          {section.type === 'custom' && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Custom Content
                              </label>
                              <textarea
                                value={section.customContent || ''}
                                onChange={(e) => {
                                  const updated = sections.map((s) =>
                                    s.id === section.id
                                      ? { ...s, customContent: e.target.value }
                                      : s
                                  );
                                  onUpdateSections(updated);
                                }}
                                rows={4}
                                placeholder="Enter custom HTML or markdown content..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
