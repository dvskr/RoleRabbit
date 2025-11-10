/**
 * AI Service
 * Unified interface for OpenAI and Anthropic Claude
 * Handles all AI-powered features: resume tailoring, chat, analysis
 */

const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'anthropic'
    this.mockMode = process.env.AI_AGENT_MOCK_MODE === 'true';

    if (this.mockMode) {
      logger.info('AI Service initialized in MOCK MODE');
      return;
    }

    // Initialize providers
    if (this.provider === 'openai') {
      this.initializeOpenAI();
    } else if (this.provider === 'anthropic') {
      this.initializeAnthropic();
    } else {
      logger.warn(`Unknown AI provider: ${this.provider}. Falling back to mock mode.`);
      this.mockMode = true;
    }
  }

  /**
   * Initialize OpenAI client
   */
  initializeOpenAI() {
    try {
      const { OpenAI } = require('openai');

      if (!process.env.OPENAI_API_KEY) {
        logger.warn('OPENAI_API_KEY not set. Running in mock mode.');
        this.mockMode = true;
        return;
      }

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
      logger.info('OpenAI initialized', { model: this.model });
    } catch (error) {
      logger.error('Failed to initialize OpenAI', { error: error.message });
      this.mockMode = true;
    }
  }

  /**
   * Initialize Anthropic client
   */
  initializeAnthropic() {
    try {
      const Anthropic = require('@anthropic-ai/sdk');

      if (!process.env.ANTHROPIC_API_KEY) {
        logger.warn('ANTHROPIC_API_KEY not set. Running in mock mode.');
        this.mockMode = true;
        return;
      }

      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      this.model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
      logger.info('Anthropic initialized', { model: this.model });
    } catch (error) {
      logger.error('Failed to initialize Anthropic', { error: error.message });
      this.mockMode = true;
    }
  }

  /**
   * Generate chat completion
   */
  async chat(messages, options = {}) {
    if (this.mockMode) {
      return this.mockChat(messages);
    }

    try {
      if (this.provider === 'openai') {
        return await this.chatOpenAI(messages, options);
      } else if (this.provider === 'anthropic') {
        return await this.chatAnthropic(messages, options);
      }
    } catch (error) {
      logger.error('Chat error', { error: error.message, provider: this.provider });
      throw error;
    }
  }

  /**
   * OpenAI chat completion
   */
  async chatOpenAI(messages, options = {}) {
    const response = await this.openai.chat.completions.create({
      model: options.model || this.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      response_format: options.json ? { type: 'json_object' } : undefined
    });

    return {
      content: response.choices[0].message.content,
      tokensUsed: response.usage.total_tokens,
      model: response.model
    };
  }

  /**
   * Anthropic chat completion
   */
  async chatAnthropic(messages, options = {}) {
    // Convert OpenAI format to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.anthropic.messages.create({
      model: options.model || this.model,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      })),
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7
    });

    return {
      content: response.content[0].text,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: response.model
    };
  }

  /**
   * Mock chat for development
   */
  async mockChat(messages) {
    const lastMessage = messages[messages.length - 1];
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    return {
      content: "I understand you'd like help with that. This is a mock response. Configure your AI API key to enable real AI features.",
      tokensUsed: 0,
      model: 'mock'
    };
  }

  /**
   * Analyze job description
   */
  async analyzeJobDescription(jobDescription) {
    if (this.mockMode) {
      return this.mockAnalyzeJobDescription(jobDescription);
    }

    const prompt = `Analyze this job description and extract key information:

Job Description:
${jobDescription}

Extract and return a JSON object with:
1. keywords: array of technical skills, tools, and technologies mentioned
2. requiredSkills: array of key skills required
3. experienceLevel: Junior, Mid, Senior, or Lead
4. industry: the industry this job is in
5. keyResponsibilities: array of main responsibilities
6. qualifications: array of required qualifications

Return only valid JSON.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are an expert at analyzing job descriptions and extracting structured data.' },
        { role: 'user', content: prompt }
      ], { json: true });

      const analysis = JSON.parse(response.content);

      return {
        ...analysis,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      logger.error('Job description analysis failed', { error: error.message });
      return this.mockAnalyzeJobDescription(jobDescription);
    }
  }

  /**
   * Mock job description analysis
   */
  mockAnalyzeJobDescription(jobDescription) {
    // Simple keyword extraction
    const keywords = [];
    const techWords = ['javascript', 'react', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb'];

    const lowerDesc = jobDescription.toLowerCase();
    techWords.forEach(word => {
      if (lowerDesc.includes(word)) {
        keywords.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    });

    return {
      keywords: keywords.length > 0 ? keywords : ['JavaScript', 'React', 'Node.js'],
      requiredSkills: ['Software Development', 'Problem Solving', 'Communication'],
      experienceLevel: lowerDesc.includes('senior') ? 'Senior' : lowerDesc.includes('junior') ? 'Junior' : 'Mid',
      industry: 'Technology',
      keyResponsibilities: ['Develop software', 'Collaborate with team', 'Write clean code'],
      qualifications: ["Bachelor's degree", 'Relevant experience'],
      tokensUsed: 0
    };
  }

  /**
   * Tailor resume content to job description
   */
  async tailorResume(resumeData, jobDescription, options = {}) {
    if (this.mockMode) {
      return this.mockTailorResume(resumeData, jobDescription);
    }

    const tone = options.tone || 'professional';
    const length = options.length || 'medium';

    const prompt = `You are an expert resume writer. Tailor this resume to match the job description while maintaining authenticity.

ORIGINAL RESUME:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
1. Modify the summary to highlight relevant experience for this role
2. Emphasize relevant skills and reorder them by importance to the job
3. Adjust experience descriptions to highlight relevant achievements
4. Add keywords from the job description naturally
5. Maintain truthfulness - don't add fake experience
6. Use a ${tone} tone
7. Keep it ${length === 'concise' ? 'brief and impactful' : length === 'detailed' ? 'comprehensive and detailed' : 'balanced'}

Return a JSON object with the same structure as the input resume, with tailored content.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are an expert resume writer and career coach with deep knowledge of ATS systems.' },
        { role: 'user', content: prompt }
      ], { json: true, maxTokens: 3000 });

      const tailoredResume = JSON.parse(response.content);

      return {
        resume: tailoredResume,
        tokensUsed: response.tokensUsed,
        changes: this.detectChanges(resumeData, tailoredResume)
      };
    } catch (error) {
      logger.error('Resume tailoring failed', { error: error.message });
      return this.mockTailorResume(resumeData, jobDescription);
    }
  }

  /**
   * Mock resume tailoring
   */
  mockTailorResume(resumeData, jobDescription) {
    // Create a simple tailored version
    const tailored = JSON.parse(JSON.stringify(resumeData)); // Deep copy

    // Add a note to summary
    if (tailored.summary) {
      tailored.summary = tailored.summary + ' [Tailored for this position]';
    }

    return {
      resume: tailored,
      tokensUsed: 0,
      changes: ['Summary updated', 'Skills reordered']
    };
  }

  /**
   * Generate cover letter
   */
  async generateCoverLetter(resumeData, jobDescription, company, jobTitle, tone = 'professional') {
    if (this.mockMode) {
      return this.mockGenerateCoverLetter(company, jobTitle);
    }

    const prompt = `Write a compelling cover letter for this job application.

RESUME DATA:
Name: ${resumeData.name}
Title: ${resumeData.title}
Summary: ${resumeData.summary}
Experience: ${resumeData.experience?.slice(0, 2).map(e => `${e.role} at ${e.company}`).join(', ')}

JOB DETAILS:
Company: ${company}
Position: ${jobTitle}
Description: ${jobDescription}

REQUIREMENTS:
1. Use a ${tone} tone
2. Highlight relevant experience and skills
3. Show enthusiasm for the role and company
4. Keep it concise (3-4 paragraphs)
5. Include specific examples from experience
6. Make it personalized and authentic

Return only the cover letter text.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are an expert at writing compelling, personalized cover letters that get results.' },
        { role: 'user', content: prompt }
      ], { maxTokens: 1500 });

      return {
        content: response.content,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      logger.error('Cover letter generation failed', { error: error.message });
      return this.mockGenerateCoverLetter(company, jobTitle);
    }
  }

  /**
   * Mock cover letter generation
   */
  mockGenerateCoverLetter(company, jobTitle) {
    const content = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in software development and proven track record of delivering high-quality solutions, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed expertise in building scalable applications and collaborating with cross-functional teams. I am particularly drawn to ${company}'s innovative approach and commitment to excellence.

I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application.

Best regards,
[Your Name]

[Mock mode - Configure AI API key for personalized cover letters]`;

    return {
      content,
      tokensUsed: 0
    };
  }

  /**
   * Research company
   */
  async researchCompany(companyName) {
    if (this.mockMode) {
      return this.mockResearchCompany(companyName);
    }

    const prompt = `Research and provide key information about ${companyName}.

Provide:
1. Company overview (2-3 sentences)
2. Industry and sector
3. Key products/services
4. Company culture (if known)
5. Recent news or developments (if any)
6. Tips for interviewing at this company

Format as JSON with these fields.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are a career researcher with extensive knowledge of companies across industries.' },
        { role: 'user', content: prompt }
      ], { json: true });

      const research = JSON.parse(response.content);

      return {
        ...research,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      logger.error('Company research failed', { error: error.message });
      return this.mockResearchCompany(companyName);
    }
  }

  /**
   * Mock company research
   */
  mockResearchCompany(companyName) {
    return {
      overview: `${companyName} is a company in the technology sector.`,
      industry: 'Technology',
      products: ['Software solutions'],
      culture: 'Collaborative and innovative',
      recentNews: 'No recent news available in mock mode',
      interviewTips: ['Research the company', 'Prepare examples', 'Ask thoughtful questions'],
      tokensUsed: 0
    };
  }

  /**
   * Generate interview preparation materials
   */
  async generateInterviewPrep(jobDescription, resumeData, company) {
    if (this.mockMode) {
      return this.mockGenerateInterviewPrep(company);
    }

    const prompt = `Generate comprehensive interview preparation materials for this job.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE BACKGROUND:
${resumeData.summary}
Experience: ${resumeData.experience?.slice(0, 2).map(e => e.role).join(', ')}
Skills: ${resumeData.skills?.slice(0, 10).join(', ')}

Company: ${company}

Generate:
1. Common interview questions (5-7 questions)
2. Technical questions specific to the role (5-7 questions)
3. Behavioral questions (5 questions)
4. Questions to ask the interviewer (5 questions)
5. Key points to emphasize about your background

Return as JSON.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are an experienced interview coach and career advisor.' },
        { role: 'user', content: prompt }
      ], { json: true, maxTokens: 2500 });

      const prepMaterial = JSON.parse(response.content);

      return {
        ...prepMaterial,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      logger.error('Interview prep generation failed', { error: error.message });
      return this.mockGenerateInterviewPrep(company);
    }
  }

  /**
   * Mock interview prep
   */
  mockGenerateInterviewPrep(company) {
    return {
      commonQuestions: [
        'Tell me about yourself',
        'Why do you want to work at ' + company + '?',
        'What are your strengths and weaknesses?',
        'Where do you see yourself in 5 years?',
        'Why are you leaving your current role?'
      ],
      technicalQuestions: [
        'Describe your development process',
        'How do you handle technical debt?',
        'Explain a complex project you worked on',
        'How do you stay current with technology?',
        'Describe a technical challenge you overcame'
      ],
      behavioralQuestions: [
        'Tell me about a time you led a team',
        'Describe a conflict and how you resolved it',
        'Give an example of a failed project',
        'How do you handle tight deadlines?',
        'Describe your collaboration style'
      ],
      questionsToAsk: [
        'What does success look like in this role?',
        'What are the team\'s current priorities?',
        'How does the team handle work-life balance?',
        'What are the growth opportunities?',
        'What\'s the onboarding process like?'
      ],
      keyPoints: [
        'Emphasize relevant experience',
        'Show enthusiasm for the role',
        'Demonstrate cultural fit',
        'Highlight problem-solving skills',
        'Prepare specific examples'
      ],
      tokensUsed: 0
    };
  }

  /**
   * Handle conversational AI chat
   */
  async handleChatMessage(message, conversationHistory = []) {
    if (this.mockMode) {
      return this.mockChatResponse(message);
    }

    const messages = [
      {
        role: 'system',
        content: `You are an AI job application assistant. You help users with:
- Resume tailoring and optimization
- Cover letter writing
- Job search strategies
- Company research
- Interview preparation
- Application tracking

Be helpful, concise, and action-oriented. Suggest specific actions when appropriate.`
      },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: message }
    ];

    try {
      const response = await this.chat(messages);

      // Extract suggested actions
      const suggestedActions = this.extractSuggestedActions(message, response.content);

      return {
        message: response.content,
        suggestedActions,
        tokensUsed: response.tokensUsed
      };
    } catch (error) {
      logger.error('Chat message handling failed', { error: error.message });
      return this.mockChatResponse(message);
    }
  }

  /**
   * Mock chat response
   */
  mockChatResponse(message) {
    const responses = {
      'resume': {
        message: "I can help you tailor your resume! To get started, please provide the job description you're applying for.",
        suggestedActions: [
          { label: 'Tailor resume', action: 'generate_resume' },
          { label: 'View resume tips', action: 'resume_tips' }
        ]
      },
      'cover': {
        message: "I'll help you write a compelling cover letter. Please share the job details.",
        suggestedActions: [
          { label: 'Generate cover letter', action: 'generate_cover_letter' }
        ]
      },
      'company': {
        message: "I can research companies for you. Which company would you like to know about?",
        suggestedActions: [
          { label: 'Research company', action: 'research_company' }
        ]
      },
      'default': {
        message: "I'm here to help with your job search! I can assist with resume tailoring, cover letters, company research, and interview prep. What would you like help with?",
        suggestedActions: [
          { label: 'Tailor resume', action: 'generate_resume' },
          { label: 'Research company', action: 'research_company' }
        ]
      }
    };

    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('resume')) response = responses.resume;
    else if (lowerMessage.includes('cover')) response = responses.cover;
    else if (lowerMessage.includes('company') || lowerMessage.includes('research')) response = responses.company;

    return {
      ...response,
      tokensUsed: 0
    };
  }

  /**
   * Extract suggested actions from AI response
   */
  extractSuggestedActions(userMessage, aiResponse) {
    const actions = [];

    if (aiResponse.toLowerCase().includes('tailor') || aiResponse.toLowerCase().includes('resume')) {
      actions.push({ label: 'Generate resume', action: 'generate_resume' });
    }

    if (aiResponse.toLowerCase().includes('cover letter')) {
      actions.push({ label: 'Generate cover letter', action: 'generate_cover_letter' });
    }

    if (aiResponse.toLowerCase().includes('research') || aiResponse.toLowerCase().includes('company')) {
      actions.push({ label: 'Research company', action: 'research_company' });
    }

    return actions;
  }

  /**
   * Detect changes between original and tailored resume
   */
  detectChanges(original, tailored) {
    const changes = [];

    if (original.summary !== tailored.summary) {
      changes.push('Summary updated');
    }

    if (JSON.stringify(original.skills) !== JSON.stringify(tailored.skills)) {
      changes.push('Skills reordered/updated');
    }

    if (original.experience && tailored.experience) {
      const experienceChanged = original.experience.some((exp, i) => {
        return JSON.stringify(exp) !== JSON.stringify(tailored.experience[i]);
      });
      if (experienceChanged) {
        changes.push('Experience descriptions enhanced');
      }
    }

    return changes.length > 0 ? changes : ['Resume optimized for job description'];
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return !this.mockMode;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      provider: this.provider,
      model: this.model,
      mockMode: this.mockMode,
      available: this.isAvailable()
    };
  }
}

// Export singleton instance
module.exports = new AIService();
