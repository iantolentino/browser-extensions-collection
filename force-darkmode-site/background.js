chrome.runtime.onInstalled.addListener(() => {
  console.log("Smart Dark Mode Extension Installed!");
});

// Listen for popup toggle
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "setDarkMode") {
    const { hostname, enabled } = msg;
    chrome.storage.sync.set({ [hostname]: enabled }, () => {
      sendResponse({ success: true });
    });
    return true; // async response
  }
});
