# Browser Extension - Job Search Copilot

A Chrome/Edge extension that helps users capture job listings, auto-fill applications, and sync with RoleReady.

## Features

### 1. **One-Click Job Capture**
- Click extension icon on any job listing
- Automatically extracts:
  - Job title
  - Company name
  - Location
  - Description
  - Requirements
  - Application URL
- Instantly adds to RoleReady job tracker

### 2. **Smart Resume Tailoring**
- Right-click context menu on job description
- Click "Tailor Resume" 
- Extension analyzes job requirements
- Generates tailored resume version
- Auto-opens in RoleReady editor

### 3. **Quick Application Status**
- Badge shows total active applications
- Click to view dashboard
- See application pipeline at a glance

### 4. **Smart Autofill**
- Detects application forms
- Auto-fills with RoleReady profile data
- Works on common job boards:
  - LinkedIn
  - Indeed
  - Glassdoor
  - Company career pages

### 5. **ATS Checker**
- Highlight any text on job board
- Right-click → "Check ATS Score"
- Instantly see how your resume matches
- Get keyword suggestions

## Installation

```bash
cd browser-extension
npm install
npm run build
```

### Chrome Installation
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build` folder

### Edge Installation
1. Open `edge://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build` folder

## Extension Manifest

```json
{
  "manifest_version": 3,
  "name": "RoleReady - Job Search Copilot",
  "version": "1.0.0",
  "description": "Capture jobs, auto-fill applications, and manage your job search",
  "permissions": [
    "activeTab",
    "contextMenus",
    "storage",
    "tabs"
  ],
  "host_permissions": [
    "http://localhost:3001/*",
    "https://*.linkedin.com/*",
    "https://*.indeed.com/*",
    "https://*.glassdoor.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

## Implementation Files

### 1. `popup.html` - Extension Popup
Shows quick access to:
- Active job count
- Recent applications
- Quick actions

### 2. `background.js` - Service Worker
Handles:
- Job capture logic
- API communication with RoleReady
- Badge updates
- Context menu registration

### 3. `content.js` - Page Injection
Extracts data from:
- LinkedIn job listings
- Indeed job postings
- General application forms
- Detects form fields for autofill

### 4. `jobCapture.js` - Core Logic
```javascript
// Captures job data from current page
async function captureJob() {
  const jobData = {
    title: extractTitle(),
    company: extractCompany(),
    location: extractLocation(),
    description: extractDescription(),
    url: window.location.href
  };
  
  await sendToRoleReady(jobData);
}

// Smart form detection
function detectApplicationForm() {
  const forms = document.querySelectorAll('form');
  // Analyze forms for autofill opportunities
  return autofillableForms(forms);
}
```

## API Integration

### Save Job to RoleReady
```javascript
POST http://localhost:3001/api/jobs
{
  "title": "Software Engineer",
  "company": "TechCorp",
  "location": "San Francisco, CA",
  "status": "applied",
  "source": "extension_linkedin",
  "description": "...",
  "url": "https://..."
}
```

### Tailor Resume
```javascript
POST http://localhost:3001/api/ai/tailor-resume
{
  "jobDescription": "...",
  "resumeId": "..."
}
```

## Usage Examples

### Scenario 1: LinkedIn Job Capture
1. User browses LinkedIn jobs
2. Sees interesting position
3. Clicks RoleReady extension icon
4. Job automatically added to tracker
5. Option to "Apply Now" or "Save for Later"

### Scenario 2: Indeed Application
1. User finds job on Indeed
2. Starts filling application form
3. Extension detects form fields
4. Shows "Auto-fill with RoleReady" button
5. Clicks → Form pre-filled with profile data

### Scenario 3: Resume Tailoring
1. User reads job description
2. Highlights text
3. Right-clicks → "Check ATS Score"
4. Extension shows keyword matches
5. Option to generate tailored version

## Future Enhancements

1. **AI Cover Letter Generation**
   - Right-click → "Generate Cover Letter"
   - Analyzes job description
   - Creates tailored cover letter

2. **Interview Prep**
   - Extract job description
   - Generate practice questions
   - Simulate interview scenarios

3. **Job Board Sync**
   - Automatically sync all job boards
   - Deduplicate listings
   - Track across platforms

4. **Application Reminders**
   - Notifications for follow-ups
   - Deadline reminders
   - Interview schedules

## Development Notes

The Browser Extension would be a separate project within the monorepo:

```
RoleReady-FullStack/
├── browser-extension/
│   ├── manifest.json
│   ├── src/
│   │   ├── popup/
│   │   ├── background/
│   │   ├── content/
│   │   └── utils/
│   ├── icons/
│   └── webpack.config.js
```

## Integration with RoleReady

The extension communicates with RoleReady backend through:
- REST API for job data
- WebSocket for real-time updates
- Chrome Storage API for local caching

All features would work seamlessly with the main RoleReady platform!

