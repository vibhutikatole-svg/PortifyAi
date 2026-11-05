const express = require('express');
const router = express.Router();
const {
  getAIStatus,
  handleEnhanceSummary,
  handleEnhanceHighlights,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/status', getAIStatus);

// AI enhancement actions require auth
router.use(protect);
router.post('/enhance-summary', handleEnhanceSummary);
router.post('/enhance-highlights', handleEnhanceHighlights);

module.exports = router;

