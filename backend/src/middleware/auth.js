const { verifyToken } = require('../config/jwt');
const { User } = require('../models');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/responseFormatter');

/**
 * Verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('[Auth Middleware] Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth Middleware] No valid token provided');
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    console.log('[Auth Middleware] Token extracted:', token ? 'EXISTS' : 'NOT FOUND');

    // Verify token
    const decoded = verifyToken(token);

    // Find user
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return unauthorizedResponse(res, 'User not found or inactive');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid or expired token');
  }
};

/**
 * Check if user has required role
 * @param {Array} roles - Required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);

      if (user && user.is_active) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
