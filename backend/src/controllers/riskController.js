const { Risk } = require('../models');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/constants');
const { getPaginationMetadata } = require('../utils/helpers');
const { calculateRisk, generateRiskMatrix, prioritizeRisks } = require('../services/riskCalculator');
const { createRiskAlert } = require('../services/alertService');
const logger = require('../config/logger');

/**
 * Get all risks with pagination
 */
const getAllRisks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      risk_level,
      category,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { user_id: req.user.id };

    if (risk_level) where.risk_level = risk_level;
    if (category) where.category = category;
    if (status) where.status = status;

    const { count, rows: risks } = await Risk.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['risk_score', 'DESC']],
      include: [
        { association: 'threat', attributes: ['id', 'name', 'type'] },
        { association: 'vulnerability', attributes: ['id', 'name', 'cve_id'] }
      ]
    });

    const pagination = getPaginationMetadata(
      parseInt(page),
      parseInt(limit),
      count
    );

    return successResponse(
      res,
      { risks, pagination },
      'Risks retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get risk by ID
 */
const getRiskById = async (req, res, next) => {
  try {
    const risk = await Risk.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { association: 'threat' },
        { association: 'vulnerability' },
        { association: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });

    if (!risk) {
      return notFoundResponse(res, 'Risk');
    }

    return successResponse(
      res,
      { risk },
      'Risk retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new risk
 */
const createRisk = async (req, res, next) => {
  try {
    const { probability, impact } = req.body;

    // Calculate risk automatically
    const riskCalculation = calculateRisk(probability, impact);

    const riskData = {
      ...req.body,
      user_id: req.user.id,
      risk_score: riskCalculation.riskScore,
      risk_level: riskCalculation.riskLevel
    };

    const risk = await Risk.create(riskData);

    // Create alert if risk is critical or high
    await createRiskAlert(risk);

    logger.info(`Risk created: ${risk.name} with score ${risk.risk_score}`);

    return successResponse(
      res,
      { risk, calculation: riskCalculation },
      'Risk created successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update risk
 */
const updateRisk = async (req, res, next) => {
  try {
    const risk = await Risk.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!risk) {
      return notFoundResponse(res, 'Risk');
    }

    // Log the request body
    logger.info(`Update request body: ${JSON.stringify(req.body)}`);
    logger.info(`Current risk before update: prob=${risk.probability}, impact=${risk.impact}, score=${risk.risk_score}, level=${risk.risk_level}`);

    // Update fields explicitly to trigger validation hooks
    if (req.body.name !== undefined) risk.name = req.body.name;
    if (req.body.description !== undefined) risk.description = req.body.description;
    if (req.body.category !== undefined) risk.category = req.body.category;
    if (req.body.probability !== undefined) {
      // Convert to number to ensure proper type
      risk.probability = parseFloat(req.body.probability);
      logger.info(`Updated probability to: ${risk.probability} (from: ${req.body.probability}, type: ${typeof req.body.probability})`);
    }
    if (req.body.impact !== undefined) {
      // Convert to integer to ensure proper type
      risk.impact = parseInt(req.body.impact, 10);
      logger.info(`Updated impact to: ${risk.impact} (from: ${req.body.impact}, type: ${typeof req.body.impact})`);
    }
    if (req.body.treatment_strategy !== undefined) risk.treatment_strategy = req.body.treatment_strategy;
    if (req.body.treatment_plan !== undefined) risk.treatment_plan = req.body.treatment_plan;
    if (req.body.status !== undefined) risk.status = req.body.status;
    if (req.body.residual_probability !== undefined) risk.residual_probability = req.body.residual_probability;
    if (req.body.residual_impact !== undefined) risk.residual_impact = req.body.residual_impact;

    // Calculate risk_score and risk_level BEFORE save
    if (risk.probability !== null && risk.probability !== undefined &&
        risk.impact !== null && risk.impact !== undefined) {
      const calculatedScore = (risk.probability * risk.impact * 10).toFixed(2);
      risk.risk_score = parseFloat(calculatedScore);

      const score = parseFloat(calculatedScore);
      if (score >= 50) {
        risk.risk_level = 'critical';
      } else if (score >= 30) {
        risk.risk_level = 'high';
      } else if (score >= 15) {
        risk.risk_level = 'medium';
      } else {
        risk.risk_level = 'low';
      }

      logger.info(`Calculated in controller: score=${calculatedScore}, level=${risk.risk_level}`);
    }

    logger.info(`Risk before save: prob=${risk.probability}, impact=${risk.impact}, score=${risk.risk_score}, level=${risk.risk_level}`);

    // Save without relying on hooks
    await risk.save();

    logger.info(`Risk after save: prob=${risk.probability}, impact=${risk.impact}, score=${risk.risk_score}, level=${risk.risk_level}`);

    logger.info(`Risk updated: ${risk.id}`);

    return successResponse(
      res,
      { risk },
      'Risk updated successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete risk
 */
const deleteRisk = async (req, res, next) => {
  try {
    const risk = await Risk.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!risk) {
      return notFoundResponse(res, 'Risk');
    }

    await risk.destroy();

    logger.info(`Risk deleted: ${req.params.id}`);

    return successResponse(
      res,
      null,
      'Risk deleted successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate risk score
 */
const calculateRiskScore = async (req, res, next) => {
  try {
    const { probability, impact } = req.body;

    const calculation = calculateRisk(probability, impact);

    return successResponse(
      res,
      { calculation },
      'Risk calculated successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get risk matrix data
 */
const getRiskMatrix = async (req, res, next) => {
  try {
    const risks = await Risk.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'name', 'probability', 'impact', 'risk_score', 'risk_level', 'category']
    });

    const matrix = generateRiskMatrix(risks);

    return successResponse(
      res,
      { matrix },
      'Risk matrix generated successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get prioritized risks
 */
const getPrioritizedRisks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const risks = await Risk.findAll({
      where: {
        status: { [require('sequelize').Op.ne]: 'closed' },
        user_id: req.user.id
      }
    });

    const prioritized = prioritizeRisks(risks, parseInt(limit));

    return successResponse(
      res,
      { risks: prioritized },
      'Prioritized risks retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRisks,
  getRiskById,
  createRisk,
  updateRisk,
  deleteRisk,
  calculateRiskScore,
  getRiskMatrix,
  getPrioritizedRisks
};
