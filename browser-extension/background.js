/**
 * Background Service Worker for RoleReady Extension
 */

const API_BASE = 'http://localhost:3001';

/**
 * Extension installation handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('RoleReady extension installed');
    
    // Create context menus
    chrome.contextMenus.create({
      id: 'saveToRoleReady',
      title: 'Save to RoleReady',
      contexts: ['page', 'selection']
    });

    chrome.contextMenus.create({
      id: 'tailorResume',
      title: 'Tailor Resume',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'checkATS',
      title: 'Check ATS Score',
      contexts: ['selection']
    });
  }
});

/**
 * Context menu click handler
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'saveToRoleReady':
      saveCurrentPageToRoleReady(tab);
      break;
    case 'tailorResume':
      tailorResumeForJob(info.selectionText);
      break;
    case 'checkATS':
      checkATSScore(info.selectionText);
      break;
  }
});

/**
 * Message handler from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'saveJob':
      handleSaveJob(message.data);
      break;
    case 'syncData':
      syncDataWithBackend(message.data);
      break;
    case 'fetchUserData':
      fetchUserDataForAutoFill().then(data => sendResponse(data));
      return true; // Keep channel open for async response
    default:
      console.log('Unknown message action:', message.action);
  }
});

/**
 * Save current page to RoleReady
 */
async function saveCurrentPageToRoleReady(tab) {
  try {
    const jobData = await extractJobData(tab);
    const result = await syncJobToBackend(jobData);
    
    if (result) {
      showNotification('Success', 'Job saved to RoleReady');
    } else {
      showNotification('Error', 'Failed to save job');
    }
  } catch (error) {
    console.error('Error saving job:', error);
    showNotification('Error', 'Failed to save job');
  }
}

/**
 * Extract job data from current page
 */
async function extractJobData(tab) {
  // Extract data based on URL
  if (tab.url.includes('linkedin.com/jobs')) {
    return await extractLinkedInJob(tab.id);
  } else if (tab.url.includes('indeed.com')) {
    return await extractIndeedJob(tab.id);
  } else if (tab.url.includes('glassdoor.com')) {
    return await extractGlassdoorJob(tab.id);
  }
  
  // Generic extraction
  return {
    title: 'Job from ' + new URL(tab.url).hostname,
    company: 'Unknown',
    url: tab.url,
    source: 'unknown'
  };
}

/**
 * Extract LinkedIn job data
 */
async function extractLinkedInJob(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'extractLinkedInJob' }, (response) => {
      resolve(response || {
        title: 'LinkedIn Job',
        company: 'Company',
        location: 'Location',
        url: '',
        description: '',
        source: 'linkedin'
      });
    });
  });
}

/**
 * Extract Indeed job data
 */
async function extractIndeedJob(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'extractIndeedJob' }, (response) => {
      resolve(response || {
        title: 'Indeed Job',
        company: 'Company',
        location: 'Location',
        url: '',
        description: '',
        source: 'indeed'
      });
    });
  });
}

/**
 * Extract Glassdoor job data
 */
async function extractGlassdoorJob(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'extractGlassdoorJob' }, (response) => {
      resolve(response || {
        title: 'Glassdoor Job',
        company: 'Company',
        location: 'Location',
        url: '',
        description: '',
        source: 'glassdoor'
      });
    });
  });
}

/**
 * Sync job to backend
 */
async function syncJobToBackend(jobData) {
  try {
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync job:', error);
    return false;
  }
}

/**
 * Tailor resume for job
 */
async function tailorResumeForJob(jobDescription) {
  // Send message to content script to show tailoring UI
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showTailorUI',
      jobDescription
    });
  }
}

/**
 * Check ATS score
 */
async function checkATSScore(text) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showATS',
      text
    });
  }
}

/**
 * Fetch user data for auto-fill
 */
async function fetchUserDataForAutoFill() {
  try {
    const response = await fetch(`${API_BASE}/api/user/profile`);
    const data = await response.json();
    
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      github: data.github,
      website: data.website,
      experience: data.experience,
      education: data.education,
      skills: data.skills
    };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

/**
 * Sync data with backend
 */
async function syncDataWithBackend(data) {
  try {
    await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Failed to sync data:', error);
  }
}

/**
 * Show notification
 */
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
}

/**
 * Badge update handler
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Update badge based on page type
    if (tab.url.includes('linkedin.com/jobs') || 
        tab.url.includes('indeed.com') ||
        tab.url.includes('glassdoor.com')) {
      chrome.action.setBadgeText({ text: '💼', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && (
      tab.url.includes('linkedin.com/jobs') ||
      tab.url.includes('indeed.com') ||
      tab.url.includes('glassdoor.com')
    )) {
      chrome.action.setBadgeText({ text: '💼', tabId: tab.id });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }
  });
});

console.log('RoleReady background service worker loaded');

