const BaseController = require('../utils/BaseController');
const categoryService = require('../services/category.service');

class CategoryController extends BaseController {
  constructor() {
    super(categoryService);
  }
  // Không cần viết gì thêm!
  // Tất cả CRUD đã có sẵn
}

module.exports = new CategoryController();
