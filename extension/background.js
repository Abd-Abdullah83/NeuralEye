// ============================================================
// NeuralEye Extension — background.js (Service Worker, MV3)
// Handles: context menu, badge, right-click image routing
// ============================================================

// ── Install: create context menu ──────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  // Right-click on any image on any page
  chrome.contextMenus.create({
    id: 'neuraleye-check-image',
    title: '🔍 Check with NeuralEye',
    contexts: ['image'],
    documentUrlPatterns: ['<all_urls>']
  });

  // Right-click on selected text (for news checking)
  chrome.contextMenus.create({
    id: 'neuraleye-check-news',
    title: '📰 Verify this text with NeuralEye',
    contexts: ['selection'],
    documentUrlPatterns: ['<all_urls>']
  });

  console.log('[NeuralEye] Extension installed. Context menus created.');
});

// ── Context menu click handler ────────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {

  if (info.menuItemId === 'neuraleye-check-image') {
    const imageUrl = info.srcUrl;
    if (!imageUrl) return;

    // Store pending image URL + source tab info
    chrome.storage.local.set({
      pendingImageUrl: imageUrl,
      pendingImageTimestamp: Date.now(),
      pendingMode: 'image',
      pendingSourceTab: tab?.url || ''
    }, () => {
      // Set a badge so user knows something is queued
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#00e5ff' });
    });
  }

  if (info.menuItemId === 'neuraleye-check-news') {
    const selectedText = info.selectionText;
    if (!selectedText) return;

    chrome.storage.local.set({
      pendingNewsText: selectedText.slice(0, 500), // trim to 500 chars
      pendingTimestamp: Date.now(),
      pendingMode: 'news'
    }, () => {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    });
  }
});

// ── Clear badge when popup opens ──────────────────────────────
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});

// ── Message listener (from popup or content script) ───────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'clearBadge') {
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ ok: true });
  }

  if (message.action === 'setBadgeError') {
    chrome.action.setBadgeText({ text: '✗' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    sendResponse({ ok: true });
  }

  if (message.action === 'setBadgeDone') {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    // Auto-clear after 4 seconds
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 4000);
    sendResponse({ ok: true });
  }

  // Keep channel open for async responses
  return true;
});
