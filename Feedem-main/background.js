// Background service worker for real-time sync across tabs
let currentState = {
  brightness: 80,
  enabled: true,
  lastUpdated: Date.now() 
};

// Load saved state
chrome.storage.local.get(['brightness', 'enabled'], (result) => {
  if (result.brightness !== undefined) {
    currentState.brightness = result.brightness;
  }
  if (result.enabled !== undefined) {
    currentState.enabled = result.enabled;
  }
  currentState.lastUpdated = Date.now();
});

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'increase-brightness':
      broadcastToTabs({
        action: 'INCREMENT_BRIGHTNESS',
        amount: 10
      });
      break;
      
    case 'decrease-brightness':
      broadcastToTabs({
        action: 'DECREMENT_BRIGHTNESS',
        amount: 10
      });
      break;
      
    case 'toggle-dimming':
      broadcastToTabs({
        action: 'TOGGLE',
        animate: false
      });
      break;
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATE_UPDATE') {
    // Update current state
    currentState = {
      ...currentState,
      ...message.data,
      lastUpdated: Date.now()
    };
    
    // Broadcast to all other tabs
    broadcastToTabs({
      action: 'SYNC_STATE',
      ...currentState
    }, sender.tab?.id);
  }
  
  sendResponse({ success: true });
});

// Broadcast message to all tabs
function broadcastToTabs(message, excludeTabId = null) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      // Skip excluded tab
      if (excludeTabId && tab.id === excludeTabId) return;
      
      // Skip tabs that don't support our content script
      const url = tab.url || '';
      const isSupportedSite = 
        url.includes('facebook.com') ||
        url.includes('whatsapp.com') ||
        url.includes('instagram.com') ||
        url.includes('messenger.com');
      
      if (isSupportedSite) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab might not have content script loaded yet
        });
      }
    });
  });
}

// Update badge when state changes
function updateBadge() {
  if (!currentState.enabled) {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#666' });
  } else {
    chrome.action.setBadgeText({ text: `${currentState.brightness}%` });
    
    // Color based on brightness
    let color;
    if (currentState.brightness >= 80) color = '#4CAF50';
    else if (currentState.brightness >= 50) color = '#FF9800';
    else color = '#F44336';
    
    chrome.action.setBadgeBackgroundColor({ color });
  }
}

// Periodically update badge
setInterval(updateBadge, 1000);

updateBadge();
