const express = require('express');
const router = express.Router();
const { uploadAndParseResume, previewResumeExtract } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.post('/upload', protect, uploadResume.single('resume'), uploadAndParseResume);
router.post('/preview-extract', protect, uploadResume.single('resume'), previewResumeExtract);

module.exports = router;

