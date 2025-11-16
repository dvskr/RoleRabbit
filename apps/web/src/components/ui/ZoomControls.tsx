import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../common/Button';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  className?: string;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  className = '',
}) => {
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

  const handleFitToWidth = () => {
    // Calculate zoom to fit width (assuming 8.5" page width)
    const containerWidth = document.querySelector('[data-preview-container]')?.clientWidth || 800;
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const fitZoom = Math.floor((containerWidth / pageWidth) * 100);
    const closestZoom = ZOOM_LEVELS.reduce((prev, curr) =>
      Math.abs(curr - fitZoom) < Math.abs(prev - fitZoom) ? curr : prev
    );
    onZoomChange(closestZoom);
  };

  const handleFitToPage = () => {
    // Calculate zoom to fit entire page
    const container = document.querySelector('[data-preview-container]');
    if (!container) return;
    
    const containerHeight = container.clientHeight;
    const pageHeight = 11 * 96; // 11 inches at 96 DPI
    const fitZoom = Math.floor((containerHeight / pageHeight) * 100);
    const closestZoom = ZOOM_LEVELS.reduce((prev, curr) =>
      Math.abs(curr - fitZoom) < Math.abs(prev - fitZoom) ? curr : prev
    );
    onZoomChange(closestZoom);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Zoom Out Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        className="p-2"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      {/* Zoom Percentage Dropdown */}
      <select
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Zoom level"
      >
        {ZOOM_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}%
          </option>
        ))}
      </select>

      {/* Zoom In Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        className="p-2"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* Fit to Width Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFitToWidth}
        className="p-2"
        title="Fit to Width"
        aria-label="Fit to width"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>

      {/* Fit to Page Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFitToPage}
        className="p-2"
        title="Fit to Page"
        aria-label="Fit to page"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>

      {/* Keyboard Shortcuts Hint */}
      <span className="hidden lg:inline text-xs text-gray-500 dark:text-gray-400 ml-2">
        Ctrl + / Ctrl -
      </span>
    </div>
  );
};

export default ZoomControls;

