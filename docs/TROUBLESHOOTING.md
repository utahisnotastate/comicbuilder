# Troubleshooting

Last updated: 2025-10-05

This page lists common issues and how to resolve them.

Contents
- Setup and Build
- Image Generation
- Video Preview
- Story/Dialogue
- Webhook/CSV Pipeline
- Import/Export
- Performance


Setup and Build
- npm install fails
  - Delete node_modules and package-lock.json, then run npm install again.
  - Ensure your Node.js version matches the repo’s requirements (recent LTS recommended).
- Dev server not reachable
  - Confirm Vite is running and no other app uses the same port. Visit http://localhost:5173.


Image Generation
- Images look like placeholders instead of AI art
  - Expected with the default provider. Integrate a real provider (see docs/PROVIDERS_AND_INTEGRATIONS.md).
- Control Image URL not applied
  - The default provider ignores control conditioning (it’s a stub). Implement ControlNet support in your custom provider.
- Character Consistency not working
  - Without a fine‑tuned model or embeddings, consistency is prompt‑based. Train and use a token (Textual Inversion/DreamBooth) with a real provider for reliable results.


Video Preview
- “MediaRecorder not supported”
  - Your browser may not support MediaRecorder codecs. Try Chrome/Edge on desktop.
- “Failed to load image for video preview”
  - The image host may block cross‑origin canvas use. Use same‑origin or CORS‑enabled images.
- Exported video does not play
  - Some players don’t support VP9. The app falls back to VP8/webm where possible.


Story/Dialogue
- Brainstorm returns generic content
  - By design the local fallback is simple. Plug a real LLM to improve richness.
- Generate Dialogue For All Panels does nothing
  - Ensure saved panels exist and contain images (for better captions). Check console for errors.


Webhook/CSV Pipeline
- “no_webhook” or send returns false
  - Set a valid Webhook URL in Panel Manager → Video Pipeline.
- Rows are empty
  - Only dialogue elements produce rows. Add dialogue to panels first.
- Target ignored
  - Target is an informational field for your downstream; your server must route based on it.


Import/Export
- Import images added as blank panels
  - Intended. Add dialogue and metadata after import, or generate story beats first.
- Export PNG looks blurry
  - Use the built‑in export button. It renders at a 3× pixel ratio for print.


Performance
- High memory usage with many generated images
  - Download/save desired results and clear the Generated Images list periodically.
- Sluggish UI
  - Avoid generating many previews at once. Keep the browser tab focused during MediaRecorder operations.
