const path = require('path');
const { extractTextFromPDF } = require('../services/pdfService');
const { extractTextFromDOCX } = require('../services/docxService');
const { extractResumeData } = require('../services/aiService');
const { Portfolio, THEME_LIST } = require('../models/Portfolio');
const User = require('../models/User');
const { generateUniqueSlug } = require('../utils/slugify');
const { validateFileContentSignature } = require('../middleware/upload');

/**
 * Helper to safely extract text from PDF, DOCX, or text file buffer
 * Handles file signature validation, scanned PDF detection, and malformed document handling
 * @param {object} file - Multer file object
 * @returns {Promise<{ rawText: string, ext: string }>}
 */
const processFileToText = async (file) => {
  const { originalname, buffer } = file;
  const ext = path.extname(originalname).toLowerCase();

  // 1. Validate binary magic bytes signature
  const signatureCheck = validateFileContentSignature(file);
  if (!signatureCheck.valid) {
    const error = new Error(signatureCheck.error);
    error.statusCode = 400;
    error.isValidation = true;
    throw error;
  }

  let rawText = '';

  // 2. Extract raw text with dedicated format engines
  if (ext === '.pdf') {
    rawText = await extractTextFromPDF(buffer);
  } else if (ext === '.docx' || ext === '.doc') {
    rawText = await extractTextFromDOCX(buffer);
  } else if (ext === '.txt') {
    rawText = buffer.toString('utf-8').trim();
  } else {
    const error = new Error('Unsupported format. Only PDF and DOCX files are allowed.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Verify minimum text content
  if (!rawText || rawText.trim().length < 20) {
    const error = new Error('Insufficient text content extracted from document. Please ensure the resume is not empty or scanned.');
    error.statusCode = 400;
    throw error;
  }

  return { rawText, ext };
};

/**
 * Handle resume upload (PDF / DOCX), extract text, parse with AI / fallback, rotate theme, save portfolio
 * POST /api/resume/upload
 */
const uploadAndParseResume = async (req, res, next) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    const { originalname, size } = req.file;

    // Secure diagnostic logging (zero PII)
    console.log(`[Resume Upload] Processing file: ${path.basename(originalname)} (${size} bytes)`);

    // 1. Extract text with security and format checks
    let rawText = '';
    try {
      const extracted = await processFileToText(req.file);
      rawText = extracted.rawText;
    } catch (extractErr) {
      if (extractErr.isScanned) {
        return res.status(400).json({
          success: false,
          isScanned: true,
          pageCount: extractErr.pageCount,
          message: extractErr.message,
        });
      }
      return res.status(extractErr.statusCode || 400).json({
        success: false,
        isMalformed: true,
        message: extractErr.message,
      });
    }

    // 2. Extract structured data with Gemini AI or Deterministic Fallback (Zod-validated)
    const extractionResult = await extractResumeData(rawText);
    const parsedData = extractionResult.data;

    // 3. Automatic Theme Rotation for consecutive uploads
    const user = await User.findById(req.user._id);
    let nextTheme = 'minimal-pro';
    if (user) {
      const lastIndex = THEME_LIST.indexOf(user.lastThemeUsed || 'minimal-pro');
      const nextIndex = (lastIndex + 1) % THEME_LIST.length;
      nextTheme = THEME_LIST[nextIndex];
    }

    // 4. Generate Unique Slug
    const baseSlugName = parsedData.personalInfo?.fullName || user.name || 'portfolio';
    const slug = await generateUniqueSlug(baseSlugName);

    // 5. Create Portfolio Record in MongoDB
    const portfolio = await Portfolio.create({
      user: req.user._id,
      title: parsedData.title || `${parsedData.personalInfo?.fullName || user.name}'s Portfolio`,
      slug,
      theme: nextTheme,
      isPublished: true,
      extractionSource: extractionResult.source,
      originalFileName: originalname,
      personalInfo: parsedData.personalInfo,
      summary: parsedData.summary,
      experience: parsedData.experience,
      education: parsedData.education,
      skills: parsedData.skills,
      softSkills: parsedData.softSkills || [],
      projects: parsedData.projects,
      certifications: parsedData.certifications,
      achievements: parsedData.achievements || [],
      customSections: parsedData.customSections || [],
    });

    // 6. Update user's lastThemeUsed and portfolioCount
    if (user) {
      user.lastThemeUsed = nextTheme;
      user.portfolioCount = (user.portfolioCount || 0) + 1;
      await user.save();
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Resume Upload] Success in ${elapsed}ms: source=${extractionResult.source}, theme=${nextTheme}, slug=${slug}`);

    res.status(201).json({
      success: true,
      message: 'Resume parsed and portfolio generated successfully!',
      source: extractionResult.source,
      sourceMessage: extractionResult.message,
      portfolio,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Parse raw resume text without saving immediately (for previewing extraction)
 * POST /api/resume/preview-extract
 */
const previewResumeExtract = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    const { originalname } = req.file;

    let rawText = '';
    try {
      const extracted = await processFileToText(req.file);
      rawText = extracted.rawText;
    } catch (extractErr) {
      if (extractErr.isScanned) {
        return res.status(400).json({
          success: false,
          isScanned: true,
          pageCount: extractErr.pageCount,
          message: extractErr.message,
        });
      }
      return res.status(extractErr.statusCode || 400).json({
        success: false,
        isMalformed: true,
        message: extractErr.message,
      });
    }

    const extractionResult = await extractResumeData(rawText);

    res.json({
      success: true,
      fileName: originalname,
      rawTextLength: rawText.length,
      source: extractionResult.source,
      sourceMessage: extractionResult.message,
      data: extractionResult.data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadAndParseResume,
  previewResumeExtract,
};
