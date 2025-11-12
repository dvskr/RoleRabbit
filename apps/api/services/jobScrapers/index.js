/**
 * Job Scraper Service
 * Main entry point for scraping jobs from various platforms
 */

const LinkedInScraper = require('./linkedinScraper');
const IndeedScraper = require('./indeedScraper');
const logger = require('../../utils/logger');

/**
 * Detect job board platform from URL
 */
function detectPlatform(url) {
  if (LinkedInScraper.isLinkedInUrl(url)) {
    return 'linkedin';
  }
  if (IndeedScraper.isIndeedUrl(url)) {
    return 'indeed';
  }
  // Add more platforms here as needed
  return 'unknown';
}

/**
 * Scrape job details from URL
 * @param {string} url - Job posting URL
 * @returns {Promise<Object>} - Scraped job data
 */
async function scrapeJobFromUrl(url) {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided');
    }

    // Normalize URL
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Detect platform
    const platform = detectPlatform(url);

    logger.info('Scraping job from URL', { url, platform });

    // Route to appropriate scraper
    let scraper;
    switch (platform) {
      case 'linkedin':
        scraper = new LinkedInScraper();
        break;
      case 'indeed':
        scraper = new IndeedScraper();
        break;
      default:
        throw new Error(`Unsupported job board: ${url}. Currently supported: LinkedIn, Indeed`);
    }

    // Scrape job data
    const jobData = await scraper.scrapeJob(url);

    return {
      success: true,
      platform,
      data: jobData
    };

  } catch (error) {
    logger.error('Job scraping failed', { url, error: error.message });
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Scrape multiple jobs from URLs
 * @param {string[]} urls - Array of job posting URLs
 * @returns {Promise<Object>} - Results for all URLs
 */
async function scrapeMultipleJobs(urls) {
  const results = await Promise.allSettled(
    urls.map(url => scrapeJobFromUrl(url))
  );

  const successful = results
    .filter(r => r.status === 'fulfilled' && r.value.success)
    .map(r => r.value);

  const failed = results
    .map((r, i) => ({ result: r, url: urls[i] }))
    .filter(({ result }) => result.status === 'rejected' || !result.value.success)
    .map(({ result, url }) => ({
      url,
      error: result.reason?.message || result.value?.error || 'Unknown error'
    }));

  return {
    successful,
    failed,
    summary: {
      total: urls.length,
      successful: successful.length,
      failed: failed.length
    }
  };
}

module.exports = {
  scrapeJobFromUrl,
  scrapeMultipleJobs,
  detectPlatform
};
