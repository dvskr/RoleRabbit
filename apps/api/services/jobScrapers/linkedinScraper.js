/**
 * LinkedIn Job Scraper
 * Scrapes job details from LinkedIn job postings
 */

const GenericScraper = require('./genericScraper');
const logger = require('../../utils/logger');

class LinkedInScraper extends GenericScraper {
  constructor() {
    super();
    this.platform = 'linkedin';
  }

  /**
   * Check if URL is a LinkedIn job posting
   */
  static isLinkedInUrl(url) {
    return url.includes('linkedin.com/jobs/view/') || url.includes('linkedin.com/jobs/collections/');
  }

  /**
   * Scrape job details from LinkedIn
   */
  async scrapeJob(url) {
    try {
      await this.navigateTo(url);

      // Wait for main content to load
      await this.waitForSelector('.top-card-layout', 5000);

      // Extract job title
      const jobTitle = await this.getTextContent(
        '.top-card-layout__title, h1.topcard__title, .job-details-jobs-unified-top-card__job-title'
      );

      // Extract company name
      const company = await this.getTextContent(
        '.top-card-layout__card .topcard__flavor--black-link, .job-details-jobs-unified-top-card__company-name a, .topcard__org-name-link'
      );

      // Extract location
      const location = await this.getTextContent(
        '.top-card-layout__card .topcard__flavor, .job-details-jobs-unified-top-card__bullet, .topcard__flavor--bullet'
      );

      // Extract job description
      let jobDescription = await this.getTextContent(
        '.show-more-less-html__markup, .description__text, .core-section-container__content'
      );

      // If description is empty, try alternative selectors
      if (!jobDescription) {
        jobDescription = await this.page.evaluate(() => {
          const descSection = document.querySelector('.description, .job-view-layout, [class*="description"]');
          return descSection ? descSection.innerText : '';
        });
      }

      // Extract job type (Remote, Hybrid, On-site)
      const jobTypeElement = await this.getTextContent(
        '.jobs-unified-top-card__workplace-type, .job-details-jobs-unified-top-card__job-insight span'
      );
      const jobType = this.determineJobType(jobTypeElement, jobDescription);

      // Extract employment type (Full-time, Part-time, Contract)
      const employmentType = await this.getTextContent(
        '.jobs-unified-top-card__job-insight span, .job-details-jobs-unified-top-card__job-insight--highlight'
      );

      // Extract salary if available
      const salary = await this.getTextContent(
        '.jobs-unified-top-card__job-insight--salary, .salary'
      );

      // Parse description for additional details
      const parsed = this.parseJobDescription(jobDescription);

      // Construct job data
      const jobData = {
        company: company || 'Unknown Company',
        jobTitle: jobTitle || 'Unknown Position',
        jobDescription: jobDescription || 'No description available',
        location: location || 'Not specified',
        jobUrl: url,
        salary: salary || null,
        jobType: jobType,
        employmentType: employmentType || null,
        experience: parsed.experience,
        skills: parsed.skills,
        requirements: parsed.requirements,
        platform: this.platform
      };

      logger.info('LinkedIn job scraped successfully', {
        company: jobData.company,
        jobTitle: jobData.jobTitle
      });

      return this.cleanData(jobData);

    } catch (error) {
      logger.error('LinkedIn scraping failed', { url, error: error.message });
      throw new Error(`Failed to scrape LinkedIn job: ${error.message}`);
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Determine job type from text
   */
  determineJobType(text, description) {
    const combined = `${text} ${description}`.toLowerCase();

    if (combined.includes('remote')) return 'Remote';
    if (combined.includes('hybrid')) return 'Hybrid';
    if (combined.includes('on-site') || combined.includes('onsite') || combined.includes('in-office')) {
      return 'On-site';
    }

    return null;
  }
}

module.exports = LinkedInScraper;
