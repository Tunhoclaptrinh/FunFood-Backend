const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');



// Register - validate tất cả schema fields
router.post('/register',
  validateSchema('user'),
  authController.register
);

// Login - custom validate email + password
router.post('/login',
  validateFields('user', ['email', 'password']),
  authController.login
);

// Get me
router.get('/me', protect, authController.getMe);

// Logout
router.post('/logout', protect, authController.logout);

// Change password - custom validate
router.put('/change-password',
  protect,
  // validateFields('user', ['password']),
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
      .custom((value) => {
        if (!/[A-Z]/.test(value) && !/[0-9]/.test(value)) {
          throw new Error('Password must contain uppercase or number');
        }
        return true;
      })
  ],
  authController.changePassword
);

module.exports = router;