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
    const risk = await Risk.findByPk(req.params.id, {
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

    // Update fields
    Object.assign(risk, req.body);

    // Recalculate if probability or impact changed
    if (req.body.probability || req.body.impact) {
      const calculation = calculateRisk(risk.probability, risk.impact);
      risk.risk_score = calculation.riskScore;
      risk.risk_level = calculation.riskLevel;
    }

    await risk.save();

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
    const risk = await Risk.findByPk(req.params.id);

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
