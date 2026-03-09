const Booking = require('../models/bookingModel');
const Car = require('../models/carModel');


const calcTotal = (start, end, pricePerDay) => {
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return days * pricePerDay;
};


const hasOverlap = async (carNumber, startDate, endDate, excludeId = null) => {
    const query = {
        carNumber,
        startDate: { $lt: new Date(endDate) },
        endDate: { $gt: new Date(startDate) }
    };
    if (excludeId) query._id = { $ne: excludeId };
    const conflict = await Booking.findOne(query);
    return conflict;
};



// GET /bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.render('bookings/index', { title: 'Bookings', bookings });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// GET /bookings/new
const getNewBookingForm = async (req, res) => {
    try {
        const cars = await Car.find();
        res.render('bookings/form', { title: 'New Booking', booking: null, cars, error: null });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// GET /bookings/:id/edit
const getEditBookingForm = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).render('error', { message: 'Booking not found' });
        const cars = await Car.find();
        res.render('bookings/form', { title: 'Edit Booking', booking, cars, error: null });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};


// GET /api/bookings
// Admin: all bookings; User: only own bookings
const apiGetAllBookings = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
        const bookings = await Booking.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /bookings  /api/bookings
const createBooking = async (req, res) => {
    try {
        const { customerName, carNumber, startDate, endDate } = req.body;

        if (new Date(endDate) <= new Date(startDate)) {
            const msg = 'End date must be after start date.';
            if (req.isApi) return res.status(400).json({ error: msg });
            const cars = await Car.find();
            return res.status(400).render('bookings/form', { title: 'New Booking', booking: null, cars, error: msg });
        }

        // Overlap check
        const conflict = await hasOverlap(carNumber, startDate, endDate);
        if (conflict) {
            const msg = `Car ${carNumber} is already booked from ${new Date(conflict.startDate).toDateString()} to ${new Date(conflict.endDate).toDateString()}.`;
            if (req.isApi) return res.status(409).json({ error: msg });
            const cars = await Car.find();
            return res.status(409).render('bookings/form', { title: 'New Booking', booking: null, cars, error: msg });
        }

        // Get car price
        const car = await Car.findOne({ carNumber });
        if (!car) {
            const msg = `Car with number ${carNumber} not found.`;
            if (req.isApi) return res.status(404).json({ error: msg });
            const cars = await Car.find();
            return res.status(404).render('bookings/form', { title: 'New Booking', booking: null, cars, error: msg });
        }

        const totalAmount = calcTotal(startDate, endDate, car.pricePerDay);

        const booking = await Booking.create({
            customerName, carNumber, startDate, endDate, totalAmount,
            userId: req.user?.id || null,
        });

        // Update car status to rented
        await Car.findOneAndUpdate({ carNumber }, { status: 'rented' });

        if (req.isApi) return res.status(201).json(booking);
        res.redirect('/bookings');
    } catch (err) {
        if (req.isApi) return res.status(400).json({ error: err.message });
        const cars = await Car.find();
        res.status(400).render('bookings/form', { title: 'New Booking', booking: null, cars, error: err.message });
    }
};

// PUT /bookings/:id  /api/bookings/:id
const updateBooking = async (req, res) => {
    try {
        const { customerName, carNumber, startDate, endDate } = req.body;
        const { id } = req.params;

        if (new Date(endDate) <= new Date(startDate)) {
            const msg = 'End date must be after start date.';
            if (req.isApi) return res.status(400).json({ error: msg });
            const cars = await Car.find();
            const booking = await Booking.findById(id);
            return res.status(400).render('bookings/form', { title: 'Edit Booking', booking, cars, error: msg });
        }

        // Overlap check excluding itself
        const conflict = await hasOverlap(carNumber, startDate, endDate, id);
        if (conflict) {
            const msg = `Car ${carNumber} is already booked from ${new Date(conflict.startDate).toDateString()} to ${new Date(conflict.endDate).toDateString()}.`;
            if (req.isApi) return res.status(409).json({ error: msg });
            const cars = await Car.find();
            const booking = await Booking.findById(id);
            return res.status(409).render('bookings/form', { title: 'Edit Booking', booking, cars, error: msg });
        }

        // Get car price
        const car = await Car.findOne({ carNumber });
        if (!car) {
            const msg = `Car with number ${carNumber} not found.`;
            if (req.isApi) return res.status(404).json({ error: msg });
        }

        const totalAmount = calcTotal(startDate, endDate, car.pricePerDay);

        const booking = await Booking.findByIdAndUpdate(
            id,
            { customerName, carNumber, startDate, endDate, totalAmount },
            { new: true, runValidators: true }
        );

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (req.isApi) return res.json(booking);
        res.redirect('/bookings');
    } catch (err) {
        if (req.isApi) return res.status(400).json({ error: err.message });
        res.status(400).render('error', { message: err.message });
    }
};

// DELETE /bookings/:id  /api/bookings/:id
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Free up car status back to available
        await Car.findOneAndUpdate({ carNumber: booking.carNumber }, { status: 'available' });

        if (req.isApi) return res.json({ message: 'Booking deleted successfully' });
        res.redirect('/bookings');
    } catch (err) {
        if (req.isApi) return res.status(500).json({ error: err.message });
        res.status(500).render('error', { message: err.message });
    }
};

module.exports = {
    getAllBookings, getNewBookingForm, getEditBookingForm,
    apiGetAllBookings, createBooking, updateBooking, deleteBooking
};
