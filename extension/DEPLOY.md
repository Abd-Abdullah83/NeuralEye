# NeuralEye Browser Extension — Deployment Guide

---

## PART 1 — Test Locally in Chrome (5 minutes)

### Step 1 — Set up the folder

Copy `logo.png` from your main NeuralEye repo into the extension folder.
Your final `extension/` folder must look exactly like this:

```
extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
└── logo.png          ← copy from your main NeuralEye folder
```

### Step 2 — Open Chrome Extensions page

1. Open **Google Chrome**
2. In the address bar type: `chrome://extensions`
3. Press Enter

### Step 3 — Enable Developer Mode

Look for the toggle in the **top-right corner** of the extensions page.
Switch **Developer mode → ON**

You will see three new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 4 — Load the extension

1. Click **"Load unpacked"**
2. A file browser opens — navigate to your `extension/` folder
3. Select the `extension/` folder itself (not a file inside it)
4. Click **"Select Folder"** (Windows) or **"Open"** (Mac)

### Step 5 — Verify it loaded

You should see **NeuralEye** appear in the extensions list with:
- The NeuralEye logo
- A green circle (active)
- A puzzle-piece icon in Chrome's toolbar

Click the puzzle piece (top-right of Chrome) → pin NeuralEye so it always shows.

### Step 6 — Add your API keys

1. Click the NeuralEye icon in the toolbar
2. Go to the **⚙️ Keys** tab
3. Add your Gemini, HuggingFace, Sightengine keys
4. Click **Save Keys**

### Step 7 — Test it

**Test right-click:**
1. Go to any webpage with images (e.g. Google Images)
2. Right-click any image
3. You should see: **"🔍 Check with NeuralEye"**
4. Click it → a blue badge `!` appears on the NeuralEye icon
5. Click the NeuralEye icon → see the pending image banner → click **Analyze**

**Test manual upload:**
1. Click the NeuralEye icon
2. Click the upload zone in the **🔍 Analyze** tab
3. Select an image → click **⚡ Analyze Now**

---

## PART 2 — Publish to Chrome Web Store

### Requirements before submitting

| Item | Details |
|:---|:---|
| Developer account | One-time $5 registration fee |
| Privacy policy URL | Required — host a simple one on GitHub Pages |
| Screenshots | 1280×800 or 640×400 — at least 1, up to 5 |
| Promotional image | 440×280 PNG (optional but strongly recommended) |
| Store listing | Description, category, language |

---

### Step 1 — Create a developer account

1. Go to: **https://chrome.google.com/webstore/devconsole**
2. Sign in with your Google account
3. Pay the **one-time $5 USD registration fee**
4. Accept the developer agreement

---

### Step 2 — Create a Privacy Policy

Chrome Web Store requires a privacy policy because your extension accesses images.

Create a file called `privacy-policy.md` in your NeuralEye GitHub repo:

```markdown
# NeuralEye Extension — Privacy Policy

NeuralEye does not collect, store, or transmit any personal data.

- Images you analyze are sent directly to the AI APIs you configure
  (Google Gemini, HuggingFace, Sightengine) using your own API keys.
- Your API keys are stored only in your browser's local storage.
- NeuralEye does not operate any backend server.
- No analytics, tracking, or third-party data collection is used.

Contact: [your email]
```

Enable GitHub Pages for your repo → your privacy policy URL will be:
`https://abd-abdullah83.github.io/NeuralEye/privacy-policy.html`

---

### Step 3 — Pack the extension

**Option A — Chrome packs it:**
1. Go to `chrome://extensions`
2. Click **"Pack extension"**
3. Browse to your `extension/` folder
4. Click **"Pack Extension"**
5. Chrome creates `extension.crx` and `extension.pem` — keep the `.pem` file safe (needed for future updates)

**Option B — Zip it yourself (recommended for Web Store):**
1. Select all files INSIDE the `extension/` folder (not the folder itself)
2. Create a ZIP file
3. Name it `NeuralEye-Extension-v1.0.0.zip`

```
# On Windows: Select all files → Right-click → Send to → Compressed folder
# On Mac:     Select all files → Right-click → Compress
# On Linux:
cd extension/
zip -r ../NeuralEye-Extension-v1.0.0.zip .
```

---

### Step 4 — Submit to Chrome Web Store

1. Go to: **https://chrome.google.com/webstore/devconsole**
2. Click **"+ New Item"**
3. Upload your `NeuralEye-Extension-v1.0.0.zip`
4. Fill in the store listing:

**Store Listing Fields:**

| Field | What to write |
|:---|:---|
| **Name** | NeuralEye — AI Deepfake Detector |
| **Short description** (132 chars max) | Detect AI-generated images & deepfakes using Gemini, HuggingFace & Sightengine. Right-click any image to check instantly. |
| **Full description** | (copy from below) |
| **Category** | Productivity |
| **Language** | English |
| **Privacy policy URL** | https://abd-abdullah83.github.io/NeuralEye/privacy-policy.html |

**Full description (paste this):**

```
NeuralEye detects AI-generated images and deepfakes using 3 AI engines simultaneously:

• Google Gemini — visual reasoning and clue extraction
• HuggingFace (Organika/sdxl-detector) — binary real/fake classification  
• Sightengine — AI probability scoring

FEATURES:
→ Right-click any image on any webpage to check it instantly
→ Upload images directly from your device
→ News/headline fact-checking powered by Gemini
→ 3-engine combined verdict with confidence scores
→ Threat level meter (0–100%)
→ WhatsApp sharing for public awareness
→ Urdu-friendly interface

PRIVACY:
→ Zero backend — your API keys never leave your browser
→ Images sent only to your own configured APIs
→ No signup, no tracking, no ads

Built for Pakistan's digital safety. Free forever.

You need free API keys from:
• Google Gemini: ai.google.dev (1M tokens/day free)
• HuggingFace: huggingface.co/settings/tokens (free)
• Sightengine: sightengine.com (500 ops/month free)
```

---

### Step 5 — Upload screenshots

Take screenshots of the extension popup:
- The main analyze screen
- A result showing a verdict
- The settings/keys screen
- Right-click context menu in action

Minimum size: **1280×800 pixels**

---

### Step 6 — Permissions justification

Chrome will ask you to justify each permission. Use these:

| Permission | Justification |
|:---|:---|
| `storage` | Store user's API keys locally in their browser. Keys never leave the device. |
| `contextMenus` | Add "Check with NeuralEye" to right-click menu on images. |
| `activeTab` | Read selected text on the current tab for news verification. |
| `scripting` | Inject content script to retrieve page context when needed. |
| `notifications` | Notify user when analysis completes in the background. |
| `host_permissions` for `generativelanguage.googleapis.com` | Required to call Google Gemini AI API for image analysis. |
| `host_permissions` for `api-inference.huggingface.co` | Required to call HuggingFace deepfake detection model. |
| `host_permissions` for `api.sightengine.com` | Required to call Sightengine AI image scoring API. |

---

### Step 7 — Submit for review

Click **"Submit for Review"**

**Review timeline:** Chrome Web Store typically takes **1–3 business days**.
First submissions sometimes take up to **7 days**.

You will get an email when approved or if changes are needed.

---

## PART 3 — After publishing

### How to update the extension

1. Make your changes to the extension files
2. Bump the version in `manifest.json`: `"version": "1.0.1"`
3. Rezip all the files
4. Go to Chrome Web Store Console → your extension → **"Upload new package"**
5. Submit for review (updates are usually reviewed faster, 1–2 days)

### Share your extension

Once published, your extension URL will be:
`https://chrome.google.com/webstore/detail/neuraleye/[YOUR-EXTENSION-ID]`

Share this on:
- Your GitHub README (add a Chrome Web Store badge)
- LinkedIn
- Twitter/X
- Pakistani tech communities (PakWheels, Tapchief, etc.)

---

## PART 4 — Troubleshooting

| Problem | Fix |
|:---|:---|
| Extension not loading | Make sure you selected the folder containing `manifest.json`, not a parent folder |
| "manifest.json not found" error | Unzip your download first, then load the inner folder |
| Right-click menu not appearing | Reload the extension at `chrome://extensions` → click the refresh icon |
| API errors in popup | Check your keys in ⚙️ Keys tab — Gemini key must start with `AIza` |
| HuggingFace 503 error | Model is loading — wait 30 seconds and try again |
| CORS error for URL images | Extension can only analyze images hosted with public CORS headers — use file upload instead |
| Extension rejected by Chrome | Check their rejection email carefully — usually it's missing privacy policy or permission justification |

---

*Built by Abdullah · BS Data Science · FAST-NUCES Lahore 🇵🇰*
*"Verify before you share. Every click matters."*
