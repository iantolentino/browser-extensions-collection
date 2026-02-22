Facebook: Feed & Messenger Only Extension
=========================================

Description:
This Chrome extension hides all Facebook distractions except:
- News Feed
- Messenger Chat
- Basic top navigation (logo, search, messenger icon)

Files Included:
1. manifest.json - Extension configuration
2. content.css - Main styling rules
3. content.js - Dynamic element handling
4. popup.html - Extension popup interface
5. popup.js - Popup functionality
6. background.js - Background service worker
7. icons/ - Extension icons (create simple icons)

How to Load for Testing:
1. Open Chrome and go to: chrome://extensions/
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this folder
5. Go to Facebook.com to see it in action

To Upload to Chrome Web Store:
1. Zip all files (without node_modules)
2. Go to Chrome Developer Dashboard
3. Pay $5 one-time fee
4. Upload zip file
5. Fill in store listing details
6. Submit for review

Notes:
- Facebook frequently changes their HTML structure
- You may need to update CSS selectors periodically
- Test on different Facebook pages (home, groups, etc.)