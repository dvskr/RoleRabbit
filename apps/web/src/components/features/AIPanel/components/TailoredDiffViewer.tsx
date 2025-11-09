import React, { useState } from 'react';
import type { TailorDiffEntry } from '../../../../types/ai';
import { copyToClipboard } from '../../../../utils/clipboard';

interface TailoredDiffViewerProps {
  diff: TailorDiffEntry[];
  maxVisible?: number;
}

const formatDiffValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

export default function TailoredDiffViewer({ diff, maxVisible = 5 }: TailoredDiffViewerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!Array.isArray(diff) || diff.length === 0) {
    return null;
  }

  const visibleDiffs = diff.slice(0, maxVisible);
  const remainingCount = diff.length - visibleDiffs.length;

  return (
    <div className="space-y-2">
      {visibleDiffs.map((entry, index) => {
        const isExpanded = expandedIndex === index;
        const before = formatDiffValue(entry.before);
        const after = formatDiffValue(entry.after);

        return (
          <div
            key={`${entry.path}-${index}`}
            className="rounded-md border border-indigo-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-indigo-900 text-sm font-medium"
            >
              <span className="font-mono text-[11px] truncate pr-3" title={entry.path}>
                {entry.path}
              </span>
              <span className="text-[11px] text-indigo-500">
                {isExpanded ? 'Hide details' : 'Show details'}
              </span>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 pt-1 text-xs text-indigo-900 space-y-3">
                {typeof entry.confidence === 'number' && (
                  <p className="text-[11px] text-indigo-500">
                    Confidence: {Math.round(entry.confidence * 100)}%
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Before</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(before)}
                        className="text-[11px] text-indigo-500 hover:text-indigo-600"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap bg-indigo-50 border border-indigo-100 rounded-md p-2 text-[11px] text-indigo-800">
                      {before}
                    </pre>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">After</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(after)}
                        className="text-[11px] text-indigo-500 hover:text-indigo-600"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap bg-emerald-50 border border-emerald-100 rounded-md p-2 text-[11px] text-emerald-800">
                      {after}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <p className="text-[11px] text-indigo-600">
          +{remainingCount} additional edits stored with the tailored version.
        </p>
      )}
    </div>
  );
}
