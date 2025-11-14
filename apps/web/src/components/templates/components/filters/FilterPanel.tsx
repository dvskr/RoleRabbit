/**
 * FilterPanel Component
 * Comprehensive filter panel with all filtering options
 */

import React, { useState } from 'react';
import {
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Star,
  DollarSign,
  Save,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useAdvancedFilters, type FilterPreset } from '../../hooks/useAdvancedFilters';

interface FilterPanelProps {
  onFiltersApply?: () => void;
  className?: string;
  showPresets?: boolean;
  isPremium?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersApply,
  className = '',
  showPresets = true,
  isPremium = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'difficulty', 'rating'])
  );
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  const {
    filters,
    presets,
    activePreset,
    filterOptions,
    toggleCategory,
    toggleIndustry,
    setDifficulty,
    setRating,
    setPremium,
    resetFilters,
    savePreset,
    deletePreset,
    applyPreset,
    getActiveFilterCount,
    isDefault,
  } = useAdvancedFilters();

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Handle save preset
  const handleSavePreset = async () => {
    if (presetName.trim()) {
      const saved = await savePreset(presetName.trim(), isPremium);
      if (saved) {
        setPresetName('');
        setShowSavePreset(false);
      }
    }
  };

  // Handle reset
  const handleReset = () => {
    resetFilters();
    onFiltersApply?.();
  };

  // Handle apply
  const handleApply = () => {
    onFiltersApply?.();
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {!isDefault() && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {/* Presets */}
        {showPresets && presets.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection('presets')}
              className="w-full flex items-center justify-between text-left mb-3"
            >
              <span className="font-medium text-gray-900">Saved Presets</span>
              {expandedSections.has('presets') ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {expandedSections.has('presets') && (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      activePreset === preset.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => applyPreset(preset)}
                      className="flex-1 text-left text-sm font-medium text-gray-900"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900">Categories</span>
            {expandedSections.has('categories') ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {expandedSections.has('categories') && (
            <div className="space-y-2">
              {filterOptions.categories.map((category) => (
                <label
                  key={category.value}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.value)}
                    onChange={() => toggleCategory(category.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                    {category.label}
                  </span>
                  <span className="text-xs text-gray-400">{category.count}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('difficulty')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900">Difficulty</span>
            {expandedSections.has('difficulty') ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {expandedSections.has('difficulty') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Level {filters.difficulty[0]}</span>
                <span className="text-gray-600">Level {filters.difficulty[1]}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={filters.difficulty[0]}
                onChange={(e) =>
                  setDifficulty([parseInt(e.target.value), filters.difficulty[1]])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min="1"
                max="5"
                value={filters.difficulty[1]}
                onChange={(e) =>
                  setDifficulty([filters.difficulty[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900">Rating</span>
            {expandedSections.has('rating') ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {expandedSections.has('rating') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-600">{filters.rating[0].toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-600">{filters.rating[1].toFixed(1)}</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating[0]}
                onChange={(e) => setRating([parseFloat(e.target.value), filters.rating[1]])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating[1]}
                onChange={(e) => setRating([filters.rating[0], parseFloat(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
          )}
        </div>

        {/* Premium Toggle */}
        <div className="p-4">
          <span className="font-medium text-gray-900 block mb-3">Premium Status</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPremium(null)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.premium === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPremium(false)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.premium === false
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setPremium(true)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.premium === true
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Industries */}
        {filterOptions.industries.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection('industries')}
              className="w-full flex items-center justify-between text-left mb-3"
            >
              <span className="font-medium text-gray-900">Industries</span>
              {expandedSections.has('industries') ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {expandedSections.has('industries') && (
              <div className="space-y-2">
                {filterOptions.industries.map((industry) => (
                  <label
                    key={industry.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.industries.includes(industry.value)}
                      onChange={() => toggleIndustry(industry.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                      {industry.label}
                    </span>
                    <span className="text-xs text-gray-400">{industry.count}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Save Preset */}
        {showPresets && !showSavePreset && (
          <button
            onClick={() => setShowSavePreset(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Save size={16} />
            Save as Preset
            {isPremium && <span className="text-xs text-blue-600">(Premium)</span>}
          </button>
        )}

        {/* Save Preset Form */}
        {showSavePreset && (
          <div className="space-y-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSavePreset(false);
                  setPresetName('');
                }}
                className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Check size={16} />
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
