const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    carNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance'],
        default: 'available'
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    features: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);