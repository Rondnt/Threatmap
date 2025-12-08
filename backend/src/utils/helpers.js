const { RISK_LEVELS } = require('./constants');

/**
 * Calculate risk score from probability and impact
 * @param {Number} probability - Probability (0-1)
 * @param {Number} impact - Impact (1-10)
 * @returns {Number} Risk score
 */
const calculateRiskScore = (probability, impact) => {
  if (!probability || !impact) return 0;
  return parseFloat((probability * impact * 10).toFixed(2));
};

/**
 * Determine risk level from risk score
 * @param {Number} riskScore - Risk score
 * @returns {String} Risk level (critical, high, medium, low)
 */
const getRiskLevel = (riskScore) => {
  if (riskScore >= RISK_LEVELS.CRITICAL.min) return RISK_LEVELS.CRITICAL.label;
  if (riskScore >= RISK_LEVELS.HIGH.min) return RISK_LEVELS.HIGH.label;
  if (riskScore >= RISK_LEVELS.MEDIUM.min) return RISK_LEVELS.MEDIUM.label;
  return RISK_LEVELS.LOW.label;
};

/**
 * Generate pagination metadata
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @returns {Object} Pagination metadata
 */
const getPaginationMetadata = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {String} ISO string or null
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Sanitize query parameters
 * @param {Object} query - Query parameters
 * @returns {Object} Sanitized query
 */
const sanitizeQuery = (query) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Generate random UUID (fallback)
 * @returns {String} UUID
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Check if user has permission
 * @param {String} userRole - User role
 * @param {String} requiredRole - Required role
 * @returns {Boolean} Has permission
 */
const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = { admin: 3, analyst: 2, viewer: 1 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Convert severity to numeric value
 * @param {String} severity - Severity level
 * @returns {Number} Numeric value
 */
const severityToNumber = (severity) => {
  const map = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
  return map[severity] || 0;
};

/**
 * Calculate CVSS score category
 * @param {Number} score - CVSS score (0-10)
 * @returns {String} Category
 */
const getCVSSCategory = (score) => {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  return 'low';
};

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  getPaginationMetadata,
  formatDate,
  sanitizeQuery,
  generateUUID,
  hasPermission,
  severityToNumber,
  getCVSSCategory
};
