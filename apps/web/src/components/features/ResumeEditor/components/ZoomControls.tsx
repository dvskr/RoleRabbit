import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToWidth: () => void;
  onFitToPage: () => void;
  colors: any;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export default function ZoomControls({
  zoom,
  onZoomChange,
  onFitToWidth,
  onFitToPage,
  colors,
}: ZoomControlsProps) {
  const currentIndex = ZOOM_LEVELS.indexOf(zoom);
  const canZoomIn = currentIndex < ZOOM_LEVELS.length - 1;
  const canZoomOut = currentIndex > 0;

  const handleZoomIn = () => {
    if (canZoomIn) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    if (canZoomOut) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        background: colors.inputBackground,
        borderColor: colors.border,
      }}
    >
      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        className="p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          color: colors.primaryText,
        }}
        onMouseEnter={(e) => {
          if (canZoomOut) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut size={16} />
      </button>

      {/* Zoom Percentage Dropdown */}
      <select
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="px-2 py-1 text-sm font-medium rounded border-none outline-none cursor-pointer"
        style={{
          background: colors.cardBackground,
          color: colors.primaryText,
        }}
        aria-label="Zoom level"
      >
        {ZOOM_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}%
          </option>
        ))}
      </select>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        className="p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          color: colors.primaryText,
        }}
        onMouseEnter={(e) => {
          if (canZoomIn) {
            e.currentTarget.style.background = colors.hoverBackground;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn size={16} />
      </button>

      {/* Divider */}
      <div
        className="w-px h-6 mx-1"
        style={{ background: colors.border }}
      />

      {/* Fit to Width */}
      <button
        onClick={onFitToWidth}
        className="p-1.5 rounded transition-colors"
        style={{
          color: colors.secondaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.color = colors.primaryText;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.secondaryText;
        }}
        title="Fit to width"
        aria-label="Fit to width"
      >
        <Maximize2 size={16} />
      </button>

      {/* Fit to Page */}
      <button
        onClick={onFitToPage}
        className="p-1.5 rounded transition-colors"
        style={{
          color: colors.secondaryText,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.hoverBackground;
          e.currentTarget.style.color = colors.primaryText;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = colors.secondaryText;
        }}
        title="Fit to page"
        aria-label="Fit to page"
      >
        <Minimize2 size={16} />
      </button>
    </div>
  );
}

