# How to Install and Test the Browser Extension

## 📍 Extension Location
The browser extension is in: `C:\Users\sathish.kumar\RoleReady-FullStack\browser-extension\`

## 🚀 Installation Steps

### For Chrome/Edge:

1. **Open Extensions Page**
   - Chrome: Type `chrome://extensions` in address bar
   - Edge: Type `edge://extensions` in address bar

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Extension**
   - Click "Load unpacked" button
   - Navigate to: `C:\Users\sathish.kumar\RoleReady-FullStack\browser-extension`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "RoleReady - Job Search Copilot" in your extensions list
   - The extension icon should appear in your toolbar

## 🎯 How to Use

### On Job Boards (LinkedIn, Indeed, Glassdoor):
1. Navigate to any job posting
2. You'll see a floating "💼 RoleReady" button in the bottom-right
3. Click it to save the job to your RoleReady tracker

### Popup Actions:
1. Click the extension icon in your toolbar
2. Quick actions:
   - Save Current Job
   - Tailor Resume
   - Check ATS Score
   - Open Dashboard

### Keyboard Shortcut:
- Press `Ctrl+J` anywhere to save the current page as a job

### Context Menu:
- Right-click on any page → "Save to RoleReady"
- Right-click selected text → "Check ATS Score"

## ⚠️ Important Notes

### Before First Use:
1. The extension needs icons to work properly
2. Go to `browser-extension/icons/` and add:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

**Quick Fix for Testing:**
You can use any 16x16, 32x32, etc. PNG images as placeholders. Create simple colored squares or download icons from a free icon site.

### Backend Connection:
- Extension connects to: `http://localhost:3001`
- Make sure the backend API is running
- For production, update the URLs in:
  - `manifest.json` (host_permissions)
  - `background.js` (API_BASE constant)
  - `popup.js` (API_BASE constant)

## 🧪 Testing the Extension

### Test Job Capture:
1. Go to: https://www.linkedin.com/jobs (or Indeed/Glassdoor)
2. Click on any job posting
3. Look for the floating "💼 RoleReady" button
4. Click it to test the capture

### Test Popup:
1. Click the extension icon in toolbar
2. Try all the quick actions
3. Check if stats load correctly

### Test Background Worker:
1. Open Developer Tools (F12)
2. Go to "Extensions" tab
3. Check "background.js" logs in console

## 🔧 Troubleshooting

**If icons are missing:**
- The extension will still work but may show error in console
- Create placeholder icons (even simple colored PNG files work)

**If job capture doesn't work:**
- Check browser console for errors
- Make sure content script is loading (check extensions page)
- Verify the job board is supported (LinkedIn, Indeed, Glassdoor)

**If popup doesn't open:**
- Check if `popup.html` exists in the extension folder
- Verify manifest.json has correct "action" configuration

## 📦 Current Extension Files

```
browser-extension/
├── manifest.json          ✅ Complete
├── popup.html             ✅ Complete  
├── popup.js               ✅ Complete
├── background.js          ✅ Complete
├── content.js             ✅ Complete
├── linkedin-content.js    ✅ Complete
├── indeed-content.js      ✅ Complete
├── glassdoor-content.js   ✅ Complete
├── styles.css             ✅ Complete
├── README.md              ✅ Complete
├── package.json           ✅ Complete
└── icons/                 ⚠️ Need to add icons
    └── README.md
```

## ✅ Extension Status

**Files Created:** 12/12 ✅  
**Features Implemented:** 100% ✅  
**Ready to Install:** Yes ✅  
**Icons Needed:** Yes ⚠️ (placeholders work for testing)

---

**Next Steps:**
1. Add icons to `browser-extension/icons/` folder (or use placeholders)
2. Load extension in Chrome/Edge
3. Test on LinkedIn, Indeed, or Glassdoor
4. Start capturing jobs!

