const BaseService = require('../utils/BaseService');
const db = require('../config/database');
const categorySchema = require('../schemas/category.schema');

class CategoryService extends BaseService {
  constructor() {
    super('categories');
  }

  /**
   * Get schema for import/export
   */
  getSchema() {
    return categorySchema;
  }

  // Chỉ cần validate delete
  async validateDelete(id) {
    // Check nếu category đang được dùng
    const restaurants = db.findMany('restaurants', { categoryId: parseInt(id) });
    const products = db.findMany('products', { categoryId: parseInt(id) });

    if (restaurants.length > 0 || products.length > 0) {
      return {
        success: false,
        message: 'Cannot delete category that is in use',
        statusCode: 400,
        details: {
          restaurants: restaurants.length,
          products: products.length
        }
      };
    }

    return { success: true };
  }
}

module.exports = new CategoryService();
