/**
 * Indeed-specific content script
 */

(function() {
  'use strict';

  console.log('RoleReady Indeed content script loaded');

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractIndeedJob') {
      const jobData = extractIndeedJobData();
      sendResponse(jobData);
      return true;
    }
  });

  /**
   * Extract Indeed job data
   */
  function extractIndeedJobData() {
    const data = {
      title: '',
      company: '',
      location: '',
      description: '',
      url: window.location.href,
      source: 'indeed',
      extractedAt: new Date().toISOString()
    };

    // Job title
    data.title = 
      document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() ||
      document.querySelector('h2[class*="jobTitle"]')?.textContent?.trim() ||
      document.querySelector('h1').textContent?.trim() ||
      'Indeed Job';

    // Company name
    data.company = 
      document.querySelector('[data-testid="jobInfoHeader-companyName"]')?.textContent?.trim() ||
      document.querySelector('[class*="companyName"]')?.textContent?.trim() ||
      'Unknown Company';

    // Location
    data.location = 
      document.querySelector('[data-testid="jobInfoHeader-location"]')?.textContent?.trim() ||
      document.querySelector('[class*="location"]')?.textContent?.trim() ||
      'Unknown Location';

    // Job description
    data.description = 
      document.querySelector('#jobDescriptionText')?.textContent?.trim() ||
      document.querySelector('[class*="jobDescription"]')?.textContent?.trim() ||
      '';

    // Salary if available
    const salaryElement = document.querySelector('[class*="salary"]')?.textContent;
    if (salaryElement) {
      data.salary = salaryElement.trim();
    }

    // Posted date
    const postedDate = document.querySelector('[class*="date"]')?.textContent;
    if (postedDate) {
      data.postedDate = postedDate.trim();
    }

    return data;
  }

  /**
   * Inject Indeed-specific features
   */
  function injectIndeedFeatures() {
    // Add save button to job listings
    const jobCards = document.querySelectorAll('[class*="job_seen_beacon"]');
    
    jobCards.forEach(card => {
      if (!card.querySelector('.roleready-save-btn')) {
        const btn = document.createElement('button');
        btn.className = 'roleready-save-btn';
        btn.innerHTML = '💼 Save';
        btn.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        `;

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.runtime.sendMessage({
            action: 'saveJob',
            data: extractIndeedJobData()
          });
        });

        const actionSection = card.querySelector('[class*="buttonList"]');
        if (actionSection) {
          actionSection.appendChild(btn);
        }
      }
    });
  }

  // Watch for dynamically loaded content
  const observer = new MutationObserver(() => {
    injectIndeedFeatures();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial injection
  setTimeout(() => {
    injectIndeedFeatures();
  }, 2000);

})();

