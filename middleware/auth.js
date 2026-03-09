const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

/**
 * Verify JWT token from Authorization: Bearer <token> header
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired.' });
        }
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

/**
 * Require admin role (must be used after verifyToken)
 */
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
};

module.exports = { verifyToken, requireAdmin };
