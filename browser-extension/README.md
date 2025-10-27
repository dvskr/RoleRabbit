# RoleReady Browser Extension

A powerful browser extension that acts as your AI-powered job search copilot across all job boards.

## Features

### 🎯 Job Capture
- One-click job save from LinkedIn, Indeed, Glassdoor, and more
- Automatically extracts job title, company, description, location
- Synced instantly with your RoleReady dashboard

### ✨ Resume Tailoring
- Tailor your resume to match job descriptions
- AI-powered keyword optimization
- ATS score checking in real-time

### 📋 Auto-Fill
- Fill application forms with one click
- Pulls data from your RoleReady profile
- Works across major job boards and ATS systems

### 🚀 Quick Actions
- Keyboard shortcuts (Ctrl+J to save)
- Context menu options
- Floating action button on job pages

## Installation

### Chrome/Edge
1. Clone this repository
2. Navigate to `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `browser-extension` folder

### Firefox
1. Clone this repository
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `manifest.json`

## Usage

### Saving a Job
1. Browse to any job posting on LinkedIn, Indeed, or Glassdoor
2. Click the floating "💼 RoleReady" button OR
3. Press Ctrl+J OR
4. Right-click → "Save to RoleReady"

### Checking ATS Score
1. On any job page, highlight the job description
2. Right-click → "Check ATS Score"
3. See how your resume matches the job

### Tailoring Your Resume
1. On any job page, click "✨ Tailor Resume" in the popup
2. AI will optimize your resume for this specific job
3. Review and apply the optimizations

## Development

### Project Structure
```
browser-extension/
├── manifest.json        # Extension configuration
├── popup.html           # Popup UI
├── popup.js             # Popup logic
├── background.js        # Service worker
├── content.js           # Main content script
├── styles.css           # Extension styles
├── linkedin-content.js  # LinkedIn-specific logic
├── indeed-content.js    # Indeed-specific logic
├── glassdoor-content.js # Glassdoor-specific logic
├── options.html         # Options page
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Testing
1. Load the extension in developer mode
2. Navigate to a job board (LinkedIn, Indeed, Glassdoor)
3. Test the floating button
4. Test the popup actions
5. Check browser console for logs

## Permissions

- **activeTab**: Access to current tab for job extraction
- **storage**: Save user preferences and jobs
- **contextMenus**: Right-click menu options
- **tabs**: Access to active tabs

## API Integration

The extension connects to your RoleReady backend at:
- **Development**: `http://localhost:3001`
- **Production**: `https://api.roleready.io`

## Security

- All API calls use HTTPS
- No data stored locally (syncs with platform)
- User data remains private and encrypted
- Follows Chrome Web Store security guidelines

## Support

For issues or questions:
- GitHub: https://github.com/dvskr/roleready
- Documentation: See BROWSER_EXTENSION_SETUP.md

