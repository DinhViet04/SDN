const User = require('../models/userModel');
const Car = require('../models/carModel');
const Booking = require('../models/bookingModel');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        
        const totalCars = await Car.countDocuments();
        const availableCars = await Car.countDocuments({ status: 'available' });
        const rentedCars = await Car.countDocuments({ status: 'rented' });
        
        const totalBookings = await Booking.countDocuments();
        
        const revenueAgg = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
        
        res.json({
            users: { total: totalUsers, admins: adminUsers },
            cars: { total: totalCars, available: availableCars, rented: rentedCars },
            bookings: { total: totalBookings, revenue: totalRevenue }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
