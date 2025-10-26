const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Hash password
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Remove password from user object
exports.sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Calculate distance between two GPS coordinates
 * Using Haversine formula
 * @returns distance in kilometers
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate delivery fee based on distance
 * @param {number} distance - Distance in km
 * @returns {number} - Delivery fee in VND
 */
exports.calculateDeliveryFee = (distance) => {
  const baseFee = 15000;  // Base fee for <= 2km
  const perKm = 5000;     // Per km for 2-5km
  const extraPerKm = 7000; // Per km for > 5km

  if (distance <= 2) {
    return baseFee;
  } else if (distance <= 5) {
    return baseFee + Math.ceil(distance - 2) * perKm;
  } else {
    return baseFee + 3 * perKm + Math.ceil(distance - 5) * extraPerKm;
  }
};

/**
 * Format distance for display
 */
exports.formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};