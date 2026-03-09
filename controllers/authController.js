const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: sign token
const signToken = (user) =>
    jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Only allow 'user' role by default (admin must be set manually or via specific flow)
        const newUser = await User.create({
            username,
            email,
            password,
            role: 'user', // Mặc định là user, admin chỉ được tạo qua DB
        });

        const token = signToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        // Handle duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(409).json({ error: `${field} already exists` });
        }
        res.status(400).json({ error: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Select password explicitly (it's hidden by default)
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = signToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/me  (requires verifyToken)
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/auth/users  (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/auth/users/:id/role  (admin only)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role must be "user" or "admin"' });
        }

        // Prevent admin from demoting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ message: `Role updated to ${role}`, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, getMe, getAllUsers, updateUserRole };
