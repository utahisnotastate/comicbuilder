# Video Pipeline — CSV and Webhooks

Last updated: 2025-10-05

This document explains how ComicBuilder normalizes panels into clip rows and how to export or send them to external tools via CSV and webhooks.

Contents
- Overview
- Row Generation (panelToClipRows, panelsToClipRows)
- CSV Export
- Webhook Integration
- Field Definitions
- End‑to‑End Example (Zapier/Make)
- Troubleshooting


Overview
- Goal: Convert your panels and dialogue into a structured list of clips that downstream tools (e.g., Veo, Fliki, custom pipelines) can turn into videos.
- Where: Panel Manager → Video Pipeline section.


Row Generation
- Single panel → rows: src/utils/aiUtils.js: panelToClipRows(panel, voiceMap)
- Many panels → rows: panelsToClipRows(panels, voiceMap)
- Logic
  - For each dialogue element (type === 'dialogue') in a panel:
    - Builds Cinematic_Prompt by refining the panel’s imagePrompt + dialogue content + character name.
    - Computes B_Roll_Keywords heuristically from dialogue keywords.
    - Resolves Voice_ID from a voiceMap (character → voice id), or falls back to the character name.


CSV Export
- The app can generate a CSV with headers:
  - Scene_ID, Voice_ID, Content, Raw_Media_Prompt, Cinematic_Prompt, B_Roll_Keywords, Panel_ID, Character
- Use the downloadCsv helper in aiUtils.js or wire the rows into your pipeline tool.


Webhook Integration
- Configure in Panel Manager → Video Pipeline:
  - Webhook URL (Zapier/Make/your server)
  - Target (string that identifies your downstream system)
  - Auto‑send on save (optional)
- Sending
  - Send Panel: Normalizes the selected panel into rows and POSTs { target, rows } to the webhook).
  - Send All: Normalizes all saved panels and POSTs { target, rows }.
- Response handling
  - The UI expects JSON but will accept any 2xx and attempts to parse response JSON.


Field Definitions
- Scene_ID: A unique identifier combining scene title, panel number, panel id, and dialogue index.
- Voice_ID: A symbolic id for the voice to use for TTS. Derived from voiceMap[character] or falls back to character.
- Content: The actual line of dialogue.
- Raw_Media_Prompt: The panel’s image prompt (metadata.imagePrompt).
- Cinematic_Prompt: A refined, cinematic version of the media prompt tailored to the dialogue and character.
- B_Roll_Keywords: Comma‑separated short phrases suggesting background visuals.
- Panel_ID: The id of the originating panel.
- Character: The speaking character name.


End‑to‑End Example (Zapier/Make)
- In Make.com: Create a webhook trigger (Custom Webhook) and copy its URL.
- Paste the URL into Webhook URL.
- Set Target to your downstream app name (e.g., "veo").
- Click Send All to deliver the rows. In Make.com, add an iterator over the rows array and push each row into your chosen video tool, TTS, or storage.
- Optional: Save CSV locally via generateCsv(rows) if you prefer manual import.


Troubleshooting
- No rows generated
  - Ensure your panels contain dialogue elements. Only dialogue produces rows by design.
- Webhook fails
  - Check CORS and HTTPS. For local testing, use a service like webhook.site.
- Wrong voices
  - Configure voiceMap in Panel Manager → Video Pipeline so characters map to the correct TTS voice ids.
