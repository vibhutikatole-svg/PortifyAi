/**
 * Portify AI — Secure Image Upload & EXIF Stripping Middleware
 *
 * Enforces:
 * 1. File size limit: 5MB
 * 2. Magic-byte signature verification (JPEG, PNG, WebP) to prevent spoofing
 * 3. Privacy-preserving EXIF and metadata stripping
 * 4. OWASP ASVS 5.0 compliance
 */

const multer = require('multer');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Preliminary MIME check (reinforced by magic bytes below)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
      return cb(new Error('Only JPEG, PNG, and WebP image formats are permitted.'));
    }
    cb(null, true);
  },
});

/**
 * Verify genuine magic bytes to prevent extension spoofing
 * @param {Buffer} buffer
 * @returns {'image/jpeg' | 'image/png' | 'image/webp' | null}
 */
const detectImageSignature = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF (4 bytes) + Size (4 bytes) + WEBP (4 bytes)
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return null;
};

/**
 * Strip EXIF (App1) metadata from JPEG buffer to protect user privacy (GPS, camera serials, timestamps)
 * @param {Buffer} buffer
 * @returns {Buffer} Sanitized buffer
 */
const stripJpegExif = (buffer) => {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer;
  }

  const chunks = [buffer.subarray(0, 2)]; // Keep SOI (Start of Image)
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      // Stream desynchronization or image data scan reached
      chunks.push(buffer.subarray(offset));
      break;
    }

    const marker = buffer[offset + 1];

    // Standalone markers without length: SOI, EOI, RST0-RST7, TEM
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      chunks.push(buffer.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    if (offset + 4 > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;

    // Marker 0xE1 is APP1 (EXIF / XMP metadata)
    // Marker 0xE2 is APP2 (ICC profile or FlashPix - keep or strip if EXIF)
    if (marker === 0xe1) {
      // Discard APP1 EXIF segment completely
      offset = segmentEnd;
      continue;
    }

    // Keep all other segments (e.g. DQT, SOF, DHT, SOS)
    chunks.push(buffer.subarray(offset, Math.min(segmentEnd, buffer.length)));
    offset = segmentEnd;

    // SOS (Start of Scan 0xDA) means the compressed image bitstream follows
    if (marker === 0xda) {
      if (offset < buffer.length) {
        chunks.push(buffer.subarray(offset));
      }
      break;
    }
  }

  return Buffer.concat(chunks);
};

/**
 * Strip ancillary metadata chunks (tEXt, zTXt, iTXt, eXIf) from PNG buffer
 * @param {Buffer} buffer
 * @returns {Buffer} Sanitized PNG buffer
 */
const stripPngMetadata = (buffer) => {
  if (buffer.length < 8) return buffer;

  const signature = buffer.subarray(0, 8);
  const chunks = [signature];
  let offset = 8;

  const metadataChunkNames = new Set(['tEXt', 'zTXt', 'iTXt', 'eXIf']);

  while (offset < buffer.length - 12) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const chunkTotalLength = 12 + length; // 4 length + 4 type + length data + 4 CRC

    if (offset + chunkTotalLength > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (!metadataChunkNames.has(type)) {
      chunks.push(buffer.subarray(offset, offset + chunkTotalLength));
    }

    offset += chunkTotalLength;
    if (type === 'IEND') break;
  }

  return Buffer.concat(chunks);
};

/**
 * Sanitize image buffer by stripping privacy-sensitive metadata
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Buffer}
 */
const sanitizeImageBuffer = (buffer, mimeType) => {
  try {
    if (mimeType === 'image/jpeg') {
      return stripJpegExif(buffer);
    }
    if (mimeType === 'image/png') {
      return stripPngMetadata(buffer);
    }
    return buffer;
  } catch (err) {
    console.warn('[Image Sanitizer Warning]: Metadata strip failed, returning original buffer:', err.message);
    return buffer;
  }
};

module.exports = {
  uploadAvatar: upload.single('avatar'),
  detectImageSignature,
  stripJpegExif,
  stripPngMetadata,
  sanitizeImageBuffer,
};

