const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerName: { type: String, required: true, trim: true },
    carNumber: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    // Link booking to the user who created it
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,  // null for legacy bookings created before auth
    },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);