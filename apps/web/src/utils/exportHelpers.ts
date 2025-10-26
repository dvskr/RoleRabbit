/**
 * Export helpers for Job Tracker
 * Supports CSV and Excel (XLSX) exports
 */

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  filename?: string;
  data: any[];
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string = 'export') {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle commas, quotes, and newlines in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format (XLSX)
 * Note: Requires xlsx library - this is a placeholder implementation
 */
export function exportToXLSX(data: any[], filename: string = 'export') {
  // For now, we'll fall back to CSV until xlsx library is installed
  console.warn('XLSX export requires xlsx library. Falling back to CSV.');
  exportToCSV(data, filename);
  
  // TODO: Install xlsx library and implement:
  // import * as XLSX from 'xlsx';
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
  // XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string = 'export') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function with format selection
 */
export function exportData(options: ExportOptions) {
  const { format, data, filename } = options;
  const defaultFilename = 'jobs-export';

  switch (format) {
    case 'csv':
      exportToCSV(data, filename || defaultFilename);
      break;
    case 'xlsx':
      exportToXLSX(data, filename || defaultFilename);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
}
