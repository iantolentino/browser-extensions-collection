(() => {
  const HOSTNAME = window.location.hostname;
  const STYLE_ID = "smart-monochrome-style";

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

  function injectMonochrome() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = MONOCHROME_CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function removeMonochrome() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  // Apply if saved
  chrome.storage.sync.get(HOSTNAME, (res) => {
    if (res && res[HOSTNAME]) injectMonochrome();
  });

  // Listen for popup toggle
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "toggleMonochrome") {
      msg.enabled ? injectMonochrome() : removeMonochrome();
    }
  });

  // Sync with storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes[HOSTNAME]) {
      changes[HOSTNAME].newValue ? injectMonochrome() : removeMonochrome();
    }
  });
})();
