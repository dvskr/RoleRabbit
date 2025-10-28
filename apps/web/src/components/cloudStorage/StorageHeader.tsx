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
      {/* Ultra-compact unified stats and actions bar */}
      <div className="flex items-center gap-2">
        {/* Storage Usage - Compact inline with stats */}
        <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-1 border border-gray-200 flex-1">
          <HardDrive size={14} className="text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-900">{storageInfo.used} GB</span>
              <span className="text-[10px] text-gray-500">/ {storageInfo.limit} GB</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStorageColor(storageInfo.percentage)}`}>
                {storageInfo.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <TrendingUp size={9} />
            156
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <Users size={9} />
            12
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-500">
            <Archive size={9} />
            3
          </div>
        </div>

        {/* Files stats - compact inline */}
        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
          <Cloud size={12} className="text-green-600" />
          <span className="text-xs font-bold">24</span>
        </div>
        
        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
          <Users size={12} className="text-purple-600" />
          <span className="text-xs font-bold">8</span>
        </div>
        
        <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
          <Star size={12} className="text-yellow-600" />
          <span className="text-xs font-bold">5</span>
        </div>

        {/* Action buttons */}
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
            className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg flex items-center gap-1 transition-all"
          >
            <Upload size={14} />
            <span className="text-xs font-medium">Upload</span>
          </button>
        </div>
      </div>
    </div>
  );
}
