'use client';

import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, TrendingUp, FileText, Sparkles, Target, X } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { logger } from '../../utils/logger';

interface ATSCheckerProps {
  resumeData: ResumeData;
  isOpen: boolean;
  onClose: () => void;
}

interface ATSResult {
  overallScore: number;
  categoryScores: {
    keywords: number;
    format: number;
    content: number;
    experience: number;
  };
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
}

export default function ATSChecker({ resumeData, isOpen, onClose }: ATSCheckerProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);

  const analyzeResume = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description to analyze against.');
      return;
    }

    setIsAnalyzing(true);
    logger.debug('Starting ATS analysis...');

    // Simulate API call - in production, this would call the backend
    setTimeout(() => {
      const mockResult: ATSResult = {
        overallScore: calculateATSScore(resumeData, jobDescription),
        categoryScores: {
          keywords: 85,
          format: 92,
          content: 78,
          experience: 90
        },
        strengths: [
          'Good keyword optimization in summary and experience sections',
          'Proper formatting and structure for ATS parsing',
          'Quantifiable achievements present',
          'Technical skills well-documented'
        ],
        improvements: [
          'Add more industry-specific keywords from job description',
          'Include more metrics and numbers in experience descriptions',
          'Expand skills section with more relevant technologies',
          'Consider adding a "Key Achievements" section'
        ],
        missingKeywords: extractMissingKeywords(jobDescription, resumeData)
      };

      setAtsResult(mockResult);
      setIsAnalyzing(false);
      logger.debug('ATS analysis complete:', mockResult);
    }, 1500);
  };

  const calculateATSScore = (data: ResumeData, jobDesc: string): number => {
    let score = 0;
    let totalChecks = 0;

    // Check keywords
    const keywords = extractKeywords(jobDesc);
    const resumeText = JSON.stringify(data).toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );
    score += (matchedKeywords.length / keywords.length) * 30;
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
    score += (presentSections.length / requiredSections.length) * 25;
    totalChecks += 25;

    // Check content quality (quantifiable achievements)
    const hasQuantifiableAchievements = data.experience?.some(exp => 
      exp.description?.match(/\d+%|\d+\+|\$\d+|saved|increased|decreased|managed/i)
    ) || false;
    score += hasQuantifiableAchievements ? 25 : 15;
    totalChecks += 25;

    // Check experience depth
    const hasExperience = data.experience && data.experience.length > 0;
    score += hasExperience ? 20 : 10;
    totalChecks += 20;

    return Math.round(score);
  };

  const extractKeywords = (jobDesc: string): string[] => {
    const commonKeywords = ['experience', 'skills', 'years', 'work', 'project', 'team', 'leadership', 'communication', 'technical', 'development', 'management', 'strategy'];
    const text = jobDesc.toLowerCase();
    return commonKeywords.filter(keyword => text.includes(keyword));
  };

  const extractMissingKeywords = (jobDesc: string, data: ResumeData): string[] => {
    const keywords = extractKeywords(jobDesc);
    const resumeText = JSON.stringify(data).toLowerCase();
    return keywords.filter(keyword => !resumeText.includes(keyword.toLowerCase())).slice(0, 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">ATS Score Checker</h3>
              <p className="text-sm text-gray-600">Analyze your resume against job requirements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Job Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here to analyze your resume against it..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 The more specific the job description, the better the analysis
          </p>
        </div>

        {/* Analyze Button */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={analyzeResume}
            disabled={!jobDescription.trim() || isAnalyzing}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              !jobDescription.trim() || isAnalyzing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="animate-spin" size={18} />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Target size={18} />
                Analyze Resume
              </span>
            )}
          </button>
        </div>

        {/* Results */}
        {atsResult && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Overall ATS Score</h4>
                  <p className="text-sm text-gray-600">Your resume's ATS compatibility</p>
                </div>
                <div className={`text-4xl font-bold px-6 py-4 rounded-xl ${getScoreColor(atsResult.overallScore)}`}>
                  {atsResult.overallScore}/100
                </div>
              </div>

              {/* Score Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${atsResult.overallScore}%` }}
                />
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Keywords</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{atsResult.categoryScores.keywords}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Format</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{atsResult.categoryScores.format}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Content</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{atsResult.categoryScores.content}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Experience</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{atsResult.categoryScores.experience}</div>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {atsResult.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-yellow-600" />
                <h4 className="text-lg font-semibold text-gray-900">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2">
                {atsResult.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            {atsResult.missingKeywords.length > 0 && (
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={20} className="text-red-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Missing Keywords</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {atsResult.missingKeywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  💡 Consider adding these keywords naturally in your resume sections
                </p>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
