# AI Studio Pro — In‑Depth Guide

Last updated: 2025-10-05

AI Studio Pro is the creative cockpit of ComicBuilder. It collects all AI‑assisted features into a single modal with six tabs: Image, Text, Style, Video, Story, and Layout. This document explains every control and how data flows through the app so you can make the most of it.

Contents
- Anatomy of AI Studio
- Image Tab
- Text Tab
- Style Tab
- Video Tab
- Story Tab
- Layout Tab
- Working With Panels
- Ratings, Assets, and Iteration


Anatomy of AI Studio
- Where: Open Panel Manager and click “AI Studio Pro.” The modal embeds the studio and passes the currently selected panel id (if any) so actions can apply to that panel.
- Persistence: Generated assets are kept in UI state for the session; use Save/Apply/Download to keep what you need.


Image Tab
Purpose: Generate panel imagery.

Controls
- Prompt: Free‑form description of the image you want.
- Art Style: Select from realistic, comic, anime, watercolor, oil, sketch.
- Quality: 25 (fast) to 100 (ultra). Real providers can map this to steps/samplers.
- Character Consistency: Pick a character from your story’s registry. Their token and descriptors are appended to the prompt.
- Control Type: None, pose, edges, depth.
- Control Image URL: Optional source image for control guidance.

Actions
- Generate Image: Calls the active image provider (placeholder by default). Results appear under Generated Images.
- Clear: Resets the prompt.

Generated Images Panel
- Shows thumbnails with timestamp, prompt, and chips for style and quality.
- Like/Dislike: Record your preference for this asset.
- Save to Assets: Placeholder for future asset library.
- Download: Save the image locally.
- Use in Panel: Apply the image to the active/selected panel.

Under the Hood
- src/utils/aiUtils.js exposes registerImageProvider, setActiveImageProvider, and generateImage.
- The default provider builds a placeholder image URL and returns quickly so the UX is demonstrable without keys.
- Character consistency: The selected character’s descriptors and token are appended to the prompt so a future tuned model can lock visual identity.
- Control fields: Passed through to the provider options for ControlNet‑style use.


Text Tab
Purpose: Generate dialogue or narration.

Controls
- Prompt: Describe the desired text output.

Actions
- Generate Text: Adds sample text to the list. Replace the implementation in utils/llmUtils.js to integrate a real LLM.
- Clear: Resets the prompt.

Generated Text Panel
- Shows timestamped entries with content.
- Like/Dislike, Save to Dialogue Library (placeholder), Use in Script (placeholder for future insertion helpers).


Style Tab
Purpose: Explore and apply a consistent style across images.

Controls
- Target Style: Select a global look to aim for.
- Apply to all project images: Toggles batch application intent (conceptual in the current build).

Actions
- Apply Style Transfer: Placeholder action for a future pipeline. For now, see Train Style in the Image tab for a conceptual LoRA trainer hook.


Video Tab
Purpose: Add subtle cinematic motion to still images.

Controls
- Source Image URL: Auto‑filled when you generate images; you can paste another URL.
- Aspect Ratio: 16:9, 9:16, 1:1.
- Motion: Pan Right/Left/Up/Down.
- Duration: 2–10 seconds.
- Zoom End: 1.05–1.5x.

Actions
- Generate Preview: Produces an in‑browser webm preview via MediaRecorder.
- Clear: Removes the current preview.
- Download: Saves the generated webm.

Notes
- Some images hosted without CORS headers cannot be recorded by the canvas for security reasons. Use your own uploads or hosts with proper CORS.


Story Tab
Purpose: Co‑create story structure and characters.

Controls & Actions
- Theme or premise: A short description of your story.
- Brainstorm: Produces a logline, beats, and characters (deterministic local fallback by default).
- Apply Beats: Creates panels from beats with metadata (sceneTitle, panelNumber, imagePrompt).
- Generate Dialogue For All Panels: Uses vision captioning + dialogue generation hooks to fill panels with speech bubbles.

Data
- Saved to global store (zustand). Characters are upserted into characterRegistry; beats are kept in story.beats.


Layout Tab
Purpose: Experiment with story flow via reordering.

Actions
- Reverse Order: Reverses saved panels.
- Shuffle: Moves random panels to the front repeatedly to reshuffle.

Future Work
- Add composition‑aware layouts using simple CV over panel images to detect subject placement and vary panel grid arrangements.


Working With Panels
- Apply to Panel (from Image tab) will either update the selected panel in Panel Manager or set the active panel image if none is selected.
- You can preview and export panels at high resolution from Panel Manager.


Ratings, Assets, and Iteration
- Ratings are written to store.feedback. Use them to guide your next generation round.
- An asset library hook is scaffolded (Save icons) for future persistence or cloud sync.
