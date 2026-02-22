class RealTimeBrightnessController {
  constructor() {
    this.brightness = 100;
    this.isEnabled = true;
    this.overlay = null;
    this.transitionDuration = 300; // ms for smooth transitions
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    this.createOverlay();
    this.loadSettings();
    this.setupMessageListener();
    this.addMutationObserver();
    this.addRealTimeListeners();
    
    // Apply initial brightness
    requestAnimationFrame(() => this.applyBrightness());
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'realtime-brightness-overlay';
    this.overlay.className = 'brightness-overlay';
    
    // Add to document before any content loads
    if (document.documentElement) {
      document.documentElement.appendChild(this.overlay);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.appendChild(this.overlay);
      });
    }
  }

  loadSettings() {
    chrome.storage.local.get(['brightness', 'enabled'], (result) => {
      this.brightness = result.brightness || 80;
      this.isEnabled = result.enabled !== false;
      
      // Apply immediately
      this.updateOverlay();
      
      // Send current state to popup if it's open
      this.sendStateUpdate();
    });
  }

  updateOverlay() {
    if (!this.overlay) return;
    
    if (this.isEnabled && this.brightness < 100) {
      const opacity = (100 - this.brightness) / 100;
      
      // Smooth transition
      this.overlay.style.transition = `opacity ${this.transitionDuration}ms ease`;
      this.overlay.style.opacity = opacity;
      this.overlay.classList.add('active');
    } else {
      this.overlay.style.transition = `opacity ${this.transitionDuration}ms ease`;
      this.overlay.style.opacity = '0';
      
      // Remove active class after transition
      setTimeout(() => {
        if (this.overlay && !this.isEnabled) {
          this.overlay.classList.remove('active');
        }
      }, this.transitionDuration);
    }
  }

  applyBrightness() {
    this.updateOverlay();
  }

  setBrightness(value, animate = true) {
    if (this.isTransitioning) return;
    
    const oldValue = this.brightness;
    this.brightness = Math.max(20, Math.min(100, Math.round(value)));
    
    // Skip if no change
    if (oldValue === this.brightness) return;
    
    // Disable animation if quick change
    if (!animate) {
      this.transitionDuration = 0;
    } else {
      this.transitionDuration = 300;
    }
    
    this.applyBrightness();
    this.saveSettings();
    this.sendStateUpdate();
    
    // Reset transition duration
    if (!animate) {
      setTimeout(() => {
        this.transitionDuration = 300;
      }, 10);
    }
  }

  toggle(animate = true) {
    this.isEnabled = !this.isEnabled;
    
    if (!animate) {
      this.transitionDuration = 0;
      this.applyBrightness();
      setTimeout(() => {
        this.transitionDuration = 300;
      }, 10);
    } else {
      this.applyBrightness();
    }
    
    this.saveSettings();
    this.sendStateUpdate();
  }

  saveSettings() {
    chrome.storage.local.set({
      brightness: this.brightness,
      enabled: this.isEnabled
    });
  }

  sendStateUpdate() {
    try {
      chrome.runtime.sendMessage({
        type: 'STATE_UPDATE',
        data: {
          brightness: this.brightness,
          enabled: this.isEnabled,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      // Extension context might be invalid
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'SET_BRIGHTNESS':
          this.setBrightness(request.value, request.animate);
          sendResponse({ success: true, brightness: this.brightness });
          break;
          
        case 'TOGGLE':
          this.toggle(request.animate);
          sendResponse({ success: true, enabled: this.isEnabled });
          break;
          
        case 'GET_STATE':
          sendResponse({
            brightness: this.brightness,
            enabled: this.isEnabled
          });
          break;
          
        case 'INCREMENT_BRIGHTNESS':
          this.setBrightness(this.brightness + (request.amount || 10));
          sendResponse({ success: true, brightness: this.brightness });
          break;
          
        case 'DECREMENT_BRIGHTNESS':
          this.setBrightness(this.brightness - (request.amount || 10));
          sendResponse({ success: true, brightness: this.brightness });
          break;
      }
      return true;
    });
  }

  addMutationObserver() {
    // Watch for dynamic content changes (like React/SPA navigation)
    const observer = new MutationObserver((mutations) => {
      // Re-apply overlay if it gets removed by React
      if (!document.contains(this.overlay)) {
        document.documentElement.appendChild(this.overlay);
        this.applyBrightness();
      }
    });
    
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  addRealTimeListeners() {
    // Listen for wheel events with modifier keys
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        this.setBrightness(this.brightness + delta);
      }
    }, { passive: false });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            this.setBrightness(this.brightness + 5);
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.setBrightness(this.brightness - 5);
            break;
          case ' ':
            e.preventDefault();
            this.toggle();
            break;
          case 'Home':
            e.preventDefault();
            this.setBrightness(100);
            break;
          case 'End':
            e.preventDefault();
            this.setBrightness(20);
            break;
        }
      }
    });
  }
}

// Initialize controller
let controller;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    controller = new RealTimeBrightnessController();
  });
} else {
  controller = new RealTimeBrightnessController();
}

// Make controller accessible for debugging
window.__brightnessController = controller;