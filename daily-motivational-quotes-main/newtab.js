// newtab.js (Random-per-tab, favorites, theme, Ghibli backgrounds)
document.addEventListener('DOMContentLoaded', async () => {
  const ntQuote = document.getElementById('ntQuote');
  const ntAuthor = document.getElementById('ntAuthor');
  const ntBg = document.getElementById('ntBg');
  const ntPrev = document.getElementById('ntPrev');
  const ntNext = document.getElementById('ntNext');
  const ntFav = document.getElementById('ntFav');
  const openSettingsNT = document.getElementById('openSettingsNT');
  const toggleThemeNT = document.getElementById('toggleThemeNT');

  // Fetch quotes
  let quotes = [];
  try {
    quotes = await fetch(chrome.runtime.getURL('quotes.json')).then(r => r.json());
    if (!Array.isArray(quotes) || quotes.length === 0) quotes = [{ text: 'No quotes found.', author: '' }];
  } catch (e) {
    quotes = [{ text: 'Unable to load quotes.', author: '' }];
  }

  // Settings helpers
  const getSettings = () => new Promise(res => chrome.storage.local.get(['settings'], r => res(r.settings || {})));
  const saveSettings = (s) => new Promise(res => chrome.storage.local.set({ settings: s }, () => res()));

  // Random initial index each new tab
  let idx = Math.floor(Math.random() * quotes.length);

  // apply background image for index
  function setBackgroundForIndex(i) {
    const imgPath = chrome.runtime.getURL(`icons/bg-ghibli-${(i % 5) + 1}.jpg`);
    // set but allow fallback if not found - using Image to detect failures
    const img = new Image();
    img.onload = () => {
      ntBg.style.backgroundImage = `url("${imgPath}")`;
      ntBg.style.backgroundSize = 'cover';
      ntBg.style.backgroundPosition = 'center';
    };
    img.onerror = () => {
      ntBg.style.backgroundImage = '';
      ntBg.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
    };
    img.src = imgPath;
  }

  // render quote and UI
  async function render(i) {
    const q = quotes[i] || { text: '', author: '' };
    ntQuote.textContent = q.text || '';
    ntAuthor.textContent = q.author ? `— ${q.author}` : '';
    setBackgroundForIndex(i);
    updateFavUI(i);
  }

  // favorites UI toggle
  async function updateFavUI(index) {
    const s = await getSettings();
    const favs = s.favorites || [];
    if (favs.includes(index)) {
      ntFav.classList.add('favorited');
      ntFav.innerHTML = '<i class="fa-solid fa-heart"></i>';
      ntFav.setAttribute('aria-pressed', 'true');
      ntFav.title = 'Unfavorite';
    } else {
      ntFav.classList.remove('favorited');
      ntFav.innerHTML = '<i class="fa-regular fa-heart"></i>';
      ntFav.setAttribute('aria-pressed', 'false');
      ntFav.title = 'Favorite';
    }
  }

  // toggle favorite for current index
  async function toggleFavorite(index) {
    const s = Object.assign({}, (await getSettings()));
    s.favorites = s.favorites || [];
    if (s.favorites.includes(index)) {
      s.favorites = s.favorites.filter(x => x !== index);
    } else {
      s.favorites.push(index);
    }
    await saveSettings(s);
    updateFavUI(index);
  }

  // apply theme from settings
  async function applyStoredTheme() {
    const s = await getSettings();
    const theme = s.theme || 'dark';
    document.body.setAttribute('data-theme', theme);
  }

  // toggle theme and store
  async function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    const s = Object.assign({}, (await getSettings()));
    s.theme = next;
    await saveSettings(s);
  }

  // navigation handlers
  ntPrev.addEventListener('click', () => {
    idx = (idx - 1 + quotes.length) % quotes.length;
    render(idx);
  });
  ntNext.addEventListener('click', () => {
    idx = (idx + 1) % quotes.length;
    render(idx);
  });
  ntFav.addEventListener('click', () => toggleFavorite(idx));
  openSettingsNT.addEventListener('click', () => chrome.runtime.openOptionsPage?.());
  toggleThemeNT.addEventListener('click', toggleTheme);

  // keyboard shortcuts: ← → to navigate, F to favorite, T to toggle theme
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { ntPrev.click(); }
    if (e.key === 'ArrowRight') { ntNext.click(); }
    if (e.key.toLowerCase() === 'f') { ntFav.click(); }
    if (e.key.toLowerCase() === 't') { toggleThemeNT.click(); }
  });

  // Ensure a new random quote on each load (already set), but also avoid showing same as last opened tab if stored
  // (optional) if you want to avoid repeating the exact same quote twice in a row across tabs, you can compare with lastSavedIndex
  try {
    const lastSaved = await new Promise(r => chrome.storage.session ? chrome.storage.session.get(['lastIndex'], res => r(res.lastIndex)) : r(undefined));
    // choose another random if matches lastSaved and quotes length > 1
    if (typeof lastSaved !== 'undefined' && lastSaved === idx && quotes.length > 1) {
      let newIdx = Math.floor(Math.random() * quotes.length);
      if (newIdx === idx) newIdx = (idx + 1) % quotes.length;
      idx = newIdx;
    }
    // store current as lastIndex in session storage (if available)
    if (chrome.storage.session) {
      chrome.storage.session.set({ lastIndex: idx });
    } else {
      // fallback to local but non-persistent handling: keep as lastIndex in local (ok)
      chrome.storage.local.set({ lastIndex: idx });
    }
  } catch (e) {
    // ignore storage/session issues
  }

  // initial apply and render
  await applyStoredTheme();
  render(idx);
});
