module.exports = {
  name: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 50,
    description: 'Category name'
  },
  icon: {
    type: 'string',
    required: false,
    default: '📦',
    description: 'Category emoji icon'
  },
  image: {
    type: 'string',
    required: false,
    default: '',
    description: 'Category image URL'
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Category description'
  }
};