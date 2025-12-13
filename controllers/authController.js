const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { validatePassword, validateEmail, validatePhone, validateName } = require('../utils/validators');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Validate name
        const nameValidation = validateName(name);
        if (!nameValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: nameValidation.error
            });
        }

        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
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

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user with formatted phone
        const { data: user, error } = await supabase
            .from('users')
            .insert([
                {
                    name: name.trim(),
                    email: email.toLowerCase().trim(),
                    phone: phoneValidation.formatted,
                    password_hash: passwordHash,
                    role: role || 'user',
                },
            ])
            .select('id, name, email, phone, role')
            .single();

        if (error) {
            throw error;
        }

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: emailValidation.error
            });
        }

        // Check for user (include lockout fields)
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked. Try again in ${remainingTime} minutes.`,
                locked_until: user.locked_until
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            // Increment failed login attempts
            const failedAttempts = (user.failed_login_attempts || 0) + 1;
            const lockDuration = failedAttempts >= 5 ? 15 * 60 * 1000 : null; // 15 minutes

            await supabase
                .from('users')
                .update({
                    failed_login_attempts: failedAttempts,
                    locked_until: lockDuration ? new Date(Date.now() + lockDuration).toISOString() : null
                })
                .eq('id', user.id);

            if (failedAttempts >= 5) {
                return res.status(403).json({
                    success: false,
                    message: 'Too many failed login attempts. Account locked for 15 minutes.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                attemptsRemaining: 5 - failedAttempts
            });
        }

        // Reset failed attempts on successful login
        await supabase
            .from('users')
            .update({
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq('id', user.id);

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};
