const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class AddressService extends BaseService {
  constructor() {
    super('addresses');
  }

  async beforeCreate(data) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      const userAddresses = db.findMany('addresses', { userId: data.userId });
      userAddresses.forEach(addr => {
        if (addr.isDefault) {
          db.update('addresses', addr.id, { isDefault: false });
        }
      });
    }

    return {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getAddresses(userId) {
    const addresses = db.findMany('addresses', { userId });

    return {
      success: true,
      data: addresses
    };
  }

  async getDefaultAddress(userId) {
    const defaultAddress = db.findOne('addresses', {
      userId,
      isDefault: true
    });

    if (!defaultAddress) {
      return {
        success: false,
        message: 'No default address found',
        statusCode: 404
      };
    }

    return {
      success: true,
      data: defaultAddress
    };
  }

  async setDefaultAddress(addressId, userId) {
    const address = db.findById('addresses', addressId);

    if (!address) {
      return {
        success: false,
        message: 'Address not found',
        statusCode: 404
      };
    }

    if (address.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    // Unset all other defaults
    const userAddresses = db.findMany('addresses', { userId });
    userAddresses.forEach(addr => {
      if (addr.isDefault) {
        db.update('addresses', addr.id, { isDefault: false });
      }
    });

    // Set this as default
    const updated = db.update('addresses', addressId, {
      isDefault: true,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Default address updated',
      data: updated
    };
  }

  async deleteAddress(addressId, userId) {
    const address = db.findById('addresses', addressId);

    if (!address) {
      return {
        success: false,
        message: 'Address not found',
        statusCode: 404
      };
    }

    if (address.userId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        statusCode: 403
      };
    }

    db.delete('addresses', addressId);

    return {
      success: true,
      message: 'Address deleted successfully'
    };
  }

  async clearNonDefault(userId) {
    const userAddresses = db.findMany('addresses', { userId });
    const nonDefaultAddresses = userAddresses.filter(addr => !addr.isDefault);

    if (nonDefaultAddresses.length === 0) {
      return {
        success: true,
        message: 'No non-default addresses to clear'
      };
    }

    nonDefaultAddresses.forEach(addr => db.delete('addresses', addr.id));

    return {
      success: true,
      message: 'Non-default addresses cleared',
      cleared: nonDefaultAddresses.length
    };
  }
}

module.exports = new AddressService();