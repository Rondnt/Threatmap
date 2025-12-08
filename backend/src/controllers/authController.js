const { User } = require('../models');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/constants');
const logger = require('../config/logger');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return errorResponse(
        res,
        'User with this email or username already exists',
        HTTP_STATUS.CONFLICT
      );
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      full_name,
      role: role || 'analyst'
    });

    // Generate token
    const token = generateToken({ id: user.id, role: user.role });

    logger.info(`New user registered: ${user.username}`);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      },
      'User registered successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        'Account is inactive. Please contact administrator.'
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid email or password'
      );
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ id: user.id, role: user.role });

    logger.info(`User logged in: ${user.username}`);

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        token
      },
      'Login successful',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Profile retrieved successfully',
      { user }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Update fields
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;

    await user.save();

    logger.info(`User profile updated: ${user.username}`);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      'Profile updated successfully',
      { user }
    );
  } catch (error) {
    next(error);
  }
};

// Already exported via exports.functionName above
