const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Get overview stats
router.get('/stats', verifyToken, requireAdmin, adminController.getStats);

module.exports = router;
