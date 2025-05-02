// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isLoggedIn} = require("./middleware");

// Show booking form
router.get('/bookingForm', isLoggedIn, bookingController.showBookingForm);

// Create new booking
router.post('/booking',isLoggedIn, bookingController.createBooking);

module.exports = router;