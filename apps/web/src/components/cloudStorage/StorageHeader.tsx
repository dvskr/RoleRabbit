'use client';

import React from 'react';
import { Cloud, Upload, RefreshCw, HardDrive, TrendingUp, Users, Star, Archive } from 'lucide-react';
import { StorageInfo } from '../../types/cloudStorage';

interface StorageHeaderProps {
  storageInfo: StorageInfo;
  onUpload: () => void;
  onRefresh: () => void;
}

export default function StorageHeader({ 
  storageInfo, 
  onUpload, 
  onRefresh 
}: StorageHeaderProps) {
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStorageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="mb-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Cloud size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Manage your resumes and files with advanced sharing</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onUpload}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center space-x-2"
          >
            <Upload size={14} />
            <span className="text-sm font-medium">Upload</span>
          </button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-4 gap-3">
        {/* Storage Usage */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
              <HardDrive size={14} className="text-blue-600" />
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStorageColor(storageInfo.percentage)}`}>
              {storageInfo.percentage.toFixed(1)}%
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              {storageInfo.used} GB
            </h3>
            <p className="text-xs text-gray-600 mb-2">of {storageInfo.limit} GB</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${getStorageBarColor(storageInfo.percentage)}`}
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Files Count */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
              <Cloud size={14} className="text-green-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">24</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-1">Total Files</h3>
            <p className="text-xs text-gray-600">6 resumes, 12 templates</p>
          </div>
        </div>

        {/* Shared Files */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
              <Users size={14} className="text-purple-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">8</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-1">Shared</h3>
            <p className="text-xs text-gray-600">12 collaborators</p>
          </div>
        </div>

        {/* Starred Files */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
              <Star size={14} className="text-yellow-600" />
            </div>
            <span className="text-sm font-bold text-gray-900">5</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-1">Starred</h3>
            <p className="text-xs text-gray-600">Your favorites</p>
          </div>
        </div>
      </div>

      {/* Compact Quick Actions */}
      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <TrendingUp size={12} />
          <span>156 downloads</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users size={12} />
          <span>12 collaborators</span>
        </div>
        <div className="flex items-center space-x-1">
          <Archive size={12} />
          <span>3 archived</span>
        </div>
      </div>
    </div>
  );
}
