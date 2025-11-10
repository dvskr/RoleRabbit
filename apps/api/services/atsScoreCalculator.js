/**
 * ATS Score Calculator
 * Calculates Applicant Tracking System compatibility scores
 * Analyzes resume against job description
 */

const logger = require('../utils/logger');

class ATSScoreCalculator {
  /**
   * Calculate comprehensive ATS score
   */
  async calculateScore(resumeData, jobDescription, options = {}) {
    try {
      logger.info('Calculating ATS score');

      const scores = {
        keywordMatch: await this.calculateKeywordMatch(resumeData, jobDescription),
        formatScore: this.calculateFormatScore(resumeData),
        experienceMatch: this.calculateExperienceMatch(resumeData, jobDescription),
        skillsMatch: this.calculateSkillsMatch(resumeData, jobDescription),
        educationMatch: this.calculateEducationMatch(resumeData, jobDescription)
      };

      // Weighted average
      const weights = {
        keywordMatch: 0.35,    // 35%
        formatScore: 0.15,     // 15%
        experienceMatch: 0.25, // 25%
        skillsMatch: 0.20,     // 20%
        educationMatch: 0.05   // 5%
      };

      const overall = Object.keys(scores).reduce((total, key) => {
        return total + (scores[key] * weights[key]);
      }, 0);

      const breakdown = {
        ...scores,
        overall: Math.round(overall),
        weights
      };

      const suggestions = this.generateSuggestions(scores, resumeData, jobDescription);

      return {
        score: Math.round(overall),
        breakdown,
        suggestions,
        matchedKeywords: this.extractMatchedKeywords(resumeData, jobDescription),
        missingKeywords: this.extractMissingKeywords(resumeData, jobDescription)
      };
    } catch (error) {
      logger.error('ATS score calculation error', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate keyword match score
   */
  async calculateKeywordMatch(resumeData, jobDescription) {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeText = this.resumeToText(resumeData);
    const resumeKeywords = this.extractKeywords(resumeText);

    let matchCount = 0;
    const totalKeywords = jobKeywords.length;

    jobKeywords.forEach(keyword => {
      if (resumeKeywords.some(rk => rk.toLowerCase() === keyword.toLowerCase())) {
        matchCount++;
      }
    });

    const score = totalKeywords > 0 ? (matchCount / totalKeywords) * 100 : 0;

    logger.debug('Keyword match', { matched: matchCount, total: totalKeywords, score });

    return Math.round(score);
  }

  /**
   * Calculate format score
   */
  calculateFormatScore(resumeData) {
    let score = 100;
    const deductions = [];

    // Check for essential sections
    if (!resumeData.name || resumeData.name.trim().length === 0) {
      score -= 10;
      deductions.push('Missing name');
    }

    if (!resumeData.email || !this.isValidEmail(resumeData.email)) {
      score -= 10;
      deductions.push('Missing or invalid email');
    }

    if (!resumeData.phone) {
      score -= 5;
      deductions.push('Missing phone number');
    }

    if (!resumeData.summary || resumeData.summary.trim().length < 50) {
      score -= 10;
      deductions.push('Weak or missing summary');
    }

    if (!resumeData.experience || resumeData.experience.length === 0) {
      score -= 20;
      deductions.push('No work experience listed');
    }

    if (!resumeData.skills || resumeData.skills.length === 0) {
      score -= 15;
      deductions.push('No skills listed');
    }

    if (!resumeData.education || resumeData.education.length === 0) {
      score -= 10;
      deductions.push('No education listed');
    }

    // Bonus for good formatting
    if (resumeData.experience && resumeData.experience.length > 0) {
      const hasDescriptions = resumeData.experience.every(exp => exp.description && exp.description.length > 20);
      if (hasDescriptions) {
        score += 5; // Bonus
      }
    }

    logger.debug('Format score', { score, deductions });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate experience match score
   */
  calculateExperienceMatch(resumeData, jobDescription) {
    if (!resumeData.experience || resumeData.experience.length === 0) {
      return 0;
    }

    const jobLower = jobDescription.toLowerCase();

    // Extract required years of experience from JD
    const yearMatches = jobDescription.match(/(\d+)\+?\s*years?/i);
    const requiredYears = yearMatches ? parseInt(yearMatches[1]) : null;

    // Calculate total years of experience
    const totalYears = this.calculateTotalYears(resumeData.experience);

    let score = 50; // Base score

    // Years match
    if (requiredYears !== null) {
      if (totalYears >= requiredYears) {
        score += 25;
      } else if (totalYears >= requiredYears * 0.75) {
        score += 15;
      } else {
        score -= 10;
      }
    }

    // Relevant experience
    const relevantExp = resumeData.experience.filter(exp => {
      const expText = `${exp.role} ${exp.company} ${exp.description}`.toLowerCase();
      const keywords = this.extractKeywords(jobDescription);

      const matchCount = keywords.filter(kw =>
        expText.includes(kw.toLowerCase())
      ).length;

      return matchCount >= 2; // At least 2 keyword matches
    });

    if (relevantExp.length > 0) {
      score += 25;
    }

    logger.debug('Experience match', { totalYears, requiredYears, relevantCount: relevantExp.length, score });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate skills match score
   */
  calculateSkillsMatch(resumeData, jobDescription) {
    if (!resumeData.skills || resumeData.skills.length === 0) {
      return 0;
    }

    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeSkills = resumeData.skills.map(s => s.toLowerCase());

    let matchCount = 0;
    const requiredSkills = jobKeywords.filter(kw => {
      // Filter for actual skills (not just any keyword)
      return kw.length > 2;
    });

    requiredSkills.forEach(skill => {
      if (resumeSkills.some(rs => rs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(rs))) {
        matchCount++;
      }
    });

    const score = requiredSkills.length > 0
      ? (matchCount / requiredSkills.length) * 100
      : 50;

    logger.debug('Skills match', { matched: matchCount, total: requiredSkills.length, score });

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate education match score
   */
  calculateEducationMatch(resumeData, jobDescription) {
    if (!resumeData.education || resumeData.education.length === 0) {
      // Check if education is required
      const eduRequired = jobDescription.toLowerCase().includes("bachelor") ||
                         jobDescription.toLowerCase().includes("master") ||
                         jobDescription.toLowerCase().includes("degree");

      return eduRequired ? 0 : 75; // If not required, neutral score
    }

    const jobLower = jobDescription.toLowerCase();
    let score = 50; // Base score for having education

    // Check for specific degree requirements
    const hasBachelor = resumeData.education.some(edu =>
      edu.degree?.toLowerCase().includes('bachelor')
    );

    const hasMaster = resumeData.education.some(edu =>
      edu.degree?.toLowerCase().includes('master')
    );

    const hasPhD = resumeData.education.some(edu =>
      edu.degree?.toLowerCase().includes('phd') || edu.degree?.toLowerCase().includes('doctorate')
    );

    if (jobLower.includes('phd') || jobLower.includes('doctorate')) {
      score = hasPhD ? 100 : hasMaster ? 75 : hasBachelor ? 50 : 25;
    } else if (jobLower.includes('master')) {
      score = hasMaster || hasPhD ? 100 : hasBachelor ? 75 : 50;
    } else if (jobLower.includes('bachelor')) {
      score = hasBachelor || hasMaster || hasPhD ? 100 : 50;
    } else {
      score = 75; // No specific requirement, having education is good
    }

    logger.debug('Education match', { hasBachelor, hasMaster, hasPhD, score });

    return Math.round(score);
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    // Common tech and business keywords
    const keywords = new Set();

    // Remove common words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);

    // Extract words (alphanumeric including + and #)
    const words = text.match(/[\w+#.-]+/g) || [];

    words.forEach(word => {
      const lower = word.toLowerCase();
      if (lower.length > 2 && !stopWords.has(lower)) {
        keywords.add(word);
      }
    });

    return Array.from(keywords);
  }

  /**
   * Convert resume to searchable text
   */
  resumeToText(resumeData) {
    const parts = [
      resumeData.name,
      resumeData.title,
      resumeData.summary,
      resumeData.skills?.join(' '),
      resumeData.experience?.map(e => `${e.role} ${e.company} ${e.description}`).join(' '),
      resumeData.education?.map(e => `${e.degree} ${e.institution} ${e.field}`).join(' '),
      resumeData.projects?.map(p => `${p.title} ${p.description}`).join(' '),
      resumeData.certifications?.map(c => c.name).join(' ')
    ];

    return parts.filter(Boolean).join(' ');
  }

  /**
   * Extract matched keywords
   */
  extractMatchedKeywords(resumeData, jobDescription) {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeText = this.resumeToText(resumeData).toLowerCase();
    const matched = [];

    jobKeywords.forEach(keyword => {
      if (resumeText.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      }
    });

    return matched.slice(0, 20); // Top 20
  }

  /**
   * Extract missing keywords
   */
  extractMissingKeywords(resumeData, jobDescription) {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeText = this.resumeToText(resumeData).toLowerCase();
    const missing = [];

    jobKeywords.forEach(keyword => {
      if (!resumeText.includes(keyword.toLowerCase())) {
        missing.push(keyword);
      }
    });

    return missing.slice(0, 20); // Top 20
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(scores, resumeData, jobDescription) {
    const suggestions = [];

    if (scores.keywordMatch < 70) {
      suggestions.push({
        type: 'keywords',
        priority: 'high',
        message: 'Add more keywords from the job description to your resume',
        action: 'Review missing keywords and naturally incorporate them into your experience and skills sections'
      });
    }

    if (scores.formatScore < 80) {
      suggestions.push({
        type: 'format',
        priority: 'high',
        message: 'Improve resume formatting and completeness',
        action: 'Ensure all sections (contact info, summary, experience, skills, education) are complete and well-formatted'
      });
    }

    if (scores.skillsMatch < 70) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Add relevant skills mentioned in the job description',
        action: 'Review the job requirements and add matching skills you possess to your skills section'
      });
    }

    if (scores.experienceMatch < 60) {
      suggestions.push({
        type: 'experience',
        priority: 'medium',
        message: 'Highlight relevant experience more prominently',
        action: 'Rewrite experience descriptions to emphasize achievements relevant to this role'
      });
    }

    if (!resumeData.summary || resumeData.summary.length < 100) {
      suggestions.push({
        type: 'summary',
        priority: 'medium',
        message: 'Strengthen your professional summary',
        action: 'Write a compelling 2-3 sentence summary that highlights your most relevant qualifications'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'optimization',
        priority: 'low',
        message: 'Your resume looks great! Minor optimizations could help',
        action: 'Continue refining your bullet points to be more impactful and results-oriented'
      });
    }

    return suggestions;
  }

  /**
   * Calculate total years of experience
   */
  calculateTotalYears(experience) {
    if (!experience || experience.length === 0) return 0;

    let totalMonths = 0;

    experience.forEach(exp => {
      const start = this.parseDate(exp.startDate);
      const end = exp.isCurrent ? new Date() : this.parseDate(exp.endDate);

      if (start && end) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
                      (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });

    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  /**
   * Parse date string
   */
  parseDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Try various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Try "Month Year" format
      const parts = dateStr.split(' ');
      if (parts.length === 2) {
        const months = ['january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = months.findIndex(m => m.startsWith(parts[0].toLowerCase()));
        if (monthIndex >= 0) {
          return new Date(parseInt(parts[1]), monthIndex, 1);
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
module.exports = new ATSScoreCalculator();
