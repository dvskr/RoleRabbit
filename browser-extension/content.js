/**
 * Content Script for RoleReady Extension
 * Injects into all pages to detect job listings
 */

(function() {
  'use strict';

  console.log('RoleReady content script loaded');

  // Detect page type
  const url = window.location.href;
  let pageType = 'unknown';

  if (url.includes('linkedin.com/jobs')) {
    pageType = 'linkedin';
  } else if (url.includes('indeed.com')) {
    pageType = 'indeed';
  } else if (url.includes('glassdoor.com')) {
    pageType = 'glassdoor';
  } else if (url.includes('ziprecruiter.com')) {
    pageType = 'ziprecruiter';
  }

  /**
   * Extract job data based on page type
   */
  function extractJobData() {
    switch (pageType) {
      case 'linkedin':
        return extractLinkedInJob();
      case 'indeed':
        return extractIndeedJob();
      case 'glassdoor':
        return extractGlassdoorJob();
      default:
        return extractGenericJob();
    }
  }

  /**
   * Extract LinkedIn job data
   */
  function extractLinkedInJob() {
    const jobTitle = document.querySelector('.jobs-details-top-card__job-title, .jobs-unified-top-card__job-title')?.textContent?.trim();
    const company = document.querySelector('.jobs-details-top-card__company-name, .jobs-unified-top-card__company-name')?.textContent?.trim();
    const location = document.querySelector('.jobs-details-top-card__bullet, .jobs-unified-top-card__primary-description')?.textContent?.trim();
    const description = document.querySelector('.jobs-description-content__text, .jobs-description__text')?.textContent?.trim();
    const url = window.location.href;

    return {
      title: jobTitle || 'LinkedIn Job',
      company: company || 'Unknown Company',
      location: location || 'Unknown Location',
      description: description || '',
      url: url,
      source: 'linkedin',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Extract Indeed job data
   */
  function extractIndeedJob() {
    const jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim();
    const company = document.querySelector('[data-testid="jobInfoHeader-companyName"]')?.textContent?.trim();
    const location = document.querySelector('[data-testid="jobInfoHeader-location"]')?.textContent?.trim();
    const description = document.querySelector('#jobDescriptionText')?.textContent?.trim();
    const url = window.location.href;

    return {
      title: jobTitle || 'Indeed Job',
      company: company || 'Unknown Company',
      location: location || 'Unknown Location',
      description: description || '',
      url: url,
      source: 'indeed',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Extract Glassdoor job data
   */
  function extractGlassdoorJob() {
    const jobTitle = document.querySelector('.jobTitle')?.textContent?.trim();
    const company = document.querySelector('.employerName, .css-1s4z4ah')?.textContent?.trim();
    const location = document.querySelector('[data-test="job-location"]')?.textContent?.trim();
    const description = document.querySelector('.jobDesc')?.textContent?.trim();
    const url = window.location.href;

    return {
      title: jobTitle || 'Glassdoor Job',
      company: company || 'Unknown Company',
      location: location || 'Unknown Location',
      description: description || '',
      url: url,
      source: 'glassdoor',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Extract generic job data
   */
  function extractGenericJob() {
    const title = document.querySelector('h1, .job-title, .jobTitle')?.textContent?.trim();
    const company = document.querySelector('.company, .employer, .job-company')?.textContent?.trim();
    const url = window.location.href;

    return {
      title: title || 'Job Posting',
      company: company || 'Unknown Company',
      location: 'Unknown',
      description: '',
      url: url,
      source: 'generic',
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Inject floating action button
   */
  function injectFloatingButton() {
    // Remove existing button if any
    const existing = document.getElementById('roleready-float-btn');
    if (existing) existing.remove();

    const btn = document.createElement('div');
    btn.id = 'roleready-float-btn';
    btn.innerHTML = '💼 RoleReady';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      transition: transform 0.2s;
      user-select: none;
    `;

    btn.addEventListener('click', () => {
      const jobData = extractJobData();
      chrome.runtime.sendMessage({
        action: 'saveJob',
        data: jobData
      });
      
      // Show success message
      btn.textContent = '✓ Saved!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = '💼 RoleReady';
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 2000);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });

    document.body.appendChild(btn);
  }

  /**
   * Message listener from popup/background
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'captureJob':
        const jobData = extractJobData();
        chrome.runtime.sendMessage({
          action: 'saveJob',
          data: jobData
        });
        sendResponse({ success: true });
        break;

      case 'tailorResume':
        showTailorModal();
        sendResponse({ success: true });
        break;

      case 'checkATS':
        showATSPanel(message.text || extractJobData().description);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false });
    }
    return true;
  });

  /**
   * Show tailor resume modal
   */
  function showTailorModal() {
    console.log('Show tailor resume modal');
    // Implementation for resume tailoring UI
  }

  /**
   * Show ATS check panel
   */
  function showATSPanel(jobDescription) {
    console.log('Show ATS panel', jobDescription);
    // Implementation for ATS check UI
  }

  // Inject floating button if on job board
  if (pageType !== 'unknown') {
    setTimeout(() => {
      injectFloatingButton();
    }, 1000);
  }

})();

