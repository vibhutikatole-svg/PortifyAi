const mammoth = require('mammoth');

/**
 * Extract clean raw text from DOCX buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const extractTextFromDOCX = async (buffer) => {
  let result;
  try {
    result = await mammoth.extractRawText({ buffer });
  } catch (error) {
    throw new Error(`Malformed or corrupted DOCX file: unable to extract Word document content (${error.message})`);
  }

  if (!result || typeof result.value !== 'string') {
    throw new Error('No readable text found in DOCX.');
  }

  const rawText = result.value.replace(/\r\n/g, '\n').trim();
  if (rawText.length < 20) {
    throw new Error('The uploaded Word document contains insufficient text content.');
  }

  return rawText;
};

module.exports = { extractTextFromDOCX };
