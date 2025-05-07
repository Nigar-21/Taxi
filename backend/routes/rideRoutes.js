const express = require('express');
const router = express.Router();
const { createRide, getAllRides } = require('../controllers/rideController');

// Ride yaratmaq
router.post('/create', createRide);

// Bütün ride-ları əldə etmək
router.get('/', getAllRides);

module.exports = router;
