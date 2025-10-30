import React, { useState } from 'react';
import { X, Sparkles, Wand2, FileText, Clock, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const colors = theme.colors;
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
    ],
    custom: [
      "List of professional certifications and licenses with dates",
      "Awards and recognitions received in my career",
      "Publications and articles written or contributed to",
      "Languages spoken with proficiency levels",
      "Volunteer experience and community involvement"
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-lg shadow-xl pointer-events-auto" 
        style={{ 
          background: theme.mode === 'light' ? '#ffffff' : colors.cardBackground,
          border: `1px solid ${theme.mode === 'light' ? '#e5e7eb' : colors.border}`,
          boxShadow: theme.mode === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgePurpleText }}
            >
              <Sparkles className="text-white" size={18} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
              AI Generate {aiGenerateSection.charAt(0).toUpperCase() + aiGenerateSection.slice(1)}
            </h2>
          </div>
          <button
            onClick={() => setShowAIGenerateModal(false)}
            className="p-1 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Prompt Input Box - FIRST */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
              Describe what you want to generate
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={`Describe your ${aiGenerateSection}...`}
              className="w-full rounded-lg px-3 py-2 h-20 focus:outline-none resize-none transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.badgeInfoBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Tone and Length with Icons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Palette size={14} style={{ color: colors.tertiaryText }} />
                Style
              </label>
              <div className="flex gap-1">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setWritingTone(option.value)}
                    className="flex-1 p-2 rounded-lg border transition-colors text-sm"
                    style={{
                      background: writingTone === option.value ? colors.badgeInfoBg : colors.inputBackground,
                      border: `1px solid ${writingTone === option.value ? colors.badgeInfoBorder : colors.border}`,
                      color: writingTone === option.value ? colors.badgeInfoText : colors.secondaryText,
                    }}
                    onMouseEnter={(e) => {
                      if (writingTone !== option.value) {
                        e.currentTarget.style.background = colors.hoverBackground;
                        e.currentTarget.style.borderColor = colors.borderFocused;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (writingTone !== option.value) {
                        e.currentTarget.style.background = colors.inputBackground;
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
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
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
                <Clock size={14} style={{ color: colors.tertiaryText }} />
                Length
              </label>
              <div className="flex gap-1">
                {lengthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setContentLength(option.value)}
                    className="flex-1 p-2 rounded-lg border transition-colors text-sm"
                    style={{
                      background: contentLength === option.value ? colors.badgeInfoBg : colors.inputBackground,
                      border: `1px solid ${contentLength === option.value ? colors.badgeInfoBorder : colors.border}`,
                      color: contentLength === option.value ? colors.badgeInfoText : colors.secondaryText,
                    }}
                    onMouseEnter={(e) => {
                      if (contentLength !== option.value) {
                        e.currentTarget.style.background = colors.hoverBackground;
                        e.currentTarget.style.borderColor = colors.borderFocused;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (contentLength !== option.value) {
                        e.currentTarget.style.background = colors.inputBackground;
                        e.currentTarget.style.borderColor = colors.border;
                      }
                    }}
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
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.primaryText }}>
              <FileText size={14} style={{ color: colors.tertiaryText }} />
              Quick templates
            </label>
            <div className="space-y-2">
              {(quickPrompts as any)[aiGenerateSection]?.map((prompt: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full p-3 text-left text-sm rounded-lg border transition-colors"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.secondaryText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackground;
                    e.currentTarget.style.borderColor = colors.borderFocused;
                    e.currentTarget.style.color = colors.primaryText;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBackground;
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.secondaryText;
                  }}
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
              className="flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              style={{
                background: (!aiPrompt.trim() || isGenerating) ? colors.inputBackground : colors.badgePurpleText,
                color: (!aiPrompt.trim() || isGenerating) ? colors.tertiaryText : 'white',
                opacity: (!aiPrompt.trim() || isGenerating) ? 0.5 : 1,
                cursor: (!aiPrompt.trim() || isGenerating) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (aiPrompt.trim() && !isGenerating) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (aiPrompt.trim() && !isGenerating) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
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
              className="px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                background: colors.inputBackground,
                color: colors.secondaryText,
                border: `1px solid ${colors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackgroundStrong;
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
