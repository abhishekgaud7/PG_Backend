const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error(err);

    // PostgreSQL unique constraint violation (duplicate key)
    if (err.code === '23505') {
        const message = 'Email already exists';
        error.message = message;
        error.statusCode = 400;
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        const message = 'Referenced resource not found';
        error.message = message;
        error.statusCode = 404;
    }

    // PostgreSQL check constraint violation
    if (err.code === '23514') {
        const message = 'Invalid data provided';
        error.message = message;
        error.statusCode = 400;
    }

    // PostgreSQL invalid UUID format
    if (err.code === '22P02') {
        const message = 'Invalid ID format';
        error.message = message;
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error.message = message;
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error.message = message;
        error.statusCode = 401;
    }

    // Supabase API errors
    if (err.message && err.message.includes('Invalid API key')) {
        const message = 'Database configuration error';
        error.message = message;
        error.statusCode = 500;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
    });
};

module.exports = errorHandler;
