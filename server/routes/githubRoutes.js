const express = require('express');
const router = express.Router();
const { getRepoStats } = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

// Route is protected so only logged-in users can pull GitHub stats.
// This prevents public API abuse.
router.route('/stats/:owner/:repo').get(protect, getRepoStats);

module.exports = router;
