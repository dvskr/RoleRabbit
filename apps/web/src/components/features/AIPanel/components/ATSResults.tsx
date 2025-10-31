import React from 'react';
import { FileText, CheckCircle, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { ATSAnalysisResult } from '../types/AIPanel.types';

interface ATSResultsProps {
  atsAnalysis: ATSAnalysisResult;
  beforeScore: number | null;
  afterScore: number | null;
}

export default function ATSResults({ atsAnalysis, beforeScore, afterScore }: ATSResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' };
    if (score >= 75) return { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' };
    if (score >= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-600', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-500' };
  };

  const beforeColor = beforeScore !== null ? getScoreColor(beforeScore) : null;
  const afterColor = afterScore !== null ? getScoreColor(afterScore) : null;
  const currentColor = getScoreColor(atsAnalysis.overall);

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Overall ATS Score</h4>
            <p className="text-xs text-gray-600">Your resume compatibility</p>
          </div>
          <div className="flex gap-3">
            {beforeScore !== null && (
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-0.5">Before</div>
                <div className={`text-2xl font-bold ${beforeColor?.text}`}>
                  {beforeScore}
                </div>
              </div>
            )}
            {afterScore !== null && (
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-0.5">After</div>
                <div className={`text-2xl font-bold ${afterColor?.text}`}>
                  {afterScore}
                </div>
              </div>
            )}
            {afterScore === null && (
              <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${currentColor.bg} ${currentColor.text}`}>
                {atsAnalysis.overall}/100
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${currentColor.bar}`}
            style={{ width: `${atsAnalysis.overall}%` }}
          ></div>
        </div>
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
  );
}

