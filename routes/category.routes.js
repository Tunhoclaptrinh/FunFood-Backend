const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAll);          // From BaseController
router.get('/search', categoryController.search);    // From BaseController
router.get('/:id', categoryController.getById);      // From BaseController
router.post('/',
  protect,
  authorize('admin'),
  validation.category.create,  // Centralized validation
  categoryController.create    // From BaseController
);
router.put('/:id',
  protect,
  authorize('admin'),
  validation.category.update,
  categoryController.update
);
router.delete('/:id',
  protect,
  authorize('admin'),
  categoryController.delete
);

module.exports = router;