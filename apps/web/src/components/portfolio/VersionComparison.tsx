/**
 * Version Comparison Component
 * Requirement #6: Shows diff between two versions with highlighting
 */

'use client';

import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { PortfolioVersion } from './VersionHistory';

interface VersionComparisonProps {
  version1: PortfolioVersion;
  version2: PortfolioVersion;
  onClose: () => void;
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

/**
 * Simple word-level diff (basic implementation)
 * For production, use 'diff' library: npm install diff
 */
function diffWords(oldText: string, newText: string): DiffPart[] {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  const result: DiffPart[] = [];

  let i = 0;
  let j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      result.push({ value: newWords[j] + ' ', added: true });
      j++;
    } else if (j >= newWords.length) {
      result.push({ value: oldWords[i] + ' ', removed: true });
      i++;
    } else if (oldWords[i] === newWords[j]) {
      result.push({ value: oldWords[i] + ' ' });
      i++;
      j++;
    } else {
      result.push({ value: oldWords[i] + ' ', removed: true });
      result.push({ value: newWords[j] + ' ', added: true });
      i++;
      j++;
    }
  }

  return result;
}

function FieldDiff({ label, oldValue, newValue }: {
  label: string;
  oldValue: string;
  newValue: string;
}) {
  if (oldValue === newValue) {
    return (
      <div className="field-diff unchanged">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-900 dark:text-white">{newValue || <em className="text-gray-400">Empty</em>}</p>
        </div>
      </div>
    );
  }

  const diff = diffWords(oldValue || '', newValue || '');

  return (
    <div className="field-diff changed">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        {label}
        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-medium rounded-full">
          Changed
        </span>
      </h4>
      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {diff.map((part, index) => (
            <span
              key={index}
              className={
                part.added
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 px-1 rounded'
                  : part.removed
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 px-1 rounded line-through'
                  : ''
              }
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrayDiff({ label, oldArray, newArray }: {
  label: string;
  oldArray: string[];
  newArray: string[];
}) {
  const added = newArray.filter((item) => !oldArray.includes(item));
  const removed = oldArray.filter((item) => !newArray.includes(item));
  const unchanged = newArray.filter((item) => oldArray.includes(item));

  if (added.length === 0 && removed.length === 0) {
    return (
      <div className="array-diff unchanged">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </h4>
        <div className="flex flex-wrap gap-2">
          {unchanged.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="array-diff changed">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        {label}
        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-medium rounded-full">
          Changed
        </span>
      </h4>
      <div className="flex flex-wrap gap-2">
        {removed.map((item, index) => (
          <span
            key={`removed-${index}`}
            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 rounded-full text-sm line-through"
          >
            {item}
          </span>
        ))}
        {unchanged.map((item, index) => (
          <span
            key={`unchanged-${index}`}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full text-sm"
          >
            {item}
          </span>
        ))}
        {added.map((item, index) => (
          <span
            key={`added-${index}`}
            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function VersionComparison({
  version1,
  version2,
  onClose,
}: VersionComparisonProps) {
  const v1Data = version1.snapshot || {};
  const v2Data = version2.snapshot || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Version Comparison
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded font-medium">
                    Version {version1.versionNumber}
                  </span>
                  <span className="text-xs">
                    {new Date(version1.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <ArrowRight size={16} />
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded font-medium">
                    Version {version2.versionNumber}
                  </span>
                  <span className="text-xs">
                    {new Date(version2.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Legend */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
            <span className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 rounded">
                Added
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 rounded line-through">
                Removed
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded">
                Unchanged
              </span>
            </span>
          </div>

          {/* Field comparisons */}
          <div className="space-y-4">
            {/* Name */}
            <FieldDiff
              label="Portfolio Name"
              oldValue={v1Data.name || ''}
              newValue={v2Data.name || ''}
            />

            {/* Bio */}
            <FieldDiff
              label="Bio"
              oldValue={v1Data.bio || v1Data.professionalBio || ''}
              newValue={v2Data.bio || v2Data.professionalBio || ''}
            />

            {/* Role */}
            <FieldDiff
              label="Role"
              oldValue={v1Data.role || ''}
              newValue={v2Data.role || ''}
            />

            {/* Skills */}
            {(v1Data.skills || v2Data.skills) && (
              <ArrayDiff
                label="Skills"
                oldArray={v1Data.skills || []}
                newArray={v2Data.skills || []}
              />
            )}

            {/* Email */}
            <FieldDiff
              label="Email"
              oldValue={v1Data.email || ''}
              newValue={v2Data.email || ''}
            />

            {/* LinkedIn */}
            <FieldDiff
              label="LinkedIn"
              oldValue={v1Data.linkedin || ''}
              newValue={v2Data.linkedin || ''}
            />

            {/* GitHub */}
            <FieldDiff
              label="GitHub"
              oldValue={v1Data.github || ''}
              newValue={v2Data.github || ''}
            />

            {/* Website */}
            <FieldDiff
              label="Website"
              oldValue={v1Data.website || ''}
              newValue={v2Data.website || ''}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
