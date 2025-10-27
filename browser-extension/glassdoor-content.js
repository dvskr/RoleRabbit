/**
 * Glassdoor-specific content script
 */

(function() {
  'use strict';

  console.log('RoleReady Glassdoor content script loaded');

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractGlassdoorJob') {
      const jobData = extractGlassdoorJobData();
      sendResponse(jobData);
      return true;
    }
  });

  /**
   * Extract Glassdoor job data
   */
  function extractGlassdoorJobData() {
    const data = {
      title: '',
      company: '',
      location: '',
      description: '',
      url: window.location.href,
      source: 'glassdoor',
      extractedAt: new Date().toISOString()
    };

    // Job title
    data.title = 
      document.querySelector('.jobTitle')?.textContent?.trim() ||
      document.querySelector('h1.eiReviews-sub-header')?.textContent?.trim() ||
      document.querySelector('h2.title')?.textContent?.trim() ||
      'Glassdoor Job';

    // Company name
    data.company = 
      document.querySelector('.employerName')?.textContent?.trim() ||
      document.querySelector('.css-1s4z4ah')?.textContent?.trim() ||
      'Unknown Company';

    // Location
    data.location = 
      document.querySelector('[data-test="job-location"]')?.textContent?.trim() ||
      document.querySelector('.job-details-location')?.textContent?.trim() ||
      'Unknown Location';

    // Job description
    data.description = 
      document.querySelector('.jobDesc')?.textContent?.trim() ||
      document.querySelector('.job-description')?.textContent?.trim() ||
      '';

    // Salary range if available
    const salaryElement = document.querySelector('.salary')?.textContent;
    if (salaryElement) {
      data.salary = salaryElement.trim();
    }

    // Company rating
    const rating = document.querySelector('.rating')?.textContent?.trim();
    if (rating) {
      data.companyRating = rating;
    }

    return data;
  }

  /**
   * Inject Glassdoor-specific features
   */
  function injectGlassdoorFeatures() {
    // Add save button to job pages
    const header = document.querySelector('.css-1wdhy9n, .header');
    
    if (header && !header.querySelector('.roleready-save-btn')) {
      const btn = document.createElement('button');
      btn.className = 'roleready-save-btn';
      btn.innerHTML = '💼 Save to RoleReady';
      btn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-left: 15px;
      `;

      btn.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: 'saveJob',
          data: extractGlassdoorJobData()
        });
      });

      header.appendChild(btn);
    }
  }

  // Watch for dynamically loaded content
  const observer = new MutationObserver(() => {
    if (window.location.pathname.includes('/job-listing/')) {
      injectGlassdoorFeatures();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  setTimeout(() => {
    injectGlassdoorFeatures();
  }, 2000);

})();

