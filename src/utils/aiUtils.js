// src/utils/aiUtils.js

// --- Pluggable AI Image Providers ---
const imageProviders = {};
let activeImageProvider = 'placeholder';

const ensureProvider = (name) => {
  if (!imageProviders[name]) throw new Error(`Image provider not registered: ${name}`);
  return imageProviders[name];
};

export const registerImageProvider = (name, fn) => {
  imageProviders[name] = fn;
};

export const setActiveImageProvider = (name) => {
  activeImageProvider = name;
};

export const getActiveImageProvider = () => activeImageProvider;

// Default placeholder provider
registerImageProvider('placeholder', async (prompt, options = {}) => {
  const {
    width = 768,
    height = 768,
    bg = '4CAF50',
    fg = 'FFFFFF',
    style = 'Generic',
    quality = 75,
    seed = Math.floor(Math.random() * 1e9),
    controlImageUrl = '',
    controlType = ''
  } = options || {};
  console.log('Generating (placeholder) image with prompt:', prompt, options);
  await new Promise(resolve => setTimeout(resolve, 800));
  const ctl = controlType ? `+CTL:${encodeURIComponent(controlType)}` : '';
  const text = `AI+${encodeURIComponent(style)}+${quality}%25${ctl}`;
  return `https://via.placeholder.com/${width}x${height}/${bg}/${fg}?text=${text}`;
});

// Function to generate an image via the active provider
export const generateImage = async (prompt, options = {}) => {
  const providerName = options.provider || activeImageProvider || 'placeholder';
  const provider = ensureProvider(providerName);
  return provider(prompt, options);
};

// Function to train a LoRA model (conceptual)
export const trainStyleModel = async (images) => {
  // This is a placeholder for the LoRA training logic.
  // In a real implementation, this would involve a more complex
  // process of fine-tuning the model on a backend server.
  console.log('Training style model with images:', images);
  return 'path/to/lora_model';
};

// --- Automated Video Pipeline Utilities ---

// Heuristic, local prompt refinement stub. In production, replace with LLM API.
export const refineCinematicPrompt = (rawPrompt = '', content = '', character = '') => {
  const toneHints = [];
  const c = (content || '').toLowerCase();
  if (/(angry|rage|furious|corrupt|crime|rotten|dark)/.test(c)) toneHints.push('dark, high-contrast, tense mood');
  if (/(hope|light|ally|help|save|rescue|truth)/.test(c)) toneHints.push('hopeful, luminous accents, rising tension');
  if (/(spy|covert|intel|secret|briefing|court)/.test(c)) toneHints.push('noir, shallow depth of field, dramatic rim light');
  if (/(cosmic|universe|god|angel|wave|telepath|spectral)/.test(c)) toneHints.push('cosmic scale, volumetric light, ethereal particles');

  const camera = /(urgent|hurry|run|chase)/.test(c)
    ? 'handheld, rapid dolly-in'
    : 'slow, deliberate push-in';

  const sfx = /(battle|war|sword|gun|explode)/.test(c)
    ? 'distant battle rumbles with metallic clatter'
    : /(court|trial)/.test(c)
      ? 'reverberant courtroom hush with paper rustle'
      : 'low ambient hum with subtle whoosh';

  const visualBase = rawPrompt && rawPrompt.trim().length > 0
    ? rawPrompt.trim()
    : 'A cinematic sci‑fi tableau with symbolic elements relevant to the dialogue';

  const cinematicPrompt = [
    `${visualBase}.`,
    `Style: Neoclassical sci‑fi realism, 4K, 16:9, anamorphic lens, filmic grain.`,
    `Primary subject: ${character || 'Narrator'} — framed center, ${camera}.`,
    toneHints.length ? `Mood cues: ${toneHints.join('; ')}.` : '',
    `Sound design cue: ${sfx}.`
  ].filter(Boolean).join(' ');

  // Generate lightweight B-roll keywords list (comma-separated string)
  const bRoll = [];
  if (/court|trial|judge|jury/.test(c)) bRoll.push('courtroom');
  if (/spy|intel|agent|briefing/.test(c)) bRoll.push('intelligence office');
  if (/cosmic|universe|galaxy|star/.test(c)) bRoll.push('cosmic vista');
  if (/corrupt|rotting|vine|decay/.test(c)) bRoll.push('decay imagery');
  if (bRoll.length === 0) bRoll.push('dramatic background');

  return { cinematicPrompt, bRollKeywords: bRoll.join(', ') };
};

// Build atomic clip rows from a single panel
export const panelToClipRows = (panel, voiceMap = {}) => {
  if (!panel) return [];
  const imagePrompt = panel?.metadata?.imagePrompt || '';
  const sceneTitle = panel?.metadata?.sceneTitle || '';
  const panelNumber = panel?.metadata?.panelNumber;
  const dialogueEls = (panel.elements || []).filter(el => el.type === 'dialogue');

  const rows = [];
  dialogueEls.forEach((el, idx) => {
    const character = el.character || 'UNKNOWN';
    const content = el.dialogue || '';
    const voiceId = voiceMap[character] || character; // default to character name if not mapped
    const { cinematicPrompt, bRollKeywords } = refineCinematicPrompt(imagePrompt, content, character);
    rows.push({
      Scene_ID: `${sceneTitle ? sceneTitle + '-' : ''}${panelNumber ? panelNumber + '-' : ''}${panel.id}-${idx + 1}`,
      Voice_ID: voiceId,
      Content: content,
      Raw_Media_Prompt: imagePrompt,
      Cinematic_Prompt: cinematicPrompt,
      B_Roll_Keywords: bRollKeywords,
      Panel_ID: panel.id,
      Character: character,
    });
  });
  return rows;
};

// Build rows from many panels
export const panelsToClipRows = (panels = [], voiceMap = {}) => {
  const all = [];
  (panels || []).forEach(p => { all.push(...panelToClipRows(p, voiceMap)); });
  return all;
};

// CSV helpers
const sanitizeCsvField = (val) => {
  if (val == null) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
};

export const generateCsv = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headers = [
    'Scene_ID',
    'Voice_ID',
    'Content',
    'Raw_Media_Prompt',
    'Cinematic_Prompt',
    'B_Roll_Keywords',
    'Panel_ID',
    'Character'
  ];
  const lines = [headers.join(',')];
  rows.forEach(r => {
    const line = headers.map(h => sanitizeCsvField(r[h])).join(',');
    lines.push(line);
  });
  return lines.join('\n');
};

export const downloadCsv = (rows, filename = 'clips.csv') => {
  const csv = Array.isArray(rows) ? generateCsv(rows) : String(rows || '');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Lightweight Video Preview Generation (Ken Burns) ---
const easeInOut = (t) => (t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t);

export const generateVideoPreviewFromImage = async (imageUrl, options = {}) => {
  const {
    width = 1280,
    height = 720,
    fps = 30,
    durationSec = 4,
    zoomStart = 1.05,
    zoomEnd = 1.25,
    panX = 0.08, // horizontal pan magnitude (fraction of width)
    panY = 0,    // vertical pan magnitude (fraction of height)
    mimeType = 'video/webm;codecs=vp9'
  } = options;

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    console.warn('generateVideoPreviewFromImage: DOM not available');
    return null;
  }
  if (typeof MediaRecorder === 'undefined') {
    console.warn('generateVideoPreviewFromImage: MediaRecorder not supported');
    return null;
  }

  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = (e) => reject(new Error('Failed to load image for video preview'));
    im.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(fps);
  const chunks = [];
  let supportedMime = mimeType;
  if (!MediaRecorder.isTypeSupported(supportedMime)) {
    supportedMime = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(supportedMime)) {
      supportedMime = 'video/webm';
    }
  }
  const recorder = new MediaRecorder(stream, { mimeType: supportedMime, videoBitsPerSecond: 4_000_000 });
  recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

  const totalMs = durationSec * 1000;
  const startTs = performance.now();
  let rafId = 0;

  const draw = (now) => {
    const t = Math.min(1, (now - startTs) / totalMs);
    const e = easeInOut(t);
    const zoom = zoomStart + (zoomEnd - zoomStart) * e;

    // compute pan offsets from center
    const dx = (panX * (t * 2 - 1)) * img.width; // move from negative to positive
    const dy = (panY * (t * 2 - 1)) * img.height;

    // Fit image to canvas while preserving aspect
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    let drawW, drawH;
    if (imgAspect > canvasAspect) {
      drawH = height * zoom;
      drawW = drawH * imgAspect;
    } else {
      drawW = width * zoom;
      drawH = drawW / imgAspect;
    }

    const sx = (img.width - img.width / zoom) / 2 - dx / zoom;
    const sy = (img.height - img.height / zoom) / 2 - dy / zoom;
    const sWidth = img.width / zoom;
    const sHeight = img.height / zoom;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

    if (t < 1) {
      rafId = requestAnimationFrame(draw);
    } else {
      recorder.stop();
      cancelAnimationFrame(rafId);
    }
  };

  const result = await new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: supportedMime });
        const url = URL.createObjectURL(blob);
        resolve({ url, blob, mimeType: supportedMime });
      } catch (e) {
        reject(e);
      }
    };
    recorder.start();
    requestAnimationFrame(draw);
  });

  return result; // { url, blob, mimeType }
};
