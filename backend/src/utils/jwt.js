const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with _id and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken,
};
