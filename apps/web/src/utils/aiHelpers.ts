import { ResumeData, AIMessage } from '../types/resume';

// AI helper functions
export const aiHelpers = {
  generateAIContent: (aiGenerateSection: string, aiPrompt: string, writingTone: string, contentLength: string, resumeData: ResumeData, setResumeData: (data: ResumeData) => void, setShowAIGenerateModal: (show: boolean) => void) => {
    if (!aiPrompt.trim()) return;
    
    try {
      switch (aiGenerateSection) {
        case 'summary':
          const summaryContent = aiHelpers.generateSummaryContent(aiPrompt, writingTone, contentLength);
          setResumeData(prev => ({ ...prev, summary: summaryContent }));
          break;
        case 'skills':
          const suggestedSkills = aiHelpers.generateSkillsContent(aiPrompt, writingTone);
          const newSkills = [...resumeData.skills, ...suggestedSkills.filter(skill => !resumeData.skills.includes(skill))];
          setResumeData(prev => ({ ...prev, skills: newSkills }));
          break;
        case 'experience':
          const newExperience = aiHelpers.generateExperienceContent(aiPrompt, writingTone, contentLength);
          setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
          break;
        case 'projects':
          const newProject = aiHelpers.generateProjectContent(aiPrompt, writingTone, contentLength);
          setResumeData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
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

  analyzeJobDescription: (jobDescription: string, setIsAnalyzing: (analyzing: boolean) => void, setMatchScore: (score: number) => void, setMatchedKeywords: (keywords: string[]) => void, setMissingKeywords: (keywords: string[]) => void, setAiRecommendations: (recommendations: string[]) => void) => {
    if (!jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const mockMatchScore = Math.floor(Math.random() * 40) + 60; // 60-100%
      const mockMatchedKeywords = ['JavaScript', 'React', 'Node.js', 'Python'];
      const mockMissingKeywords = ['TypeScript', 'AWS', 'Docker', 'Kubernetes'];
      const mockRecommendations = [
        'Add TypeScript to your skills section',
        'Include AWS experience in your projects',
        'Highlight Docker and Kubernetes experience',
        'Add more specific technical achievements'
      ];
      
      setMatchScore(mockMatchScore);
      setMatchedKeywords(mockMatchedKeywords);
      setMissingKeywords(mockMissingKeywords);
      setAiRecommendations(mockRecommendations);
      setIsAnalyzing(false);
    }, 2000);
  },

  applyAIRecommendations: (aiRecommendations: string[], setAiRecommendations: (recommendations: string[]) => void) => {
    // In a real app, this would apply the recommendations to the resume
    alert('AI recommendations applied successfully!');
    setAiRecommendations([]);
  },

  sendAIMessage: (aiPrompt: string, setAiPrompt: (prompt: string) => void, aiConversation: AIMessage[], setAiConversation: (conversation: AIMessage[]) => void) => {
    if (!aiPrompt.trim()) return;
    
    const newMessage = { role: 'user', text: aiPrompt };
    setAiConversation(prev => [...prev, newMessage]);
    setAiPrompt('');
    
    setTimeout(() => {
      const aiResponse = { role: 'assistant', text: 'I can help you improve your resume. What specific section would you like to work on?' };
      setAiConversation(prev => [...prev, aiResponse]);
    }, 1000);
  }
};
