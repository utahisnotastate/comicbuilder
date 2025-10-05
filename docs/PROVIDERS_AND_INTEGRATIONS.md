# Providers and Integrations

Last updated: 2025-10-05

This guide explains how to plug real AI services into ComicBuilder. The app ships with a placeholder image provider and a deterministic LLM fallback to avoid requiring API keys. You can add real providers for image generation, LLM text, vision captioning, and more.

Contents
- Image Providers
- LLM Providers
- Vision Providers
- Voice Mapping (TTS)
- Security and Backend Proxy Patterns
- Example: Registering a Custom Image Provider


Image Providers
- File: src/utils/aiUtils.js
- Registry: registerImageProvider(name, async (prompt, options) => url)
- Active provider: setActiveImageProvider(name) or pass { provider: name } to generateImage(prompt, options)
- Options you may want to support:
  - width, height: Output resolution
  - style: One of the UI styles (map to your model’s style presets or textual tags)
  - quality: 25..100 (map to steps/sampler settings)
  - seed: Random seed for reproducibility
  - controlType: 'pose' | 'edges' | 'depth'
  - controlImageUrl: URL for ControlNet conditioning
  - styleModel: Optional LoRA/adapter id if you wire style training

LLM Providers
- File: src/utils/llmUtils.js (not shown here). It exposes:
  - generateStoryArtifacts(theme, options) → { logline, beats[], characters[] }
  - generateDialogue({ panel, caption }) → [{ character, dialogue }]
- Replace the internal stub with calls to your preferred LLM (OpenAI, Anthropic, llama.cpp server, etc.). Keep the function signatures.
- Provide deterministic fallbacks if your API is unavailable so the app remains usable.

Vision Providers
- File: src/utils/visionUtils.js (not shown here). It exposes captionImage(imageUrlOrDataUri).
- Replace with a real captioning model such as BLIP‑2, CLIP Interrogator, Gemini, or a custom endpoint.

Voice Mapping (TTS)
- Voice ids are free‑form strings stored in store.voiceMap.
- In Panel Manager → Video Pipeline, map Character → Voice id (e.g., 'NARRATOR' → 'en-US-Wavenet-D').
- Your downstream pipeline can interpret these ids as TTS voice names.

Security and Backend Proxy Patterns
- Do not bundle API keys in the frontend. Instead:
  - Deploy a small server that exposes endpoints like POST /image, POST /chat, POST /caption.
  - Server injects API keys and calls provider APIs.
  - Frontend calls your server with only the necessary parameters.
- Rate limiting and audit: Implement per‑user quotas and logging on the server.

Example: Registering a Custom Image Provider
- Create src/providers/myProvider.js and register during app startup:

```js
// src/providers/myProvider.js
import { registerImageProvider, setActiveImageProvider } from '../utils/aiUtils';

registerImageProvider('myProvider', async (prompt, options = {}) => {
  const res = await fetch('https://your-proxy.example.com/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, options })
  });
  if (!res.ok) throw new Error('Image API failed');
  const data = await res.json();
  // Expect { url: 'https://...' }
  return data.url;
});

// somewhere in your app bootstrap:
setActiveImageProvider('myProvider');
```

- Options mapping suggestion:
  - quality 25/50/75/100 → steps 10/20/30/40 (example)
  - style 'comic' → add textual tags: 'inked lines, halftone shading'
  - controlType 'pose' + controlImageUrl → add ControlNet pose module

Testing
- Stub your server endpoints to echo back a placeholder URL to verify wiring before integrating real APIs.
