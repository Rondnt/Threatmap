const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must not exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Invalid role')
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidator = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must not exceed 100 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator
};
