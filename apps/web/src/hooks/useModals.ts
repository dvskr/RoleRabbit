import { useState } from 'react';
import { CustomField } from '../types/resume';

// Modal state hook
export const useModals = () => {
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMethod, setImportMethod] = useState('json');
  const [importJsonData, setImportJsonData] = useState('');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('link');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [aiGenerateSection, setAiGenerateSection] = useState('summary');
  const [aiPrompt, setAiPrompt] = useState('');
  const [writingTone, setWritingTone] = useState('professional');
  const [contentLength, setContentLength] = useState('concise');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return {
    showNewResumeModal,
    setShowNewResumeModal,
    showAddSectionModal,
    setShowAddSectionModal,
    newSectionName,
    setNewSectionName,
    newSectionContent,
    setNewSectionContent,
    showExportModal,
    setShowExportModal,
    showImportModal,
    setShowImportModal,
    importMethod,
    setImportMethod,
    importJsonData,
    setImportJsonData,
    showAddFieldModal,
    setShowAddFieldModal,
    newFieldName,
    setNewFieldName,
    newFieldIcon,
    setNewFieldIcon,
    customFields,
    setCustomFields,
    showAIGenerateModal,
    setShowAIGenerateModal,
    aiGenerateSection,
    setAiGenerateSection,
    aiPrompt,
    setAiPrompt,
    writingTone,
    setWritingTone,
    contentLength,
    setContentLength,
    showMobileMenu,
    setShowMobileMenu
  };
};
