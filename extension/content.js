// ============================================================
// NeuralEye Extension — content.js
// Runs on every page. Handles page-level communication.
// ============================================================

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Popup asking for the src of a right-clicked image
  if (message.action === 'getImageSrc') {
    sendResponse({ src: document.activeElement?.src || null });
    return;
  }

  // Popup asking for selected text on the page
  if (message.action === 'getSelectedText') {
    const text = window.getSelection()?.toString()?.trim() || '';
    sendResponse({ text });
    return;
  }

  // Popup asking for page URL
  if (message.action === 'getPageUrl') {
    sendResponse({ url: window.location.href, title: document.title });
    return;
  }

  return true;
});
