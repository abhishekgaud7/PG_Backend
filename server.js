const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'StayEasy API is running with Supabase',
        version: '2.0.0',
        database: 'Supabase PostgreSQL',
    });
});

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

// Only listen if not in a serverless environment (e.g. Vercel) or if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log('Database: Supabase PostgreSQL');
    });
}

module.exports = app;
