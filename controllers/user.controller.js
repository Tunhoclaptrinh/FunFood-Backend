const db = require('../config/database');
const { sanitizeUser } = require('../utils/helpers');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = db.findAll('users').map(user => sanitizeUser(user));

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = db.findById('users', req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow users to view their own profile or admin
    if (req.user.id !== user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;

    const updatedUser = db.update('users', req.user.id, {
      name,
      phone,
      address,
      avatar
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = db.delete('users', req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};