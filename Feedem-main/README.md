# Facebook Dark Cleaner Extension

A Chrome extension that forces dark mode on Facebook while keeping only the essential features (Feed & Messenger) and removing all distractions.

## Features

### 🌙 Core Features
- **Force Dark Mode**: Always dark theme, overrides Facebook settings
- **Minimal Interface**: Shows only Feed and Messenger
- **Clean Layout**: Removes left/right sidebars, stories, and distractions

### ☢️ Nuclear Options
- **Nuclear Dark Mode**: Forces ALL elements to dark theme (experimental)
- **Aggressive Cleanup**: Removes trending, suggestions, birthdays, etc.

### 🧹 Cleanup Options
- **Hide Sponsored Posts**: Removes ads from feed
- **Hide Stories**: Removes Stories from top of feed
- **Hide Watch/Reels**: Removes video content tabs
- **Hide Trending**: Removes trending topics sidebar

## Installation

### For Development
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked" and select the extension folder
5. Go to Facebook.com to see it in action

### For Production
1. Zip all files (excluding node_modules and .git)
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay $5 one-time developer fee
4. Upload the zip file
5. Fill in store listing details
6. Submit for review

## Files Structure
- `manifest.json` - Extension configuration
- `content.css` - Main styling with dark mode
- `content.js` - Content script with all features
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `background.js` - Background service worker
- `icons/` - Extension icons

## Usage

1. Click the extension icon to open settings
2. Toggle features as needed
3. Click "Apply to Facebook" to apply settings
4. Use the popup to customize your experience

## Nuclear Mode Warning

**⚠️ Nuclear Mode** is experimental and may:
- Affect performance on slower computers
- Break some Facebook functionality
- Cause visual glitches
- Use with caution!

## Browser Compatibility
- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)
- Opera 74+ (Chromium-based)

## Updates
Facebook frequently changes their HTML structure. If the extension stops working:
1. Check for updates
2. Report issues on GitHub
3. Update CSS selectors if needed

## Privacy
- No data collection
- No tracking
- No analytics
- All settings stored locally

## Support
For issues or feature requests, please create an issue on GitHub.

## License
MIT License - Free to use and modify