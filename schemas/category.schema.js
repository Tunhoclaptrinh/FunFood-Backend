/**
 * Category Schema for Import/Export
 */

module.exports = {
  name: {
    type: 'string',
    required: true,
    unique: true,
    minLength: 2,
    maxLength: 50
  },
  icon: {
    type: 'string',
    required: false,
    default: '📦'
  },
  image: {
    type: 'string',
    required: false,
    default: ''
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 500
  }
};