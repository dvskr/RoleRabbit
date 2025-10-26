import React from 'react';
import { X, Upload, FileText, Link } from 'lucide-react';

interface ImportModalProps {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  importMethod: string;
  setImportMethod: (method: string) => void;
  importJsonData: string;
  setImportJsonData: (data: string) => void;
  onImport: () => void;
}

export default function ImportModal({
  showImportModal,
  setShowImportModal,
  importMethod,
  setImportMethod,
  importJsonData,
  setImportJsonData,
  onImport
}: ImportModalProps) {
  if (!showImportModal) return null;

  const importMethods = [
    { value: 'file', label: 'Upload File', icon: FileText, desc: 'Upload a resume file' },
    { value: 'linkedin', label: 'LinkedIn Profile', icon: Link, desc: 'Import from LinkedIn' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div className="absolute top-20 right-4 bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ 
        position: 'absolute', 
        top: '5rem', 
        right: '1rem',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Upload className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Import Resume</h2>
          </div>
          <button
            onClick={() => setShowImportModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl  duration-200 group"
          >
            <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Import Method
            </label>
            <div className="grid grid-cols-1 gap-3">
              {importMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    onClick={() => setImportMethod(method.value)}
                    className={`p-4 rounded-xl border-2  duration-200 text-left ${
                      importMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        importMethod === method.value ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        <IconComponent 
                          size={18} 
                          className={importMethod === method.value ? 'text-white' : 'text-gray-600'} 
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onImport}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/30  duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <Upload size={18} />
              Import Resume
            </button>
            <button
              onClick={() => setShowImportModal(false)}
              className="flex-1 bg-gray-100/80 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200/80 hover:shadow-md  duration-200 font-semibold border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}