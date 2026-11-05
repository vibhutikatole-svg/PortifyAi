const { enhanceSummary, enhanceHighlights, isAIAvailable } = require('../services/aiService');

/**
 * Check AI status
 * GET /api/ai/status
 */
const getAIStatus = async (req, res) => {
  const available = isAIAvailable();
  res.json({
    success: true,
    available,
    model: 'Gemini 1.5 Flash',
    message: available
      ? 'Google Gemini AI engine connected and ready.'
      : 'Gemini API key not configured. Operating in high-accuracy deterministic rule engine mode.',
  });
};

/**
 * Enhance summary with AI
 * POST /api/ai/enhance-summary
 */
const handleEnhanceSummary = async (req, res, next) => {
  try {
    const { summary, experience, skills } = req.body;
    const result = await enhanceSummary(summary, experience, skills);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Enhance experience highlights with AI
 * POST /api/ai/enhance-highlights
 */
const handleEnhanceHighlights = async (req, res, next) => {
  try {
    const { role, company, highlights } = req.body;
    const result = await enhanceHighlights(role, company, highlights);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAIStatus,
  handleEnhanceSummary,
  handleEnhanceHighlights,
};

