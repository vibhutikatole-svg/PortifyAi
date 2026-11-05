const QRCode = require('qrcode');

/**
 * Generate QR code as Base64 Data URL (PNG)
 * @param {string} url - Target URL to encode
 * @returns {Promise<string>}
 */
const generateQRDataUrl = async (url) => {
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#1e1b4b', // Deep indigo
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('[QR Code Generation Error]:', err.message);
    throw new Error('Failed to generate QR code.');
  }
};

/**
 * Generate QR code as Buffer (for direct file stream or ZIP bundling)
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
const generateQRBuffer = async (url) => {
  try {
    return await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('[QR Buffer Error]:', err.message);
    throw new Error('Failed to generate QR buffer.');
  }
};

module.exports = { generateQRDataUrl, generateQRBuffer };

