const { Portfolio } = require('../models/Portfolio');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generatePortfolioZip } = require('../services/zipService');
const { generateQRDataUrl } = require('../services/qrService');
const { generateUniqueSlug } = require('../utils/slugify');
const { generatePortfolioContent, generateContentDiff } = require('../services/portfolioGenerationService');
const config = require('../config/env');

/**
 * Get all portfolios for the logged-in user (History)
 * GET /api/portfolios
 */
const getPortfolios = async (req, res, next) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title slug theme isPublished extractionSource analytics createdAt updatedAt personalInfo.fullName personalInfo.headline');

    res.json({
      success: true,
      count: portfolios.length,
      portfolios,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single portfolio by ID (Owner only)
 * GET /api/portfolios/:id
 */
const getPortfolioById = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or you are not authorized to view it.',
      });
    }

    res.json({
      success: true,
      portfolio,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update portfolio (Owner only)
 * PUT /api/portfolios/:id
 */
const updatePortfolio = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or you do not have permission to edit it.',
      });
    }

    const updates = req.body;

    // If slug is being updated, verify uniqueness
    if (updates.slug && updates.slug !== portfolio.slug) {
      updates.slug = await generateUniqueSlug(updates.slug, portfolio._id);
    }

    // Apply allowed updates
    const allowedFields = [
      'title',
      'slug',
      'theme',
      'isPublished',
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'softSkills',
      'projects',
      'certifications',
      'achievements',
      'customSections',
      'themeSettings',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        portfolio[field] = updates[field];
      }
    });

    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio updated successfully.',
      portfolio,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete portfolio (Owner only)
 * DELETE /api/portfolios/:id
 */
const deletePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or already deleted.',
      });
    }

    // Decrement user's count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { portfolioCount: -1 },
    });

    res.json({
      success: true,
      message: 'Portfolio deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public access to portfolio by unique slug
 * GET /api/portfolios/public/:slug
 */
const getPublicPortfolio = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Optional authentication check: allow owner to preview unpublished drafts
    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const ownerMatch = await Portfolio.findOne({
          slug: slug.toLowerCase(),
          user: decoded.id,
        }).select('_id');
        if (ownerMatch) {
          isOwner = true;
        }
      } catch {
        // Token invalid, ignore and treat as public guest
      }
    }

    // Guests can ONLY view published portfolios; Owners can also preview unpublished drafts
    const query = { slug: slug.toLowerCase() };
    if (!isOwner) {
      query.isPublished = true;
    }

    const portfolio = await Portfolio.findOne(query).populate('user', 'name');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or it is currently private.',
      });
    }

    // Increment view count asynchronously ONLY for public visitor visits on published pages
    if (portfolio.isPublished && !isOwner) {
      Portfolio.findByIdAndUpdate(portfolio._id, {
        $inc: { 'analytics.views': 1 },
        $set: { 'analytics.lastViewedAt': new Date() },
      }).exec();
    }

    res.json({
      success: true,
      portfolio,
      isOwnerPreview: isOwner && !portfolio.isPublished,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Public download of standalone portfolio as ZIP (for published portfolios)
 * GET /api/portfolios/public/:slug/zip
 */
const downloadPublicPortfolioZip = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const portfolio = await Portfolio.findOne({
      slug: slug.toLowerCase(),
      isPublished: true,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or currently private.',
      });
    }

    const publicUrl = `${config.clientUrl}/p/${portfolio.slug}`;
    const zipBuffer = await generatePortfolioZip(portfolio.toObject(), publicUrl);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="portify-${portfolio.slug}.zip"`,
      'Content-Length': zipBuffer.length,
    });

    res.send(zipBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * Download complete standalone portfolio as ZIP
 * GET /api/portfolios/:id/zip
 */
const downloadPortfolioZip = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or unauthorized.',
      });
    }

    const publicUrl = `${config.clientUrl}/p/${portfolio.slug}`;
    const zipBuffer = await generatePortfolioZip(portfolio.toObject(), publicUrl);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="portify-${portfolio.slug}.zip"`,
      'Content-Length': zipBuffer.length,
    });

    res.send(zipBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * Get QR code data for a portfolio
 * GET /api/portfolios/:id/qr
 */
const getPortfolioQR = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found.',
      });
    }

    const publicUrl = `${config.clientUrl}/p/${portfolio.slug}`;
    const qrDataUrl = await generateQRDataUrl(publicUrl);

    res.json({
      success: true,
      publicUrl,
      qrDataUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate full enhanced portfolio with AI / grounded engine
 * POST /api/portfolios/:id/generate
 */
const generatePortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or you are not authorized.',
      });
    }

    // Allow passing current unsaved client draft data so manual edits in progress are respected
    const sourceData = req.body.reviewedData
      ? { ...portfolio.toObject(), ...req.body.reviewedData }
      : portfolio.toObject();

    const options = {
      sectionsToEnhance: req.body.sectionsToEnhance || ['all'],
    };

    const result = await generatePortfolioContent(sourceData, options);
    const diff = generateContentDiff(sourceData, result.data);

    if (req.body.applyImmediately) {
      // Apply to portfolio in MongoDB
      const updated = await Portfolio.findByIdAndUpdate(
        portfolio._id,
        {
          $set: {
            personalInfo: result.data.personalInfo,
            summary: result.data.summary,
            experience: result.data.experience,
            projects: result.data.projects,
            skills: result.data.skills,
            softSkills: result.data.softSkills,
            education: result.data.education,
            certifications: result.data.certifications,
            achievements: result.data.achievements,
          },
        },
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        portfolio: updated,
        diff,
        source: result.source,
        grounded: result.grounded,
        message: result.message,
      });
    }

    res.json({
      success: true,
      enhancedData: result.data,
      diff,
      source: result.source,
      grounded: result.grounded,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Regenerate a specific single section without touching or losing other manual edits
 * POST /api/portfolios/:id/regenerate-section
 */
const regenerateSection = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or you are not authorized.',
      });
    }

    const { section, sectionData } = req.body;
    if (!section) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required for targeted regeneration.',
      });
    }

    const sourceData = portfolio.toObject();
    if (sectionData) {
      if (section === 'headline') {
        sourceData.personalInfo = sourceData.personalInfo || {};
        sourceData.personalInfo.headline = sectionData;
      } else {
        sourceData[section] = sectionData;
      }
    }

    const result = await generatePortfolioContent(sourceData, {
      sectionsToEnhance: [section],
    });

    // Update ONLY the targeted section in MongoDB, keeping all other manual edits completely untouched
    const updateQuery = {};
    if (section === 'headline') {
      updateQuery['personalInfo.headline'] = result.data.personalInfo.headline;
    } else if (section === 'summary') {
      updateQuery.summary = result.data.summary;
    } else if (section === 'experience') {
      updateQuery.experience = result.data.experience;
    } else if (section === 'projects') {
      updateQuery.projects = result.data.projects;
    } else if (section === 'achievements') {
      updateQuery.achievements = result.data.achievements;
    } else if (section === 'skills') {
      updateQuery.skills = result.data.skills;
      updateQuery.softSkills = result.data.softSkills;
    }

    const updated = await Portfolio.findByIdAndUpdate(
      portfolio._id,
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      section,
      enhancedValue: section === 'headline' ? result.data.personalInfo?.headline : result.data[section],
      portfolio: updated,
      source: result.source,
      message: `Section ${section} regenerated and saved successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload and attach a manual profile photo / avatar
 * POST /api/portfolios/:id/avatar
 */
const uploadPortfolioAvatar = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.',
      });
    }

    const { detectImageSignature, sanitizeImageBuffer } = require('../middleware/imageUpload');
    const detectedMime = detectImageSignature(req.file.buffer);

    if (!detectedMime) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image signature. Only valid JPEG, PNG, and WebP files are allowed.',
      });
    }

    // Strip privacy-sensitive EXIF / metadata
    const sanitizedBuffer = sanitizeImageBuffer(req.file.buffer, detectedMime);
    const dataUri = `data:${detectedMime};base64,${sanitizedBuffer.toString('base64')}`;

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { 'personalInfo.avatarUrl': dataUri } },
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or unauthorized.',
      });
    }

    res.json({
      success: true,
      avatarUrl: dataUri,
      message: 'Profile photo uploaded and processed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove profile photo / avatar
 * DELETE /api/portfolios/:id/avatar
 */
const deletePortfolioAvatar = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { 'personalInfo.avatarUrl': '' } },
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or unauthorized.',
      });
    }

    res.json({
      success: true,
      avatarUrl: '',
      message: 'Profile photo removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  getPublicPortfolio,
  downloadPortfolioZip,
  downloadPublicPortfolioZip,
  getPortfolioQR,
  generatePortfolio,
  regenerateSection,
  uploadPortfolioAvatar,
  deletePortfolioAvatar,
};

