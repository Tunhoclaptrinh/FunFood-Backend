const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateSchema, validateFields } = require('../middleware/validation.middleware');


router.use(protect); // All routes need auth

router.get('/', addressController.getAddresses);
router.get('/default', addressController.getDefaultAddress);
router.get('/:id', addressController.getById);

router.post('/',
  validateSchema('address'),
  addressController.create
);

router.put('/:id',
  validateSchema('address'),
  addressController.update
);

router.patch('/:id/default', addressController.setDefaultAddress);
router.delete('/:id', addressController.delete);
router.delete('/', addressController.clearNonDefault);

module.exports = router;
