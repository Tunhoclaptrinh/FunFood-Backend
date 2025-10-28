const categoryController = require('../controllers/category.controller');
const validation = require('../middleware/validation.middleware');

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