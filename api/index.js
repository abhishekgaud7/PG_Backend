const app = require('../server');

// Vercel serverless function handler
module.exports = (req, res) => {
    return app(req, res);
};
