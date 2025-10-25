'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Settings, Eye, EyeOff, GripVertical, Plus, X } from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'activity' | 'todos' | 'metrics' | 'alerts' | 'actions' | 'premium';
  title: string;
  description: string;
  isVisible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  onClose: () => void;
}

export function DashboardCustomizer({ widgets, onWidgetsChange, onClose }: DashboardCustomizerProps) {
  const [availableWidgets] = useState<DashboardWidget[]>([
    {
      id: 'activity-feed',
      type: 'activity',
      title: 'Activity Feed',
      description: 'Recent job search activities',
      isVisible: true,
      order: 1,
      size: 'large'
    },
    {
      id: 'smart-todos',
      type: 'todos',
      title: 'Smart To-Dos',
      description: 'AI-generated daily tasks',
      isVisible: true,
      order: 2,
      size: 'medium'
    },
    {
      id: 'progress-metrics',
      type: 'metrics',
      title: 'Progress Metrics',
      description: 'Job search performance',
      isVisible: true,
      order: 3,
      size: 'medium'
    },
    {
      id: 'intelligent-alerts',
      type: 'alerts',
      title: 'Intelligent Alerts',
      description: 'Proactive notifications',
      isVisible: true,
      order: 4,
      size: 'medium'
    },
    {
      id: 'quick-actions',
      type: 'actions',
      title: 'Quick Actions',
      description: 'One-click task access',
      isVisible: true,
      order: 5,
      size: 'small'
    },
    {
      id: 'premium-features',
      type: 'premium',
      title: 'Premium Features',
      description: 'RoleReady premium tools',
      isVisible: true,
      order: 6,
      size: 'medium'
    }
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [reorderedItem] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index + 1
    }));

    onWidgetsChange(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const changeWidgetSize = (widgetId: string, newSize: DashboardWidget['size']) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, size: newSize } : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const getSizeIcon = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small': return 'S';
      case 'medium': return 'M';
      case 'large': return 'L';
      default: return 'M';
    }
  };

  const getSizeColor = (size: DashboardWidget['size']) => {
    switch (size) {
      case 'small': return 'bg-gray-100 text-gray-600';
      case 'medium': return 'bg-blue-100 text-blue-600';
      case 'large': return 'bg-green-100 text-green-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Customize Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Drag to reorder widgets</h3>
            <p className="text-xs text-gray-600">Click the eye icon to show/hide widgets</p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 border border-gray-200 rounded-lg bg-white transition-all ${
                            snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="p-1 hover:bg-gray-100 rounded cursor-grab"
                            >
                              <GripVertical size={16} className="text-gray-400" />
                            </div>

                            {/* Widget Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {widget.title}
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getSizeColor(widget.size)}`}>
                                  {getSizeIcon(widget.size)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">{widget.description}</p>
                            </div>

                            {/* Size Controls */}
                            <div className="flex items-center gap-1">
                              <select
                                value={widget.size}
                                onChange={(e) => changeWidgetSize(widget.id, e.target.value as DashboardWidget['size'])}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                              </select>
                            </div>

                            {/* Visibility Toggle */}
                            <button
                              onClick={() => toggleWidgetVisibility(widget.id)}
                              className={`p-1 rounded transition-colors ${
                                widget.isVisible
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-50'
                              }`}
                              title={widget.isVisible ? 'Hide widget' : 'Show widget'}
                            >
                              {widget.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Reset Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => onWidgetsChange(availableWidgets)}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Reset to default layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
