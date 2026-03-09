const express = require('express');
const router = express.Router();
const {
    getAllBookings, getNewBookingForm, getEditBookingForm,
    apiGetAllBookings, createBooking, updateBooking, deleteBooking
} = require('../controllers/bookingController');

// ── View routes ──
router.get('/', getAllBookings);
router.get('/new', getNewBookingForm);
router.get('/:id/edit', getEditBookingForm);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
