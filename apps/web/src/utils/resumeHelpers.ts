import { ResumeData, CustomSection, SectionVisibility } from '../types/resume';

// Resume helper functions
export const resumeHelpers = {
  generateSmartFileName: (resumeData: ResumeData) => {
    return `${resumeData.name.replace(/\s+/g, '_')}_${resumeData.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 7)}`;
  },

  resetToDefault: () => {
    return {
      fontFamily: 'arial',
      fontSize: 'ats11pt',
      lineSpacing: 'normal',
      sectionSpacing: 'medium',
      margins: 'normal',
      headingStyle: 'bold',
      bulletStyle: 'disc'
    };
  },

  addCustomSection: (newSectionName: string, newSectionContent: string, customSections: CustomSection[], setCustomSections: (sections: CustomSection[]) => void, setSectionOrder: (order: string[]) => void, setSectionVisibility: (visibility: SectionVisibility) => void, setNewSectionName: (name: string) => void, setNewSectionContent: (content: string) => void, setShowAddSectionModal: (show: boolean) => void) => {
    if (!newSectionName.trim()) return;
    
    const newSection = {
      id: `custom-${Date.now()}`,
      name: newSectionName.trim(),
      content: newSectionContent.trim()
    };
    
    setCustomSections(prev => [...prev, newSection]);
    setSectionOrder(prev => [...prev, newSection.id]);
    setSectionVisibility(prev => ({ ...prev, [newSection.id]: true }));
    
    setNewSectionName('');
    setNewSectionContent('');
    setShowAddSectionModal(false);
  },

  deleteCustomSection: (id: string, customSections: CustomSection[], setCustomSections: (sections: CustomSection[]) => void, setSectionOrder: (order: string[]) => void, setSectionVisibility: (visibility: SectionVisibility) => void) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
    setSectionOrder(prev => prev.filter(s => s !== id));
    setSectionVisibility(prev => {
      const newVisibility = { ...prev };
      delete newVisibility[id];
      return newVisibility;
    });
  },

  updateCustomSection: (id: string, content: string, customSections: CustomSection[], setCustomSections: (sections: CustomSection[]) => void) => {
    setCustomSections(prev => 
      prev.map(s => s.id === id ? { ...s, content } : s)
    );
  },

  toggleSection: (section: string, sectionVisibility: SectionVisibility, setSectionVisibility: (visibility: SectionVisibility) => void) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  },

  moveSection: (index: number, direction: 'up' | 'down', sectionOrder: string[], setSectionOrder: (order: string[]) => void) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  },

  hideSection: (section: string, sectionVisibility: SectionVisibility, setSectionVisibility: (visibility: SectionVisibility) => void) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  },

  handleTemplateSelect: (template: string) => {
    if (template) {
      alert(`Template "${template}" selected! This would load the template in a real application.`);
    }
  },

  saveToHistory: (newData: ResumeData, history: ResumeData[], historyIndex: number, setHistory: (history: ResumeData[]) => void, setHistoryIndex: (index: number) => void) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  },

  undo: (history: ResumeData[], historyIndex: number, setHistoryIndex: (index: number) => void, setResumeData: (data: ResumeData) => void) => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  },

  redo: (history: ResumeData[], historyIndex: number, setHistoryIndex: (index: number) => void, setResumeData: (data: ResumeData) => void) => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setResumeData(history[newIndex]);
    }
  },

  saveResume: () => {
    alert('Resume saved successfully!');
  }
};
