import { ResumeData, AIMessage } from '../types/resume';
import { aiService } from '../services/aiService';

// AI helper functions
export const aiHelpers = {
  generateAIContent: async (aiGenerateSection: string, aiPrompt: string, writingTone: string, contentLength: string, resumeData: ResumeData, setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void, setShowAIGenerateModal: (show: boolean) => void, setCustomSectionContent?: (content: string) => void) => {
    if (!aiPrompt.trim()) return;
    
    try {
      // Prepare system prompt based on section and tone
      const systemPrompt = `You are a professional resume writer. Create ${writingTone} content for a ${aiGenerateSection} section. Keep it ${contentLength}.`;
      
      const response = await aiService.generateContent({
        prompt: `Generate professional resume content for ${aiGenerateSection} based on: ${aiPrompt}`,
        systemPrompt,
        maxTokens: contentLength === 'comprehensive' ? 500 : contentLength === 'detailed' ? 300 : 150
      });
      
      switch (aiGenerateSection) {
        case 'summary':
          setResumeData(prev => ({ ...prev, summary: response.content }));
          break;
        case 'skills':
          const skillsList = response.content.split(',').map(s => s.trim()).filter(Boolean);
          const newSkills = [...resumeData.skills, ...skillsList.filter(skill => !resumeData.skills.includes(skill))];
          setResumeData(prev => ({ ...prev, skills: newSkills }));
          break;
        case 'experience':
          // Parse the AI response into experience format
          const experienceBullets = response.content.split('\n').map(line => line.replace(/^[•\-]\s*/, '').trim()).filter(Boolean);
          const newExperience = {
            id: Date.now(),
            company: 'AI-Generated Company',
            position: 'AI-Generated Position',
            period: '2023',
            endPeriod: 'Present',
            location: 'Remote',
            bullets: experienceBullets,
            environment: ['React', 'Node.js', 'AWS', 'TypeScript'],
            customFields: []
          };
          setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
          break;
        case 'projects':
          const projectBullets = response.content.split('\n').map(line => line.replace(/^[•\-]\s*/, '').trim()).filter(Boolean);
          const newProject = {
            id: Date.now(),
            name: `AI-Generated ${aiPrompt}`,
            description: projectBullets[0] || response.content,
            link: 'https://github.com/username/project',
            bullets: projectBullets.slice(1),
            skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
            customFields: []
          };
          setResumeData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
          break;
        case 'custom':
          // Handle custom sections
          if (setCustomSectionContent) {
            setCustomSectionContent(response.content);
          }
          break;
      }
      
      setShowAIGenerateModal(false);
    } catch (error) {
      console.error('AI Generate Error:', error);
      alert('Error generating content. Please try again.');
    }
  },

  // Enhanced content generation functions
  generateSummaryContent: (prompt: string, tone: string, length: string) => {
    const baseContent = {
      professional: "Results-driven professional with extensive experience in",
      casual: "Passionate professional who loves working with",
      formal: "Accomplished professional with demonstrated expertise in",
      creative: "Innovative professional with a creative approach to",
      technical: "Technical expert with deep knowledge in"
    };
    
    const lengthContent = {
      concise: "delivering exceptional results and driving business growth.",
      detailed: "delivering exceptional results, optimizing processes, and driving measurable business growth through strategic initiatives.",
      comprehensive: "delivering exceptional results, optimizing processes, driving measurable business growth through strategic initiatives, and leading cross-functional teams to achieve organizational objectives."
    };
    
    return `${baseContent[tone as keyof typeof baseContent]} ${prompt} ${lengthContent[length as keyof typeof lengthContent]}`;
  },

  generateSkillsContent: (prompt: string, tone: string) => {
    const skillCategories = {
      tech: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      marketing: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Analytics', 'Brand Management'],
      finance: ['Financial Modeling', 'Risk Management', 'Investment Analysis', 'Portfolio Management'],
      sales: ['CRM', 'Lead Generation', 'Account Management', 'Revenue Growth'],
      design: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    };
    
    // Extract relevant skills based on prompt
    const relevantSkills = Object.values(skillCategories).flat().filter(skill => 
      prompt.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(prompt.toLowerCase())
    );
    
    return relevantSkills.length > 0 ? relevantSkills.slice(0, 5) : skillCategories.tech.slice(0, 5);
  },

  generateExperienceContent: (prompt: string, tone: string, length: string) => {
    const actionVerbs = {
      professional: ['Led', 'Managed', 'Developed', 'Implemented', 'Optimized'],
      casual: ['Built', 'Created', 'Worked on', 'Helped with', 'Contributed to'],
      formal: ['Spearheaded', 'Orchestrated', 'Facilitated', 'Coordinated', 'Executed'],
      creative: ['Designed', 'Innovated', 'Crafted', 'Pioneered', 'Transformed'],
      technical: ['Architected', 'Engineered', 'Configured', 'Debugged', 'Deployed']
    };
    
    const bullets = {
      concise: [
        `${actionVerbs[tone as keyof typeof actionVerbs][0]} ${prompt} resulting in improved efficiency`,
        `Collaborated with cross-functional teams to deliver high-quality solutions`,
        `Implemented best practices and optimized system performance`
      ],
      detailed: [
        `${actionVerbs[tone as keyof typeof actionVerbs][0]} ${prompt} resulting in improved efficiency and cost reduction`,
        `Collaborated with cross-functional teams to deliver high-quality solutions on time and within budget`,
        `Implemented best practices and optimized system performance, reducing processing time by 30%`,
        `Led technical initiatives and mentored junior developers, improving team productivity`
      ],
      comprehensive: [
        `${actionVerbs[tone as keyof typeof actionVerbs][0]} ${prompt} resulting in improved efficiency, cost reduction, and enhanced user experience`,
        `Collaborated with cross-functional teams to deliver high-quality solutions on time and within budget`,
        `Implemented best practices and optimized system performance, reducing processing time by 30%`,
        `Led technical initiatives and mentored junior developers, improving team productivity by 25%`,
        `Established coding standards and review processes, ensuring code quality and maintainability`
      ]
    };
    
    return {
      id: Date.now(),
      company: 'AI-Generated Company',
      position: 'AI-Generated Position',
      period: '2023',
      endPeriod: 'Present',
      location: 'Remote',
      bullets: bullets[length as keyof typeof bullets],
      environment: ['React', 'Node.js', 'AWS', 'TypeScript'],
      customFields: []
    };
  },

  generateProjectContent: (prompt: string, tone: string, length: string) => {
    const projectDescriptions = {
      concise: `A ${prompt} built with modern technologies and best practices`,
      detailed: `A comprehensive ${prompt} built with modern technologies, featuring scalable architecture and best practices`,
      comprehensive: `An enterprise-grade ${prompt} built with cutting-edge technologies, featuring scalable architecture, comprehensive testing, and industry best practices`
    };
    
    const bullets = {
      concise: [
        'Implemented responsive design with mobile-first approach',
        'Integrated third-party APIs and services for enhanced functionality',
        'Optimized performance and implemented caching strategies'
      ],
      detailed: [
        'Implemented responsive design with mobile-first approach, ensuring cross-browser compatibility',
        'Integrated third-party APIs and services for enhanced functionality and user experience',
        'Optimized performance and implemented caching strategies, reducing load times by 40%',
        'Deployed using CI/CD pipelines and cloud infrastructure for scalability'
      ],
      comprehensive: [
        'Implemented responsive design with mobile-first approach, ensuring cross-browser compatibility and accessibility',
        'Integrated third-party APIs and services for enhanced functionality and seamless user experience',
        'Optimized performance and implemented advanced caching strategies, reducing load times by 40%',
        'Deployed using CI/CD pipelines and cloud infrastructure for scalability and reliability',
        'Conducted comprehensive testing including unit, integration, and end-to-end tests',
        'Implemented monitoring and logging systems for production support and maintenance'
      ]
    };
    
    return {
      id: Date.now(),
      name: `AI-Generated ${prompt}`,
      description: projectDescriptions[length as keyof typeof projectDescriptions],
      link: 'https://github.com/username/project',
      bullets: bullets[length as keyof typeof bullets],
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
      customFields: []
    };
  },

  openAIGenerateModal: (section: string, setAiGenerateSection: (section: string) => void, setShowAIGenerateModal: (show: boolean) => void) => {
    setAiGenerateSection(section);
    setShowAIGenerateModal(true);
  },

  analyzeJobDescription: async (jobDescription: string, setIsAnalyzing: (analyzing: boolean) => void, setMatchScore: (score: number) => void, setMatchedKeywords: (keywords: string[]) => void, setMissingKeywords: (keywords: string[]) => void, setAiRecommendations: (recommendations: string[]) => void) => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Use real AI service to analyze job description
      const response = await aiService.generateContent({
        prompt: `Analyze this job description and provide:\n1. Key skills and technologies mentioned\n2. Missing skills that would strengthen an application\n3. Recommendations for improving a resume to match this job\n\nJob Description:\n${jobDescription}`,
        systemPrompt: 'You are an ATS (Applicant Tracking System) expert and career advisor. Analyze job descriptions and provide actionable recommendations.',
        maxTokens: 800
      });
      
      // Extract information from the response
      const content = response.content;
      
      // Calculate match score based on keyword matching
      const keywords = ['JavaScript', 'React', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Node.js'];
      const matchedKeywords = keywords.filter(keyword => content.includes(keyword));
      const missingKeywords = keywords.filter(keyword => !content.includes(keyword));
      
      // Extract recommendations (lines starting with - or numbered)
      const recommendations = content
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
        .map(line => line.replace(/^[-\d.]\s*/, '').trim())
        .slice(0, 5);
      
      // Calculate match score
      const matchScore = Math.min(95, Math.max(60, matchedKeywords.length * 10 + 50));
      
      setMatchScore(matchScore);
      setMatchedKeywords(matchedKeywords);
      setMissingKeywords(missingKeywords);
      setAiRecommendations(recommendations.length > 0 ? recommendations : [
        'Add more relevant technical skills to your resume',
        'Include specific achievements with metrics',
        'Highlight relevant project experience',
        'Tailor your summary to match the job requirements'
      ]);
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing job description:', error);
      // Fallback to basic analysis
      setIsAnalyzing(false);
    }
  },

  applyAIRecommendations: (aiRecommendations: string[], setAiRecommendations: (recommendations: string[]) => void) => {
    // In a real app, this would apply the recommendations to the resume
    setAiRecommendations([]);
  },

  sendAIMessage: async (aiPrompt: string, setAiPrompt: (prompt: string) => void, aiConversation: AIMessage[], setAiConversation: (conversation: AIMessage[] | ((prev: AIMessage[]) => AIMessage[])) => void) => {
    if (!aiPrompt.trim()) return;
    
    const newMessage = { role: 'user', text: aiPrompt };
    setAiConversation(prev => [...prev, newMessage]);
    setAiPrompt('');
    
    try {
      // Build context from previous conversation
      const context = aiConversation
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.role}: ${msg.text}`)
        .join('\n');
      
      const response = await aiService.generateContent({
        prompt: aiPrompt,
        context,
        systemPrompt: 'You are a helpful AI assistant specializing in resume writing and career advice. Provide clear, actionable feedback.',
        maxTokens: 500,
        temperature: 0.7
      });
      
      const aiResponse = { role: 'assistant', text: response.content };
      setAiConversation(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending AI message:', error);
      // Fallback response
      const aiResponse = { role: 'assistant', text: 'I can help you improve your resume. What specific section would you like to work on?' };
      setAiConversation(prev => [...prev, aiResponse]);
    }
  }
};
