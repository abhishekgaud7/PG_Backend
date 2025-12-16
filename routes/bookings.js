const express = require('express');
const {
    createBooking,
    getUserBookings,
    getPropertyBookings,
    updateBookingStatus,
    getOwnerBookings,
    deleteBooking,
    restoreBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.delete('/:id', protect, deleteBooking); // User can cancel own booking (soft delete)

// Owner routes
router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.get('/property/:propertyId', protect, authorize('owner'), getPropertyBookings);
router.patch('/:id', protect, authorize('owner'), updateBookingStatus); // Changed from PUT to PATCH
router.patch('/:id/restore', protect, authorize('owner'), restoreBooking); // Restore cancelled booking

module.exports = router;
