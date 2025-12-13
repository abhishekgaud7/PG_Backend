const express = require('express');
const authController = require('../controllers/authController');
const otpController = require('../controllers/otpController');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Authentication routes
router.post('/register', rateLimiter.registerLimiter, authController.register);
router.post('/login', rateLimiter.loginLimiter, authController.login);

// OTP routes
router.post('/send-otp', rateLimiter.otpLimiter, otpController.requestOTP);
router.post('/verify-otp', rateLimiter.loginLimiter, otpController.loginWithOTP);

module.exports = router;
