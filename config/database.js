const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../database/db.json');

class Database {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const rawData = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading database:', error);
      return this.getDefaultData();
    }
  }

  saveData() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  getDefaultData() {
    return {
      users: [],
      categories: [],
      restaurants: [],
      products: [],
      orders: [],
      cart: [],
      favorites: [],
      reviews: [],
      promotions: [],
      addresses: []
    };
  }

  // Generic CRUD operations
  findAll(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return this.data[collection]?.find(item => item.id === parseInt(id));
  }

  findOne(collection, query) {
    return this.data[collection]?.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findMany(collection, query) {
    if (!query || Object.keys(query).length === 0) {
      return this.data[collection] || [];
    }
    return this.data[collection]?.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    }) || [];
  }

  create(collection, data) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const id = this.getNextId(collection);
    const newItem = { id, ...data };
    this.data[collection].push(newItem);
    this.saveData();
    return newItem;
  }

  update(collection, id, data) {
    const index = this.data[collection]?.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...data,
      id: parseInt(id)
    };
    this.saveData();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = this.data[collection]?.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.saveData();
    return true;
  }

  getNextId(collection) {
    const items = this.data[collection] || [];
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }
}

module.exports = new Database();
