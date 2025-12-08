const logger = require('../config/logger');
const { errorResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Validation error', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, 'Duplicate entry', HTTP_STATUS.CONFLICT, {
      field: err.errors[0]?.path,
      message: 'Value already exists'
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Invalid reference', HTTP_STATUS.BAD_REQUEST, {
      message: 'Referenced resource does not exist'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // Default server error
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return errorResponse(res, message, statusCode, process.env.NODE_ENV !== 'production' ? {
    stack: err.stack
  } : null);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Async route handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
