const multer = require('multer');
const path = require('path');

// Store file in memory as Buffer for fast parsing and zero disk leakage
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file type. Please upload a PDF or DOCX resume.'
      ),
      false
    );
  }
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

/**
 * Validates the file buffer against expected binary magic bytes
 * Prevents file spoofing (e.g. executable or script renamed to .pdf)
 * @param {object} file - Multer file object with buffer & originalname
 * @returns {{ valid: boolean, error?: string }}
 */
const validateFileContentSignature = (file) => {
  if (!file || !file.buffer || file.buffer.length === 0) {
    return { valid: false, error: 'The uploaded file is empty (0 bytes).' };
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const buffer = file.buffer;

  if (ext === '.pdf') {
    // PDF specification: must contain %PDF- in the first 1024 bytes
    const headerSlice = buffer.subarray(0, Math.min(1024, buffer.length)).toString('latin1');
    if (!headerSlice.includes('%PDF-')) {
      return {
        valid: false,
        error: 'Invalid file content: The file does not have a valid PDF binary signature.',
      };
    }
  } else if (ext === '.docx' || ext === '.doc') {
    // DOCX is a ZIP container: first bytes must be PK (0x50 0x4B)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      return {
        valid: false,
        error: 'Invalid file content: The file does not have a valid Word/DOCX signature.',
      };
    }
  } else if (ext === '.txt') {
    // Plain text should not contain binary null characters
    const sample = buffer.subarray(0, Math.min(2048, buffer.length));
    if (sample.includes(0x00)) {
      return {
        valid: false,
        error: 'Invalid file content: Binary data detected in plain text file.',
      };
    }
  }

  return { valid: true };
};

module.exports = {
  uploadResume,
  validateFileContentSignature,
};

