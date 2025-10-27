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
    <div className="mb-1">
      {/* Compact Stats - Horizontal bar style */}
      <div className="flex items-center gap-1.5">
        {/* Storage Usage */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 flex-1">
          <HardDrive size={12} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-gray-600">Storage</span>
              <span className={`text-[10px] font-medium ${getStorageColor(storageInfo.percentage)}`}>
                {storageInfo.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{storageInfo.used} GB</span>
              <span className="text-[10px] text-gray-500">of {storageInfo.limit} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-0.5 mt-1">
              <div 
                className={`h-0.5 rounded-full ${getStorageBarColor(storageInfo.percentage)}`}
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Files Count */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
          <Cloud size={12} className="text-green-600 flex-shrink-0" />
          <div className="flex items-center gap-0.5">
            <span className="text-sm font-bold text-gray-900">24</span>
            <span className="text-[9px] text-gray-600">files</span>
          </div>
        </div>

        {/* Shared Files */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
          <Users size={12} className="text-purple-600 flex-shrink-0" />
          <div className="flex items-center gap-0.5">
            <span className="text-sm font-bold text-gray-900">8</span>
            <span className="text-[9px] text-gray-600">shared</span>
          </div>
        </div>

        {/* Starred Files */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
          <Star size={12} className="text-yellow-600 flex-shrink-0" />
          <div className="flex items-center gap-0.5">
            <span className="text-sm font-bold text-gray-900">5</span>
            <span className="text-[9px] text-gray-600">starred</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onUpload}
            className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 transition-all"
          >
            <Upload size={12} />
            <span className="text-[10px] font-medium">Upload</span>
          </button>
        </div>
      </div>

      {/* Compact Quick Info */}
      <div className="mt-0.5 flex items-center gap-2 text-[9px] text-gray-500">
        <span className="flex items-center gap-0.5">
          <TrendingUp size={9} />
          156 downloads
        </span>
        <span className="flex items-center gap-0.5">
          <Users size={9} />
          12 collaborators
        </span>
        <span className="flex items-center gap-0.5">
          <Archive size={9} />
          3 archived
        </span>
      </div>
    </div>
  );
}
