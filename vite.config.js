import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only middleware to handle Vertex AI image generation
function vertexAIMiddleware() {
  return {
    name: 'vertex-ai-image-middleware',
    configureServer(server) {
      server.middlewares.use('/api/vertex/generate-image', async (req, res) => {
        try {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => {
              try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
            });
            req.on('error', reject);
          });

          const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'chroniclesof23';
          const location = process.env.VERTEX_LOCATION || 'us-central1';
          const bucketName = process.env.GCS_BUCKET || body.bucket || '';
          const uploadToGCS = Boolean(body.uploadToGCS ?? (bucketName && bucketName.length > 0));

          const {
            prompt = '',
            negativePrompt = '',
            n = 1,
            width = 1024,
            height = 1024,
            seed,
            mimeType = 'image/png',
            style = 'realistic',
            fast = false,
            controlImageUrl = ''
          } = body || {};

          if (!prompt || typeof prompt !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing prompt' }));
            return;
          }

          // Lazy import to avoid loading in build
          const { VertexAI } = await import('@google-cloud/vertexai');

          const vertexAI = new VertexAI({ project, location });
          const modelId = fast ? 'imagen-3.0-fast-generate-001' : 'imagen-3.0-generate-001';
          const model = vertexAI.getGenerativeModel({ model: modelId });

          const promptParts = [];
          const styleText = style && style !== 'custom' ? `Style: ${style}.` : '';
          const negText = negativePrompt ? `Avoid: ${negativePrompt}.` : '';
          // Build main text prompt
          promptParts.push({ text: [prompt, styleText, negText].filter(Boolean).join(' ') });

          // Optional image-to-image guidance
          if (controlImageUrl) {
            try {
              const imgResp = await fetch(controlImageUrl);
              if (!imgResp.ok) throw new Error(`Failed to fetch control image: ${imgResp.status}`);
              const arrayBuf = await imgResp.arrayBuffer();
              const b64 = Buffer.from(arrayBuf).toString('base64');
              // Assume jpeg if unknown
              const controlMime = (imgResp.headers.get('content-type')) || 'image/jpeg';
              promptParts.push({ inlineData: { data: b64, mimeType: controlMime } });
            } catch (e) {
              console.warn('Control image fetch failed:', e?.message || e);
            }
          }

          const generationConfig = {
            // Best-effort config; some fields may be ignored by the model
            // Width/height are hints; Imagen 3 supports square/portrait/landscape ratios.
            // We pass these as safety hints in the text and allow defaults.
            candidateCount: Math.max(1, Math.min(4, Number(n) || 1)),
            temperature: 0.4,
            // seed support if provided
            ...(seed != null ? { seed: Number(seed) } : {}),
          };

          const request = {
            contents: [{ role: 'user', parts: promptParts }],
            generationConfig,
          };

          const response = await model.generateContent(request);

          const images = [];
          const cands = response?.response?.candidates || [];
          cands.forEach((cand) => {
            const parts = cand?.content?.parts || [];
            parts.forEach((p) => {
              if (p?.inlineData?.data && (p?.inlineData?.mimeType || '').startsWith('image/')) {
                images.push({
                  data: p.inlineData.data,
                  mimeType: p.inlineData.mimeType,
                });
              }
            });
          });

          if (images.length === 0) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Vertex AI did not return an image' }));
            return;
          }

          // For simplicity, handle first image
          const { data: b64, mimeType: modelMime } = images[0];
          const mime = mimeType || modelMime || 'image/png';
          const buffer = Buffer.from(b64, 'base64');

          let url = '';
          let gcsInfo = null;

          if (uploadToGCS && bucketName) {
            const { Storage } = await import('@google-cloud/storage');
            const storage = new Storage();
            const ext = mime.includes('png') ? 'png' : (mime.includes('webp') ? 'webp' : 'jpg');
            const object = `ai-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const file = storage.bucket(bucketName).file(object);
            await file.save(buffer, { contentType: mime, resumable: false, public: false, metadata: { cacheControl: 'public, max-age=31536000' } });
            // Create a signed URL for quick access
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 6 * 60 * 60 * 1000 });
            url = signedUrl;
            gcsInfo = { bucket: bucketName, object };
          } else {
            // Return a data URL as fallback
            url = `data:${mime};base64,${b64}`;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ url, mimeType: mime, provider: 'vertex', gcs: gcsInfo }));
        } catch (err) {
          console.error('Vertex middleware error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vertexAIMiddleware()],
})
