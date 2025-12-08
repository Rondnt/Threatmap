const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/responseFormatter');

/**
 * Validate request using express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return validationErrorResponse(res, formattedErrors);
  }

  next();
};

module.exports = { validate };
