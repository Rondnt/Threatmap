const { HTTP_STATUS } = require('./constants');

/**
 * Success response formatter
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(response);
};

/**
 * Error response formatter
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {*} errors - Error details
 */
const errorResponse = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    errors
  };

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res,
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  );
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(
    res,
    `${resource} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(
    res,
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message
 */
const forbiddenResponse = (res, message = 'Forbidden access') => {
  return errorResponse(
    res,
    message,
    HTTP_STATUS.FORBIDDEN
  );
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
