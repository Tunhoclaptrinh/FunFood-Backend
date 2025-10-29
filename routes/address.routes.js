const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

router.get('/', protect, addressController.getAddresses);
router.get('/default', protect, addressController.getDefaultAddress);
router.get('/:id', protect, addressController.getById);
router.post('/', protect, validation.address.create, addressController.create);
router.put('/:id', protect, validation.address.update, addressController.update);
router.patch('/:id/default', protect, addressController.setDefaultAddress);
router.delete('/:id', protect, addressController.delete);
router.delete('/', protect, addressController.clearNonDefault);

module.exports = router;