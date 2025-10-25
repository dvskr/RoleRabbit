'use client';

import React, { useState } from 'react';
import { Plus, X, Sparkles, Bot } from 'lucide-react';
import { AIContextFormProps } from '../types/coverletter';

export default function AIContextForm({
  context,
  onContextChange,
  onGenerate,
  isGenerating
}: AIContextFormProps) {
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      onContextChange({
        keyPoints: [...context.keyPoints, newKeyPoint.trim()]
      });
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    onContextChange({
      keyPoints: context.keyPoints.filter((_, i) => i !== index)
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      onContextChange({
        skills: [...context.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    onContextChange({
      skills: context.skills.filter((_, i) => i !== index)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      onContextChange({
        achievements: [...context.achievements, newAchievement.trim()]
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    onContextChange({
      achievements: context.achievements.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Job Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={context.jobTitle}
            onChange={(e) => onContextChange({ jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            value={context.companyName}
            onChange={(e) => onContextChange({ companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Tech Corp"
          />
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
          <select
            value={context.industry}
            onChange={(e) => onContextChange({ industry: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="tech">Technology</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="retail">Retail</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Level</label>
          <select
            value={context.jobLevel}
            onChange={(e) => onContextChange({ jobLevel: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead</option>
            <option value="executive">Executive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
          <select
            value={context.experience}
            onChange={(e) => onContextChange({ experience: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="0-1">0-1 years</option>
            <option value="2-5">2-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>

      {/* Tone and Length */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
          <select
            value={context.tone}
            onChange={(e) => onContextChange({ tone: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Length</label>
          <select
            value={context.length}
            onChange={(e) => onContextChange({ length: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="short">Short (150-250 words)</option>
            <option value="medium">Medium (250-400 words)</option>
            <option value="long">Long (400+ words)</option>
          </select>
        </div>
      </div>

      {/* Key Points */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Key Points to Highlight</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyPoint}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a key point..."
            />
            <button
              onClick={addKeyPoint}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {context.keyPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                <span>{point}</span>
                <button
                  onClick={() => removeKeyPoint(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Relevant Skills</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a skill..."
            />
            <button
              onClick={addSkill}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {context.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm">
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(index)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Key Achievements</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add an achievement..."
            />
            <button
              onClick={addAchievement}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {context.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm">
                <span>{achievement}</span>
                <button
                  onClick={() => removeAchievement(index)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !context.jobTitle || !context.companyName}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles size={18} />
          {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>
    </div>
  );
}
