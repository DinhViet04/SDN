const express = require('express');
const router = express.Router();
const {
    getAllCars, getNewCarForm, getEditCarForm,
    apiGetAllCars, createCar, updateCar, deleteCar
} = require('../controllers/carController');

// ── View routes ──
router.get('/', getAllCars);
router.get('/new', getNewCarForm);
router.get('/:id/edit', getEditCarForm);
router.post('/', createCar);
router.put('/:id', updateCar);
router.delete('/:id', deleteCar);

module.exports = router;
