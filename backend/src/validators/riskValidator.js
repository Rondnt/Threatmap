const { body } = require('express-validator');

const createRiskValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Risk name is required')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['operational', 'technical', 'compliance', 'financial', 'reputational', 'strategic'])
    .withMessage('Invalid category'),
  body('probability')
    .notEmpty()
    .withMessage('Probability is required')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Probability must be between 0 and 1'),
  body('impact')
    .notEmpty()
    .withMessage('Impact is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Impact must be between 1 and 10')
];

const updateRiskValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('category')
    .optional()
    .isIn(['operational', 'technical', 'compliance', 'financial', 'reputational', 'strategic'])
    .withMessage('Invalid category'),
  body('probability')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Probability must be between 0 and 1'),
  body('impact')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Impact must be between 1 and 10'),
  body('status')
    .optional()
    .isIn(['identified', 'analyzing', 'treating', 'monitoring', 'closed'])
    .withMessage('Invalid status')
];

const calculateRiskValidator = [
  body('probability')
    .notEmpty()
    .withMessage('Probability is required')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Probability must be between 0 and 1'),
  body('impact')
    .notEmpty()
    .withMessage('Impact is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Impact must be between 1 and 10')
];

module.exports = {
  createRiskValidator,
  updateRiskValidator,
  calculateRiskValidator
};
