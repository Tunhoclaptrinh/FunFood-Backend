const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const addressController = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, addressController.getAddresses);
router.post('/', protect, [
  body('label').notEmpty().withMessage('Label is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('recipientName').notEmpty().withMessage('Recipient name is required'),
  body('recipientPhone').notEmpty().withMessage('Recipient phone is required')
], addressController.createAddress);
router.put('/:id', protect, addressController.updateAddress);
router.delete('/:id', protect, addressController.deleteAddress);
router.patch('/:id/default', protect, addressController.setDefaultAddress);

module.exports = router;