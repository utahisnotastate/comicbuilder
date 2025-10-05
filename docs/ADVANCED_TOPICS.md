# Advanced Topics

Last updated: 2025-10-05

This document covers power‑user workflows and integration patterns to extend ComicBuilder beyond the default offline demo setup.

Contents
- Character Consistency with Tokens (Textual Inversion, DreamBooth)
- Control‑Guided Generation (ControlNet‑style)
- Custom Image Providers
- Custom LLM and Vision Providers
- Style Transfer and LoRA Training
- Dynamic Layouts with Composition Analysis
- Performance and Caching
- Persistence Strategies
- Security and Privacy


Character Consistency with Tokens (Textual Inversion, DreamBooth)
- Goal: Ensure the same character looks consistent across panels.
- Approach A — Textual Inversion: Train an embedding on a few images to create a new token (e.g., <myChar>). Include this token in prompts.
- Approach B — DreamBooth: Fine‑tune a model on a subject/person. Use a unique identifier token in prompts.
- App hooks: The Image tab appends character token+descriptors to prompts when you select Character Consistency. Update your provider to honor these tokens. See Custom Image Providers for mapping tokens into provider‑specific params.


Control‑Guided Generation (ControlNet‑style)
- Controls: pose, edges, depth.
- UI: Pick Control Type and supply Control Image URL.
- Provider implementation: Your provider should route these to ControlNet (or equivalent) conditioning inputs and tune the guidance strength.
- Fallback behavior: The default provider simply encodes the control info in placeholder text.


Custom Image Providers
- File: src/utils/aiUtils.js
- API: registerImageProvider(name, async (prompt, options) => imageUrl)
- Usage
  - Create a module that calls registerImageProvider('myProvider', async (prompt, options) => { /* call your API */ return url; });
  - Then setActiveImageProvider('myProvider') or pass { provider: 'myProvider' } to generateImage.
- Options you may expect
  - style: 'realistic' | 'comic' | 'anime' | 'watercolor' | 'oil' | 'sketch'
  - quality: number (25..100)
  - width, height: numbers
  - controlType: 'pose' | 'edges' | 'depth'
  - controlImageUrl: string
  - seed: number
- Security: Do not put API keys in client code. Use a backend or proxy that injects secrets server‑side and exposes only the needed endpoint to the browser.


Custom LLM and Vision Providers
- LLM: src/utils/llmUtils.js contains generateStoryArtifacts and generateDialogue hooks that currently use a deterministic local fallback. Replace with calls to your LLM API (OpenAI, Anthropic, local server) while keeping the function signatures.
- Vision: src/utils/visionUtils.js exposes captionImage for image captioning/analysis. Swap in a real captioning model (BLIP‑2, CLIP variants, Gemini, etc.).
- Determinism: Keep a simple deterministic fallback so the UX remains demoable offline.


Style Transfer and LoRA Training
- Train Style (Image tab): Currently logs and returns a placeholder path. Wire it to a backend that:
  - Uploads images, launches a LoRA training job (Kohya‑ss or Diffusers‑based).
  - Stores the resulting adapter (LoRA) and returns an id/path.
  - Your image provider should accept a styleModel id and apply it during inference.
- Batch Style Transfer (Style tab): Implement a job that processes all saved panel images with the selected target look and updates them.


Dynamic Layouts with Composition Analysis
- Idea: Use basic CV (face/body detection, horizon lines, saliency) to pick grid templates (single, banner, 2x2, 1‑2 split, etc.) and place panels optimally.
- Pipeline: Analyze generated images, compute composition features, choose templates, and produce a layout suggestion presented in the Layout tab.


Performance and Caching
- Thumbnails: Downscale generated images when storing in memory to reduce RAM.
- Debounce: Debounce generate requests from the UI to prevent accidental spamming.
- Caching: Keep a small LRU of recent generations and re‑use when prompts/options are identical.
- MediaRecorder: Prefer vp9 when available; gracefully fallback to vp8/webm. Avoid very long durations for previews.


Persistence Strategies
- LocalStorage/IndexedDB: Save savedPanels and story state locally between sessions.
- Cloud Sync: Add a small backend to persist panels, styles, and ratings per user.


Security and Privacy
- Secrets: Store API keys server‑side. Never commit keys to the repo or ship them to the browser.
- PII: If you process user images or text, consider data retention policies and opt‑out controls.
- CORS: Host images on domains with proper CORS headers if you need to capture them via canvas.
