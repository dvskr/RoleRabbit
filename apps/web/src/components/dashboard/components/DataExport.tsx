'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Filter, CheckCircle, X } from 'lucide-react';
import { DashboardData } from '../types/dashboard';

interface DataExportProps {
  dashboardData: DashboardData;
  onClose: () => void;
}

export function DataExport({ dashboardData, onClose }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');
  const [includeData, setIncludeData] = useState({
    activities: true,
    todos: true,
    metrics: true,
    alerts: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const formatOptions = [
    {
      value: 'pdf' as const,
      label: 'PDF Report',
      description: 'Professional dashboard summary',
      icon: FileText,
      color: 'text-red-600 bg-red-100'
    },
    {
      value: 'csv' as const,
      label: 'CSV Data',
      description: 'Raw data for analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600 bg-green-100'
    },
    {
      value: 'json' as const,
      label: 'JSON Export',
      description: 'Complete data structure',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  const dateRangeOptions = [
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'quarter', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const filterDataByDateRange = (data: any[], dateRange: string) => {
    if (dateRange === 'all') return data;
    
    const now = new Date();
    const daysBack = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return data.filter(item => {
      const itemDate = item.timestamp || item.dueDate || item.lastUpdated;
      return itemDate && new Date(itemDate) >= cutoffDate;
    });
  };

  const generateExportData = () => {
    const exportData: any = {
      exportDate: new Date().toISOString(),
      dateRange,
      format: exportFormat,
      data: {}
    };

    if (includeData.activities) {
      exportData.data.activities = filterDataByDateRange(dashboardData.activities, dateRange);
    }
    if (includeData.todos) {
      exportData.data.todos = filterDataByDateRange(dashboardData.todos, dateRange);
    }
    if (includeData.metrics) {
      exportData.data.metrics = dashboardData.metrics;
    }
    if (includeData.alerts) {
      exportData.data.alerts = filterDataByDateRange(dashboardData.alerts, dateRange);
    }

    return exportData;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = generateExportData();
      
      if (exportFormat === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roleready-dashboard-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(exportData);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roleready-dashboard-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll generate a summary report
        const pdfContent = generatePDFContent(exportData);
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roleready-dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any) => {
    let csv = 'Type,Title,Description,Date,Status,Priority\n';
    
    if (data.data.activities) {
      data.data.activities.forEach((activity: any) => {
        csv += `Activity,"${activity.title}","${activity.description}",${activity.timestamp},${activity.status},${activity.priority}\n`;
      });
    }
    
    if (data.data.todos) {
      data.data.todos.forEach((todo: any) => {
        csv += `Todo,"${todo.title}","${todo.description}",${todo.dueDate || ''},${todo.isCompleted ? 'Completed' : 'Pending'},${todo.priority}\n`;
      });
    }
    
    return csv;
  };

  const generatePDFContent = (data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>RoleReady Dashboard Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RoleReady Dashboard Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>Date Range: ${dateRangeOptions.find(opt => opt.value === dateRange)?.label}</p>
    </div>
    
    <div class="section">
        <h2>Summary Metrics</h2>
        <div class="metric">Total Applications: ${data.data.metrics?.totalApplications || 0}</div>
        <div class="metric">Response Rate: ${data.data.metrics?.responseRate || 0}%</div>
        <div class="metric">Interview Rate: ${data.data.metrics?.interviewRate || 0}%</div>
        <div class="metric">Offer Rate: ${data.data.metrics?.offerRate || 0}%</div>
    </div>
    
    ${data.data.activities ? `
    <div class="section">
        <h2>Recent Activities</h2>
        <table>
            <tr><th>Title</th><th>Type</th><th>Date</th><th>Status</th></tr>
            ${data.data.activities.map((activity: any) => 
                `<tr><td>${activity.title}</td><td>${activity.type}</td><td>${new Date(activity.timestamp).toLocaleDateString()}</td><td>${activity.status}</td></tr>`
            ).join('')}
        </table>
    </div>
    ` : ''}
    
    ${data.data.todos ? `
    <div class="section">
        <h2>To-Do Items</h2>
        <table>
            <tr><th>Title</th><th>Category</th><th>Due Date</th><th>Status</th></tr>
            ${data.data.todos.map((todo: any) => 
                `<tr><td>${todo.title}</td><td>${todo.category}</td><td>${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</td><td>${todo.isCompleted ? 'Completed' : 'Pending'}</td></tr>`
            ).join('')}
        </table>
    </div>
    ` : ''}
</body>
</html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Export Dashboard Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {exportComplete ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Complete!</h3>
              <p className="text-gray-600">Your dashboard data has been downloaded successfully.</p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Export Format</h3>
                <div className="grid grid-cols-1 gap-2">
                  {formatOptions.map((format) => (
                    <label
                      key={format.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        exportFormat === format.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="format"
                          value={format.value}
                          checked={exportFormat === format.value}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className={`p-2 rounded ${format.color}`}>
                          <format.icon size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{format.label}</div>
                          <div className="text-xs text-gray-600">{format.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Date Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dateRangeOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        dateRange === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={option.value}
                        checked={dateRange === option.value}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Include Data</h3>
                <div className="space-y-2">
                  {Object.entries(includeData).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setIncludeData(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!exportComplete && (
          <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Data
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
