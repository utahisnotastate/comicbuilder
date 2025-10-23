# Comic Builder

A professional-grade React application for creating comic book panels with taped images and dialogue. Perfect for comic creators who want to generate print-ready assets for InDesign.

## Features

### Panel Editor
- **Interactive Elements**: Drag, drop, resize, and rotate dialogue boxes and tape
- **Customizable Styling**: Choose from different fonts and paper textures
- **Image Upload**: Upload your own images or use the built-in placeholder
- **Layout Presets**: Quickly toggle Portrait 4:5, Square 1:1, Landscape 16:9, and Story/Reels 9:16. Exports auto-optimize to the chosen resolution.
- **History Management**: Undo/redo functionality for all changes
- **Save Panels**: Save your work to a library for later use

### Page Composer
- **Multiple Layouts**: Choose from 2x2 grid, top banner, single panel, or 3-panel strip layouts
- **Panel Assignment**: Drag saved panels to different slots on the page
- **Print-Ready Export**: Generate high-resolution images optimized for InDesign (300 DPI)

### Professional Export
- **High Resolution**: All exports are generated at 3x pixel ratio for crisp printing
- **InDesign Ready**: Standard comic page dimensions (6.625" x 10.25")
- **PNG Format**: Lossless format perfect for professional printing

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

## Usage

### Creating a Panel
1. Switch to the "Panel Editor" tab
2. Upload an image using the "Upload Image" button
3. Add dialogue boxes and tape using the control buttons
4. Drag elements to position them
5. Resize dialogue boxes by dragging their corners
6. Double-click elements to delete them
7. Save your panel using the save button

### Composing a Page
1. Switch to the "Page Composer" tab
2. Choose a layout from the dropdown
3. Assign saved panels to slots by clicking the slot chips
4. Export the complete page for InDesign

## Technical Stack

- **React 19**: Latest React with modern features
- **Zustand**: Lightweight state management
- **Material-UI**: Professional UI components
- **React-RND**: Drag and drop functionality
- **html2canvas**: DOM-to-image export with transparent backgrounds, scaling, and CORS support
- **Vite**: Fast development and building

## File Structure

```
src/
├── App.jsx              # Main application with tabbed interface
├── Editor.jsx           # Panel editing workspace
├── PageComposer.jsx     # Page layout and composition
├── ComicPanel.jsx       # Interactive panel component
├── ControlPanel.jsx     # Editing controls and tools
├── store.js             # Zustand state management
└── components/
    └── SampleImage.jsx  # Placeholder image component
```

## Customization

### Adding New Fonts
Edit the `fonts` object in `ControlPanel.jsx`:
```javascript
const fonts = {
  'Your Font': '"Your Font Name", fallback',
  // ... existing fonts
};
```

### Adding New Paper Textures
Edit the `paperTextures` object in `ControlPanel.jsx`:
```javascript
const paperTextures = {
  'Your Texture': 'url("path/to/texture.png")',
  // ... existing textures
};
```

### Adding New Page Layouts
Edit the `layouts` object in `PageComposer.jsx`:
```javascript
const layouts = {
  'Your Layout': {
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '15px',
    slots: 3,
  },
  // ... existing layouts
};
```

## Export Specifications

- **Single Panel**: 650px width, auto height, 3x pixel ratio
- **Full Page**: 1988px × 3075px (6.625" × 10.25" at 300 DPI)
- **Format**: PNG (lossless)
- **Color Space**: RGB
- **Background**: Paper texture or solid color

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

# AI Studio Pro — Quick Start and Documentation

This repository now includes a complete AI Studio Pro workflow for co‑creating stories, generating images, adding motion previews, and exporting clip rows for video pipelines — all without requiring backend setup.

Quick Start (AI Studio)
- Run the app: npm install && npm run dev
- Open the app and click “AI Studio Pro” in the Panel Manager.
- Image tab: Enter a prompt, choose style/quality, and generate. Use the plus icon to apply to your panel.
- Story tab: Brainstorm a logline, beats, and characters, then Apply Beats to create panels. Generate Dialogue for All Panels when ready.
- Video tab: Paste/choose a source image, pick aspect/motion, and Generate Preview to get a short webm.

Advanced Docs
- User Guide (end‑to‑end tutorial): docs/USER_GUIDE.md
- AI Studio Pro (in‑depth): docs/AI_STUDIO.md
- Advanced Topics (consistency, control, LoRA, layouts, security): docs/ADVANCED_TOPICS.md
- Video Pipeline (CSV/webhooks): docs/VIDEO_PIPELINE.md
- Providers & Integrations (plug real AI): docs/PROVIDERS_AND_INTEGRATIONS.md
- Troubleshooting: docs/TROUBLESHOOTING.md
- FAQ: docs/FAQ.md

Notes
- The default image provider returns styled placeholders so the app runs without keys. You can register real providers later; see Providers & Integrations.
- MediaRecorder support varies by browser; use Chrome/Edge on desktop for best results.

---

Vertex AI Image Generation (GCP: chroniclesof23)
This project now includes a first‑class Google Cloud Vertex AI image provider using Imagen 3 with optional upload to Google Cloud Storage.

What you get
- Real image generation via Vertex AI (Imagen 3 fast/standard).
- Negative prompts, style presets, seed control, image‑to‑image guidance.
- Optional upload to GCS and signed URL response.
- Dev‑only middleware: runs inside Vite dev server so your credentials stay on the server side.

Prerequisites
- Enable APIs in GCP project chroniclesof23:
  - Vertex AI API (aiplatform.googleapis.com)
  - Cloud Storage (storage.googleapis.com)
- Authenticate locally (one‑time):
  - gcloud auth application-default login
- Create or choose a GCS bucket (example):
  - gsutil mb -l us-central1 gs://chroniclesof23-ai-outputs

Local env setup
Create a .env file in the project root with:

VITE_USE_VERTEX=true
VITE_GCS_BUCKET=chroniclesof23-ai-outputs
# Server-side env (picked up by Vite dev server)
GOOGLE_CLOUD_PROJECT=chroniclesof23
VERTEX_LOCATION=us-central1
GCS_BUCKET=chroniclesof23-ai-outputs

Run the app
- npm install
- npm run dev

How it works
- Frontend calls src/utils/aiUtils.js generateImage(prompt, options) using provider "vertex" when VITE_USE_VERTEX=true.
- Vite dev server exposes POST /api/vertex/generate-image handled in vite.config.js middleware:
  - Uses @google-cloud/vertexai with project chroniclesof23, location us-central1, model imagen-3.0-generate-001 (or fast variant).
  - Optionally uploads the result to GCS and returns a signed URL.

Options supported
You can pass a rich options object to generateImage:
{
  provider: 'vertex',            // optional; set via VITE_USE_VERTEX=true
  negativePrompt: 'blurry, low quality',
  width: 1024, height: 1024,     // hints to the model; it may choose closest aspect
  style: 'realistic' | 'comic' | 'anime' | 'watercolor' | 'oil' | 'sketch' | 'custom',
  seed: 1234,                    // deterministic variations
  n: 1,                          // number of candidates (1–4)
  fast: false,                   // use imagen-3.0-fast-generate-001 when true
  controlImageUrl: 'https://...',// image‑to‑image guidance
  mimeType: 'image/png',         // or 'image/jpeg'
  uploadToGCS: true,             // upload image to Bucket and return signed URL
  bucket: 'chroniclesof23-ai-outputs'
}

Production note
- The middleware runs only in dev. For production, deploy a simple Cloud Function/Run service reusing the same logic and point the client to that endpoint.


---

html2canvas migration and features
We replaced html-to-image with html2canvas for more robust, popular DOM-to-image export.

Highlights
- Transparent exports: backgroundColor: null preserves transparency for single-panel exports.
- Resolution control: scale, width, and height options for crisp results at target sizes (used by the page composer to reach 1988×3075 or 3075×1988).
- DOM preprocessing: onclone hook (not required for default flow) and our existing temporary font unlinking to avoid CORS issues with Google Fonts.
- External images: useCORS option plus crossOrigin="anonymous" on <img> to allow safe capture when your image host sends proper CORS headers.
- foreignObjectRendering: enabled to improve fidelity of complex styles.

Notes on external images (GCS signed URLs)
- To export panels that include images fetched from Google Cloud Storage (including signed URLs), ensure your bucket is configured with CORS so browsers can draw them to canvas without tainting.
- Example CORS JSON for a public GET use case:
  [
    {
      "origin": ["*"],
      "method": ["GET", "HEAD"],
      "responseHeader": ["Content-Type"],
      "maxAgeSeconds": 3600
    }
  ]
- Apply to your bucket (replace with your bucket name):
  gsutil cors set cors.json gs://chroniclesof23-ai-outputs

Troubleshooting
- If you see a SecurityError or a blank export, the canvas may be tainted by cross-origin content. Enable CORS on the image host and keep useCORS: true. For web fonts, our export temporarily removes external Google Font links before capture.
