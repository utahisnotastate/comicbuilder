# ComicBuilder User Guide

Last updated: 2025-10-05

This guide walks you through everything you need to start creating comics with ComicBuilder and the built‑in AI Studio Pro — from first steps to expert workflows. It assumes no backend is required and focuses on the browser‑only experience delivered by this repository.

Note: Real AI services are pluggable. Out of the box, image generation uses a placeholder provider so the app works without keys. You can later swap in real providers (Stable Diffusion, OpenAI, Replicate, etc.) — see Providers and Integrations.


Contents
- Quick Start
- Core Concepts
- First Project Tutorial (Step‑by‑Step)
- Image Generation (basics)
- Text/Narrative Generation (basics)
- Story Brainstorming and Beats
- Character Consistency
- Control‑Guided Generation (pose, edges, depth)
- Video Preview (Ken Burns motion)
- Feedback and Refinement Loop
- Import/Export Panels
- Webhook/CSV Video Pipeline Overview
- Tips, Shortcuts, Privacy/Security


Quick Start
1) Install dependencies: npm install
2) Run the dev server: npm run dev
3) Open http://localhost:5173 in your browser
4) Click “AI Studio Pro” from the Panel Manager to open the integrated AI desktop.


Core Concepts
- Panel: A self‑contained unit (image + elements like dialogue). Saved panels appear in the Panel Manager.
- AI Studio Pro: A multi‑tab modal that helps you generate images, text, story beats, layouts, and motion previews.
- Story: Theme, logline, beats, and characters maintained in global state to guide panel creation.
- Providers: Pluggable adapters for image and text generation. The default image provider is a visual placeholder.
- Feedback: Like/dislike actions you can apply to generated assets to track what worked.


First Project Tutorial (Step‑by‑Step)
1) Create a panel
- Open the app and go to Panel Manager.
- Click “New Panel” to create a blank panel.

2) Open AI Studio Pro
- Click the “AI Studio Pro” button. The AI Studio opens in a modal.

3) Generate your first image (Image tab)
- Enter an image prompt such as “A neon‑lit city alley at night; rain; heroic figure in silhouette.”
- Choose an Art Style (e.g., Comic Book) and a Quality level.
- Optionally pick a Character Consistency token (see Character Consistency below) and/or a Control Type with a Control Image URL.
- Click Generate Image. The result appears in the right column under “Generated Images.”
- Click the “Use in Panel” icon to apply the image to your current panel.

4) Add dialogue to your panel
- Close AI Studio.
- In the panel editor (or Panel Manager’s edit workflows), add dialogue elements and type the speech for your characters. You can generate dialogue automatically later from the Story tab if you prefer.

5) Save your panel
- Click Save to store it in the Saved Panels list in Panel Manager.

6) Export the panel
- From Panel Manager, preview the panel and click Export Panel to download a high‑resolution PNG suitable for print.

7) Optional: Create a motion preview
- Reopen AI Studio Pro and switch to Video tab.
- Paste or choose a source image URL (auto‑filled when you generate images).
- Pick aspect ratio (16:9, 9:16, or 1:1), motion direction, and duration/zoom.
- Click Generate Preview, then Download to save the short webm preview.


Image Generation (basics)
- Prompt: Free‑form text describing your desired image. The placeholder provider returns a styled placeholder. When you integrate a real provider, the same UI and prompts will work with real models.
- Style: A high‑level aesthetic preset (realistic, comic, anime, watercolor, oil, sketch).
- Quality: A coarse knob for speed vs fidelity (25, 50, 75, 100). Real providers can map this to steps/sampler.
- Apply to Panel: Use the plus icon on a generated image to set it as the current panel image.
- Train Style (concept): Upload images and click Train Style. In this repo it logs a message (no backend). See Advanced Topics for hooking in a real LoRA trainer.


Text/Narrative Generation (basics)
- Text tab: Enter a text prompt (e.g., “Write tense dialogue for a hero confronting a traitor”).
- Click Generate Text. The demo creates a sample response. You can save/like/dislike generated texts for later use.
- To plug in a real LLM, see Providers and Integrations.


Story Brainstorming and Beats
- Theme: Start with a premise (e.g., “sci‑fi thriller about truth and corruption”).
- Brainstorm: Click Brainstorm to generate a logline, beats, and characters. The default implementation uses a deterministic local fallback so it works offline; you can swap in an LLM later.
- Apply Beats: Turn beats into empty panels with per‑panel metadata (scene title, panel number, and image prompt).
- Generate Dialogue For All Panels: After you have panels, auto‑fill dialogue based on panel images and captions.


Character Consistency
- Why: Keep recurring characters visually consistent across panels.
- How: In AI Studio → Image tab, select a character from Character Consistency.
- Under the hood: The app appends a character token and descriptors to your image prompt. You can register characters in the story phase; each character may include a token (for future Textual Inversion/DreamBooth) and descriptors (e.g., “scar over left eye, leather jacket”).
- Advanced: Later, connect a fine‑tuned model (Textual Inversion or DreamBooth) and use the token in your prompts for robust consistency.


Control‑Guided Generation (pose, edges, depth)
- Purpose: Add structural guidance to the image model while preserving your style.
- In Image tab: Choose Control Type (pose/edges/depth) and provide a Control Image URL.
- Placeholder behavior: Control fields are displayed and embedded in the placeholder image text; real providers should implement ControlNet‑like conditioning.


Video Preview (Ken Burns motion)
- Generate Preview: From the Video tab, provide a source image URL and configure aspect, motion direction, duration, and zoom.
- Output: The app records a short webm file right in the browser using MediaRecorder.
- Limitations: Some browsers don’t support MediaRecorder VP9/VP8; the app falls back as needed. CORS on remote images may block preview recording; prefer same‑origin or CORS‑enabled URLs.


Feedback and Refinement Loop
- Like/Dislike: Rate generated images and texts. Use this to track what’s working as you iterate.
- Variations: Adjust prompts, style, and quality to explore alternatives. Use beats to keep story flow aligned.


Import/Export Panels
- Import: Click Import Panels in Panel Manager and select images (added as blank panels with the image) or JSON files (arrays of panel objects). The importer normalizes external data where possible.
- Export: Use the Export Panel button in the Preview dialog to download high‑resolution PNGs. Page‑level export depends on your project setup.


Webhook/CSV Video Pipeline Overview
- Purpose: Turn panels and dialogue into a CSV or send normalized rows to a webhook for automation tools (Zapier/Make) or downstream media apps (placeholders listed in UI).
- CSV schema: Scene_ID, Voice_ID, Content, Raw_Media_Prompt, Cinematic_Prompt, B_Roll_Keywords, Panel_ID, Character. The app derives these via panelToClipRows and panelsToClipRows.
- Webhook: Set Webhook URL and Target in Panel Manager → Video Pipeline. Use Send Panel/Send All helpers (auto‑send on save is available). Payload is JSON with { target, rows }.
- See docs/VIDEO_PIPELINE.md for field definitions and end‑to‑end examples.


Tips, Shortcuts, Privacy/Security
- Tips
  - Keep prompts short but specific; add style and mood tags at the end.
  - Use beats to stay aligned with the narrative while generating assets in any order.
  - Leverage aspect ratio options (in Video) to plan for social formats.
- Browser support
  - Modern Chromium/Firefox/Edge. MediaRecorder support varies; Safari has limitations.
- Privacy & Security
  - This repository does not ship API keys. When adding real providers, prefer a secure backend or proxy to store secrets.
  - Imported images and generated assets live in browser memory/state unless you export or persist them. Use with care on shared machines.


Where to next?
- Learn AI Studio features in depth: docs/AI_STUDIO.md
- Advanced integrations and custom providers: docs/ADVANCED_TOPICS.md and docs/PROVIDERS_AND_INTEGRATIONS.md
- Webhook and CSV pipeline details: docs/VIDEO_PIPELINE.md
- Troubleshooting and FAQ: docs/TROUBLESHOOTING.md and docs/FAQ.md
