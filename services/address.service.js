const BaseService = require('../utils/BaseService');
const db = require('../config/database');

class AddressService extends BaseService {
  constructor() {
    super('addresses');
  }

  async beforeCreate(data) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
      const userAddresses = await db.findMany('addresses', { userId: data.userId });

      // Update all existing defaults to false
      await Promise.all(
        userAddresses
          .filter(addr => addr.isDefault)
          .map(addr => db.update('addresses', addr.id, { isDefault: false }))
      );
    }

    return {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getAddresses(userId) {
    const addresses = await db.findMany('addresses', { userId });

    return {
      success: true,
      data: addresses
    };
  }

  async getDefaultAddress(userId) {
    const defaultAddress = await db.findOne('addresses', {
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
    const address = await db.findById('addresses', addressId);

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
    const userAddresses = await db.findMany('addresses', { userId });
    await Promise.all(
      userAddresses
        .filter(addr => addr.isDefault)
        .map(addr => db.update('addresses', addr.id, { isDefault: false }))
    );

    // Set this as default
    const updated = await db.update('addresses', addressId, {
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
    const address = await db.findById('addresses', addressId);

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

    await db.delete('addresses', addressId);

    return {
      success: true,
      message: 'Address deleted successfully'
    };
  }

  async clearNonDefault(userId) {
    const userAddresses = await db.findMany('addresses', { userId });
    const nonDefaultAddresses = userAddresses.filter(addr => !addr.isDefault);

    if (nonDefaultAddresses.length === 0) {
      return {
        success: true,
        message: 'No non-default addresses to clear'
      };
    }

    await Promise.all(
      nonDefaultAddresses.map(addr => db.delete('addresses', addr.id))
    );

    return {
      success: true,
      message: 'Non-default addresses cleared',
      cleared: nonDefaultAddresses.length
    };
  }
}

module.exports = new AddressService();