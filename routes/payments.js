const express = require('express');
const { mockPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/mock-success', protect, mockPayment);

module.exports = router;
