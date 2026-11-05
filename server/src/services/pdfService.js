const pdfParse = require('pdf-parse');

class ScannedPdfError extends Error {
  constructor(message, pageCount) {
    super(message);
    this.name = 'ScannedPdfError';
    this.isScanned = true;
    this.pageCount = pageCount;
  }
}

/**
 * Extract clean raw text from PDF buffer
 * Detects scanned or image-only PDFs with insufficient text layer
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromPDF = async (buffer) => {
  let data;
  try {
    // Convert Buffer to an isolated Uint8Array copy to prevent pdf.js from reading
    // shared Node.js Buffer pool memory offsets incorrectly.
    const pdfBytes = buffer ? new Uint8Array(buffer) : buffer;
    data = await pdfParse(pdfBytes);
  } catch (error) {
    // Malformed or corrupted PDF structure
    throw new Error(`Malformed or corrupted PDF file: unable to parse document structure (${error.message})`);
  }

  if (!data) {
    throw new Error('Unable to read PDF file structure.');
  }

  const rawText = data.text ? data.text.replace(/\r\n/g, '\n').trim() : '';
  const pageCount = data.numpages || 1;

  // Check if text layer is missing or insufficient (e.g. scanned image / photo resume)
  // A typical 1-page resume has at least 150-300 words (800+ chars).
  // If fewer than 50 characters exist across the entire document, it is scanned/image-only.
  if (rawText.length < 50) {
    throw new ScannedPdfError(
      'Scanned or image-only PDF detected. The document contains pages but no extractable machine-readable text layer. Please upload a digital text-based PDF or DOCX file.',
      pageCount
    );
  }

  return rawText;
};

module.exports = {
  extractTextFromPDF,
  ScannedPdfError,
};
