'use client';

import React, { useState, useEffect } from 'react';
import { Send, Paperclip, X, Wand2, Sparkles, RefreshCw, MessageSquare, FileText } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface EmailComposerAIProps {
  recipientEmail?: string;
  recipientName?: string;
  onSend?: (emailData: any) => void;
  onCancel?: () => void;
}

export default function EmailComposerAI({
  recipientEmail = '',
  recipientName = '',
  onSend,
  onCancel,
}: EmailComposerAIProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [to, setTo] = useState(recipientEmail);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  // Assistant states
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  
  // Template states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Load templates
  useEffect(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
        }
      } catch (e) {
        console.error('Error loading templates:', e);
      }
    }
  }, []);

  const handleSend = () => {
    if (onSend) {
      onSend({
        to,
        cc: cc ? cc.split(',').map(e => e.trim()) : [],
        bcc: bcc ? bcc.split(',').map(e => e.trim()) : [],
        subject,
        body,
        attachments,
      });
    }
  };

  const handleAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        setAttachments([...attachments, ...Array.from(files).map(f => f.name)]);
      }
    };
    input.click();
  };

  const generateFromPrompt = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedContent = `Dear ${recipientName || 'Recipient'},

${aiPrompt}

${'I hope this message finds you well. I wanted to reach out regarding the above matter and would appreciate your input.'.substring(0, 100)}

Thank you for your time and consideration.

Best regards,
[Your Name]`;
    
    setBody(generatedContent);
    setSubject(aiPrompt.substring(0, 50) + (aiPrompt.length > 50 ? '...' : ''));
    setAiPrompt('');
    setShowPromptInput(false);
    setIsGenerating(false);
  };

  const improveWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate improvement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const improved = body + '\n\n[Enhanced: This is an improved version with better clarity and professionalism.]';
    setBody(improved);
    setIsGenerating(false);
  };

  const generateSubject = async () => {
    setIsGenerating(true);
    
    // Simulate subject generation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSubject('Follow-up on Application - ' + recipientName || 'Hello');
    setIsGenerating(false);
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    // Extract variables from template
    const vars: string[] = [];
    const subjectVars = template.subject.match(/{{(\w+)}}/g) || [];
    const bodyVars = template.body.match(/{{(\w+)}}/g) || [];
    
    Array.from(new Set([...subjectVars, ...bodyVars])).forEach(v => {
      const varName = v.replace(/{{|}}/g, '');
      if (!vars.includes(varName)) vars.push(varName);
    });
    
    setVariableValues({});
    // If no variables, apply directly
    if (vars.length === 0) {
      applyTemplate(template, {});
    } else {
      // Show variable input modal by showing the template modal with variable inputs
    }
    setShowTemplateModal(true);
  };

  const applyTemplate = (template: any, values: Record<string, string>) => {
    let finalSubject = template.subject;
    let finalBody = template.body;
    
    // Replace all variables
    Object.keys(values).forEach(key => {
      finalSubject = finalSubject.replace(new RegExp(`{{${key}}}`, 'g'), values[key] || '');
      finalBody = finalBody.replace(new RegExp(`{{${key}}}`, 'g'), values[key] || '');
    });
    
    setSubject(finalSubject);
    setBody(finalBody);
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setVariableValues({});
  };

  const handleApplyTemplateWithVariables = () => {
    if (selectedTemplate) {
      applyTemplate(selectedTemplate, variableValues);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Toolbar */}
      <div 
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{
          background: colors.cardBackground,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttach}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.secondaryText;
            }}
            title="Attach File"
          >
            <Paperclip size={18} />
          </button>

          {/* Use Template Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="p-2 rounded-lg transition-colors flex items-center gap-2"
            style={{
              color: colors.primaryBlue,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgeInfoBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Use Email Template"
          >
            <FileText size={18} />
            <span className="text-xs font-medium">Template</span>
          </button>
          
          {/* Generate Button */}
          <button
            onClick={() => setShowPromptInput(true)}
            className="p-2 rounded-lg transition-colors flex items-center gap-2"
            style={{
              color: colors.badgePurpleText,
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.badgePurpleBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            title="Generate Email from Prompt"
          >
            <Sparkles size={18} />
            <span className="text-xs font-medium">Generate</span>
          </button>

          {/* Improve Email */}
          {body && (
            <button
              onClick={improveWithAI}
              disabled={isGenerating}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: colors.primaryBlue,
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = colors.badgeInfoBg;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Improve Email"
            >
              {isGenerating ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Wand2 size={18} />
              )}
            </button>
          )}

          {/* Generate Subject */}
          {!subject && (
            <button
              onClick={generateSubject}
              disabled={isGenerating}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                color: colors.successGreen,
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = colors.badgeSuccessBg;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Generate Subject"
            >
              {isGenerating ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <span className="text-xs font-semibold">Auto</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.secondaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.hoverBackground;
                e.currentTarget.style.color = colors.primaryText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
                e.currentTarget.style.color = colors.secondaryText;
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!to || !subject || !body}
            className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!(!to || !subject || !body)) {
                e.currentTarget.style.background = colors.primaryBlueHover || colors.primaryBlue;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>

      {/* Prompt Input Modal */}
      {showPromptInput && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPromptInput(false);
              setAiPrompt('');
            }
          }}
        >
          <div 
            className="rounded-lg shadow-xl w-full max-w-2xl p-6"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.primaryText }}>
              <Sparkles size={20} style={{ color: colors.badgePurpleText }} />
              Generate Email from Prompt
            </h3>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe what you want to write about... e.g., 'Follow up on my job application for the senior developer position'"
              rows={6}
              className="w-full px-3 py-2 rounded-lg resize-none transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPromptInput(false);
                  setAiPrompt('');
                }}
                className="flex-1 px-4 py-2 rounded-lg transition-colors font-medium"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.color = colors.secondaryText;
                }}
              >
                Cancel
              </button>
              <button
                onClick={generateFromPrompt}
                disabled={!aiPrompt.trim() || isGenerating}
                className="flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                style={{
                  background: colors.badgePurpleText,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  if (!(!aiPrompt.trim() || isGenerating)) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: colors.background }}>
        <div className="p-6 space-y-4">
          {/* To */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>To *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email"
              required
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>CC</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc1@example.com, cc2@example.com"
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* BCC */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>BCC</label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc1@example.com, bcc2@example.com"
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              className="w-full px-3 py-2 rounded-lg transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>Attachments</label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                  >
                    <Paperclip size={14} />
                    <span>{file}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="ml-2 transition-colors"
                      style={{ color: colors.errorRed }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>Body *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email... Click the sparkles icon for suggestions!"
              required
              rows={12}
              className="w-full px-3 py-2 rounded-lg resize-none font-mono text-sm transition-colors"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.borderFocused;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border;
              }}
            />
            <p className="text-xs mt-2" style={{ color: colors.secondaryText }}>
              💡 Tip: Use buttons above for smart suggestions, improvement, and subject generation
            </p>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTemplateModal(false);
            }
          }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{
                    background: colors.badgeInfoBg,
                    color: colors.badgeInfoText,
                  }}
                >
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>Select Email Template</h3>
                  <p className="text-sm" style={{ color: colors.secondaryText }}>Choose a template to use in your email</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: colors.secondaryText,
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.primaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.secondaryText;
                }}
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-4 rounded-lg cursor-pointer transition-all border"
                  style={{
                    background: colors.inputBackground,
                    borderColor: colors.border,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                    e.currentTarget.style.background = colors.hoverBackground;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: colors.primaryText }}>{template.name}</h4>
                    {template.isCustom && (
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: colors.badgePurpleBg,
                          color: colors.badgePurpleText,
                        }}
                      >
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: colors.secondaryText }}>{template.category}</p>
                  <p className="text-sm truncate mb-1" style={{ color: colors.primaryText }}>{template.subject}</p>
                  <p className="text-xs line-clamp-2" style={{ color: colors.secondaryText }}>{template.body}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: colors.tertiaryText }}>
                    <MessageSquare size={12} />
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4" style={{ color: colors.tertiaryText }} />
                <p className="mb-2" style={{ color: colors.secondaryText }}>No templates available</p>
                <p className="text-sm" style={{ color: colors.tertiaryText }}>Create templates in the Templates tab</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

