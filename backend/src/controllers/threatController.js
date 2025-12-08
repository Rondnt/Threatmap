const { Threat } = require('../models');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseFormatter');
const { HTTP_STATUS } = require('../utils/constants');
const { getPaginationMetadata } = require('../utils/helpers');
const { createThreatAlert } = require('../services/alertService');
const logger = require('../config/logger');

exports.getAllThreats = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      severity,
      type,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { description: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: threats } = await Threat.findAndCountAll({
      where: {
        ...where,
        user_id: req.user.id
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['detected_at', 'DESC']]
    });

    const pagination = getPaginationMetadata(
      parseInt(page),
      parseInt(limit),
      count
    );

    return successResponse(
      res,
      { threats, pagination },
      'Threats retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

exports.getThreatById = async (req, res, next) => {
  try {
    const threat = await Threat.findByPk(req.params.id);

    if (!threat) {
      return notFoundResponse(res, 'Threat');
    }

    return successResponse(
      res,
      { threat },
      'Threat retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

exports.createThreat = async (req, res, next) => {
  try {
    const threatData = {
      ...req.body,
      user_id: req.user.id
    };

    // Calculate risk score if probability and impact provided
    if (threatData.probability && threatData.impact) {
      threatData.risk_score = (threatData.probability * threatData.impact * 10).toFixed(2);
    }

    const threat = await Threat.create(threatData);

    // Create alert if threat is critical or high
    await createThreatAlert(threat);

    logger.info(`Threat created: ${threat.name} by user ${req.user.id}`);

    return successResponse(
      res,
      { threat },
      'Threat created successfully',
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    next(error);
  }
};

exports.updateThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!threat) {
      return notFoundResponse(res, 'Threat');
    }

    // Update fields
    Object.assign(threat, req.body);

    // Recalculate risk score if needed
    if (threat.probability && threat.impact) {
      threat.risk_score = (threat.probability * threat.impact * 10).toFixed(2);
    }

    await threat.save();

    logger.info(`Threat updated: ${threat.id}`);

    return successResponse(
      res,
      { threat },
      'Threat updated successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    // Log the full error for debugging
    logger.error(`Error updating threat: ${error.message}`, { error: error.errors || error });
    next(error);
  }
};

exports.deleteThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!threat) {
      return notFoundResponse(res, 'Threat');
    }

    await threat.destroy();

    logger.info(`Threat deleted: ${req.params.id}`);

    return successResponse(
      res,
      null,
      'Threat deleted successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};

exports.getThreatStatistics = async (req, res, next) => {
  try {
    const stats = await Threat.findAll({
      where: { user_id: req.user.id },
      attributes: [
        'severity',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['severity']
    });

    const statistics = {
      total: await Threat.count({ where: { user_id: req.user.id } }),
      by_severity: stats.reduce((acc, stat) => {
        acc[stat.severity] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
      active: await Threat.count({ where: { user_id: req.user.id, status: 'active' } }),
      mitigated: await Threat.count({ where: { user_id: req.user.id, status: 'mitigated' } })
    };

    return successResponse(
      res,
      { statistics },
      'Statistics retrieved successfully',
      HTTP_STATUS.OK
    );
  } catch (error) {
    next(error);
  }
};
// Force reload
