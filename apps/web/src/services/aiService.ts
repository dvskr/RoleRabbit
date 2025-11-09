/**
 * AI Service for connecting to OpenAI
 */

import { logger } from '../utils/logger';

export interface AIProvider {
  name: 'openai' | 'custom';
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
}

class AIService {
  private provider: AIProvider | null = null;
  private isConfigured = false;

  /**
   * Configure the AI service with provider credentials
   */
  configure(provider: AIProvider): void {
    this.provider = provider;
    this.isConfigured = !!provider.apiKey;
    logger.info('AI Service configured:', provider.name);
  }

  /**
   * Check if AI service is properly configured
   */
  isServiceConfigured(): boolean {
    // Check if API key exists in environment or localStorage
    const hasApiKey = 
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      localStorage.getItem('aiProvider') ||
      this.isConfigured;
    
    return !!hasApiKey;
  }

  /**
   * Generate content using AI via backend API
   */
  async generateContent(request: AIRequest): Promise<AIResponse> {
    // Call backend API which proxies to Python AI service
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        prompt: request.prompt,
        context: request.context,
        model: this.provider?.model || 'gpt-4o-mini'
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'AI generation failed' }));
      throw new Error(error.detail || error.error || 'AI generation failed');
    }
    
    const data = await response.json();
    
    return {
      content: data.content,
      model: data.model
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || this.provider?.apiKey;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.provider?.model || 'gpt-4o-mini',
        messages: [
          ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
          { role: 'user', content: request.context ? `${request.context}\n\n${request.prompt}` : request.prompt }
        ],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model
    };
  }

  /**
   * Analyze and improve content
   */
  async analyzeAndImprove(originalContent: string, context?: string): Promise<string> {
    const request: AIRequest = {
      prompt: `Analyze and improve the following content:\n\n${originalContent}\n\nProvide an improved version that is more impactful, clear, and professional.`,
      context,
      systemPrompt: 'You are a professional resume and content writer. Help improve the content to make it more impactful and professional.'
    };
    
    const response = await this.generateContent(request);
    return response.content;
  }

  /**
   * Suggest keywords based on job description
   */
  async suggestKeywords(jobDescription: string, currentResume: string): Promise<{
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  }> {
    const request: AIRequest = {
      prompt: `Analyze this job description and compare it with my resume to find matching and missing keywords.\n\nJob Description:\n${jobDescription}\n\nMy Resume:\n${currentResume}`,
      systemPrompt: 'You are an ATS (Applicant Tracking System) expert. Analyze job descriptions and resumes to identify matching keywords and gaps.'
    };
    
    const response = await this.generateContent(request);
    
    // Parse the response to extract keywords
    // In a real implementation, you'd use structured output or better parsing
    const matchedKeywords = this.extractKeywords(response.content, 'matched');
    const missingKeywords = this.extractKeywords(response.content, 'missing');
    
    return {
      matchedKeywords,
      missingKeywords,
      suggestions: response.content.split('\n').filter(line => line.trim().startsWith('-'))
    };
  }

  /**
   * Extract keywords from AI response
   */
  private extractKeywords(text: string, type: 'matched' | 'missing'): string[] {
    // Simple keyword extraction
    // In production, use more sophisticated parsing
    const lines = text.split('\n');
    const keywords: string[] = [];
    
    for (const line of lines) {
      if (line.toLowerCase().includes(type)) {
        const matches = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
        if (matches) {
          keywords.push(...matches);
        }
      }
    }
    
    return keywords.slice(0, 10); // Limit to 10 keywords
  }
}

// Export singleton instance
export const aiService = new AIService();

// Initialize with stored provider if available
if (typeof window !== 'undefined') {
  const storedProvider = localStorage.getItem('aiProvider');
  const storedApiKey = localStorage.getItem('aiApiKey');
  
  if (storedProvider && storedApiKey && storedProvider === 'openai') {
    aiService.configure({
      name: 'openai',
      apiKey: storedApiKey
    });
  }
}

