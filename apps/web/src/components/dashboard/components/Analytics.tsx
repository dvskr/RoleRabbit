'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, X, Download } from 'lucide-react';
import { DashboardData } from '../types/dashboard';

interface AnalyticsProps {
  dashboardData: DashboardData;
  onClose: () => void;
}

export function Analytics({ dashboardData, onClose }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  const metrics = [
    { key: 'applications', label: 'Applications', color: 'blue', icon: BarChart3 },
    { key: 'responses', label: 'Responses', color: 'green', icon: TrendingUp },
    { key: 'interviews', label: 'Interviews', color: 'purple', icon: Calendar },
    { key: 'offers', label: 'Offers', color: 'orange', icon: TrendingUp }
  ];

  const selectedMetricInfo = metrics.find(m => m.key === selectedMetric);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                <p className="text-blue-100">Comprehensive job search insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-white/50 focus:border-white/50"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last year</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metric</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric) => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedMetric === metric.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100 text-${metric.color}-600`}>
                      <metric.icon size={20} />
                    </div>
                    <span className="font-semibold text-gray-900">{metric.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className="text-sm text-gray-600">Total this {selectedPeriod}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Total {selectedMetricInfo?.label}</h4>
                  <p className="text-sm text-gray-600">This {selectedPeriod}</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {Math.floor(Math.random() * 100) + 20}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active metric</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Daily Average</h4>
                  <p className="text-sm text-gray-600">Per day</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {Math.floor(Math.random() * 10) + 2}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Consistent performance</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Growth Trend</h4>
                  <p className="text-sm text-gray-600">vs previous period</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-green-600">
                  +{Math.floor(Math.random() * 20) + 5}%
                </span>
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Positive trend</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMetricInfo?.label} Over Time
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Export Chart
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="h-64 flex items-end gap-2">
                {Array.from({ length: 30 }, (_, index) => {
                  const height = Math.floor(Math.random() * 80) + 20;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 hover:shadow-lg cursor-pointer bg-gradient-to-t ${
                          selectedMetric === 'applications' ? 'from-blue-500 to-blue-400' :
                          selectedMetric === 'responses' ? 'from-green-500 to-green-400' :
                          selectedMetric === 'interviews' ? 'from-purple-500 to-purple-400' :
                          'from-orange-500 to-orange-400'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`Day ${index + 1}: ${height}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Your application rate has <span className="font-semibold text-green-600">increased</span> by <span className="font-semibold">15%</span> this {selectedPeriod}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  You're averaging <span className="font-semibold">3</span> {selectedMetricInfo?.label.toLowerCase()} per day
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Consider <span className="font-semibold">maintaining</span> your current pace for better results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}