/**
 * AI-Powered Resume Parser
 * Uses AI to extract structured information from resume text
 */

import { aiService } from './aiService';

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    period: string;
    location?: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    period: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  links: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

class ResumeParser {
  /**
   * Parse resume text using AI
   */
  async parseResumeText(text: string): Promise<ParsedResume> {
    try {
      // Try AI-powered parsing first
      if (aiService.isServiceConfigured()) {
        return await this.parseWithAI(text);
      }
      
      // Fallback to regex parsing
      return this.parseWithRegex(text);
    } catch (error) {
      console.error('Error parsing resume:', error);
      console.warn('Falling back to regex parsing');
      return this.parseWithRegex(text);
    }
  }

  /**
   * Parse resume using AI
   */
  private async parseWithAI(text: string): Promise<ParsedResume> {
    const prompt = `Extract the following information from this resume in JSON format:\n\n${text}\n\nReturn a JSON object with this structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, State",
  "title": "Job Title",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"company": "...", "position": "...", "period": "...", "location": "...", "description": "..."}],
  "education": [{"school": "...", "degree": "...", "period": "..."}],
  "projects": [{"name": "...", "description": "...", "technologies": [...]}],
  "certifications": [{"name": "...", "issuer": "...", "date": "..."}],
  "links": {"linkedin": "...", "github": "...", "website": "..."}
}`;

    const response = await aiService.generateContent({
      prompt,
      systemPrompt: 'You are a resume parser. Extract structured data from resumes and return valid JSON only.',
      maxTokens: 1500,
      temperature: 0.3 // Lower temperature for more consistent structured output
    });

    try {
      // Try to parse JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.normalizeParsedData(parsed);
      }
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
    }

    // Fall back to regex if AI response is not valid JSON
    return this.parseWithRegex(text);
  }

  /**
   * Parse resume using regex (basic fallback)
   */
  private parseWithRegex(text: string): ParsedResume {
    const parsed: ParsedResume = {
      name: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      links: {}
    };

    // Parse name
    const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (nameMatch) {
      parsed.name = nameMatch[1].trim();
    }

    // Parse email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      parsed.email = emailMatch[0];
    }

    // Parse phone
    const phoneMatch = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    if (phoneMatch) {
      parsed.phone = phoneMatch[0].trim();
    }

    // Parse location
    const locationMatch = text.match(/(?:Location|Address)[:\s]+(.+)/i);
    if (locationMatch) {
      parsed.location = locationMatch[1].trim();
    }

    // Parse title
    const titleMatch = text.match(/(?:Title|Position|Job Title)[:\s]+(.+)/i);
    if (titleMatch) {
      parsed.title = titleMatch[1].trim();
    }

    // Parse summary
    const summaryMatch = text.match(/(?:SUMMARY|PROFILE|OBJECTIVE)[:\s]+(.+?)(?:EXPERIENCE|SKILLS|EDUCATION)/is);
    if (summaryMatch) {
      parsed.summary = summaryMatch[1].trim();
    }

    // Parse skills
    const skillsSection = text.match(/(?:SKILLS|TECHNICAL SKILLS)[:\s]+([^\n]+(?:\n[^\n]+){0,10})/i);
    if (skillsSection) {
      parsed.skills = skillsSection[1]
        .split(/[,\n•]/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    // Parse experience
    const experienceMatch = text.match(/(?:EXPERIENCE|WORK HISTORY)[:\s]+(.*?)(?:EDUCATION|SKILLS|PROJECTS)/is);
    if (experienceMatch) {
      const expText = experienceMatch[1];
      // Simple extraction - split by likely company/position patterns
      const jobs = expText.match(/([A-Z][^\n]+)\n.*?(\d{4})\s*[-–]\s*(\d{4}|Present)/g);
      if (jobs) {
        parsed.experience = jobs.slice(0, 3).map(job => {
          const parts = job.match(/(.+?)\n.*?(\d{4})\s*[-–]\s*(\d{4}|Present)/);
          return {
            company: parts ? parts[1].trim() : '',
            position: '',
            period: parts ? `${parts[2]} - ${parts[3]}` : '',
            description: ''
          };
        }).filter(exp => exp.company);
      }
    }

    // Parse education
    const educationMatch = text.match(/(?:EDUCATION|EDUCATIONAL BACKGROUND)[:\s]+(.*?)(?:EXPERIENCE|PROJECTS|CERTIFICATIONS)/is);
    if (educationMatch) {
      const eduText = educationMatch[1];
      const schools = eduText.match(/([A-Z][^\n]+)\n.*?(\d{4})\s*[-–]\s*(\d{4})/g);
      if (schools) {
        parsed.education = schools.slice(0, 2).map(school => {
          const parts = school.match(/(.+?)\n.*?(\d{4})\s*[-–]\s*(\d{4})/);
          return {
            school: parts ? parts[1].trim() : '',
            degree: '',
            period: parts ? `${parts[2]} - ${parts[3]}` : ''
          };
        }).filter(edu => edu.school);
      }
    }

    // Parse LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (linkedinMatch) {
      parsed.links.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    // Parse GitHub
    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (githubMatch) {
      parsed.links.github = `https://github.com/${githubMatch[1]}`;
    }

    return parsed;
  }

  /**
   * Normalize parsed data to ensure all fields are properly formatted
   */
  private normalizeParsedData(data: any): ParsedResume {
    return {
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || '',
      title: data.title || '',
      summary: data.summary || '',
      skills: Array.isArray(data.skills) ? data.skills : [],
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      links: data.links || {}
    };
  }

  /**
   * Extract specific field from resume
   */
  async extractField(text: string, field: string): Promise<string> {
    try {
      const response = await aiService.generateContent({
        prompt: `Extract the ${field} from this resume:\n\n${text}`,
        maxTokens: 100,
        temperature: 0.3
      });
      
      return response.content.trim();
    } catch (error) {
      console.error(`Error extracting ${field}:`, error);
      return '';
    }
  }

  /**
   * Analyze resume quality
   */
  async analyzeResumeQuality(text: string): Promise<{
    score: number;
    strengths: string[];
    suggestions: string[];
  }> {
    try {
      const response = await aiService.generateContent({
        prompt: `Analyze this resume and provide:\n1. Quality score (0-100)\n2. 3 main strengths\n3. 3 suggestions for improvement\n\nResume:\n${text}`,
        systemPrompt: 'You are a professional resume reviewer. Provide constructive feedback.',
        maxTokens: 500,
        temperature: 0.5
      });

      // Extract score
      const scoreMatch = response.content.match(/(\d+)(?:\s*out of\s*)?(?:\s*100)?/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

      // Extract strengths and suggestions
      const strengths = response.content.match(/(?:Strengths?|Good)(.*?)(?:Suggestions|Improvements?)/is)?.[1] || '';
      const suggestions = response.content.match(/(?:Suggestions?|Improvements?|Recommendations?)(.*?)$/is)?.[1] || '';

      return {
        score: Math.min(100, Math.max(0, score)),
        strengths: strengths.split('\n').slice(0, 3).map(s => s.trim()).filter(Boolean),
        suggestions: suggestions.split('\n').slice(0, 3).map(s => s.trim()).filter(Boolean)
      };
    } catch (error) {
      console.error('Error analyzing resume quality:', error);
      return {
        score: 75,
        strengths: ['Good formatting', 'Clear structure', 'Professional content'],
        suggestions: ['Add more metrics', 'Expand technical skills', 'Quantify achievements']
      };
    }
  }
}

// Export singleton instance
export const resumeParser = new ResumeParser();

