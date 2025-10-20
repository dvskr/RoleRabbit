import React from 'react';
import { Download, X, FileText, Eye, Printer, Share2, CheckCircle, AlertCircle, Info, Search, ArrowRight } from 'lucide-react';

// Export Modal Component
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  resumeElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, resumeData, resumeElement }) => {
  if (!isOpen) return null;

  const exportToPDF = () => {
    // Simple PDF export simulation
    alert('PDF export functionality would be implemented here');
  };

  const exportToWord = () => {
    // Simple Word export simulation
    alert('Word export functionality would be implemented here');
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_${resumeData.name?.replace(/\s+/g, '_') || 'resume'}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printResume = () => {
    if (resumeElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Resume - ${resumeData.name || 'Resume'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .resume-content { max-width: 800px; margin: 0 auto; }
              </style>
            </head>
            <body>
              <div class="resume-content">
                ${resumeElement.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Export Resume
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <FileText size={24} className="text-red-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">PDF</h4>
              <p className="text-sm text-gray-600">Download as PDF</p>
            </div>
          </button>

          <button
            onClick={exportToWord}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Word</h4>
              <p className="text-sm text-gray-600">Download as DOCX</p>
            </div>
          </button>

          <button
            onClick={exportToJSON}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Download size={24} className="text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">JSON</h4>
              <p className="text-sm text-gray-600">Download as JSON</p>
            </div>
          </button>

          <button
            onClick={printResume}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Printer size={24} className="text-purple-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Print</h4>
              <p className="text-sm text-gray-600">Print resume</p>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Export Tips</h4>
              <p className="text-sm text-blue-700 mt-1">
                For best results, use PDF for online applications and Word for email attachments. 
                JSON format preserves all formatting and can be imported back into RoleReady.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Modal Component
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  highlightText: (text: string, query: string) => string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  highlightText 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search Resume
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search through your resume..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchQuery.trim() ? (
            searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ArrowRight size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          Found in: <span className="font-medium">{result.path}</span>
                        </p>
                        <p 
                          className="text-gray-900"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(result.value, searchQuery) 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Start typing to search through your resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Toast Component
interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
      <div className={`${getBgColor()} border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
