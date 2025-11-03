/**
 * Resume Data Normalizer
 * Normalizes parsed resume data before populating UI fields
 */

export class ResumeDataNormalizer {
  
  /**
   * Normalize text: trim, remove extra whitespace, handle line breaks
   */
  static normalizeText(text: string | null | undefined, maxLength?: number): string {
    if (!text) return '';
    
    let normalized = text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
      .trim();
    
    if (maxLength && normalized.length > maxLength) {
      normalized = normalized.substring(0, maxLength).trim();
    }
    
    return normalized;
  }

  /**
   * Convert bullet points text to array
   * Handles: • - * bullets, numbered lists, plain lines
   */
  static textToBullets(text: string | null | undefined): string[] {
    if (!text) return [];
    
    return text
      .split('\n')
      .map(line => {
        // Remove bullet markers: • - * or numbers
        return line
          .replace(/^[\s•\-\*]\s*/, '') // Remove bullet
          .replace(/^\d+[\.\)]\s*/, '') // Remove numbered prefix
          .trim();
      })
      .filter(line => line.length > 0);
  }

  /**
   * Convert array to bullet point text
   */
  static bulletsToText(bullets: string[] | null | undefined): string {
    if (!bullets || bullets.length === 0) return '';
    return bullets.map(bullet => `• ${bullet.trim()}`).join('\n');
  }

  /**
   * Normalize work experience description
   * Handles paragraphs, bullets, and mixed content
   */
  static normalizeWorkDescription(text: string | null | undefined): string {
    if (!text) return '';
    
    // If already has bullets, normalize them
    if (text.includes('•') || text.includes('-') || text.match(/^\s*[\-\*•]/m)) {
      return this.bulletsToText(this.textToBullets(text));
    }
    
    // If multiple lines, treat as bullets
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 1) {
      return this.bulletsToText(lines);
    }
    
    // Single paragraph, return as-is (max 10000 chars)
    return this.normalizeText(text, 10000);
  }

  /**
   * Normalize achievements array
   */
  static normalizeAchievements(achievements: any): string[] {
    if (!achievements) return [];
    
    if (Array.isArray(achievements)) {
      return achievements
        .map(a => typeof a === 'string' ? a : a.text || a.description || '')
        .filter(a => a.length > 0)
        .map(a => this.normalizeText(a, 1000)); // Max 1000 chars per achievement
    }
    
    if (typeof achievements === 'string') {
      return this.textToBullets(achievements);
    }
    
    return [];
  }

  /**
   * Normalize skills array
   */
  static normalizeSkills(skills: any): string[] {
    if (!skills) return [];
    
    if (Array.isArray(skills)) {
      return skills
        .map(s => typeof s === 'string' ? s : s.name || '')
        .filter(s => s.length > 0 && s.length < 100) // Max 100 chars per skill
        .map(s => this.normalizeText(s));
    }
    
    if (typeof skills === 'string') {
      // Handle comma-separated or newline-separated
      return skills
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100);
    }
    
    return [];
  }

  /**
   * Normalize date string
   * Handles various formats: "2020-06-01", "Jun 2020", "06/2020", etc.
   */
  static normalizeDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to parse and format
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // If parsing fails, return as-is for user to edit
      return dateStr;
    }
    
    return dateStr; // Return as-is if can't parse
  }

  /**
   * Normalize phone number
   */
  static normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure starts with +
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned || null;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string | null | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Prepare parsed data for UI fields
   */
  static prepareForUI(parsedData: any): any {
    return {
      personal: {
        firstName: this.normalizeText(parsedData.personal?.firstName, 100),
        lastName: this.normalizeText(parsedData.personal?.lastName, 100),
        email: this.normalizeText(parsedData.personal?.email, 254),
        phone: this.normalizePhone(parsedData.personal?.phone),
        location: this.normalizeText(parsedData.personal?.location, 200)
      },
      bio: this.normalizeText(parsedData.personal?.summary || parsedData.bio, 5000),
      workExperiences: (parsedData.workExperience || []).map((exp: any) => ({
        ...exp,
        company: this.normalizeText(exp.company, 200),
        role: this.normalizeText(exp.role, 200),
        description: this.normalizeWorkDescription(exp.description),
        startDate: this.normalizeDate(exp.startDate),
        endDate: this.normalizeDate(exp.endDate),
        achievements: this.normalizeAchievements(exp.achievements || [])
      })),
      education: (parsedData.education || []).map((edu: any) => ({
        ...edu,
        institution: this.normalizeText(edu.institution, 300),
        degree: this.normalizeText(edu.degree, 200),
        field: this.normalizeText(edu.field, 200),
        graduationDate: this.normalizeDate(edu.graduationDate)
      })),
      skills: this.normalizeSkills(parsedData.skills),
      certifications: (parsedData.certifications || []).map((cert: any) => ({
        ...cert,
        name: this.normalizeText(cert.name, 300),
        issuer: this.normalizeText(cert.issuer, 200),
        date: this.normalizeDate(cert.date)
      }))
    };
  }
}

