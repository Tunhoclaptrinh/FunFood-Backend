const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, userController.getUser);
router.put('/profile', protect, userController.updateProfile);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router