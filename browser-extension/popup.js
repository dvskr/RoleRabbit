/**
 * Popup JavaScript for RoleReady Browser Extension
 */

// API base URL
const API_BASE = 'http://localhost:3001';

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();
  setupEventListeners();
});

/**
 * Load statistics from API
 */
async function loadStats() {
  try {
    // Get current active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];

    // In production, fetch real stats from API
    // const response = await fetch(`${API_BASE}/api/user/stats`);
    // const data = await response.json();
    
    // For now, use mock data
    const data = {
      activeJobs: 12,
      totalApplications: 45,
      interviews: 8,
      offers: 2
    };

    document.getElementById('activeJobs').textContent = data.activeJobs;
    document.getElementById('applications').textContent = data.totalApplications;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save current job
  document.getElementById('saveCurrentJob').addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      // Send message to content script to capture job
      chrome.tabs.sendMessage(currentTab.id, { action: 'captureJob' });
      
      // Close popup after a short delay
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  });

  // Tailor resume
  document.getElementById('tailorResume').addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      chrome.tabs.sendMessage(currentTab.id, { action: 'tailorResume' });
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Failed to tailor resume:', error);
    }
  });

  // Check ATS score
  document.getElementById('checkATS').addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      chrome.tabs.sendMessage(currentTab.id, { action: 'checkATS' });
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Failed to check ATS:', error);
    }
  });

  // Open dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
    window.close();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'j') {
      document.getElementById('saveCurrentJob').click();
    }
  });
}

/**
 * Sync with backend
 */
async function syncWithBackend(jobData) {
  try {
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      throw new Error('Failed to sync with backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Sync error:', error);
    return null;
  }
}

