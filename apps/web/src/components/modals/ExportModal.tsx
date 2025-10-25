import React from 'react';
import { X, Download, FileText, Printer } from 'lucide-react';
import { ResumeData, CustomSection } from '../../types/resume';

interface ExportModalProps {
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  resumeData: ResumeData;
  customSections: CustomSection[];
  resumeFileName: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  sectionSpacing: string;
  margins: string;
  headingStyle: string;
  bulletStyle: string;
  onExport: (format: string) => void;
}

export default function ExportModal({
  showExportModal,
  setShowExportModal,
  resumeData,
  customSections,
  resumeFileName,
  fontFamily,
  fontSize,
  lineSpacing,
  sectionSpacing,
  margins,
  headingStyle,
  bulletStyle,
  onExport
}: ExportModalProps) {
  if (!showExportModal) return null;

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
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Download className="text-white" size={18} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Export Resume</h2>
          </div>
          <button
            onClick={() => setShowExportModal(false)}
            className="p-2 hover:bg-gray-100 rounded-xl  duration-200 group"
          >
            <X size={18} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onExport('pdf')}
            className="group p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50  duration-300 hover:shadow-lg hover:shadow-red-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg group-hover:bg-red-600 transition-colors">
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Export as PDF</h3>
                <p className="text-sm text-gray-600">Professional document format</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onExport('word')}
            className="group p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50  duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                <FileText className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">Export as Word</h3>
                <p className="text-sm text-gray-600">Editable Microsoft Word document</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onExport('print')}
            className="group p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50  duration-300 hover:shadow-lg hover:shadow-gray-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500 rounded-lg group-hover:bg-gray-600 transition-colors">
                <Printer className="text-white" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 group-hover:text-gray-700 transition-colors">Print Resume</h3>
                <p className="text-sm text-gray-600">Send directly to printer</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
