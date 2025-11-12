/**
 * Generic Job Scraper Base Class
 * Provides common functionality for all job scrapers
 */

const puppeteer = require('puppeteer');
const logger = require('../../utils/logger');

class GenericScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser instance
   */
  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ]
      });

      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });

      logger.info('Browser initialized for scraping');
    } catch (error) {
      logger.error('Failed to initialize browser', { error: error.message });
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('Browser closed');
    } catch (error) {
      logger.error('Error closing browser', { error: error.message });
    }
  }

  /**
   * Navigate to URL with timeout and error handling
   */
  async navigateTo(url, options = {}) {
    const { timeout = 30000, waitUntil = 'networkidle2' } = options;

    try {
      if (!this.page) {
        await this.initBrowser();
      }

      logger.info('Navigating to URL', { url });
      await this.page.goto(url, { timeout, waitUntil });

      // Wait for page to be fully loaded
      await this.page.waitForTimeout(2000);

      return true;
    } catch (error) {
      logger.error('Navigation failed', { url, error: error.message });
      throw new Error(`Failed to load page: ${error.message}`);
    }
  }

  /**
   * Extract text content from selector
   */
  async getTextContent(selector, defaultValue = '') {
    try {
      const element = await this.page.$(selector);
      if (!element) return defaultValue;

      const text = await this.page.evaluate(el => el.textContent.trim(), element);
      return text || defaultValue;
    } catch (error) {
      logger.debug('Failed to get text content', { selector });
      return defaultValue;
    }
  }

  /**
   * Extract multiple text contents from selectors
   */
  async getTextContents(selector) {
    try {
      const elements = await this.page.$$(selector);
      const texts = [];

      for (const element of elements) {
        const text = await this.page.evaluate(el => el.textContent.trim(), element);
        if (text) texts.push(text);
      }

      return texts;
    } catch (error) {
      logger.debug('Failed to get text contents', { selector });
      return [];
    }
  }

  /**
   * Extract attribute value from selector
   */
  async getAttribute(selector, attribute, defaultValue = '') {
    try {
      const element = await this.page.$(selector);
      if (!element) return defaultValue;

      const value = await this.page.evaluate(
        (el, attr) => el.getAttribute(attr),
        element,
        attribute
      );

      return value || defaultValue;
    } catch (error) {
      logger.debug('Failed to get attribute', { selector, attribute });
      return defaultValue;
    }
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    try {
      const element = await this.page.$(selector);
      return element !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for selector with timeout
   */
  async waitForSelector(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      logger.debug('Selector not found', { selector });
      return false;
    }
  }

  /**
   * Extract job data - to be implemented by subclasses
   */
  async scrapeJob(url) {
    throw new Error('scrapeJob method must be implemented by subclass');
  }

  /**
   * Clean and normalize extracted data
   */
  cleanData(data) {
    const cleaned = {};

    // Clean company name
    if (data.company) {
      cleaned.company = data.company.trim().replace(/\s+/g, ' ');
    }

    // Clean job title
    if (data.jobTitle) {
      cleaned.jobTitle = data.jobTitle.trim().replace(/\s+/g, ' ');
    }

    // Clean job description
    if (data.jobDescription) {
      cleaned.jobDescription = data.jobDescription
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n'); // Preserve paragraph breaks
    }

    // Clean location
    if (data.location) {
      cleaned.location = data.location.trim().replace(/\s+/g, ' ');
    }

    // Clean job URL
    if (data.jobUrl) {
      cleaned.jobUrl = data.jobUrl.split('?')[0]; // Remove query parameters
    }

    // Preserve other fields
    cleaned.salary = data.salary || null;
    cleaned.jobType = data.jobType || null; // Remote, Hybrid, Onsite
    cleaned.employmentType = data.employmentType || null; // Full-time, Part-time, Contract
    cleaned.experience = data.experience || null;
    cleaned.skills = data.skills || [];
    cleaned.requirements = data.requirements || [];

    return cleaned;
  }

  /**
   * Parse job description to extract requirements and skills
   */
  parseJobDescription(description) {
    const result = {
      requirements: [],
      skills: [],
      experience: null,
      education: null
    };

    if (!description) return result;

    // Extract experience requirements (e.g., "3+ years", "5-7 years")
    const expMatch = description.match(/(\d+)[\s-+]+(?:to\s+)?(\d+)?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i);
    if (expMatch) {
      const min = parseInt(expMatch[1]);
      const max = expMatch[2] ? parseInt(expMatch[2]) : null;
      result.experience = max ? `${min}-${max} years` : `${min}+ years`;
    }

    // Extract education requirements
    const eduMatch = description.match(/bachelor'?s?\s+degree|master'?s?\s+degree|phd|doctorate/i);
    if (eduMatch) {
      result.education = eduMatch[0];
    }

    // Common tech skills to look for
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'typescript',
      'aws', 'docker', 'kubernetes', 'sql', 'nosql', 'mongodb',
      'git', 'agile', 'scrum', 'ci/cd', 'rest api', 'graphql'
    ];

    const descLower = description.toLowerCase();
    result.skills = commonSkills.filter(skill => descLower.includes(skill));

    return result;
  }
}

module.exports = GenericScraper;
