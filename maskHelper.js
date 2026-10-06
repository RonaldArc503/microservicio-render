const zlib = require('zlib');
const { fal } = require('@fal-ai/client');

let cachedDefaultMaskUrl = null;

/**
 * Genera un buffer PNG binario válido (512x512, escala de grises)
 * donde la parte superior (45%) es blanca (área a inpaint/cabello)
 * y la inferior es negra (protege rostro y rasgos).
 * Utiliza zlib nativo de Node.js sin dependencias externas pesadas.
 */
function createHairMaskPngBuffer(width = 512, height = 512) {
  const rowSize = 1 + width;
  const raw = Buffer.alloc(height * rowSize);
  const hairHeight = Math.floor(height * 0.45);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filtro PNG tipo 0 (None)
    const color = y < hairHeight ? 255 : 0;
    for (let x = 0; x < width; x++) {
      raw[rowOffset + 1 + x] = color;
    }
  }

  const idatData = zlib.deflateSync(raw);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(Buffer.concat([chunkType, data])), 0);
    return Buffer.concat([len, chunkType, data, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // 8-bit depth
  ihdr[9] = 0;  // Grayscale (0)
  ihdr[10] = 0; // Compression deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // No interlace
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', iend)
  ]);
}

/**
 * Resuelve la URL de la máscara:
 * 1. Si el cliente envió una máscara explícita (maskUrl), se usa directamente.
 * 2. Si está configurada la variable DEFAULT_MASK_URL en el entorno, se usa.
 * 3. Si no, genera dinámicamente un PNG estándar de zona capilar, lo sube a Fal CDN
 *    y lo guarda en memoria para todas las llamadas posteriores.
 */
async function resolveMaskUrl(providedMaskUrl) {
  if (providedMaskUrl && typeof providedMaskUrl === 'string' && providedMaskUrl.trim().length > 0) {
    return providedMaskUrl.trim();
  }

  if (process.env.DEFAULT_MASK_URL && process.env.DEFAULT_MASK_URL.trim().length > 0) {
    return process.env.DEFAULT_MASK_URL.trim();
  }

  if (cachedDefaultMaskUrl) {
    return cachedDefaultMaskUrl;
  }

  try {
    const maskBuffer = createHairMaskPngBuffer(512, 512);
    const maskBlob = new Blob([maskBuffer], { type: 'image/png' });
    cachedDefaultMaskUrl = await fal.storage.upload(maskBlob);
    console.log('[MaskHelper] Máscara capilar por defecto subida a Fal Storage:', cachedDefaultMaskUrl);
    return cachedDefaultMaskUrl;
  } catch (err) {
    console.warn('[MaskHelper] Advertencia: No se pudo subir la máscara automática a Fal Storage:', err.message);
    return null;
  }
}

module.exports = {
  createHairMaskPngBuffer,
  resolveMaskUrl
};
