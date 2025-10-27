/**
 * LinkedIn-specific content script
 */

(function() {
  'use strict';

  console.log('RoleReady LinkedIn content script loaded');

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractLinkedInJob') {
      const jobData = extractLinkedInJobData();
      sendResponse(jobData);
      return true;
    }
  });

  /**
   * Extract LinkedIn job data with high precision
   */
  function extractLinkedInJobData() {
    const data = {
      title: '',
      company: '',
      location: '',
      description: '',
      url: window.location.href,
      source: 'linkedin',
      extractedAt: new Date().toISOString()
    };

    // Try multiple selectors for job title
    data.title = 
      document.querySelector('.jobs-unified-top-card__job-title')?.textContent?.trim() ||
      document.querySelector('.jobs-details-top-card__job-title')?.textContent?.trim() ||
      document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim() ||
      document.querySelector('h1')?.textContent?.trim() ||
      'LinkedIn Job';

    // Try multiple selectors for company
    data.company = 
      document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim() ||
      document.querySelector('.jobs-details-top-card__company-name')?.textContent?.trim() ||
      document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent?.trim() ||
      'Unknown Company';

    // Try multiple selectors for location
    data.location = 
      document.querySelector('.jobs-unified-top-card__primary-description-without-tagline')?.textContent?.trim() ||
      document.querySelector('.jobs-details-top-card__bullet')?.textContent?.trim() ||
      document.querySelector('[data-test-id="job-details-location"]')?.textContent?.trim() ||
      'Unknown Location';

    // Get job description
    data.description = 
      document.querySelector('.jobs-description-content__text')?.textContent?.trim() ||
      document.querySelector('.jobs-description__text')?.textContent?.trim() ||
      document.querySelector('[data-test-id="job-description"]')?.textContent?.trim() ||
      '';

    // Get salary if available
    const salaryElement = document.querySelector('.jobs-unified-top-card__job-insight')?.textContent;
    if (salaryElement) {
      data.salary = salaryElement.trim();
    }

    return data;
  }

  /**
   * Inject LinkedIn-specific features
   */
  function injectLinkedInFeatures() {
    // Add "Save to RoleReady" button on LinkedIn job cards
    const jobCards = document.querySelectorAll('.job-card-container');
    
    jobCards.forEach(card => {
      if (!card.querySelector('.roleready-save-btn')) {
        const btn = document.createElement('button');
        btn.className = 'roleready-save-btn';
        btn.innerHTML = '💼 Save to RoleReady';
        btn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          z-index: 1000;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const jobUrl = card.querySelector('a')?.href;
          if (jobUrl) {
            chrome.runtime.sendMessage({
              action: 'saveJob',
              data: extractLinkedInJobData()
            });
          }
        });

        card.style.position = 'relative';
        card.appendChild(btn);
      }
    });
  }

  // Watch for dynamically loaded content
  const observer = new MutationObserver(() => {
    if (window.location.pathname.includes('/jobs/view/')) {
      injectLinkedInFeatures();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  setTimeout(() => {
    injectLinkedInFeatures();
  }, 2000);

})();

