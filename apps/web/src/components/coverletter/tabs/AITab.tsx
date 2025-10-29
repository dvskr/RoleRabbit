'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, User, Mail, Phone, MapPin, Building, Eye, Download, Copy, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface AITabProps {
  content: string;
  setContent: (content: string) => void;
  title: string;
  setTitle: (title: string) => void;
  setWordCount: (count: number) => void;
  setActiveTab: (tab: 'templates' | 'ai' | 'custom' | 'preview') => void;
}

interface FormData {
  // Your Information
  fullName: string;
  email: string;
  phone: string;
  address: string;
  
  // Recipient Information
  hiringManagerName: string;
  title: string;
  companyName: string;
  companyAddress: string;
  
  // Letter Content
  positionApplyingFor: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraph1: string;
  bodyParagraph2: string;
  closingParagraph: string;
  closing: string;
}

export default function AITab({ content, setContent, title, setTitle, setWordCount, setActiveTab }: AITabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, San Francisco, CA 94102',
    hiringManagerName: 'Sarah Johnson',
    title: 'Hiring Manager',
    companyName: 'Tech Innovations Inc.',
    companyAddress: '456 Tech Avenue, San Francisco, CA 94103',
    positionApplyingFor: 'Senior Software Engineer',
    salutation: 'Dear Ms. Johnson,',
    openingParagraph: 'I am writing to express my strong interest in the Senior Software Engineer position at Tech Innovations Inc. With over 5 years of experience in full-stack development and a proven track record of delivering scalable solutions, I am excited about the opportunity to contribute to your innovative team.',
    bodyParagraph1: 'Throughout my career, I have specialized in React, Node.js, and cloud technologies, leading the development of microservices architecture that serves over 1 million users. At my current role at Tech Corp, I have successfully mentored a team of 5 junior developers while reducing API response times by 40% through strategic optimization. My technical expertise combined with my leadership abilities makes me an ideal candidate for this position.',
    bodyParagraph2: 'What particularly excites me about Tech Innovations Inc. is your commitment to pushing the boundaries of technology while maintaining a strong focus on user experience. I am impressed by your recent product launches and would love to bring my experience in building responsive web applications and implementing CI/CD pipelines to help drive your continued success.',
    closingParagraph: 'I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application. I look forward to speaking with you soon.',
    closing: 'Sincerely,'
  });

  // Generate full letter content from form data
  useEffect(() => {
    const fullContent = `${formData.openingParagraph}\n\n${formData.bodyParagraph1}\n\n${formData.bodyParagraph2}\n\n${formData.closingParagraph}\n\n${formData.closing}\n${formData.fullName}`;
    setContent(fullContent);
  }, [formData, setContent]);

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    return content.trim() === '' ? 0 : words.length;
  }, [content]);

  useEffect(() => {
    setWordCount(wordCount);
  }, [wordCount, setWordCount]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEnhanceWithAI = async () => {
    setIsGenerating(true);
    // Simulate AI enhancement
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In real implementation, this would call an AI API
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadPDF = () => {
    // In real implementation, this would generate and download a PDF
    console.log('Downloading PDF...');
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper component for form inputs
  const FormInput = ({ label, icon: Icon, value, onChange, placeholder, type = 'text' }: {
    label: string;
    icon?: React.ElementType;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: colors.primaryText }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2" 
            style={{ color: colors.tertiaryText }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 rounded-lg text-sm transition-all"
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
    </div>
  );

  // Helper component for form textareas
  const FormTextarea = ({ label, value, onChange, placeholder, rows = 4 }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
  }) => (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: colors.primaryText }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg text-sm transition-all resize-none"
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
  );

  return (
    <div className="flex gap-6 h-full p-6" style={{ height: '100%', overflow: 'hidden' }}>
      {/* Left Panel - Input Forms (60%) */}
      <div className="flex-1 flex flex-col pr-4" style={{ width: '60%', height: '100%', minHeight: 0 }}>
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2" style={{ minHeight: 0 }}>
          <div className="space-y-6">

          {/* Your Information */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.primaryText }}>
              Your Information
            </h3>
            <div className="space-y-4">
              <FormInput
                label="Full Name"
                icon={User}
                value={formData.fullName}
                onChange={(v) => updateFormData('fullName', v)}
                placeholder="John Doe"
              />
              <FormInput
                label="Email"
                icon={Mail}
                value={formData.email}
                onChange={(v) => updateFormData('email', v)}
                placeholder="john.doe@email.com"
                type="email"
              />
              <FormInput
                label="Phone"
                icon={Phone}
                value={formData.phone}
                onChange={(v) => updateFormData('phone', v)}
                placeholder="+1 (555) 123-4567"
              />
              <FormInput
                label="Address"
                icon={MapPin}
                value={formData.address}
                onChange={(v) => updateFormData('address', v)}
                placeholder="123 Main Street, San Francisco, CA 94102"
              />
            </div>
          </div>

          {/* Recipient Information */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.primaryText }}>
              Recipient Information
            </h3>
            <div className="space-y-4">
              <FormInput
                label="Hiring Manager Name"
                value={formData.hiringManagerName}
                onChange={(v) => updateFormData('hiringManagerName', v)}
                placeholder="Sarah Johnson"
              />
              <FormInput
                label="Title"
                value={formData.title}
                onChange={(v) => updateFormData('title', v)}
                placeholder="Hiring Manager"
              />
              <FormInput
                label="Company Name"
                icon={Building}
                value={formData.companyName}
                onChange={(v) => updateFormData('companyName', v)}
                placeholder="Tech Innovations Inc."
              />
              <FormInput
                label="Company Address"
                icon={MapPin}
                value={formData.companyAddress}
                onChange={(v) => updateFormData('companyAddress', v)}
                placeholder="456 Tech Avenue, San Francisco, CA 94103"
              />
            </div>
          </div>

          {/* Letter Content */}
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.primaryText }}>
              Letter Content
            </h3>
            <div className="space-y-4">
              <FormInput
                label="Position Applying For"
                value={formData.positionApplyingFor}
                onChange={(v) => updateFormData('positionApplyingFor', v)}
                placeholder="Senior Software Engineer"
              />
              <FormInput
                label="Salutation"
                value={formData.salutation}
                onChange={(v) => updateFormData('salutation', v)}
                placeholder="Dear Ms. Johnson,"
              />
              <FormTextarea
                label="Opening Paragraph"
                value={formData.openingParagraph}
                onChange={(v) => updateFormData('openingParagraph', v)}
                placeholder="I am writing to express..."
                rows={4}
              />
              <FormTextarea
                label="Body Paragraph 1 (Qualifications)"
                value={formData.bodyParagraph1}
                onChange={(v) => updateFormData('bodyParagraph1', v)}
                placeholder="Throughout my career..."
                rows={5}
              />
              <FormTextarea
                label="Body Paragraph 2 (Company Interest)"
                value={formData.bodyParagraph2}
                onChange={(v) => updateFormData('bodyParagraph2', v)}
                placeholder="What particularly excites me..."
                rows={5}
              />
              <FormTextarea
                label="Closing Paragraph"
                value={formData.closingParagraph}
                onChange={(v) => updateFormData('closingParagraph', v)}
                placeholder="I would welcome the opportunity..."
                rows={3}
              />
              <FormInput
                label="Closing"
                value={formData.closing}
                onChange={(v) => updateFormData('closing', v)}
                placeholder="Sincerely,"
              />
            </div>
          </div>
          </div>
        </div>

        {/* Fixed AI Assistant Section at Bottom */}
        <div className="flex-shrink-0 mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.primaryText }}>
            AI Assistant
          </h3>
          <div className="space-y-4">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to enhance your cover letter... (e.g., 'Make it more professional', 'Add more enthusiasm', 'Highlight my technical skills')"
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm transition-all resize-none"
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleEnhanceWithAI}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
                  color: 'white',
                  opacity: isGenerating ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating) e.currentTarget.style.opacity = '1';
                }}
              >
                <Sparkles size={16} />
                {isGenerating ? 'Enhancing...' : 'Enhance with AI'}
              </button>
              <button
                onClick={handleCopy}
                className="p-2.5 rounded-lg transition-all"
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
                title="Copy"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2.5 rounded-lg transition-all"
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
                title="Download"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Preview (40%) */}
      <div className="flex-shrink-0 flex flex-col" style={{ width: '40%', height: '100%', minHeight: 0 }}>
        {/* Fixed Preview Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye size={18} style={{ color: colors.primaryText }} />
            <h3 className="text-lg font-semibold" style={{ color: colors.primaryText }}>
              Live Preview
            </h3>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {/* Scrollable Cover Letter Preview */}
        <div 
          className="flex-1 overflow-y-auto rounded-lg p-8"
          style={{
            background: 'white',
            border: `1px solid ${colors.border}`,
            minHeight: 0,
          }}
        >
            {/* Applicant Information */}
            <div className="mb-6">
              <div className="font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>
                {formData.fullName}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>
                <div>{formData.address}</div>
                <div>{formData.email}</div>
                <div>{formData.phone}</div>
              </div>
            </div>

            {/* Date */}
            <div className="text-sm mb-6" style={{ color: '#666' }}>
              {formatDate()}
            </div>

            {/* Recipient Information */}
            <div className="mb-6">
              <div className="font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>
                {formData.hiringManagerName}
              </div>
              <div className="text-sm" style={{ color: '#666' }}>
                <div>{formData.title}</div>
                <div>{formData.companyName}</div>
                <div>{formData.companyAddress}</div>
              </div>
            </div>

            {/* Salutation */}
            <div className="mb-4" style={{ color: '#1a1a1a' }}>
              {formData.salutation}
            </div>

            {/* Letter Body */}
            <div 
              className="space-y-4 mb-6 leading-relaxed"
              style={{ 
                color: '#1a1a1a',
                fontFamily: 'Georgia, serif',
                fontSize: '14px'
              }}
            >
              <div>{formData.openingParagraph}</div>
              <div>{formData.bodyParagraph1}</div>
              <div>{formData.bodyParagraph2}</div>
              <div>{formData.closingParagraph}</div>
            </div>

            {/* Closing */}
            <div className="mt-8" style={{ color: '#1a1a1a' }}>
              <div className="mb-4">{formData.closing}</div>
              <div className="mt-8">{formData.fullName}</div>
            </div>
        </div>
      </div>
    </div>
  );
}
