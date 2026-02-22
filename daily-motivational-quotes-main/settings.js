// settings.js 
(async () => {
  const DEFAULTS = {
    theme: 'dark',
    background: 'ghibli',
    notifyDaily: false,
    notifyHour: 9,
    favorites: []
  };

  const themeRadios = document.querySelectorAll('input[name="theme"]');
  const bgSelect = document.getElementById('bgSelect');
  const notifyDaily = document.getElementById('notifyDaily');
  const notifyHour = document.getElementById('notifyHour');
  const saveBtn = document.getElementById('saveBtn');
  const clearFavs = document.getElementById('clearFavs');
  const favoritesList = document.getElementById('favoritesList');

  function loadQuotes() {
    return fetch(chrome.runtime.getURL('quotes.json')).then(r => r.json());
  }

  function loadSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(['settings'], (res) => resolve(Object.assign({}, DEFAULTS, res.settings || {})));
    });
  }

  function renderFavorites(favs, quotes) {
    if (!favs || favs.length === 0) {
      favoritesList.textContent = 'No favorites yet.';
      return;
    }
    favoritesList.innerHTML = '';
    favs.forEach(i => {
      const q = quotes[i];
      const div = document.createElement('div');
      div.className = 'fav-item';
      div.style.padding = '8px';
      div.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
      div.innerHTML = `<div style="font-weight:700">${q.text}</div><div style="font-size:12px;color:rgba(255,255,255,0.6)">— ${q.author || 'Unknown'}</div>`;
      favoritesList.appendChild(div);
    });
  }

  async function init() {
    const quotes = await loadQuotes();
    const s = await loadSettings();
    // set controls
    themeRadios.forEach(r => r.checked = (r.value === s.theme));
    bgSelect.value = s.background || 'ghibli';
    notifyDaily.checked = !!s.notifyDaily;
    notifyHour.value = s.notifyHour || 9;
    renderFavorites(s.favorites || [], quotes);
  }

  saveBtn.addEventListener('click', async () => {
    const theme = Array.from(themeRadios).find(r => r.checked).value;
    const settings = {
      theme,
      background: bgSelect.value,
      notifyDaily: notifyDaily.checked,
      notifyHour: Number(notifyHour.value) || 9,
    };
    // keep favorites intact
    const prev = await new Promise(r => chrome.storage.local.get(['settings'], res => r(res.settings || {})));
    settings.favorites = prev.favorites || [];
    chrome.storage.local.set({ settings }, () => {
      // set alarm if necessary
      if (settings.notifyDaily) {
        chrome.alarms.create('dailyQuote', { periodInMinutes: 1440 });
      } else {
        chrome.alarms.clear('dailyQuote');
      }
      alert('Settings saved');
    });
  });

  clearFavs.addEventListener('click', () => {
    chrome.storage.local.get(['settings'], (res) => {
      const s = res.settings || {};
      s.favorites = [];
      chrome.storage.local.set({ settings: s }, () => {
        init();
      });
    });
  });

  init();
})();
