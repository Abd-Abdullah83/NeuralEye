<div align="center">

```
███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     ███████╗██╗   ██╗███████╗
████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     ██╔════╝╚██╗ ██╔╝██╔════╝
██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     █████╗   ╚████╔╝ █████╗  
██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     ██╔══╝    ╚██╔╝  ██╔══╝  
██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗███████╗   ██║   ███████╗
╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝   ╚══════╝
                         AI DETECTION PLATFORM  •  v3.0
```

**Detect deepfakes. Verify news. Fight misinformation.**  
*Powered by Gemini · HuggingFace · Sightengine*

---

![Version](https://img.shields.io/badge/version-3.0-00e5ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==)
![Status](https://img.shields.io/badge/status-live-10b981?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-7c3aed?style=for-the-badge)
![Made in Pakistan](https://img.shields.io/badge/made%20in-Pakistan%20🇵🇰-00e5ff?style=for-the-badge)
![No Server](https://img.shields.io/badge/no%20server-100%25%20client--side-f59e0b?style=for-the-badge)

</div>

---

## ✨ What is NeuralEye?

> *"Only 26% of people can reliably tell the difference between real and AI-generated faces."*
> — Nature Communications, 2022

**NeuralEye** is a single-file, zero-installation AI detection platform that brings the power of three AI providers into one sleek dark-mode interface. Upload a photo and NeuralEye triangulates verdicts from **Google Gemini**, **HuggingFace**, and **Sightengine** — then renders a confidence chart, threat-level meter, and visual clues explaining *why* it reached its verdict.

No backend. No data collection. No installation. Just open the HTML file and go.

---

## 🚀 Features at a Glance

| Module | What It Does |
|--------|-------------|
| 🔍 **AI Image Analyzer** | Detects AI-generated images & deepfakes using 3 AI providers simultaneously |
| 📰 **News Verifier** | Cross-references headlines, URLs, and screenshots for misinformation |
| 🎓 **Education Hub** | Explains deepfakes, detection tips, and Pakistan-specific context |
| 📅 **Timeline** | Global & Pakistani misinformation incidents from 2017 to present |
| 🤝 **Pledge Wall** | Community pledge to verify before sharing — tracked via JSONBin |
| 🤖 **Ask AI** | Multi-turn Gemini-powered conversational AI assistant |
| ⚙️ **Settings** | API key management, theme switcher, accent colors, voice controls |

---

## 🎯 Core Capabilities

### 🔍 Triple-Engine Image Analysis
NeuralEye doesn't rely on a single opinion. It fires all three simultaneously:

```
Image Input
    │
    ├──► 🔵 Google Gemini 2.5 Flash   →  Visual reasoning + clue extraction
    ├──► 🟠 HuggingFace Inference     →  Binary AI/Real classification score  
    └──► 🟣 Sightengine API           →  Deepfake probability score
              │
              ▼
       Combined Verdict Engine
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
  REAL      AI GEN    DEEPFAKE
```

Each analysis produces:
- **Final Verdict** with confidence score
- **Threat Level Meter** — danger to public trust if shared
- **Detected Clues** — e.g., unnatural hands, glassy eyes, lighting inconsistency
- **Confidence Chart** (Chart.js bar visualization)
- **Gemini Explanation** — plain-language reasoning

### 📰 News Verifier  
Three input modes for maximum flexibility:
- 📝 **Text / Headline** — paste news directly
- 🔗 **Article URL** — link to any web article  
- 🖼️ **Screenshot** — upload an image of a news post

### 🤖 Ask AI Chatbot
A full multi-turn conversational assistant powered by Gemini 2.5 Flash — tuned for Pakistani users with locally relevant examples. Covers education, health, science, technology, career guidance, and current affairs.

---

## 🏗️ Tech Stack

```
┌──────────────────────────────────────────────────┐
│              NEURALEYE TECH STACK                │
├──────────────────┬───────────────────────────────┤
│  AI / APIs       │  Gemini 2.5 Flash Lite         │
│                  │  HuggingFace Inference API      │
│                  │  Sightengine Vision API         │
│                  │  NewsAPI                        │
│                  │  JSONBin (pledge storage)       │
├──────────────────┼───────────────────────────────┤
│  Visualization   │  Chart.js 4.4                  │
│  Export          │  jsPDF 2.5 + html2canvas       │
│  Typography      │  Space Mono · DM Sans          │
│  Icons           │  Font Awesome 6.5              │
├──────────────────┼───────────────────────────────┤
│  Architecture    │  100% Client-Side HTML/CSS/JS  │
│                  │  Zero build step, zero server  │
│                  │  localStorage for persistence  │
└──────────────────┴───────────────────────────────┘
```

---

## ⚡ Quick Start

Getting NeuralEye running takes **under 2 minutes**.

### Step 1 — Open the file
```bash
# No install. Just open it.
open NeuralEyeV3.html
# or drag it into any browser window
```

### Step 2 — Get your API keys (free tiers available)

| API | Where to Get It | Required For |
|-----|----------------|--------------|
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) | Image analysis + chatbot |
| **HuggingFace** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | AI/Real classification |
| **Sightengine** | [sightengine.com](https://sightengine.com) | Deepfake scoring |
| **NewsAPI** | [newsapi.org](https://newsapi.org) | News verification |
| **JSONBin** | [jsonbin.io](https://jsonbin.io) | Pledge wall (optional) |

### Step 3 — Enter keys in Settings
Click **⚙️ Settings** → paste your keys → **Save Keys**  
*(Keys are stored only in your browser's localStorage — never sent anywhere)*

### Step 4 — Analyze!
Go to **🔍 Analyze** → upload an image → the AI does the rest.

---

## 🖥️ Interface Preview

```
┌──────────────────────────────────────────────────────────────────┐
│  NEURAL·EYE          📡 14:32:07                                 │
│  AI DETECTION                                                    │
│ ─────────────                ┌─────────────────────────────────┐│
│  MAIN                        │  🔍 ANALYZE IMAGE               ││
│  ├ 🔍 Analyze          ◄─── │                                 ││
│  ├ 📰 News Verifier          │  [  Drop image here  ]          ││
│  ├ 🎓 Education              │                                 ││
│  ├ 📅 Timeline               │  ┌──────────┐ ┌─────────────┐  ││
│  ├ 🤝 Pledge                 │  │  GEMINI  │ │ HUGGINGFACE │  ││
│  └ 🤖 Ask AI                 │  │  97.3%   │ │   91.8%     │  ││
│                              │  └──────────┘ └─────────────┘  ││
│  SYSTEM                      │                                 ││
│  └ ⚙️ Settings               │  ⚠️  AI GENERATED  — 94.6%     ││
│                              │  Threat: ████████░░ HIGH        ││
│  🌙 Dark  ☀️ Light           └─────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 🇵🇰 Built for Pakistan

NeuralEye was developed with the Pakistani digital landscape in mind. It includes:

- **Pakistan-specific fact database** — deepfake stats relevant to Pakistani media
- **WhatsApp-aware design** — one-tap WhatsApp share for verified results
- **Urdu-friendly AI responses** — the chatbot understands Pakistani context
- **Local news sources** — Dawn, Geo, ARY, BBC Urdu listed for verification
- **PECA 2016 coverage** — legal context explained in the Education Hub
- **2024 Election misinformation** — documented in the Timeline

> Pakistan has **50+ million WhatsApp users** — making digital literacy not just useful, but *urgent*.

---

## 📤 Export & Share

After every analysis, NeuralEye gives you multiple ways to act on the results:

```
📄  Export PDF          →  Full report with scores, clues, and explanation
🖼️  Share Card          →  Auto-generated visual card for social media
💬  WhatsApp Share      →  Pre-formatted message ready to send
📋  Copy to Clipboard   →  Plain text result for any use
```

---

## 🎨 Customization

NeuralEye is fully themeable — right from the Settings panel:

**Theme Modes**
- 🌙 **Dark** (default) — deep space aesthetic with glowing accents
- ☀️ **Light** — clean white with muted tones

**Accent Colors**
```
  ● Cyan #00e5ff   (default)
  ● Purple #7c3aed
  ● Green #10b981
  ● Amber #f59e0b
  ● Red #ef4444
  ● Pink #ec4899
  ● Custom (color picker)
```

**Voice Controls**
- 🔊 TTS readout of analysis results (toggle on/off)
- 🎙️ Voice input for the chatbot and news verifier

---

## 🔒 Privacy First

NeuralEye takes privacy seriously:

```
✅  API keys stored in localStorage only
✅  Images processed directly by third-party APIs — not stored by NeuralEye
✅  No analytics, no tracking, no telemetry
✅  No backend server — your data never touches our infrastructure
✅  Open source — audit every line in NeuralEyeV3.html
```

---

## 🗂️ File Structure

```
NeuralEyeV3.html          ← The entire application (single file)
README.md                 ← You are here
```

That's it. One file. The entire platform — HTML, CSS, and JavaScript — lives in `NeuralEyeV3.html`.

---

## 🛣️ Roadmap

- [ ] 🎥 Video deepfake frame-by-frame analysis
- [ ] 🌐 Urdu language UI toggle
- [ ] 📊 Analysis history log with local storage
- [ ] 🔌 Browser extension for right-click detection
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🔗 WhatsApp Bot integration

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Make your changes to NeuralEyeV3.html
# 3. Test in Chrome/Firefox/Edge
# 4. Submit a pull request with a clear description
```

**Ideas for contribution:** new AI provider integrations, UI improvements, Urdu translations, additional Pakistan-specific content, new export formats.

---

## ⚠️ Disclaimer

NeuralEye is an **educational and awareness tool**. No AI detection system is 100% accurate. Always use multiple verification methods for critical decisions. The platform does not store, share, or process images beyond the API calls you initiate.

---

## 📜 License

```
MIT License — Free to use, modify, and distribute.
Attribution appreciated but not required.
```

---

<div align="center">

**Built with 🤍 to fight misinformation in Pakistan and beyond**

*"Verify before you share."*

---

⭐ Star this repo if NeuralEye helped you detect something fake!

</div>
