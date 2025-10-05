# FAQ

Last updated: 2025-10-05

General
- Is ComicBuilder free? Yes, this repository is MIT‑licensed. You may use and modify it under the terms of the license.
- Do I need API keys to try it? No. The default providers work offline with placeholders so you can explore the UX without keys.

AI Image Generation
- How do I use Stable Diffusion or OpenAI images?
  - Implement a custom image provider and set it active. See docs/PROVIDERS_AND_INTEGRATIONS.md.
- Can I control the aspect ratio of generated images?
  - Pass width/height in provider options. The UI currently generates 1024×1024 by default.

Character Consistency
- How can I keep characters consistent across panels?
  - Use Character Consistency to append tokens/traits and consider training a Textual Inversion or DreamBooth model for best results.

Story and Dialogue
- Can the app write full scripts?
  - The included LLM stubs brainstorm a logline/beats/characters and generate sample dialogue. Swap in a real LLM for richer outputs.

Video
- Does the app generate full videos with voiceover?
  - The app creates short Ken Burns previews in‑browser and exports CSV/webhook clip rows you can feed into external video/TTS tools.

Import/Export
- What file types can I import?
  - Images (added as panels) and JSON with arrays of panel objects.
- How do I export for print?
  - Use Export Panel from the preview dialog; it renders at 3× pixel ratio for sharp results.

Integrations
- How do I keep my API keys safe?
  - Use a backend proxy. Never put secrets in frontend code.

Troubleshooting
- Why is my image black in the video preview?
  - Likely a CORS issue with the image URL. Use CORS‑enabled images or data URLs.
- Why do Send Panel/All show no rows?
  - Ensure panels have dialogue elements. Only dialogue lines create clip rows.
