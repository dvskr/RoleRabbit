'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Target, Zap, CheckCircle, AlertCircle, Briefcase, Settings, Palette, Crown, BarChart3, FileText, Lightbulb, Shield, Star, TrendingUp, RefreshCw } from 'lucide-react';

interface AIPanelProps {
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  aiMode: string;
  setAiMode: (mode: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  isAnalyzing: boolean;
  matchScore: number;
  showATSScore: boolean;
  setShowATSScore: (show: boolean) => void;
  matchedKeywords: string[];
  missingKeywords: string[];
  aiRecommendations: string[];
  setAiRecommendations: (rec: string[]) => void;
  tailorEditMode: string;
  setTailorEditMode: (mode: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedLength: string;
  setSelectedLength: (length: string) => void;
  aiConversation: any[];
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isMobile: boolean;
  resumeData: any;
  onAnalyzeJobDescription: () => void;
  onApplyAIRecommendations: () => void;
  onSendAIMessage: () => void;
  onResumeUpdate?: (updatedData: any) => void;
}

export default function AIPanel({
  showRightPanel,
  setShowRightPanel,
  aiMode,
  setAiMode,
  jobDescription,
  setJobDescription,
  isAnalyzing,
  matchScore,
  showATSScore,
  setShowATSScore,
  matchedKeywords,
  missingKeywords,
  aiRecommendations,
  setAiRecommendations,
  tailorEditMode,
  setTailorEditMode,
  selectedTone,
  setSelectedTone,
  selectedLength,
  setSelectedLength,
  aiConversation,
  aiPrompt,
  setAiPrompt,
  selectedModel,
  setSelectedModel,
  isMobile,
  resumeData,
  onAnalyzeJobDescription,
  onApplyAIRecommendations,
  onSendAIMessage,
  onResumeUpdate
}: AIPanelProps) {
  
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const [showApplyButton, setShowApplyButton] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const handleClearAnalysis = () => {
    setAtsAnalysis(null);
    setBeforeScore(null);
    setAfterScore(null);
    setShowApplyButton(false);
    setIsApplied(false);
    setImprovedResumeData(null);
    setJobDescription('');
    setShowATSScore(false);
  };
  
  const handleATSAnalysis = () => {
    if (!jobDescription.trim() || !resumeData) return;
    
    const result = calculateATSScore(resumeData, jobDescription);
    setAtsAnalysis(result);
    setBeforeScore(result.overall);
    setShowATSScore(true);
    setShowApplyButton(true);
  };
  
  const handleApplyImprovements = () => {
    if (!resumeData || isApplying) return;
    
    setIsApplying(true);
    
    // Mock AI improvements - in real implementation, this would call an AI API
    setTimeout(() => {
      const improvedData = generateImprovedResume(resumeData, jobDescription, atsAnalysis);
      setImprovedResumeData(improvedData);
      
      // Calculate after score
      const afterResult = calculateATSScore(improvedData, jobDescription);
      setAfterScore(afterResult.overall);
      setIsApplying(false);
      setIsApplied(true);
      
      // Apply the improvements to the resume
      onApplyAIRecommendations();
      onResumeUpdate?.(improvedData);
    }, 1500);
  };
  
  const generateImprovedResume = (data: any, jobDesc: string, analysis: any): any => {
    const improved = JSON.parse(JSON.stringify(data));
    
    // Add missing keywords to summary
    if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
      const missingKeywordsText = analysis.missingKeywords.join(', ');
      improved.summary = `${improved.summary}\n\nKey skills: ${missingKeywordsText}`;
    }
    
    // Enhance experience with keywords
    if (improved.experience && improved.experience.length > 0) {
      improved.experience = improved.experience.map((exp: any) => {
        const enhancedDescription = `${exp.description}\n\n${analysis.improvements?.join('. ')}`;
        return { ...exp, description: enhancedDescription };
      });
    }
    
    return improved;
  };
  
  if (!showRightPanel) return null;

  const toneOptions = [
    { id: 'professional', name: 'Professional', icon: Briefcase, description: 'Formal and polished', color: 'text-amber-600' },
    { id: 'technical', name: 'Technical', icon: Settings, description: 'Detailed and precise', color: 'text-gray-600' },
    { id: 'creative', name: 'Creative', icon: Palette, description: 'Dynamic and engaging', color: 'text-pink-600' },
    { id: 'executive', name: 'Executive', icon: Crown, description: 'Strategic and leadership-focused', color: 'text-blue-600' },
    { id: 'results', name: 'Results', icon: BarChart3, description: 'Metrics and impact-focused', color: 'text-green-600' }
  ];

  const lengthOptions = [
    { id: 'concise', name: 'Concise', description: 'Short and punchy' },
    { id: 'medium', name: 'Medium', description: 'Balanced detail' },
    { id: 'detailed', name: 'Detailed', description: 'Full detail' }
  ];

  const quickActions = [
    { name: 'Write Summary', icon: FileText },
    { name: 'Suggest Skills', icon: Lightbulb },
    { name: 'Make it ATS-friendly', icon: Shield },
    { name: 'Optimize for [job title]', icon: Target },
    { name: 'Improve Bullets', icon: Star },
    { name: 'Review Resume', icon: CheckCircle },
    { name: 'Add Achievements', icon: TrendingUp },
    { name: 'Check for Errors', icon: AlertCircle }
  ];

  const calculateATSScore = (data: any, jobDesc: string): any => {
    let score = 0;
    let totalChecks = 0;

    // Check keywords
    const keywords = extractKeywords(jobDesc);
    const resumeText = JSON.stringify(data).toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );
    const keywordScore = (matchedKeywords.length / Math.max(keywords.length, 1)) * 30;
    score += keywordScore;
    totalChecks += 30;

    // Check format (sections present)
    const requiredSections = ['summary', 'experience', 'education', 'skills'];
    const presentSections = requiredSections.filter(section => {
      if (section === 'summary' && data.summary) return true;
      if (section === 'experience' && data.experience?.length > 0) return true;
      if (section === 'education' && data.education?.length > 0) return true;
      if (section === 'skills' && data.skills?.length > 0) return true;
      return false;
    });
    const formatScore = (presentSections.length / requiredSections.length) * 25;
    score += formatScore;
    totalChecks += 25;

    // Check content quality (quantifiable achievements)
    const hasQuantifiableAchievements = data.experience?.some((exp: any) => 
      exp.description?.match(/\d+%|\d+\+|\$\d+|saved|increased|decreased|managed/i)
    ) || false;
    const contentScore = hasQuantifiableAchievements ? 25 : 15;
    score += contentScore;
    totalChecks += 25;

    // Check experience depth
    const hasExperience = data.experience && data.experience.length > 0;
    const expScore = hasExperience ? 20 : 10;
    score += expScore;
    totalChecks += 20;

    return {
      overall: Math.round(score),
      keywords: Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100),
      format: Math.round((presentSections.length / requiredSections.length) * 100),
      content: Math.round((hasQuantifiableAchievements ? 100 : 60)),
      experience: Math.round(hasExperience ? 100 : 50),
      strengths: generateStrengths(data),
      improvements: generateImprovements(data, keywords),
      missingKeywords: extractMissingKeywords(jobDesc, data)
    };
  };

  const extractKeywords = (jobDesc: string): string[] => {
    const commonKeywords = ['experience', 'skills', 'years', 'work', 'project', 'team', 'leadership', 'communication', 'technical', 'development', 'management', 'strategy'];
    const text = jobDesc.toLowerCase();
    return commonKeywords.filter(keyword => text.includes(keyword));
  };

  const extractMissingKeywords = (jobDesc: string, data: any): string[] => {
    const keywords = extractKeywords(jobDesc);
    const resumeText = JSON.stringify(data).toLowerCase();
    return keywords.filter(keyword => !resumeText.includes(keyword.toLowerCase())).slice(0, 5);
  };

  const generateStrengths = (data: any): string[] => {
    const strengths = [];
    if (data.summary) strengths.push('Professional summary present');
    if (data.experience?.length > 0) strengths.push('Experience section well-documented');
    if (data.skills?.length > 0) strengths.push('Technical skills listed');
    if (data.education?.length > 0) strengths.push('Education credentials included');
    return strengths;
  };

  const generateImprovements = (data: any, keywords: string[]): string[] => {
    const improvements = [];
    improvements.push('Add more industry-specific keywords from job description');
    improvements.push('Include more quantifiable achievements with numbers');
    improvements.push('Expand technical skills section');
    improvements.push('Add metrics to experience descriptions');
    return improvements;
  };

  const aiModels = [
    { id: 'gpt-5', name: 'GPT-5', description: 'Latest OpenAI model with advanced reasoning', capabilities: ['multimodal', 'code-generation', 'creative-writing'] },
    { id: 'sonnet-4.5', name: 'Sonnet 4.5', description: 'Anthropic\'s latest model with enhanced safety', capabilities: ['safety', 'long-context', 'creative-writing'] },
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks', capabilities: ['text-generation', 'analysis', 'reasoning'] },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks', capabilities: ['text-generation', 'analysis'] },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic\'s most powerful model', capabilities: ['text-generation', 'analysis', 'reasoning'] }
  ];

  return (
    <div className={`h-full bg-white shadow-2xl z-40 ${isMobile ? 'w-full' : 'w-80'} border-l border-gray-100`}>
      <div className="h-full flex flex-col">
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-500">Resume Optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearAnalysis} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear analysis"
              >
                <RefreshCw size={18} className="text-gray-600" />
              </button>
              <button 
                onClick={() => setShowRightPanel(false)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* AI Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {aiModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-500">
                {aiModels.find(m => m.id === selectedModel)?.capabilities.join(', ')}
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <div className="flex bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setAiMode('tailor')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    aiMode === 'tailor' 
                      ? 'bg-white text-purple-700 shadow-sm border border-purple-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Target size={14} className="inline mr-1.5" />
                  Tailor for Job
                </button>
                <button
                  onClick={() => setAiMode('chat')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    aiMode === 'chat' 
                      ? 'bg-white text-purple-700 shadow-sm border border-purple-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Bot size={14} className="inline mr-1.5" />
                  AI Chat
                </button>
              </div>
            </div>

            {/* Tailor Mode Content */}
            {aiMode === 'tailor' && (
              <div className="space-y-6">
                {/* Job Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-28 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-sm"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {jobDescription.length} characters
                    </span>
                    <button
                      onClick={showApplyButton && !isApplied ? handleApplyImprovements : handleATSAnalysis}
                      disabled={(!jobDescription.trim() || isAnalyzing || !resumeData || isApplying) && !isApplied}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                        isApplied 
                          ? 'bg-green-600 text-white cursor-default' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <Shield size={14} />
                      {isApplied ? 'Applied' : isApplying ? 'Applying...' : isAnalyzing ? 'Analyzing...' : showApplyButton ? 'Apply Improvements' : 'Run ATS Check'}
                    </button>
                  </div>
                </div>

                {/* Detailed ATS Analysis */}
                {atsAnalysis && (
                  <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Overall ATS Score</h4>
                          <p className="text-xs text-gray-600">Your resume compatibility</p>
                        </div>
                        <div className="flex gap-3">
                          {/* Before Score */}
                          {beforeScore !== null && (
                            <div className="text-right">
                              <div className="text-xs text-gray-600 mb-0.5">Before</div>
                              <div className={`text-2xl font-bold ${
                                beforeScore >= 90 ? 'text-green-600' :
                                beforeScore >= 75 ? 'text-blue-600' :
                                beforeScore >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {beforeScore}
                              </div>
                            </div>
                          )}
                          {/* After Score */}
                          {afterScore !== null && (
                            <div className="text-right">
                              <div className="text-xs text-gray-600 mb-0.5">After</div>
                              <div className={`text-2xl font-bold ${
                                afterScore >= 90 ? 'text-green-600' :
                                afterScore >= 75 ? 'text-blue-600' :
                                afterScore >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {afterScore}
                              </div>
                            </div>
                          )}
                          {/* Current Score (when no after score) */}
                          {afterScore === null && (
                            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                              atsAnalysis.overall >= 90 ? 'bg-green-100 text-green-600' :
                              atsAnalysis.overall >= 75 ? 'bg-blue-100 text-blue-600' :
                              atsAnalysis.overall >= 60 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {atsAnalysis.overall}/100
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            atsAnalysis.overall >= 90 ? 'bg-green-500' :
                            atsAnalysis.overall >= 75 ? 'bg-blue-500' :
                            atsAnalysis.overall >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${atsAnalysis.overall}%` }}
                        ></div>
                      </div>
                      {/* Show improvement if after score exists */}
                      {afterScore !== null && beforeScore !== null && (
                        <div className="mt-2 text-center">
                          <span className={`text-xs font-medium ${
                            afterScore > beforeScore ? 'text-green-600' : 
                            afterScore < beforeScore ? 'text-red-600' : 
                            'text-gray-600'
                          }`}>
                            {afterScore > beforeScore ? `↑ +${afterScore - beforeScore} points` : 
                             afterScore < beforeScore ? `↓ ${afterScore - beforeScore} points` : 
                             'No change'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText size={14} className="text-blue-600" />
                          <span className="text-xs font-medium text-gray-700">Keywords</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">{atsAnalysis.keywords}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle size={14} className="text-green-600" />
                          <span className="text-xs font-medium text-gray-700">Format</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">{atsAnalysis.format}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp size={14} className="text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">Content</span>
                        </div>
                        <div className="text-xl font-bold text-purple-600">{atsAnalysis.content}</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target size={14} className="text-orange-600" />
                          <span className="text-xs font-medium text-gray-700">Experience</span>
                        </div>
                        <div className="text-xl font-bold text-orange-600">{atsAnalysis.experience}</div>
                      </div>
                    </div>

                    {/* Strengths */}
                    {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <h5 className="text-sm font-medium text-gray-900">Strengths</h5>
                        </div>
                        <ul className="space-y-1.5">
                          {atsAnalysis.strengths.slice(0, 3).map((strength: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                              <CheckCircle size={10} className="text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {atsAnalysis.improvements && atsAnalysis.improvements.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-yellow-600" />
                          <h5 className="text-sm font-medium text-gray-900">Improvements</h5>
                        </div>
                        <ul className="space-y-1.5">
                          {atsAnalysis.improvements.slice(0, 3).map((improvement: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                              <AlertCircle size={10} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {atsAnalysis.missingKeywords && atsAnalysis.missingKeywords.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-red-600" />
                          <h5 className="text-sm font-medium text-gray-900">Missing Keywords</h5>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {atsAnalysis.missingKeywords.slice(0, 6).map((keyword: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords Analysis */}
                {matchedKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs border border-green-200">
                          <CheckCircle size={10} className="inline mr-1" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {missingKeywords.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs border border-red-200">
                          <AlertCircle size={10} className="inline mr-1" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                {aiRecommendations && Array.isArray(aiRecommendations) && aiRecommendations.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      {aiRecommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-2 bg-white rounded-md border border-gray-100">
                          <p className="text-xs text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={onApplyAIRecommendations}
                        className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all"
                      >
                        Apply All
                      </button>
                      <button
                        onClick={() => setAiRecommendations([])}
                        className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Tailoring Mode Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Tailoring Mode</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTailorEditMode('partial')}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        tailorEditMode === 'partial' 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Partial Edit (ATS Optimization)</h5>
                      <p className="text-xs text-gray-600">Adds keywords, preserves original content</p>
                    </button>
                    <button
                      onClick={() => setTailorEditMode('full')}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${
                        tailorEditMode === 'full' 
                          ? 'border-purple-300 bg-purple-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Full Edit (Complete Tailoring)</h5>
                      <p className="text-xs text-gray-600">Rewrites sections to match job description</p>
                    </button>
                  </div>
                </div>

                {/* AI Writing Preferences */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">AI Writing Preferences</h4>
                  
                  {/* Tone Selection */}
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Tone</h5>
                    <div className="space-y-1.5">
                      {toneOptions.map((tone) => {
                        const IconComponent = tone.icon;
                        return (
                          <button
                            key={tone.id}
                            onClick={() => setSelectedTone(tone.id)}
                            className={`w-full p-2.5 rounded-lg border transition-all text-left ${
                              selectedTone === tone.id 
                                ? 'border-purple-300 bg-purple-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <IconComponent size={16} className={tone.color} />
                              <div>
                                <h6 className="text-sm font-medium text-gray-900">{tone.name}</h6>
                                <p className="text-xs text-gray-600">{tone.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Length Selection */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Content Length</h5>
                    <div className="space-y-1.5">
                      {lengthOptions.map((length) => (
                        <button
                          key={length.id}
                          onClick={() => setSelectedLength(length.id)}
                          className={`w-full p-2.5 rounded-lg border transition-all text-left ${
                            selectedLength === length.id 
                              ? 'border-purple-300 bg-purple-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <h6 className="text-sm font-medium text-gray-900">{length.name}</h6>
                          <p className="text-xs text-gray-600">{length.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Mode Content */}
            {aiMode === 'chat' && (
              <div className="space-y-4">
                {/* Initial AI Message */}
                {aiConversation.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-xs px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-800">
                      Hi! I'm your AI Resume Assistant. Tell me about your experience and I'll help you craft professional resume content. What position are you applying for?
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {aiConversation.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask me anything about your resume..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && onSendAIMessage()}
                  />
                  <button
                    onClick={onSendAIMessage}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-md transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickActions.map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <button 
                          key={index}
                          className="p-2 bg-gray-50 text-gray-700 rounded-md text-xs hover:bg-gray-100 transition-all text-left border border-gray-100"
                        >
                          <IconComponent size={12} className="inline mr-1.5" />
                          {action.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
