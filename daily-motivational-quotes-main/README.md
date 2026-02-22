# Ghibli Daily Quotes 

**Ghibli Daily Quotes** is a lightweight extension that replaces the New Tab page with a beautiful, motivational-quotes experience inspired by Ghibli-style art. It shows a fresh random quote on every new tab, supports favorites, dark/light theme matching your SaverPro brand, background image selection, daily notifications, and exportable favorites via the Settings UI.
 
--- 
 
## Key Features   
 
* ✅ Random motivational quote every new tab 
* ❤️ Save and manage favorite quotes (persisted in `chrome.storage.local`) 
* 🌙 Dark / Light theme with SaverPro-styled colors
* 🖼 Ghibli-style background image set (5 sample backgrounds) 
* 🔔 Optional daily notification: "Quote of the Day" 
* ⚙ Settings page to configure theme, background style, notifications, and favorites
* 📄 New Tab override (`chrome_url_overrides`) — seamless replacement of the browser new-tab page 
* 🔒 Local-first: quotes and favorites stored locally; no external network required (unless you choose to extend it) 

---

## Project Structure
   
```
motivational-quotes-extension/
├─ manifest.json
├─ background.js
├─ quotes.json
├─ popup.html
├─ popup.css
├─ popup.js
├─ newtab.html
├─ newtab.css
├─ newtab.js
├─ settings.html
├─ settings.css
├─ settings.js
└─ icons/
   ├─ icon-16.png
   ├─ icon-32.png
   ├─ icon-48.png
   ├─ icon-128.png
   ├─ bg-ghibli-1.jpg
   ├─ bg-ghibli-2.jpg
   ├─ bg-ghibli-3.jpg
   ├─ bg-ghibli-4.jpg
   └─ bg-ghibli-5.jpg
```

---

## Installation (Developer / Side-loading)

1. Download or clone the extension folder to your machine.
2. Open Chrome (or any Chromium-based browser like Edge/Brave).
3. Navigate to `chrome://extensions`.
4. Enable **Developer mode** (top-right).
5. Click **Load unpacked** and select the extension folder.
6. The extension will appear in the toolbar. New tabs will now show the Ghibli Quotes page.

---

## Usage

* Click the extension icon to open the popup (quick quote + navigation).
* Open a new browser tab to see a random quote and background.
* Use the ◀ ▶ buttons to navigate quotes.
* Click the heart to favorite/unfavorite a quote.
* Open **Settings** to:

  * Toggle theme (dark/light)
  * Choose background style (Ghibli / Finance / Minimal)
  * Enable/disable daily notifications and choose notification hour
  * View and clear favorites

---

## Settings & Storage

* All settings and favorites are stored in `chrome.storage.local` under the `settings` key.
* Default settings:

```json
{
  "theme": "dark",
  "background": "ghibli",
  "notifyDaily": false,
  "notifyHour": 9,
  "favorites": []
}
```

* The background images and `quotes.json` are packaged assets (local), so the extension works offline.

---

## Permissions

The extension requests these permissions deliberately and minimally:

* `storage` — persist user settings and favorites.
* `alarms` — schedule daily notifications when enabled.
* `notifications` — show the optional “Quote of the Day” notification.
* `chrome_url_overrides` (new tab) — override the default new tab page.

No external network permission is required by default — all content is local.

---

## Adding / Editing Quotes

* Quotes are stored in `quotes.json`. Each quote is an object with `text` and optional `author`.
* Example entry:

```json
{
  "text": "Start small, stay consistent, surprise yourself later.",
  "author": "Anonymous"
}
```

* To add more quotes, append objects to the array in `quotes.json`. The extension reads this file on load.

---

## Theming & Assets

* Background images: `icons/bg-ghibli-1.jpg` ... `bg-ghibli-5.jpg`. Replace these with your own licensed images if desired.
* Icons: place `icon-16.png`, `icon-32.png`, `icon-48.png`, and `icon-128.png` in `icons/`.
* If background images are missing, the UI falls back to a subtle gradient for legibility.

**Important:** Ensure you have the right to use any images you include. Use public-domain or properly licensed assets.

---

## Notification Behavior

* When daily notifications are enabled (Settings → Notifications), the background service worker schedules an alarm using `chrome.alarms` with `periodInMinutes: 1440`.
* Clicking the notification opens the New Tab page for the user to read the full quote and interact with favorites.

---

## Troubleshooting

* **Quote repeats or doesn’t change:** The extension is configured to choose a random quote on every new tab. If you see repeat quotes frequently, ensure `quotes.json` contains many entries (50+ recommended) and the extension was reloaded after changes.
* **Background not loading:** Verify `icons/bg-ghibli-*.jpg` files exist and filenames match. The extension falls back to a gradient when images are missing.
* **Notifications not appearing:** Ensure notifications are enabled in the OS/browser and `notifyDaily` is turned on in Settings. Confirm that `chrome.alarms` is available and the extension is not in a disabled state.

---

## Extending the Extension

* Add remote quote sources (APIs) — ensure CORS and privacy considerations are addressed.
* Add multi-language support by modifying `quotes.json` structure.
* Add synchronization via `chrome.storage.sync` if you want user settings & favorites to sync across devices (note quota limits).
* Add a lightweight backend to provide rotating background packs or curated daily quote packs.

---

## Privacy

* The extension stores only local settings and favorites. It does not transmit quotes or user data to external servers by default.
* If you extend the extension to fetch remote content, update this README and disclose any external data usage.

---

## Contributing

1. Fork the repository.
2. Add or improve quotes, styles, or features.
3. Submit a pull request with a clear description of changes.
4. Keep added image assets licensed or permissively available.

--- 

## Changelog (high level)

* **v1.0.0** — Initial release: new-tab override, random-per-tab quotes, favorites, theme, backgrounds, notifications, popup, and settings page.

* Provide a `LICENSE` file (MIT recommended), or
* Generate a downloadable ZIP bundle of the extension files.
