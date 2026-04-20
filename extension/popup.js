// ============================================================
// NeuralEye Extension — popup.js
// Full detection logic: Gemini + HuggingFace + Sightengine
// Uses chrome.storage.local instead of localStorage
// ============================================================

'use strict';

// ── State ──────────────────────────────────────────────────
let currentImageBase64 = null;
let currentImageMime   = 'image/jpeg';
let currentImageFile   = null;
let currentImageUrl    = null;
let analysisResult     = null;
let newsResult         = null;
let checkedCount       = 0;

// ── Facts (shown in About panel) ───────────────────────────
const FACTS = [
  '96% of deepfake videos target non-consenting women. — Sensity AI',
  'AI can clone any voice in just 3 seconds. — Microsoft Research',
  'Pakistan has 50M+ WhatsApp users — one of the most vulnerable to viral misinformation.',
  'Only 26% of people can reliably spot AI-generated faces. — Nature Communications',
  'Deepfakes were used in Pakistan\'s 2024 elections. — Dawn, 2024',
  'Over 500,000 deepfake videos were posted online in 2023 — up 550% from 2019.',
];

// ── Key helpers (chrome.storage.local) ─────────────────────
async function getKeys() {
  return new Promise(resolve => {
    chrome.storage.local.get(
      ['ne_gemini','ne_hf','ne_se_user','ne_se_secret'],
      data => resolve({
        gemini   : data.ne_gemini    || '',
        hf       : data.ne_hf        || '',
        seUser   : data.ne_se_user   || '',
        seSecret : data.ne_se_secret || '',
      })
    );
  });
}

async function saveKeys(keys) {
  return new Promise(resolve => {
    chrome.storage.local.set({
      ne_gemini    : keys.gemini,
      ne_hf        : keys.hf,
      ne_se_user   : keys.seUser,
      ne_se_secret : keys.seSecret,
    }, resolve);
  });
}

async function getCount() {
  return new Promise(resolve => {
    chrome.storage.local.get(['ne_count'], d => resolve(d.ne_count || 0));
  });
}

async function incrementCount() {
  const c = await getCount() + 1;
  chrome.storage.local.set({ ne_count: c });
  return c;
}

// ── DOM helpers ─────────────────────────────────────────────
const $ = id => document.getElementById(id);
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function isHidden(id) { return $(id).classList.contains('hidden'); }

function setStep(n, state) {
  const el = $('s' + n);
  if (!el) return;
  el.className = 'step ' + state;
}

// ── TAB SWITCHING ───────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('panel-' + btn.dataset.tab).classList.add('active');
  });
});

// ── MODE SWITCHING (file / url) ─────────────────────────────
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    $('modeFile').classList.toggle('hidden', mode !== 'file');
    $('modeUrl').classList.toggle('hidden', mode !== 'url');
  });
});

// ── FILE UPLOAD ──────────────────────────────────────────────
const dropZone = $('dropZone');
const fileInput = $('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) processFile(f);
});

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) processFile(f);
});

function processFile(file) {
  currentImageFile = file;
  currentImageMime = file.type || 'image/jpeg';
  const reader = new FileReader();
  reader.onload = ev => {
    currentImageBase64 = ev.target.result.split(',')[1];
    currentImageUrl = null;
    showPreview(ev.target.result, file.name, `${(file.size/1024).toFixed(0)} KB`);
  };
  reader.readAsDataURL(file);
}

// ── URL LOAD ────────────────────────────────────────────────
$('loadUrlBtn').addEventListener('click', loadFromUrl);
$('imageUrlInput').addEventListener('keydown', e => { if (e.key === 'Enter') loadFromUrl(); });

function loadFromUrl() {
  const url = $('imageUrlInput').value.trim();
  if (!url) return;
  currentImageUrl    = url;
  currentImageBase64 = null;
  currentImageFile   = null;
  currentImageMime   = 'image/jpeg';
  showPreview(url, url.split('/').pop().slice(0,30) || 'Remote image', 'URL');
}

// ── SHOW PREVIEW ────────────────────────────────────────────
function showPreview(src, name, detail) {
  const img = $('imagePreview');
  img.src = src;
  img.style.display = 'block';
  $('previewInfo').textContent = name + (detail ? ` · ${detail}` : '');
  $('analyzeActions').style.display = 'flex';
  hide('analyzeResults');
  hide('analyzeLoader');
}

// ── CLEAR ───────────────────────────────────────────────────
$('clearBtn').addEventListener('click', clearImage);
$('analyzeAnotherBtn').addEventListener('click', clearImage);

function clearImage() {
  currentImageBase64 = null; currentImageUrl = null;
  currentImageFile = null; analysisResult = null;
  $('imagePreview').src = ''; $('imagePreview').style.display = 'none';
  $('previewInfo').textContent = '';
  $('analyzeActions').style.display = 'none';
  hide('analyzeResults'); hide('analyzeLoader');
  $('imageUrlInput').value = '';
  fileInput.value = '';
}

// ── PENDING IMAGE (from right-click context menu) ────────────
async function checkPending() {
  chrome.storage.local.get(['pendingImageUrl','pendingImageTimestamp','pendingMode','pendingNewsText'], data => {
    // Expire after 2 minutes
    if (data.pendingImageTimestamp && Date.now() - data.pendingImageTimestamp > 120000) {
      chrome.storage.local.remove(['pendingImageUrl','pendingImageTimestamp','pendingMode','pendingNewsText']);
      return;
    }

    if (data.pendingMode === 'image' && data.pendingImageUrl) {
      show('pendingBanner');
      $('pendingUrlText').textContent = data.pendingImageUrl;
      $('analyzePendingBtn').onclick = () => {
        currentImageUrl = data.pendingImageUrl;
        currentImageBase64 = null; currentImageFile = null;
        showPreview(data.pendingImageUrl, 'Right-click image', 'URL');
        hide('pendingBanner');
        chrome.storage.local.remove(['pendingImageUrl','pendingImageTimestamp','pendingMode']);
        startAnalysis();
      };
    }

    if (data.pendingMode === 'news' && data.pendingNewsText) {
      // Switch to news tab automatically
      document.querySelector('[data-tab="news"]').click();
      show('newsPendingBanner');
      $('newsPendingText').textContent = data.pendingNewsText;
      $('newsInput').value = data.pendingNewsText;
      chrome.storage.local.remove(['pendingNewsText','pendingTimestamp','pendingMode']);
    }
  });
  // Clear badge
  chrome.runtime.sendMessage({ action: 'clearBadge' });
}

// ── ANALYZE ──────────────────────────────────────────────────
$('analyzeBtn').addEventListener('click', startAnalysis);

async function startAnalysis() {
  if (!currentImageBase64 && !currentImageUrl) {
    alert('Please upload an image or enter a URL first.');
    return;
  }
  const keys = await getKeys();
  if (!keys.gemini) {
    alert('Please add your Gemini API key in the ⚙️ Keys tab first.');
    return;
  }

  hide('analyzeResults');
  show('analyzeLoader');
  $('analyzeActions').style.display = 'none';
  ['s1','s2','s3','s4'].forEach((id, i) => setStep(i+1, i === 0 ? 'active' : ''));

  // Run all 3 in parallel
  const [gRes, hRes, sRes] = await Promise.allSettled([
    callGemini(keys.gemini),
    callHuggingFace(keys.hf),
    callSightengine(keys.seUser, keys.seSecret),
  ]);

  setStep(1, 'done'); setStep(2, 'done'); setStep(3, 'done'); setStep(4, 'active');

  const gemini = gRes.status === 'fulfilled' ? gRes.value : { error: gRes.reason?.message };
  const hf     = hRes.status === 'fulfilled' ? hRes.value : { error: hRes.reason?.message };
  const se     = sRes.status === 'fulfilled' ? sRes.value : { error: sRes.reason?.message };

  await new Promise(r => setTimeout(r, 300));
  setStep(4, 'done');

  hide('analyzeLoader');
  show('analyzeResults');
  $('analyzeActions').style.display = 'flex';
  displayResults(gemini, hf, se);

  const count = await incrementCount();
  checkedCount = count;
  $('statusCount').textContent = `${count} checked`;

  // Tell background
  chrome.runtime.sendMessage({ action: 'setBadgeDone' });
}

// ── GEMINI ───────────────────────────────────────────────────
async function callGemini(apiKey) {
  if (!apiKey) return { error: 'No Gemini key', verdict: 'UNKNOWN', confidence: 0.5, explanation: 'Add key in ⚙️ Keys tab.', clues: [], threat_level: 50 };

  const prompt = `You are an expert AI image forensics analyst. Analyze this image and determine:
1. REAL — genuine photograph
2. AI_GENERATED — made by Midjourney, DALL-E, Stable Diffusion, Firefly, etc.
3. DEEPFAKE — real person with AI-manipulated face/body

Check: fingers/hands (extra/deformed), eyes (glassy/asymmetric), skin (too smooth/waxy), hair (unnatural), background (inconsistent), lighting (wrong shadows), edges (blurry at face boundary), text (garbled).

Respond ONLY as JSON, no markdown, no backticks:
{"verdict":"REAL" or "AI_GENERATED" or "DEEPFAKE","confidence":0.0-1.0,"explanation":"2 sentences","clues":["clue1","clue2"],"threat_level":0-100}`;

  const parts = [{ text: prompt }];
  if (currentImageBase64) {
    parts.push({ inlineData: { mimeType: currentImageMime, data: currentImageBase64 } });
  } else {
    parts.push({ text: `[Analyze image at URL: ${currentImageUrl}]` });
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.1, maxOutputTokens: 400 } })
    }
  );
  if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status);
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    const isAI = /ai.gen|artificial|generated|fake|synthetic/i.test(text);
    return { verdict: isAI ? 'AI_GENERATED' : 'REAL', confidence: 0.65, explanation: text.slice(0, 200), clues: [], threat_level: isAI ? 70 : 20 };
  }
}

// ── HUGGINGFACE ──────────────────────────────────────────────
async function callHuggingFace(apiKey) {
  if (!apiKey) return { error: 'No HF key', ai_score: 0.5, label: 'UNKNOWN' };

  let blob;
  try {
    if (currentImageBase64) {
      const bin = atob(currentImageBase64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      blob = new Blob([arr], { type: currentImageMime });
    } else {
      try {
        const r = await fetch(currentImageUrl, { mode: 'cors' });
        blob = await r.blob();
      } catch {
        return { error: 'CORS blocked for URL', ai_score: 0.5, label: 'UNKNOWN' };
      }
    }
  } catch (e) {
    return { error: 'Image load failed: ' + e.message, ai_score: 0.5, label: 'UNKNOWN' };
  }

  const MODEL_URL = 'https://api-inference.huggingface.co/models/Organika/sdxl-detector';
  const headers = { 'Authorization': 'Bearer ' + apiKey, 'x-use-cache': 'false' };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(MODEL_URL, { method: 'POST', headers, body: blob });
      if (resp.status === 503) { await new Promise(r => setTimeout(r, 8000)); continue; }
      if (!resp.ok) throw new Error('HF HTTP ' + resp.status);
      const data = await resp.json();
      if (Array.isArray(data)) {
        const art  = data.find(d => /artif|ai|fake|gen|synth/i.test(d.label));
        const real = data.find(d => /real|human|photo|natural/i.test(d.label));
        const aiScore = art?.score ?? (real ? 1 - real.score : 0.5);
        return { ai_score: aiScore, label: aiScore > 0.5 ? 'AI_GENERATED' : 'REAL', raw: data };
      }
      if (data.error) throw new Error(data.error);
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
  return { error: 'HF timed out — try again in 30s', ai_score: 0.5, label: 'UNKNOWN' };
}

// ── SIGHTENGINE ──────────────────────────────────────────────
async function callSightengine(user, secret) {
  if (!user || !secret) return { error: 'No SE keys', ai_score: 0.5, label: 'UNKNOWN' };

  const form = new FormData();
  form.append('models', 'genai');
  form.append('api_user', user);
  form.append('api_secret', secret);

  if (currentImageFile) {
    form.append('media', currentImageFile);
  } else if (currentImageUrl) {
    form.append('url', currentImageUrl);
  } else if (currentImageBase64) {
    const bin = atob(currentImageBase64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    form.append('media', new Blob([arr], { type: currentImageMime }), 'img.jpg');
  }

  const resp = await fetch('https://api.sightengine.com/1.0/check.json', { method: 'POST', body: form });
  if (!resp.ok) throw new Error('Sightengine HTTP ' + resp.status);
  const data = await resp.json();
  const score = data.type?.ai_generated ?? 0;
  return { ai_score: score, label: score > 0.5 ? 'AI_GENERATED' : 'REAL', raw: data };
}

// ── DISPLAY RESULTS ──────────────────────────────────────────
function displayResults(gemini, hf, se) {
  const scores = [];

  // Gemini
  if (gemini && !gemini.error) {
    const aiConf = gemini.verdict === 'REAL' ? (1 - gemini.confidence) : (gemini.confidence || 0.5);
    scores.push(aiConf);
    const pct = Math.round(aiConf * 100);
    $('r-gemini').textContent = gemini.verdict === 'REAL' ? '✅ REAL' : '🤖 FAKE';
    $('r-gemini').style.color = gemini.verdict === 'REAL' ? 'var(--ok)' : 'var(--danger)';
    $('p-gemini').style.width = pct + '%';
    $('s-gemini').textContent = pct + '%';
  } else {
    $('r-gemini').textContent = '⚠ Error'; $('r-gemini').style.color = 'var(--warn)';
    $('s-gemini').textContent = gemini?.error?.slice(0, 20) || 'Failed';
  }

  // HuggingFace
  if (hf && !hf.error) {
    const pct = Math.round((hf.ai_score || 0.5) * 100);
    scores.push(hf.ai_score);
    $('r-hf').textContent = hf.label === 'REAL' ? '✅ REAL' : '🤖 FAKE';
    $('r-hf').style.color = hf.label === 'REAL' ? 'var(--ok)' : 'var(--danger)';
    $('p-hf').style.width = pct + '%';
    $('s-hf').textContent = pct + '%';
  } else {
    $('r-hf').textContent = '⚠ Error'; $('r-hf').style.color = 'var(--warn)';
    $('s-hf').textContent = hf?.error?.slice(0, 20) || 'No key';
  }

  // Sightengine
  if (se && !se.error) {
    const pct = Math.round((se.ai_score || 0.5) * 100);
    scores.push(se.ai_score);
    $('r-se').textContent = se.label === 'REAL' ? '✅ REAL' : '🤖 FAKE';
    $('r-se').style.color = se.label === 'REAL' ? 'var(--ok)' : 'var(--danger)';
    $('p-se').style.width = pct + '%';
    $('s-se').textContent = pct + '%';
  } else {
    $('r-se').textContent = '⚠ Error'; $('r-se').style.color = 'var(--warn)';
    $('s-se').textContent = se?.error?.slice(0, 20) || 'No key';
  }

  // Combined
  const avgAI = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
  const threat = gemini?.threat_level ?? Math.round(avgAI * 100);

  let verdict, icon, cls;
  if      (avgAI >= 0.80) { verdict = 'AI GENERATED';        icon = '🤖'; cls = 'fake'; }
  else if (avgAI >= 0.60) { verdict = 'LIKELY AI GENERATED'; icon = '⚠️'; cls = 'suspect'; }
  else if (avgAI >= 0.40) { verdict = 'UNCERTAIN';           icon = '🔍'; cls = ''; }
  else if (avgAI >= 0.20) { verdict = 'LIKELY REAL';         icon = '✅'; cls = 'real'; }
  else                    { verdict = 'REAL PHOTO';           icon = '📷'; cls = 'real'; }

  analysisResult = { verdict, avgAI, threat, gemini, hf, se };

  const vc = $('verdictCard');
  vc.className = 'verdict-card ' + cls;
  $('vIcon').textContent = icon;
  $('vLabel').textContent = verdict;
  $('vSub').textContent = `Combined AI Score: ${Math.round(avgAI*100)}% · ${scores.length} model${scores.length!==1?'s':''}`;

  // Threat meter
  $('threatFill').style.width = threat + '%';
  $('threatPct').textContent  = threat + '%';
  $('threatPct').style.color  = threat > 75 ? 'var(--danger)' : threat > 50 ? 'var(--warn)' : 'var(--ok)';

  // Clues
  const clues = gemini?.clues || [];
  $('cluesWrap').innerHTML = clues.length
    ? clues.map(c => `<span class="clue">${c}</span>`).join('')
    : '';

  // Explanation
  $('explanationBox').textContent = gemini?.explanation
    ? '📝 ' + gemini.explanation
    : 'No detailed explanation available — add a Gemini API key for full analysis.';

  // FIA button
  if (threat > 50) { show('fiaBtn'); } else { hide('fiaBtn'); }
}

// ── SHARE BUTTONS ────────────────────────────────────────────
$('copyResultBtn').addEventListener('click', () => {
  if (!analysisResult) return;
  const text = `NeuralEye Detection Result\n\nVerdict: ${analysisResult.verdict}\nAI Score: ${Math.round(analysisResult.avgAI*100)}%\nThreat Level: ${analysisResult.threat}%\n\n${analysisResult.gemini?.explanation || ''}\n\nVerify before you share 🛡️`;
  navigator.clipboard.writeText(text).then(() => {
    $('copyResultBtn').textContent = '✅ Copied!';
    setTimeout(() => { $('copyResultBtn').textContent = '📋 Copy'; }, 2000);
  });
});

$('whatsappBtn').addEventListener('click', () => {
  if (!analysisResult) return;
  const msg = encodeURIComponent(`🔍 NeuralEye Detection\n\nVerdict: ${analysisResult.verdict}\nAI Score: ${Math.round(analysisResult.avgAI*100)}%\nThreat: ${analysisResult.threat}%\n\nVerify before you share! 🛡️\nabd-abdullah83.github.io/NeuralEye`);
  chrome.tabs.create({ url: 'https://wa.me/?text=' + msg });
});

$('openFullBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://abd-abdullah83.github.io/NeuralEye/index.html' });
});

$('openWebApp').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://abd-abdullah83.github.io/NeuralEye/index.html' });
});

// ── NEWS VERIFICATION ────────────────────────────────────────
$('verifyNewsBtn').addEventListener('click', verifyNews);
$('clearNewsBtn').addEventListener('click', () => {
  $('newsInput').value = '';
  hide('newsResults');
});

async function verifyNews() {
  const text = $('newsInput').value.trim();
  if (!text) { alert('Please enter a headline or claim to verify.'); return; }
  const keys = await getKeys();
  if (!keys.gemini) { alert('Please add your Gemini API key in the ⚙️ Keys tab.'); return; }

  show('newsLoader');
  hide('newsResults');

  const prompt = `You are a professional fact-checker. Verify this news claim: "${text.slice(0, 500)}"
Respond ONLY as JSON (no markdown, no backticks):
{"verdict":"VERIFIED" or "UNVERIFIED" or "DISPUTED" or "MISINFORMATION","confidence":0.0-1.0,"summary":"2-3 sentence analysis","recommended_sources":["Dawn","Geo News","BBC Urdu","Reuters","AP News"],"context":"brief background"}`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${keys.gemini}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 500 } })
      }
    );
    const data = await resp.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    showNewsResult(result);
  } catch (err) {
    hide('newsLoader');
    alert('Verification failed: ' + err.message);
  }
}

const NEWS_SOURCE_URLS = {
  'Dawn'     : 'https://www.dawn.com',
  'Geo News' : 'https://www.geo.tv',
  'ARY News' : 'https://arynews.tv',
  'BBC Urdu' : 'https://www.bbc.com/urdu',
  'Reuters'  : 'https://www.reuters.com',
  'AP News'  : 'https://apnews.com',
  'Snopes'   : 'https://www.snopes.com',
  'FactCheck.org' : 'https://www.factcheck.org',
};

function showNewsResult(r) {
  hide('newsLoader');
  show('newsResults');

  const ICONS    = { VERIFIED:'✅', UNVERIFIED:'❓', DISPUTED:'⚠️', MISINFORMATION:'🚫' };
  const CLASSES  = { VERIFIED:'real', UNVERIFIED:'', DISPUTED:'suspect', MISINFORMATION:'fake' };

  const vc = $('newsVerdictCard');
  vc.className = 'verdict-card ' + (CLASSES[r.verdict] || '');
  $('newsVIcon').textContent  = ICONS[r.verdict] || '📰';
  $('newsVLabel').textContent = r.verdict;
  $('newsVSub').textContent   = `Confidence: ${Math.round((r.confidence||0.5)*100)}%`;
  $('newsExplanation').textContent = r.summary || r.context || '';

  const sources = r.recommended_sources || [];
  $('newsSources').innerHTML = sources.length
    ? '🔗 Verify at: ' + sources.map(s => {
        const url = NEWS_SOURCE_URLS[s] || ('https://www.google.com/search?q=' + encodeURIComponent(s + ' fact check'));
        return `<a href="${url}" target="_blank" style="color:var(--accent);text-decoration:none;margin-right:8px">${s}</a>`;
      }).join('')
    : '';

  newsResult = r;
}

$('copyNewsBtn').addEventListener('click', () => {
  if (!newsResult) return;
  const text = `NeuralEye News Verification\n\nVerdict: ${newsResult.verdict}\nSummary: ${newsResult.summary || ''}\n\nVerify before you share 🛡️`;
  navigator.clipboard.writeText(text).then(() => {
    $('copyNewsBtn').textContent = '✅ Copied!';
    setTimeout(() => { $('copyNewsBtn').textContent = '📋 Copy'; }, 2000);
  });
});

$('whatsappNewsBtn').addEventListener('click', () => {
  if (!newsResult) return;
  const msg = encodeURIComponent(`📰 NeuralEye News Check\n\nVerdict: ${newsResult.verdict}\n${newsResult.summary || ''}\n\nVerify before you share! 🛡️`);
  chrome.tabs.create({ url: 'https://wa.me/?text=' + msg });
});

// ── SETTINGS ─────────────────────────────────────────────────
async function loadKeysToUI() {
  const keys = await getKeys();
  $('k-gemini').value    = keys.gemini;
  $('k-hf').value        = keys.hf;
  $('k-se-user').value   = keys.seUser;
  $('k-se-secret').value = keys.seSecret;
}

$('saveKeysBtn').addEventListener('click', async () => {
  await saveKeys({
    gemini   : $('k-gemini').value.trim(),
    hf       : $('k-hf').value.trim(),
    seUser   : $('k-se-user').value.trim(),
    seSecret : $('k-se-secret').value.trim(),
  });
  const msg = $('keyMsg');
  msg.textContent = '✅ Keys saved securely in browser storage';
  msg.style.color = 'var(--ok)';
  setTimeout(() => { msg.textContent = ''; }, 3000);
});

$('clearKeysBtn').addEventListener('click', async () => {
  if (!confirm('Clear all saved API keys?')) return;
  await saveKeys({ gemini: '', hf: '', seUser: '', seSecret: '' });
  loadKeysToUI();
  $('keyMsg').textContent = 'Keys cleared.';
  setTimeout(() => { $('keyMsg').textContent = ''; }, 2000);
});

// Toggle key visibility
document.querySelectorAll('[data-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = $(btn.dataset.toggle);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// ── ABOUT FACT ───────────────────────────────────────────────
function loadFact() {
  const idx = Math.floor(Date.now() / 86400000) % FACTS.length;
  $('aboutFact').textContent = '"' + FACTS[idx] + '"';
}

// ── STATUS COUNT ─────────────────────────────────────────────
async function loadStatusCount() {
  const c = await getCount();
  checkedCount = c;
  $('statusCount').textContent = `${c} checked`;
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadKeysToUI();
  await loadStatusCount();
  await checkPending();
  loadFact();
});
