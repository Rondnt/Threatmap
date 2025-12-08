const { calculateRiskScore, getRiskLevel } = require('../utils/helpers');
const { RISK_CALCULATION } = require('../utils/constants');

/**
 * Calculate risk score and level
 * @param {Number} probability - Probability (0-1)
 * @param {Number} impact - Impact (1-10)
 * @returns {Object} Risk calculation result
 */
const calculateRisk = (probability, impact) => {
  // Validate inputs
  if (
    probability < RISK_CALCULATION.MIN_PROBABILITY ||
    probability > RISK_CALCULATION.MAX_PROBABILITY ||
    impact < RISK_CALCULATION.MIN_IMPACT ||
    impact > RISK_CALCULATION.MAX_IMPACT
  ) {
    throw new Error('Invalid probability or impact values');
  }

  const riskScore = calculateRiskScore(probability, impact);
  const riskLevel = getRiskLevel(riskScore);

  return {
    probability,
    impact,
    riskScore,
    riskLevel,
    description: getRiskDescription(riskLevel, riskScore)
  };
};

/**
 * Get risk description based on level
 * @param {String} level - Risk level
 * @param {Number} score - Risk score
 * @returns {String} Description
 */
const getRiskDescription = (level, score) => {
  const descriptions = {
    critical: `Critical risk (${score}/10) - Immediate action required`,
    high: `High risk (${score}/10) - Priority attention needed`,
    medium: `Medium risk (${score}/10) - Should be addressed`,
    low: `Low risk (${score}/10) - Monitor and review`
  };

  return descriptions[level] || 'Unknown risk level';
};

/**
 * Calculate residual risk after mitigation
 * @param {Number} originalProbability
 * @param {Number} originalImpact
 * @param {Number} reductionFactor - Factor by which risk is reduced (0-1)
 * @returns {Object} Residual risk calculation
 */
const calculateResidualRisk = (originalProbability, originalImpact, reductionFactor = 0.5) => {
  const residualProbability = parseFloat((originalProbability * (1 - reductionFactor)).toFixed(2));
  const residualImpact = Math.max(1, Math.round(originalImpact * (1 - reductionFactor * 0.5)));

  const residualRisk = calculateRisk(residualProbability, residualImpact);

  return {
    original: calculateRisk(originalProbability, originalImpact),
    residual: residualRisk,
    reduction: {
      probability: originalProbability - residualProbability,
      impact: originalImpact - residualImpact,
      score: calculateRiskScore(originalProbability, originalImpact) - residualRisk.riskScore
    }
  };
};

/**
 * Generate risk matrix data
 * @param {Array} risks - Array of risk objects
 * @returns {Object} Risk matrix data
 */
const generateRiskMatrix = (risks) => {
  const matrix = {
    data: [],
    statistics: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: risks.length
    }
  };

  risks.forEach(risk => {
    const matrixPoint = {
      id: risk.id,
      name: risk.name,
      probability: risk.probability,
      impact: risk.impact,
      riskScore: risk.risk_score,
      riskLevel: risk.risk_level,
      category: risk.category
    };

    matrix.data.push(matrixPoint);
    matrix.statistics[risk.risk_level]++;
  });

  return matrix;
};

/**
 * Prioritize risks by score
 * @param {Array} risks - Array of risk objects
 * @param {Number} limit - Number of top risks to return
 * @returns {Array} Prioritized risks
 */
const prioritizeRisks = (risks, limit = 10) => {
  return risks
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, limit)
    .map((risk, index) => ({
      rank: index + 1,
      ...risk
    }));
};

/**
 * Calculate aggregate risk metrics
 * @param {Array} risks - Array of risk objects
 * @returns {Object} Aggregate metrics
 */
const calculateAggregateMetrics = (risks) => {
  if (!risks.length) {
    return {
      totalRisks: 0,
      averageRiskScore: 0,
      maxRiskScore: 0,
      riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  const totalScore = risks.reduce((sum, risk) => sum + risk.risk_score, 0);
  const distribution = risks.reduce((acc, risk) => {
    acc[risk.risk_level]++;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });

  return {
    totalRisks: risks.length,
    averageRiskScore: parseFloat((totalScore / risks.length).toFixed(2)),
    maxRiskScore: Math.max(...risks.map(r => r.risk_score)),
    minRiskScore: Math.min(...risks.map(r => r.risk_score)),
    riskDistribution: distribution,
    criticalPercentage: parseFloat(((distribution.critical / risks.length) * 100).toFixed(1)),
    highPercentage: parseFloat(((distribution.high / risks.length) * 100).toFixed(1))
  };
};

module.exports = {
  calculateRisk,
  calculateResidualRisk,
  generateRiskMatrix,
  prioritizeRisks,
  calculateAggregateMetrics,
  getRiskDescription
};
