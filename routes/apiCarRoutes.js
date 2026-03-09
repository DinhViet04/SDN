const express = require('express');
const router = express.Router();
const {
    apiGetAllCars, createCar, updateCar, deleteCar
} = require('../controllers/carController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Set API flag for all routes in this router
router.use((req, res, next) => { req.isApi = true; next(); });

// Public: anyone can view cars
router.get('/', apiGetAllCars);

// Protected: admin only
router.post('/', verifyToken, requireAdmin, createCar);
router.put('/:id', verifyToken, requireAdmin, updateCar);
router.delete('/:id', verifyToken, requireAdmin, deleteCar);

module.exports = router;
