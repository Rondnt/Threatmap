const { body } = require('express-validator');

const createThreatValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Threat name is required')
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('type')
    .notEmpty()
    .withMessage('Threat type is required')
    .isIn(['malware', 'phishing', 'ransomware', 'ddos', 'sql_injection', 'xss', 'mitm', 'insider_threat', 'zero_day', 'brute_force', 'social_engineering', 'other'])
    .withMessage('Invalid threat type'),
  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Invalid severity level'),
  body('probability')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Probability must be between 0 and 1'),
  body('impact')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Impact must be between 1 and 10')
];

const updateThreatValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Name must not exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['malware', 'phishing', 'ransomware', 'ddos', 'sql_injection', 'xss', 'mitm', 'insider_threat', 'zero_day', 'brute_force', 'social_engineering', 'other'])
    .withMessage('Invalid threat type'),
  body('severity')
    .optional()
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Invalid severity level'),
  body('status')
    .optional()
    .isIn(['active', 'mitigated', 'monitoring', 'closed'])
    .withMessage('Invalid status'),
  body('probability')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Probability must be between 0 and 1'),
  body('impact')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Impact must be between 1 and 10')
];

module.exports = {
  createThreatValidator,
  updateThreatValidator
};
