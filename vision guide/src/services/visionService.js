/**
 * visionService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * AI Vision Analysis Service — Step 3 scaffold
 *
 * This module owns the interface between the UI and the AI backend.
 * In Step 3 the `analyzeImage` function is a stub that validates its inputs
 * and returns a clearly-labelled placeholder.  In Step 4 this is the only
 * file that needs to change to wire in the real Gemini Vision API.
 *
 * Contract
 * ─────────
 *  analyzeImage(imageDataUrl: string, action: 'describe'|'read'|'find')
 *    → Promise<{ text: string, action: string, timestamp: number }>
 *
 * The caller (App.jsx) passes:
 *   • imageDataUrl  – a PNG base64 data-URL produced by canvas.toDataURL()
 *   • action        – the selected analysis mode
 *
 * The service resolves with an object that ResponseSection can render directly.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// Action labels used both here and in the UI
export const ACTION_LABELS = {
  describe: 'Describe Scene',
  read:     'Read Text',
  find:     'Find Object',
};

/**
 * Extracts the raw base64 string from a data-URL.
 * e.g. "data:image/png;base64,iVBOR..." → "iVBOR..."
 *
 * @param {string} dataUrl
 * @returns {string}
 */
export function dataUrlToBase64(dataUrl) {
  if (!dataUrl || !dataUrl.includes(',')) {
    throw new Error('[visionService] Invalid data URL provided.');
  }
  return dataUrl.split(',')[1];
}

/**
 * Returns the MIME type embedded in a data-URL.
 * e.g. "data:image/png;base64,..." → "image/png"
 *
 * @param {string} dataUrl
 * @returns {string}
 */
export function dataUrlMimeType(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : 'image/png';
}

/**
 * analyzeImage — core AI analysis entry point.
 *
 * STEP 3 STATUS: Stub — validates inputs, returns a placeholder result.
 * STEP 4 TODO:   Replace the stub body with a real Gemini Vision API call
 *                using the `base64` and `mimeType` values already extracted.
 *
 * @param {string} imageDataUrl  PNG data-URL from canvas.toDataURL()
 * @param {'describe'|'read'|'find'} action  Selected analysis mode
 * @returns {Promise<{ text: string, action: string, timestamp: number }>}
 */
export async function analyzeImage(imageDataUrl, action) {
  if (!imageDataUrl) {
    throw new Error('[visionService] No image provided for analysis.');
  }
  if (!ACTION_LABELS[action]) {
    throw new Error(`[visionService] Unknown action "${action}". Expected: describe | read | find.`);
  }

  const base64 = dataUrlToBase64(imageDataUrl);
  const mimeType = dataUrlMimeType(imageDataUrl);

  const prompts = {
    describe: 'Describe this scene clearly and helpfully. Mention important objects, people, surroundings, and anything a visually impaired user should know.',
    read: 'Read all visible text in this image. Return the text accurately and preserve its meaning.',
    find: 'Identify the important objects visible in this image and describe where they are located relative to the camera.'
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompts[action] },
            { inline_data: { mime_type: mimeType, data: base64 } }
          ]
        }]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini API request failed.');
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

  if (!text) {
    throw new Error('Gemini returned no analysis.');
  }

  return {
    text,
    action,
    timestamp: Date.now(),
  };
}
