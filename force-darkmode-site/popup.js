const STYLE_ID = "smart-monochrome-style";

/* CSS used for fallback injection if content script can't run */
const MONOCHROME_CSS = `
/* Smart Monochrome forced dark mode (no image/icon recolor) */
html, body, #__next, .app, .root {
  background: #000 !important;
  color: #fff !important;
}

*,
*::before,
*::after {
  color: #fff !important;
  background-image: none !important;
  box-shadow: none !important;
  text-shadow: none !important;
  border-color: #333 !important;
}

/* Common containers */
html, body, div, section, article, header, footer, main, nav, aside, ul, li, p, span, table, tr, td, th, figure {
  background-color: #000 !important;
  color: #fff !important;
}

/* Links */
a { color: #ddd !important; text-decoration-color: #555 !important; }

/* Inputs & controls */
input, textarea, select, button {
  background-color: #111 !important;
  color: #fff !important;
  border: 1px solid #333 !important;
  caret-color: #fff !important;
}

/* Code blocks */
pre, code, kbd {
  background: #040404 !important;
  color: #fff !important;
  border: 1px solid #222 !important;
}

/* DO NOT alter images, videos, icons */
img, picture, video, canvas, svg, svg * {
  filter: none !important;
  opacity: 1 !important;
  background: transparent !important;
  color: inherit !important;
}

/* Remove gradient/image backgrounds */
*[style*="background"], *[style*="background-image"] {
  background-image: none !important;
  background-color: #000 !important;
}

html, body { background-color: #000 !important; }
`;

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("darkToggle");
  const siteNameEl = document.getElementById("siteName");
  const statusEl = document.getElementById("status");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || !tab.url) {
      siteNameEl.textContent = "No active site";
      toggle.disabled = true;
      return;
    }

    let hostname;
    try {
      hostname = new URL(tab.url).hostname;
    } catch (e) {
      hostname = tab.url;
    }
    siteNameEl.textContent = hostname;

    // Load saved state
    chrome.storage.sync.get(hostname, (res) => {
      toggle.checked = !!(res && res[hostname]);
      statusEl.textContent = toggle.checked ? "Auto-applied on this site" : "Not applied";
    });

    toggle.addEventListener("change", () => {
      const enabled = toggle.checked;
      statusEl.textContent = enabled ? "Applying..." : "Removing...";

      // Save preference
      const obj = {};
      obj[hostname] = enabled;
      chrome.storage.sync.set(obj, () => {
        // Try to message content script first
        chrome.tabs.sendMessage(tab.id, { type: "toggleMonochrome", enabled }, (resp) => {
          if (chrome.runtime.lastError) {
            // content script not available -> fallback: inject style directly
            try {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (enabledInner, css) => {
                  const STYLE_ID = "smart-monochrome-style";
                  if (enabledInner) {
                    if (!document.getElementById(STYLE_ID)) {
                      const s = document.createElement("style");
                      s.id = STYLE_ID;
                      s.textContent = css;
                      (document.head || document.documentElement).appendChild(s);
                    }
                  } else {
                    const el = document.getElementById(STYLE_ID);
                    if (el) el.remove();
                  }
                },
                args: [enabled, MONOCHROME_CSS]
              }, () => {
                statusEl.textContent = enabled ? "Applied (fallback)" : "Removed (fallback)";
              });
            } catch (err) {
              console.warn("Fallback injection failed:", err);
              statusEl.textContent = "Could not apply on this page";
            }
          } else {
            // content script handled it
            statusEl.textContent = enabled ? "Applied" : "Removed";
          }
        });
      });
    });
  });
});
