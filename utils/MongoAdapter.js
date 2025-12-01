const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class MongoAdapter {
  constructor() {
    this.models = {};
    this.initConnection();

    // --- SỬA LỖI TẠI ĐÂY ---
    this.relations = {
      restaurants: {
        products: { ref: 'products', localField: '_id', foreignField: 'restaurantId' },
        reviews: { ref: 'reviews', localField: '_id', foreignField: 'restaurantId' }
      },
      users: {
        orders: { ref: 'orders', localField: '_id', foreignField: 'userId' }
      },
      orders: {
        // ❌ Đã xóa dòng: items: { ... } gây lỗi xung đột
        // Lý do: 'items' đã là một trường dữ liệu thật trong Order Schema
      },
      products: {
        restaurant: { ref: 'restaurants', localField: 'restaurantId', foreignField: '_id', justOne: true }
      }
    };

    this.loadSchemasAsModels();
  }

  async initConnection() {
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('🔌 MongoDB Adapter Connected');
      } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
      }
    }
  }

  loadSchemasAsModels() {
    const schemasDir = path.join(__dirname, '../schemas');
    const files = fs.readdirSync(schemasDir);

    files.forEach(file => {
      if (file === 'index.js') return;
      const entityName = file.replace('.schema.js', 's');
      const schemaDef = require(path.join(schemasDir, file));

      const mongooseFields = {};
      for (const [key, val] of Object.entries(schemaDef)) {
        if (key === 'custom') continue;

        let type = String;
        if (val.type === 'number') type = Number;
        if (val.type === 'boolean') type = Boolean;
        if (val.type === 'date') type = Date;
        if (val.type === 'array') type = Array; // Thêm hỗ trợ Array

        if (val.foreignKey) {
          type = Number;
        }

        mongooseFields[key] = {
          type: type,
          required: val.required || false,
          default: val.default
        };
      }

      // Giữ ID là Number để tương thích với Frontend hiện tại
      mongooseFields._id = { type: Number };

      if (!mongoose.models[entityName]) {
        const schema = new mongoose.Schema(mongooseFields, {
          timestamps: true,
          toJSON: { virtuals: true },
          toObject: { virtuals: true }
        });

        // Map id -> _id để frontend không bị lỗi
        schema.virtual('id').get(function () { return this._id; });

        // Setup Virtuals cho populate
        const rels = this.relations[entityName];
        if (rels) {
          for (const [field, config] of Object.entries(rels)) {
            // Kiểm tra xem field có bị trùng với schema thật không trước khi add virtual
            if (!mongooseFields[field]) {
              schema.virtual(field, {
                ref: config.ref,
                localField: config.localField,
                foreignField: config.foreignField,
                justOne: config.justOne || false
              });
            }
          }
        }

        this.models[entityName] = mongoose.model(entityName, schema);
      } else {
        this.models[entityName] = mongoose.models[entityName];
      }
    });
  }

  getModel(collection) {
    return this.models[collection];
  }

  // --- Các hàm Adapter ---

  async findAllAdvanced(collection, options = {}) {
    const Model = this.getModel(collection);
    const query = {};

    if (options.filter) {
      for (const [key, val] of Object.entries(options.filter)) {
        if (key === 'q') {
          query['$or'] = [
            { name: { $regex: val, $options: 'i' } },
            { description: { $regex: val, $options: 'i' } }
          ];
        } else if (key.endsWith('_gte')) query[key.replace('_gte', '')] = { $gte: val };
        else if (key.endsWith('_lte')) query[key.replace('_lte', '')] = { $lte: val };
        else if (key.endsWith('_like')) query[key.replace('_like', '')] = { $regex: val, $options: 'i' };
        else if (key.endsWith('_in')) query[key.replace('_in', '')] = { $in: val.split(',') };
        else query[key] = val;
      }
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    let queryBuilder = Model.find(query);

    if (options.sort) {
      const sortObj = {};
      sortObj[options.sort] = options.order === 'desc' ? -1 : 1;
      queryBuilder = queryBuilder.sort(sortObj);
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    // Populate relations
    if (options.embed) {
      options.embed.split(',').forEach(field => {
        // Chỉ populate nếu field đó là virtual hoặc ref
        try { queryBuilder.populate(field); } catch (e) { }
      });
    }
    if (options.expand) {
      options.expand.split(',').forEach(field => {
        try { queryBuilder.populate(field); } catch (e) { }
      });
    }

    const data = await queryBuilder.skip(skip).limit(limit).lean();
    const total = await Model.countDocuments(query);

    return {
      success: true,
      data: data,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(collection, id) {
    const Model = this.getModel(collection);
    try {
      const item = await Model.findById(id).lean();
      return item ? { success: true, data: item } : { success: false };
    } catch (e) { return { success: false }; }
  }

  async findOne(collection, query) {
    const Model = this.getModel(collection);
    return await Model.findOne(query).lean();
  }

  async findMany(collection, query) {
    const Model = this.getModel(collection);
    return await Model.find(query).lean();
  }

  async create(collection, data) {
    // Tự sinh ID số ngẫu nhiên nếu chưa có (để giống JSON server)
    if (!data._id) data._id = Math.floor(Math.random() * 1000000000);
    const Model = this.getModel(collection);
    return await Model.create(data);
  }

  async update(collection, id, data) {
    const Model = this.getModel(collection);
    return await Model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(collection, id) {
    const Model = this.getModel(collection);
    return await Model.findByIdAndDelete(id);
  }

  async applyRelations(items, collection, options) {
    if (!items || items.length === 0) return items;
    const Model = this.getModel(collection);
    let populatedItems = [...items];

    if (options.embed) {
      const fields = options.embed.split(',');
      for (const field of fields) {
        // Bỏ qua nếu field không phải virtual (như items trong order)
        if (collection === 'orders' && field === 'items') continue;
        try {
          populatedItems = await Model.populate(populatedItems, { path: field });
        } catch (e) { console.log('Populate error ignored:', e.message); }
      }
    }
    return populatedItems;
  }
}

module.exports = new MongoAdapter();