const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/imageUpload');

// Public route for viewing live portfolios and downloading standalone ZIPs (accessible without auth)
router.get('/public/:slug', getPublicPortfolio);
router.get('/public/:slug/zip', downloadPublicPortfolioZip);

// Authenticated user portfolio routes
router.use(protect);
router.get('/', getPortfolios);
router.get('/:id', getPortfolioById);
router.put('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);
router.get('/:id/zip', downloadPortfolioZip);
router.get('/:id/qr', getPortfolioQR);
router.post('/:id/generate', generatePortfolio);
router.post('/:id/regenerate-section', regenerateSection);
router.post('/:id/avatar', uploadAvatar, uploadPortfolioAvatar);
router.delete('/:id/avatar', deletePortfolioAvatar);

module.exports = router;

