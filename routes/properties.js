const express = require('express');
const {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    restoreProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected routes (owner only)
router.post('/', protect, authorize('owner'), createProperty);
router.put('/:id', protect, authorize('owner'), updateProperty);
router.delete('/:id', protect, authorize('owner'), deleteProperty); // Soft delete
router.patch('/:id/restore', protect, authorize('owner'), restoreProperty); // Restore

module.exports = router;
