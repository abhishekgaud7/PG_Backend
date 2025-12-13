const express = require('express');
const {
    createBooking,
    getUserBookings,
    getPropertyBookings,
    updateBookingStatus,
    getOwnerBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.get('/property/:propertyId', protect, authorize('owner'), getPropertyBookings);
router.put('/:id', protect, authorize('owner'), updateBookingStatus);

module.exports = router;
