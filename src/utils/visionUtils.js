// src/utils/visionUtils.js
// Lightweight, client-side helpers for captions and composition hints.

export const captionImage = async (imageUrl) => {
  try {
    if (typeof document === 'undefined') return 'An illustrative scene.';
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('Failed to load image'));
      im.src = imageUrl;
    });

    // Draw small to canvas to estimate brightness and dominant area
    const w = 32, h = 32;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    let left = 0, right = 0, top = 0, bottom = 0, center = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; // luminance
        sum += l;
        if (x < w / 3) left += l; else if (x > (2 * w) / 3) right += l; else center += l;
        if (y < h / 3) top += l; else if (y > (2 * h) / 3) bottom += l;
      }
    }
    const avg = sum / (w * h);
    const brightness = avg > 140 ? 'bright' : avg < 70 ? 'dark' : 'dimly lit';

    const horiz = left > right && left > center ? 'left' : right > center ? 'right' : 'center';
    const vert = top > bottom && top > (sum / 3) ? 'top' : bottom > (sum / 3) ? 'bottom' : 'middle';

    return `A ${brightness} scene with visual weight near the ${vert}-${horiz}.`;
  } catch (e) {
    console.warn('captionImage failed', e);
    return 'An evocative scene.';
  }
};

export const analyzeComposition = async (imageUrl) => {
  // For now just reuse captionImage’s quick stats
  const caption = await captionImage(imageUrl);
  const subject = /left/.test(caption) ? 'left' : /right/.test(caption) ? 'right' : 'center';
  const vertical = /top/.test(caption) ? 'top' : /bottom/.test(caption) ? 'bottom' : 'middle';
  const light = /bright/.test(caption) ? 'bright' : /dark/.test(caption) ? 'dark' : 'dim';
  return { subject, vertical, light, caption };
};
