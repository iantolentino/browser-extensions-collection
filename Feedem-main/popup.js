class RealTimePopup {
  constructor() {
    this.elements = {};
    this.currentState = {
      brightness: 80,
      enabled: true
    };
    this.isUpdating = false;
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.loadState();
    this.setupEventListeners();
    this.setupRealTimeListener();
    this.updateUI();
  }

  cacheElements() {
    this.elements = {
      toggle: document.getElementById('toggleSwitch'),
      slider: document.getElementById('brightnessSlider'),
      value: document.getElementById('brightnessValue'),
      sliderFill: document.getElementById('sliderFill'),
      statusBadge: document.getElementById('statusBadge'),
      stateText: document.getElementById('stateText'),
      feedback: document.getElementById('feedback'),
      presetButtons: document.querySelectorAll('.preset-btn')
    };
  }

  loadState() {
    // Get current tab state
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      
      const url = tabs[0].url || '';
      const isSupported = this.isSupportedSite(url);
      
      if (isSupported) {
        this.getTabState(tabs[0].id);
      } else {
        this.elements.stateText.textContent = 'Not on supported site';
        this.elements.toggle.disabled = true;
        this.elements.slider.disabled = true;
      }
    });
    
    // Also load from storage as fallback
    chrome.storage.local.get(['brightness', 'enabled'], (result) => {
      if (result.brightness) this.currentState.brightness = result.brightness;
      if (result.enabled !== undefined) this.currentState.enabled = result.enabled;
      this.updateUI();
    });
  }

  getTabState(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded yet
        return;
      }
      
      if (response) {
        this.currentState = response;
        this.updateUI();
      }
    });
  }

  setupEventListeners() {
    // Toggle switch
    this.elements.toggle.addEventListener('change', (e) => {
      this.toggleDimming(e.target.checked);
    });

    // Real-time slider
    this.elements.slider.addEventListener('input', (e) => {
      this.handleSliderInput(parseInt(e.target.value));
    });

    this.elements.slider.addEventListener('change', (e) => {
      this.setBrightness(parseInt(e.target.value));
    });

    // Preset buttons
    this.elements.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = parseInt(btn.dataset.value);
        this.setBrightness(value, true);
      });
    });
  }

  setupRealTimeListener() {
    // Listen for state updates from background/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'STATE_UPDATE' || message.action === 'SYNC_STATE') {
        this.currentState = {
          ...this.currentState,
          ...(message.data || message)
        };
        this.updateUI();
      }
      sendResponse({ received: true });
    });
  }

  isSupportedSite(url) {
    return url.includes('facebook.com') ||
           url.includes('whatsapp.com') ||
           url.includes('instagram.com') ||
           url.includes('messenger.com');
  }

  handleSliderInput(value) {
    if (this.isUpdating) return;
    
    // Update display immediately for real-time feedback
    this.elements.value.textContent = `${value}%`;
    this.updateSliderFill(value);
    
    // Debounce the actual brightness change
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.setBrightness(value, true);
    }, 50);
  }

  setBrightness(value, animate = true) {
    if (value === this.currentState.brightness) return;
    
    this.currentState.brightness = value;
    this.updateUI();
    
    // Enable toggle if setting brightness < 100
    if (value < 100 && !this.elements.toggle.checked) {
      this.elements.toggle.checked = true;
      this.toggleDimming(true);
    }
    
    // Send to current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'SET_BRIGHTNESS',
          value: value,
          animate: animate
        }).catch(() => {
          // Tab might not have content script
        });
      }
    });
    
    this.showFeedback(`Brightness: ${value}%`);
  }

  toggleDimming(enabled) {
    this.currentState.enabled = enabled;
    this.updateUI();
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'TOGGLE',
          animate: true
        }).catch(() => {
          // Tab might not have content script
        });
      }
    });
    
    this.showFeedback(enabled ? 'Dimming ON' : 'Dimming OFF');
  }

  updateUI() {
    if (this.isUpdating) return;
    this.isUpdating = true;
    
    // Update brightness value
    this.elements.value.textContent = `${this.currentState.brightness}%`;
    this.elements.slider.value = this.currentState.brightness;
    this.updateSliderFill(this.currentState.brightness);
    
    // Update toggle
    this.elements.toggle.checked = this.currentState.enabled;
    
    // Update status
    this.elements.statusBadge.textContent = this.currentState.enabled ? 'ON' : 'OFF';
    this.elements.statusBadge.className = `status-badge ${!this.currentState.enabled ? 'off' : ''}`;
    
    // Update preset buttons
    this.elements.presetButtons.forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.value) === this.currentState.brightness) {
        btn.classList.add('active');
      }
    });
    
    // Update state text
    if (this.currentState.enabled) {
      const level = this.getBrightnessLevel(this.currentState.brightness);
      this.elements.stateText.textContent = `Active • ${level}`;
    } else {
      this.elements.stateText.textContent = 'Disabled';
    }
    
    this.isUpdating = false;
  }

  updateSliderFill(value) {
    const percentage = ((value - 20) / 80) * 100;
    this.elements.sliderFill.style.width = `${percentage}%`;
  }

  getBrightnessLevel(value) {
    if (value >= 85) return 'Day';
    if (value >= 70) return 'Evening';
    if (value >= 55) return 'Dim';
    if (value >= 40) return 'Dark';
    return 'Night';
  }

  showFeedback(message) {
    this.elements.feedback.textContent = message;
    this.elements.feedback.classList.add('show');
    
    setTimeout(() => {
      this.elements.feedback.classList.remove('show');
    }, 1000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RealTimePopup();
});

// Keep popup alive for real-time updates
setInterval(() => {
  // Just to keep the service worker alive
}, 1000);