const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAll);
router.get('/stats/summary', protect, authorize('admin'), userController.getUserStats);
router.patch('/:id/status', protect, authorize('admin'), userController.toggleUserStatus);
router.delete('/:id/permanent', protect, authorize('admin'), userController.permanentDeleteUser);

// User routes
router.get('/:id', protect, userController.getById);
router.get('/:id/activity', protect, userController.getUserActivity);
router.put('/profile', protect, userController.updateProfile);
router.put('/:id', protect, authorize('admin'), userController.update);
router.delete('/:id', protect, authorize('admin'), userController.delete)

module.exports = router