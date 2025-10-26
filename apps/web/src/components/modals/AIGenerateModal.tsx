import React, { useState } from 'react';
import { X, Sparkles, Wand2, FileText, Clock, Palette } from 'lucide-react';

interface AIGenerateModalProps {
  showAIGenerateModal: boolean;
  setShowAIGenerateModal: (show: boolean) => void;
  aiGenerateSection: string;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  writingTone: string;
  setWritingTone: (tone: string) => void;
  contentLength: string;
  setContentLength: (length: string) => void;
  onGenerate: () => void;
}

export default function AIGenerateModal({
  showAIGenerateModal,
  setShowAIGenerateModal,
  aiGenerateSection,
  aiPrompt,
  setAiPrompt,
  writingTone,
  setWritingTone,
  contentLength,
  setContentLength,
  onGenerate
}: AIGenerateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!showAIGenerateModal) return null;

  const quickPrompts = {
    summary: [
      "Experienced software engineer with 5+ years in full-stack development",
      "Results-driven marketing professional with proven track record",
      "Dynamic sales executive with extensive B2B experience"
    ],
    experience: [
      "Led development of scalable web applications using React and Node.js",
      "Managed cross-functional teams and delivered projects on time",
      "Built client relationships resulting in 30% increase in satisfaction"
    ],
    projects: [
      "Built a full-stack e-commerce platform with payment integration",
      "Developed a cross-platform mobile app with real-time features",
      "Created data visualization dashboard for business intelligence"
    ],
    skills: [
      "Frontend: React, Vue.js, Angular, TypeScript, JavaScript",
      "Backend: Node.js, Python, Java, C#, Express.js",
      "Cloud: AWS, Azure, Docker, Kubernetes, CI/CD"
    ]
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'formal', label: 'Formal', icon: '🎩' }
  ];

  const lengthOptions = [
    { value: 'concise', label: 'Short', icon: '📝' },
    { value: 'detailed', label: 'Medium', icon: '📄' },
    { value: 'comprehensive', label: 'Long', icon: '📚' }
  ];

  const handleQuickPrompt = (prompt: string) => {
    setAiPrompt(prompt);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate();
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              AI Generate {aiGenerateSection.charAt(0).toUpperCase() + aiGenerateSection.slice(1)}
            </h2>
          </div>
          <button
            onClick={() => setShowAIGenerateModal(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Prompt Input Box - FIRST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to generate
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`Describe your ${aiGenerateSection}...`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Tone and Length with Icons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Palette size={14} className="text-gray-500" />
                Style
              </label>
              <div className="flex gap-1">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWritingTone(option.value)}
                    className={`flex-1 p-2 rounded-lg border transition-colors text-sm ${
                      writingTone === option.value
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="text-xs">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                Length
              </label>
              <div className="flex gap-1">
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentLength(option.value)}
                    className={`flex-1 p-2 rounded-lg border transition-colors text-sm ${
                      contentLength === option.value
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="text-xs">{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Examples - LAST */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={14} className="text-gray-500" />
              Quick templates
            </label>
            <div className="space-y-2">
              {(quickPrompts as any)[aiGenerateSection]?.map((prompt: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full p-3 text-left text-sm text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-gray-800 rounded-lg border border-gray-200 hover:border-purple-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  Generate
                </>
              )}
            </button>
            <button
              onClick={() => setShowAIGenerateModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
