# Icon Generator Instructions

The browser extension needs icon files to work properly.

## Option 1: Quick Placeholder (Testing)

Create simple colored square images:
- Open any image editor
- Create 16x16, 32x32, 48x48, 128x128 PNG files
- Use purple gradient: #667eea to #764ba2
- Save as: icon16.png, icon32.png, icon48.png, icon128.png

## Option 2: Download Icons

Use an online icon generator:
1. Go to https://www.favicon-generator.org/ or https://favicon.io/
2. Upload RoleReady logo
3. Generate all sizes
4. Download and place in this folder

## Option 3: SVG Icon

For now, you can use this SVG and convert to PNG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#grad)" rx="20"/>
  <text x="64" y="85" font-size="60" text-anchor="middle" fill="white">💼</text>
</svg>
```

## For Now: Skip Icons

The extension will work without proper icons, but you'll see a default icon placeholder.

You can test the extension functionality without custom icons by:
1. Loading it in Chrome/Edge developer mode
2. The browser will use a default gray square icon
3. All functionality will still work!

## Next Steps After Adding Icons

1. Add icons to this folder
2. Reload the extension in Chrome/Edge
3. The custom icon will appear
4. Start testing on job boards!

