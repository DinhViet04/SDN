const Car = require('../models/carModel');



// GET /cars
const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.render('cars/index', { title: 'Cars', cars });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// GET /cars/new
const getNewCarForm = (req, res) => {
    res.render('cars/form', { title: 'Add New Car', car: null });
};

// GET /cars/:id/edit
const getEditCarForm = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).render('error', { message: 'Car not found' });
        res.render('cars/form', { title: 'Edit Car', car });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};



// GET /api/cars
const apiGetAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort({ createdAt: -1 });
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /cars  /api/cars
const createCar = async (req, res) => {
    try {
        const { carNumber, capacity, status, pricePerDay, features } = req.body;

        // Parse features: accept comma-separated string or array
        let featuresArray = [];
        if (Array.isArray(features)) {
            featuresArray = features.filter(Boolean);
        } else if (typeof features === 'string') {
            featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
        }

        const car = await Car.create({
            carNumber,
            capacity: Number(capacity),
            status: status || 'available',
            pricePerDay: Number(pricePerDay),
            features: featuresArray
        });

        if (req.isApi) return res.status(201).json(car);
        res.redirect('/cars');
    } catch (err) {
        if (req.isApi) return res.status(400).json({ error: err.message });
        res.status(400).render('cars/form', { title: 'Add New Car', car: null, error: err.message });
    }
};

// PUT /cars/:id  /api/cars/:id
const updateCar = async (req, res) => {
    try {
        const { carNumber, capacity, status, pricePerDay, features } = req.body;

        let featuresArray = [];
        if (Array.isArray(features)) {
            featuresArray = features.filter(Boolean);
        } else if (typeof features === 'string') {
            featuresArray = features.split(',').map(f => f.trim()).filter(Boolean);
        }

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            { carNumber, capacity: Number(capacity), status, pricePerDay: Number(pricePerDay), features: featuresArray },
            { new: true, runValidators: true }
        );

        if (!car) return res.status(404).json({ error: 'Car not found' });

        if (req.isApi) return res.json(car);
        res.redirect('/cars');
    } catch (err) {
        if (req.isApi) return res.status(400).json({ error: err.message });
        res.status(400).render('error', { message: err.message });
    }
};

// DELETE /cars/:id  /api/cars/:id
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) return res.status(404).json({ error: 'Car not found' });

        if (req.isApi) return res.json({ message: 'Car deleted successfully' });
        res.redirect('/cars');
    } catch (err) {
        if (req.isApi) return res.status(500).json({ error: err.message });
        res.status(500).render('error', { message: err.message });
    }
};

module.exports = { getAllCars, getNewCarForm, getEditCarForm, apiGetAllCars, createCar, updateCar, deleteCar };
