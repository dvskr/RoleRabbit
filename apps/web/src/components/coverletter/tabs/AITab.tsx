'use client';

import React, { useState } from 'react';
import { Sparkles, Bot, Wand2 } from 'lucide-react';
import AIContextForm from '../components/AIContextForm';
import CoverLetterEditor from '../components/CoverLetterEditor';
import { AIContext } from '../types/coverletter';

export default function AITab() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiContext, setAiContext] = useState<AIContext>({
    jobTitle: '',
    companyName: '',
    industry: 'tech',
    jobLevel: 'mid',
    experience: '2-5',
    tone: 'professional',
    length: 'medium',
    keyPoints: [],
    skills: [],
    achievements: []
  });

  const handleContextChange = (changes: Partial<AIContext>) => {
    setAiContext(prev => ({ ...prev, ...changes }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI-generated content based on context
    const generatedContent = generateAIContent(aiContext);
    setContent(generatedContent);
    
    setIsGenerating(false);
  };

  const generateAIContent = (context: AIContext): string => {
    const { jobTitle, companyName, industry, jobLevel, experience, tone, keyPoints, skills, achievements } = context;
    
    let content = `Dear Hiring Manager,\n\n`;
    
    // Opening paragraph
    content += `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. `;
    
    if (experience === '0-1') {
      content += `As a recent graduate with a passion for ${industry}, I am excited about the opportunity to contribute to your team. `;
    } else if (experience === '2-5') {
      content += `With ${experience} years of experience in ${industry}, I am confident that my skills and enthusiasm make me an ideal candidate for this role. `;
    } else {
      content += `With over ${experience} years of experience in ${industry}, I bring a wealth of knowledge and expertise that would be valuable to your organization. `;
    }
    
    // Skills paragraph
    if (skills.length > 0) {
      content += `\n\nMy technical skills include ${skills.slice(0, 3).join(', ')}`;
      if (skills.length > 3) {
        content += `, and ${skills.length - 3} other relevant technologies`;
      }
      content += `. `;
    }
    
    // Achievements paragraph
    if (achievements.length > 0) {
      content += `I have successfully ${achievements[0]}`;
      if (achievements.length > 1) {
        content += ` and ${achievements[1]}`;
      }
      content += `. `;
    }
    
    // Key points paragraph
    if (keyPoints.length > 0) {
      content += `\n\nI am particularly drawn to this opportunity because ${keyPoints[0]}`;
      if (keyPoints.length > 1) {
        content += `. Additionally, ${keyPoints[1]}`;
      }
      content += `. `;
    }
    
    // Company-specific paragraph
    content += `\n\nI am impressed by ${companyName}'s reputation in the ${industry} industry and would be excited to contribute to your continued success. `;
    
    // Closing paragraph
    if (tone === 'enthusiastic') {
      content += `I am thrilled about the possibility of joining your team and would welcome the opportunity to discuss how my background and passion align with your needs.\n\nThank you for your consideration, and I look forward to hearing from you soon.\n\nSincerely,\n[Your Name]`;
    } else if (tone === 'casual') {
      content += `I'd love to chat about how I can help ${companyName} achieve its goals. I'm excited about the possibility of working together.\n\nThanks for your time, and I hope to hear from you soon!\n\nBest regards,\n[Your Name]`;
    } else {
      content += `I am confident that my experience and dedication make me a strong candidate for this position. I would welcome the opportunity to discuss my qualifications further.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]`;
    }
    
    return content;
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleWordCountChange = (count: number) => {
    setWordCount(count);
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Bot size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">AI-Powered Generation</h3>
            <p className="text-sm text-purple-700">
              Our AI analyzes your job details and generates a tailored cover letter that highlights your strengths and matches the company's needs.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - AI Context Form */}
        <div className="space-y-6">
          <AIContextForm
            context={aiContext}
            onContextChange={handleContextChange}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right Column - Generated Content */}
        <div className="space-y-4">
          
          <CoverLetterEditor
            content={content}
            onContentChange={handleContentChange}
            wordCount={wordCount}
            onWordCountChange={handleWordCountChange}
            placeholder="Your AI-generated cover letter will appear here..."
          />
          
          {content && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Tip:</strong> Review and customize the generated content to make it more personal and specific to your experience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
