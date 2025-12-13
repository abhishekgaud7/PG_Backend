const supabase = require('../config/supabase');
const { sendOTP, verifyOTP } = require('../services/smsService');
const { validatePhone } = require('../utils/validators');
const jwt = require('jsonwebtoken');

// @desc    Request OTP for login
// @route   POST /api/auth/send-otp
// @access  Public
exports.requestOTP = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Validate phone format
        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.error
            });
        }

        const formattedPhone = phoneValidation.formatted;

        // Check if user exists with this phone
        const { data: user } = await supabase
            .from('users')
            .select('id, phone, phone_verified')
            .eq('phone', formattedPhone)
            .single();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number'
            });
        }

        // Send OTP
        const result = await sendOTP(formattedPhone);

        // In development, include OTP in response for testing
        const response = {
            success: true,
            message: 'OTP sent successfully',
            expiresAt: result.expiresAt
        };

        // Add OTP code in development mode only
        if (result.code) {
            response.code = result.code;
            response.devMessage = '⚠️ OTP shown for development only';
        }

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
exports.loginWithOTP = async (req, res, next) => {
    try {
        const { phone, code } = req.body;

        if (!phone || !code) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP code are required'
            });
        }

        // Validate phone
        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: phoneValidation.error
            });
        }

        const formattedPhone = phoneValidation.formatted;

        // Verify OTP
        const otpResult = await verifyOTP(formattedPhone, code);

        if (!otpResult.isValid) {
            return res.status(400).json({
                success: false,
                message: otpResult.error || 'Invalid OTP'
            });
        }

        // Get user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('phone', formattedPhone)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mark phone as verified
        await supabase
            .from('users')
            .update({
                phone_verified: true,
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq('id', user.id);

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};


