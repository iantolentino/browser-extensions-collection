// background.js
// Service worker: schedules daily notifications and handles notification clicks.

const DEFAULT_SETTINGS = {
  theme: 'dark',
  background: 'ghibli', // 'ghibli' | 'finance' | 'minimal'
  notifyDaily: false,
  notifyHour: 9, // 9 AM local by default
  favorites: []
};

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(['settings'], (res) => {
      resolve(Object.assign({}, DEFAULT_SETTINGS, res.settings || {}));
    });
  });
}

async function getQuotes() {
  return new Promise(resolve => {
    fetch(chrome.runtime.getURL('quotes.json')).then(r => r.json()).then(json => resolve(json));
  });
}

function chooseQuoteOfDay(quotes) {
  // Deterministic based on local date
  const now = new Date();
  const idx = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())/86400000)) % quotes.length;
  return quotes[idx];
}

async function sendDailyNotification() {
  const quotes = await getQuotes();
  const q = chooseQuoteOfDay(quotes);
  const options = {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Quote of the Day',
    message: `${q.text}\n— ${q.author}`,
    priority: 2
  };
  chrome.notifications.create('quoteOfDay', options);
}

chrome.runtime.onInstalled.addListener(async () => {
  const s = await getSettings();
  // create daily alarm if desired
  if (s.notifyDaily) {
    chrome.alarms.create('dailyQuote', { periodInMinutes: 1440 });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm && alarm.name === 'dailyQuote') {
    const s = await getSettings();
    if (s.notifyDaily) {
      await sendDailyNotification();
    }
  }
});

// When settings change, update alarm
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.settings) {
    const s = Object.assign({}, DEFAULT_SETTINGS, changes.settings.newValue || {});
    if (s.notifyDaily) {
      chrome.alarms.create('dailyQuote', { periodInMinutes: 1440 });
    } else {
      chrome.alarms.clear('dailyQuote');
    }
  }
});

chrome.notifications.onClicked.addListener((notifId) => {
  if (notifId === 'quoteOfDay') {
    // open options (settings) or new tab to the newtab page
    chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') });
  }
});
