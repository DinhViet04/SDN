const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, updateUserRole } = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  — protected
router.get('/me', verifyToken, getMe);

// Admin: user management
router.get('/users', verifyToken, requireAdmin, getAllUsers);
router.put('/users/:id/role', verifyToken, requireAdmin, updateUserRole);

module.exports = router;
