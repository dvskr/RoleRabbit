'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { ResumeEditor, AIPanel } from '../../components/features';

export default function TestAllComponents() {
  // State management
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [previousSidebarState, setPreviousSidebarState] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMethod, setImportMethod] = useState('json');
  const [importJsonData, setImportJsonData] = useState('');

  // Resume data
  const [resumeFileName, setResumeFileName] = useState('My_Resume');
  
  // Formatting state
  const [fontFamily, setFontFamily] = useState('arial');
  const [fontSize, setFontSize] = useState('ats11pt');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [sectionSpacing, setSectionSpacing] = useState('medium');
  const [margins, setMargins] = useState('normal');
  const [headingStyle, setHeadingStyle] = useState('bold');
  const [bulletStyle, setBulletStyle] = useState('disc');
  
  const [resumeData, setResumeData] = useState({
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software engineer with 5+ years of experience...',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience: [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        duration: '2020 - Present',
        description: 'Led development of web applications...'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Bachelor of Computer Science',
        school: 'University of California',
        year: '2018'
      }
    ],
    projects: [],
    certifications: []
  });

  // Section management
  const [sectionOrder, setSectionOrder] = useState(['summary', 'skills', 'experience', 'education', 'projects', 'certifications']);
  const [sectionVisibility, setSectionVisibility] = useState({
    summary: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true
  });
  const [customSections, setCustomSections] = useState([]);

  // AI Panel state
  const [aiMode, setAiMode] = useState('tailor');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [showATSScore, setShowATSScore] = useState(false);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [tailorEditMode, setTailorEditMode] = useState('partial');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('concise');
  const [aiConversation, setAiConversation] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');

  // Mock functions
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarCollapsed(tab === 'editor');
  };

  const toggleSection = (section: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const generateSmartFileName = () => {
    return `${resumeData.name.replace(/\s+/g, '_')}_${resumeData.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 7)}`;
  };

  const resetToDefault = () => {
    setFontFamily('arial');
    setFontSize('ats11pt');
    setLineSpacing('normal');
    setSectionSpacing('medium');
    setMargins('normal');
    setHeadingStyle('bold');
    setBulletStyle('disc');
  };

  const addCustomSection = () => {
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
  };

  const deleteCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
    setSectionOrder(prev => prev.filter(s => s !== id));
    setSectionVisibility(prev => {
      const newVisibility = { ...prev };
      delete newVisibility[id];
      return newVisibility;
    });
  };

  const updateCustomSection = (id: string, content: string) => {
    setCustomSections(prev => 
      prev.map(s => s.id === id ? { ...s, content } : s)
    );
  };

  const exportResume = (format: string) => {
    const exportData = {
      resumeData,
      customSections,
      sectionOrder,
      sectionVisibility,
      formatting: {
        fontFamily,
        fontSize,
        lineSpacing,
        sectionSpacing,
        margins,
        headingStyle,
        bulletStyle
      },
      fileName: resumeFileName
    };

    switch (format) {
      case 'pdf':
        // In a real app, you'd generate PDF here
        console.log('Exporting as PDF:', exportData);
        alert('PDF export would be implemented here');
        break;
      case 'word':
        // In a real app, you'd generate DOCX here
        console.log('Exporting as Word:', exportData);
        alert('Word export would be implemented here');
        break;
      case 'json':
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${resumeFileName}.json`;
        link.click();
        URL.revokeObjectURL(url);
        break;
      case 'print':
        window.print();
        break;
    }
    setShowExportModal(false);
  };

  const importResume = () => {
    if (importMethod === 'json' && importJsonData.trim()) {
      try {
        const data = JSON.parse(importJsonData);
        if (data.resumeData) setResumeData(data.resumeData);
        if (data.customSections) setCustomSections(data.customSections);
        if (data.sectionOrder) setSectionOrder(data.sectionOrder);
        if (data.sectionVisibility) setSectionVisibility(data.sectionVisibility);
        if (data.formatting) {
          if (data.formatting.fontFamily) setFontFamily(data.formatting.fontFamily);
          if (data.formatting.fontSize) setFontSize(data.formatting.fontSize);
          if (data.formatting.lineSpacing) setLineSpacing(data.formatting.lineSpacing);
          if (data.formatting.sectionSpacing) setSectionSpacing(data.formatting.sectionSpacing);
          if (data.formatting.margins) setMargins(data.formatting.margins);
          if (data.formatting.headingStyle) setHeadingStyle(data.formatting.headingStyle);
          if (data.formatting.bulletStyle) setBulletStyle(data.formatting.bulletStyle);
        }
        if (data.fileName) setResumeFileName(data.fileName);
        alert('Resume imported successfully!');
      } catch (error) {
        alert('Invalid JSON format. Please check your data.');
      }
    } else if (importMethod === 'file') {
      alert('File upload would be implemented here');
    } else if (importMethod === 'linkedin') {
      alert('LinkedIn import would be implemented here');
    }
    setShowImportModal(false);
    setImportJsonData('');
  };

  const loadSampleJson = () => {
    const sampleData = {
      resumeData: {
        name: "John Doe",
        title: "Software Engineer",
        email: "john@example.com",
        phone: "(555) 123-4567",
        summary: "Experienced software engineer with 5+ years of experience...",
        skills: ["JavaScript", "React", "Node.js", "Python"],
        experience: [
          {
            id: "1",
            position: "Senior Software Engineer",
            company: "Tech Corp",
            duration: "2020 - Present",
            description: "Led development of web applications..."
          }
        ],
        education: [
          {
            id: "1",
            degree: "Bachelor of Computer Science",
            school: "University of Technology",
            year: "2018"
          }
        ]
      },
      customSections: [],
      sectionOrder: ["summary", "skills", "experience", "education"],
      sectionVisibility: {
        summary: true,
        skills: true,
        experience: true,
        education: true
      },
      formatting: {
        fontFamily: "arial",
        fontSize: "ats11pt",
        lineSpacing: "normal",
        sectionSpacing: "medium",
        margins: "normal",
        headingStyle: "bold",
        bulletStyle: "disc"
      },
      fileName: "Sample_Resume"
    };
    setImportJsonData(JSON.stringify(sampleData, null, 2));
  };

  const renderSection = (section: string) => {
    if (!sectionVisibility[section]) return null;

    // Handle custom sections
    const customSection = customSections.find(s => s.id === section);
    if (customSection) {
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">{customSection.name.toUpperCase()}</h3>
            <button 
              onClick={() => deleteCustomSection(customSection.id)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete Section"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <textarea
            value={customSection.content}
            onChange={(e) => updateCustomSection(customSection.id, e.target.value)}
            className="w-full h-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
            placeholder={`Add your ${customSection.name.toLowerCase()} content here...`}
          />
        </div>
      );
    }

    switch (section) {
      case 'summary':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">SUMMARY</h3>
            <textarea
              value={resumeData.summary}
              onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full h-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
              placeholder="Write a compelling summary..."
            />
          </div>
        );
      case 'skills':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">SKILLS</h3>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'experience':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">EXPERIENCE</h3>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                <p className="text-gray-700 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        );
      case 'education':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">EDUCATION</h3>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
                <p className="text-gray-600">{edu.school} • {edu.year}</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const analyzeJobDescription = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setMatchScore(85);
      setShowATSScore(true);
      setMatchedKeywords(['JavaScript', 'React', 'Node.js']);
      setMissingKeywords(['TypeScript', 'AWS']);
      setAiRecommendations([
        'Add TypeScript to your skills section',
        'Include AWS experience in your experience section',
        'Update your summary to mention cloud technologies'
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const applyAIRecommendations = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, 'TypeScript', 'AWS']
    }));
    setAiRecommendations(null);
  };

  const sendAIMessage = () => {
    if (!aiPrompt.trim()) return;
    
    const newMessage = { role: 'user', text: aiPrompt };
    setAiConversation(prev => [...prev, newMessage]);
    setAiPrompt('');
    
    setTimeout(() => {
      const aiResponse = { role: 'assistant', text: 'I can help you improve your resume. What specific section would you like to work on?' };
      setAiConversation(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onShowUserProfile={() => setShowUserProfile(true)}
        onShowNewResumeModal={() => setShowNewResumeModal(true)}
        onShowImportModal={() => setShowImportModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'editor' && (
          <>
            <Header
              isMobile={false}
              isSaving={false}
              canUndo={true}
              canRedo={true}
              showRightPanel={showRightPanel}
              previousSidebarState={previousSidebarState}
              sidebarCollapsed={sidebarCollapsed}
              onExport={() => setShowExportModal(true)}
              onUndo={() => console.log('Undo clicked')}
              onRedo={() => console.log('Redo clicked')}
              onImport={() => setShowImportModal(true)}
              onSave={() => console.log('Save clicked')}
              onToggleAIPanel={() => setShowRightPanel(!showRightPanel)}
              onShowMobileMenu={() => setShowMobileMenu(true)}
              setPreviousSidebarState={setPreviousSidebarState}
              setSidebarCollapsed={setSidebarCollapsed}
              setShowRightPanel={setShowRightPanel}
            />
            <ResumeEditor
              resumeFileName={resumeFileName}
              setResumeFileName={setResumeFileName}
              sectionOrder={sectionOrder}
              sectionVisibility={sectionVisibility}
              customSections={customSections}
              resumeData={resumeData}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={setFontSize}
              lineSpacing={lineSpacing}
              setLineSpacing={setLineSpacing}
              sectionSpacing={sectionSpacing}
              setSectionSpacing={setSectionSpacing}
              margins={margins}
              setMargins={setMargins}
              headingStyle={headingStyle}
              setHeadingStyle={setHeadingStyle}
              bulletStyle={bulletStyle}
              setBulletStyle={setBulletStyle}
              onToggleSection={toggleSection}
              onMoveSection={moveSection}
              onShowAddSectionModal={() => setShowAddSectionModal(true)}
              onDeleteCustomSection={deleteCustomSection}
              onUpdateCustomSection={updateCustomSection}
              onGenerateSmartFileName={generateSmartFileName}
              onResetToDefault={resetToDefault}
              renderSection={renderSection}
            />
          </>
        )}
      </div>

      {/* AI Panel */}
      <AIPanel
        showRightPanel={showRightPanel}
        setShowRightPanel={setShowRightPanel}
        aiMode={aiMode}
        setAiMode={setAiMode}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        isAnalyzing={isAnalyzing}
        matchScore={matchScore}
        showATSScore={showATSScore}
        setShowATSScore={setShowATSScore}
        matchedKeywords={matchedKeywords}
        missingKeywords={missingKeywords}
        aiRecommendations={aiRecommendations}
        setAiRecommendations={setAiRecommendations}
        tailorEditMode={tailorEditMode}
        setTailorEditMode={setTailorEditMode}
        selectedTone={selectedTone}
        setSelectedTone={setSelectedTone}
        selectedLength={selectedLength}
        setSelectedLength={setSelectedLength}
        aiConversation={aiConversation}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        isMobile={false}
        onAnalyzeJobDescription={analyzeJobDescription}
        onApplyAIRecommendations={applyAIRecommendations}
        onSendAIMessage={sendAIMessage}
      />

      {/* Add Custom Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add Custom Section</h3>
              <button 
                onClick={() => setShowAddSectionModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Portfolio, Awards, Languages..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Content (Optional)
                </label>
                <textarea
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder="Add some initial content for this section..."
                  className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addCustomSection}
                disabled={!newSectionName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Resume Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Export Resume</h3>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* PDF */}
              <button
                onClick={() => exportResume('pdf')}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">PDF</h4>
                <p className="text-sm text-gray-600">Download as PDF</p>
              </button>

              {/* Word */}
              <button
                onClick={() => exportResume('word')}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Word</h4>
                <p className="text-sm text-gray-600">Download as DOCX</p>
              </button>

              {/* JSON */}
              <button
                onClick={() => exportResume('json')}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">JSON</h4>
                <p className="text-sm text-gray-600">Download as JSON</p>
              </button>

              {/* Print */}
              <button
                onClick={() => exportResume('print')}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-1">Print</h4>
                <p className="text-sm text-gray-600">Print resume</p>
              </button>
            </div>

            {/* Export Tips */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Export Tips</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• For best results, use PDF for online applications and Word for email attachments.</li>
                    <li>• JSON format preserves all formatting and can be imported back into RoleReady.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Resume Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-600">Import Resume</h3>
              <button 
                onClick={() => setShowImportModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Import Method Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* JSON File */}
              <button
                onClick={() => setImportMethod('json')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  importMethod === 'json' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2V4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4V6H20V4H4V6M20 8H4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8M6 10H8V12H6V10M10 10H12V12H10V10M14 10H16V12H14V10M6 14H8V16H6V14M10 14H12V16H10V14M14 14H16V16H14V14Z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">JSON File</h4>
                <p className="text-xs text-gray-600">Exported resume</p>
              </button>

              {/* Upload File */}
              <button
                onClick={() => setImportMethod('file')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  importMethod === 'file' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">Upload File</h4>
                <p className="text-xs text-gray-600">PDF, DOCX, TXT</p>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => setImportMethod('linkedin')}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  importMethod === 'linkedin' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">LinkedIn</h4>
                <p className="text-xs text-gray-600">Import profile</p>
              </button>
            </div>

            {/* JSON Data Input */}
            {importMethod === 'json' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Paste JSON Data</h4>
                  <button
                    onClick={loadSampleJson}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-all"
                  >
                    Load Sample
                  </button>
                </div>
                <textarea
                  value={importJsonData}
                  onChange={(e) => setImportJsonData(e.target.value)}
                  placeholder='{"resumeData": {...}, "customFields": [...], ...}'
                  className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm font-mono"
                />
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600">
                    Paste the JSON data from a previously exported resume file. Click "Load Sample" to see the format.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={importResume}
                disabled={importMethod === 'json' && !importJsonData.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
