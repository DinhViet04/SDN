const express = require('express');
const router = express.Router();
const {
    apiGetAllBookings, createBooking, updateBooking, deleteBooking
} = require('../controllers/bookingController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Set API flag for all routes in this router
router.use((req, res, next) => { req.isApi = true; next(); });

// Authenticated: own bookings for user, all bookings for admin (filtered in controller)
router.get('/', verifyToken, apiGetAllBookings);

// Authenticated users: create, update, delete own booking
router.post('/', verifyToken, createBooking);
router.put('/:id', verifyToken, updateBooking);
router.delete('/:id', verifyToken, deleteBooking);

module.exports = router;
