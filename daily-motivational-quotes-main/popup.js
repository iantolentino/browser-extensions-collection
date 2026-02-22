// popup.js
(async () => {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const bgWrap = document.getElementById('bgWrap');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const favBtn = document.getElementById('favBtn');
  const openNewTab = document.getElementById('openNewTab');
  const openSettings = document.getElementById('openSettings');

  const quotes = await fetch(chrome.runtime.getURL('quotes.json')).then(r => r.json());
  let idx = 0;
  // Use deterministic daily index as default
  function dailyIndex() {
    const now = new Date();
    return Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())/86400000)) % quotes.length;
  }
  idx = dailyIndex();

  async function getSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(['settings'], (res) => resolve(res.settings || {}));
    });
  }
  function renderQuote(i) {
    const q = quotes[i];
    quoteText.textContent = q.text;
    quoteAuthor.textContent = q.author ? `— ${q.author}` : '';
    // set a ghibli-style background (placeholder: use provided images under icons/bg-*)
    bgWrap.style.backgroundImage = `url("${chrome.runtime.getURL('icons/bg-ghibli-'+((i%5)+1)+'.jpg')}")`;
    updateFavButton();
  }

  function saveFavorite(i, add) {
    chrome.storage.local.get(['settings'], (res) => {
      const s = res.settings || { favorites: [] };
      s.favorites = s.favorites || [];
      if (add) {
        if (!s.favorites.includes(i)) s.favorites.push(i);
      } else {
        s.favorites = s.favorites.filter(x => x !== i);
      }
      chrome.storage.local.set({ settings: s });
      updateFavButton();
    });
  }

  function updateFavButton() {
    chrome.storage.local.get(['settings'], (res) => {
      const s = res.settings || {};
      const favs = s.favorites || [];
      if (favs.includes(idx)) {
        favBtn.classList.add('favorited');
        favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        favBtn.classList.remove('favorited');
        favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });
  }

  prevBtn.addEventListener('click', () => {
    idx = (idx - 1 + quotes.length) % quotes.length;
    renderQuote(idx);
  });
  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % quotes.length;
    renderQuote(idx);
  });

  favBtn.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (res) => {
      const s = res.settings || { favorites: [] };
      s.favorites = s.favorites || [];
      if (s.favorites.includes(idx)) {
        saveFavorite(idx, false);
      } else {
        saveFavorite(idx, true);
      }
    });
  });

  openNewTab.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
    window.close();
  });

  openSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  // init bg images pre-check: if images not supplied, fallback subtle gradient
  function precheckBackgroundImages() {
    // attempt to set one; if 404, fallback to gradient
    const imgPath = chrome.runtime.getURL('icons/bg-ghibli-1.jpg');
    fetch(imgPath, { method: 'HEAD' }).then(r => {
      if (!r.ok) {
        bgWrap.style.backgroundImage = '';
        bgWrap.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
      }
    }).catch(() => {
      bgWrap.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))';
    });
  }

  precheckBackgroundImages();
  renderQuote(idx);
})();
