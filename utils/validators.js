// Validation utility functions

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: getPasswordStrength(password)
    };
};

/**
 * Calculate password strength (0-4)
 */
const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return Math.min(strength, 4); // 0=very weak, 4=very strong
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        error: emailRegex.test(email) ? null : 'Invalid email format'
    };
};

/**
 * Validate phone number (Indian format)
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX
 */
const validatePhone = (phone) => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Check if it matches Indian phone pattern
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(cleaned)) {
        return {
            isValid: false,
            error: 'Invalid phone number. Must be a valid Indian mobile number',
            formatted: null
        };
    }

    // Format to +91XXXXXXXXXX
    const digits = cleaned.replace(/^(\+91|91)/, '');
    const formatted = `+91${digits}`;

    return {
        isValid: true,
        error: null,
        formatted
    };
};

/**
 * Validate name
 */
const validateName = (name) => {
    if (!name || name.trim().length < 2) {
        return {
            isValid: false,
            error: 'Name must be at least 2 characters long'
        };
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return {
            isValid: false,
            error: 'Name can only contain letters and spaces'
        };
    }

    return { isValid: true, error: null };
};

module.exports = {
    validatePassword,
    validateEmail,
    validatePhone,
    validateName,
    getPasswordStrength
};
