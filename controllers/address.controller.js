const { validationResult } = require('express-validator');
const db = require('../config/database');

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = db.findMany('addresses', { userId: req.user.id });

    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

exports.createAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { label, address, recipientName, recipientPhone, latitude, longitude, isDefault } = req.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      const userAddresses = db.findMany('addresses', { userId: req.user.id });
      userAddresses.forEach(addr => {
        if (addr.isDefault) {
          db.update('addresses', addr.id, { isDefault: false });
        }
      });
    }

    const newAddress = db.create('addresses', {
      userId: req.user.id,
      label,
      address,
      recipientName,
      recipientPhone,
      latitude: latitude || null,
      longitude: longitude || null,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: newAddress
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const address = db.findById('addresses', req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Check authorization
    if (address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this address'
      });
    }

    const updated = db.update('addresses', req.params.id, req.body);

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = db.findById('addresses', req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Check authorization
    if (address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this address'
      });
    }

    db.delete('addresses', req.params.id);

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = db.findById('addresses', req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Check authorization
    if (address.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Unset all other defaults
    const userAddresses = db.findMany('addresses', { userId: req.user.id });
    userAddresses.forEach(addr => {
      if (addr.isDefault) {
        db.update('addresses', addr.id, { isDefault: false });
      }
    });

    // Set this as default
    const updated = db.update('addresses', req.params.id, { isDefault: true });

    res.json({
      success: true,
      message: 'Default address updated',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};