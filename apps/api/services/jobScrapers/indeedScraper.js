/**
 * Indeed Job Scraper
 * Scrapes job details from Indeed job postings
 */

const GenericScraper = require('./genericScraper');
const logger = require('../../utils/logger');

class IndeedScraper extends GenericScraper {
  constructor() {
    super();
    this.platform = 'indeed';
  }

  /**
   * Check if URL is an Indeed job posting
   */
  static isIndeedUrl(url) {
    return url.includes('indeed.com/viewjob') || url.includes('indeed.com/jobs/view') || url.includes('indeed.com/rc/clk');
  }

  /**
   * Scrape job details from Indeed
   */
  async scrapeJob(url) {
    try {
      await this.navigateTo(url);

      // Wait for main content to load
      await this.waitForSelector('.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title-container', 5000);

      // Extract job title
      const jobTitle = await this.getTextContent(
        '.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title-container, h1[class*="jobTitle"]'
      );

      // Extract company name
      const company = await this.getTextContent(
        '[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader a, [class*="companyName"]'
      );

      // Extract location
      const location = await this.getTextContent(
        '[data-testid="jobsearch-JobInfoHeader-companyLocation"], .jobsearch-JobInfoHeader-subtitle-location, [class*="companyLocation"]'
      );

      // Extract job description
      let jobDescription = await this.getTextContent(
        '#jobDescriptionText, .jobsearch-jobDescriptionText, [id*="jobDescription"]'
      );

      // If description is empty, try getting all text from job details section
      if (!jobDescription) {
        jobDescription = await this.page.evaluate(() => {
          const descSection = document.querySelector('#jobDescriptionText, .jobsearch-JobComponent-description, [id*="description"]');
          return descSection ? descSection.innerText : '';
        });
      }

      // Extract salary if available
      const salary = await this.getTextContent(
        '#salaryInfoAndJobType, .jobsearch-JobMetadataHeader-item, [id*="salary"]'
      );

      // Extract job metadata (job type, employment type)
      const metadata = await this.getTextContents(
        '.jobsearch-JobMetadataHeader-item, [class*="metadata"]'
      );

      // Determine job type and employment type from metadata
      const jobType = this.extractJobType(metadata, jobDescription);
      const employmentType = this.extractEmploymentType(metadata, jobDescription);

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
        employmentType: employmentType,
        experience: parsed.experience,
        skills: parsed.skills,
        requirements: parsed.requirements,
        platform: this.platform
      };

      logger.info('Indeed job scraped successfully', {
        company: jobData.company,
        jobTitle: jobData.jobTitle
      });

      return this.cleanData(jobData);

    } catch (error) {
      logger.error('Indeed scraping failed', { url, error: error.message });
      throw new Error(`Failed to scrape Indeed job: ${error.message}`);
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Extract job type from metadata
   */
  extractJobType(metadata, description) {
    const combined = [...metadata, description].join(' ').toLowerCase();

    if (combined.includes('remote')) return 'Remote';
    if (combined.includes('hybrid')) return 'Hybrid';
    if (combined.includes('on-site') || combined.includes('in-person')) return 'On-site';

    return null;
  }

  /**
   * Extract employment type from metadata
   */
  extractEmploymentType(metadata, description) {
    const combined = [...metadata, description].join(' ').toLowerCase();

    if (combined.includes('full-time') || combined.includes('full time')) return 'Full-time';
    if (combined.includes('part-time') || combined.includes('part time')) return 'Part-time';
    if (combined.includes('contract')) return 'Contract';
    if (combined.includes('temporary') || combined.includes('temp')) return 'Temporary';
    if (combined.includes('internship')) return 'Internship';

    return null;
  }
}

module.exports = IndeedScraper;
