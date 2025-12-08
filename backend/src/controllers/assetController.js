const Asset = require('../models/Asset');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { Op } = require('sequelize');
//crud de activos del sistema
exports.create = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      ip_address,
      hostname,
      os,
      location,
      criticality,
      is_public_facing,
      ports_open,
      services,
      status,
      exposure_level,
      owner,
      tags,
      notes,
      connections
    } = req.body;

    const asset = await Asset.create({
      name,
      type,
      description,
      ip_address,
      hostname,
      os,
      location,
      criticality: criticality || 'medium',
      is_public_facing: is_public_facing === true || is_public_facing === 'true',
      ports_open: ports_open || [],
      services: services || [],
      status: status || 'active',
      exposure_level: exposure_level || 'internal',
      owner,
      tags: tags || [],
      notes,
      connections: connections || [],
      user_id: req.user.id
    });

    return successResponse(res, { asset }, 'Asset creado exitosamente', 201);
  } catch (error) {
    console.error('Error creating asset:', error);
    return errorResponse(res, 'Error al crear asset', 500);
  }
};

exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = '',
      type = '',
      criticality = '',
      exposure_level = '',
      status = ''
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { user_id: req.user.id };

    // Filters
    if (type) {
      where.type = type;
    }

    if (criticality) {
      where.criticality = criticality;
    }

    if (exposure_level) {
      where.exposure_level = exposure_level;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { ip_address: { [Op.like]: `%${search}%` } },
        { hostname: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: assets } = await Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, {
      assets,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }, 'Assets obtenidos exitosamente', 200);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return errorResponse(res, 'Error al obtener assets', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!asset) {
      return errorResponse(res, 'Asset no encontrado', 404);
    }

    return successResponse(res, { asset }, 'Asset obtenido exitosamente', 200);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return errorResponse(res, 'Error al obtener asset', 500);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!asset) {
      return errorResponse(res, 'Asset no encontrado', 404);
    }

    // Build update object with only provided fields
    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.ip_address !== undefined) updateData.ip_address = req.body.ip_address;
    if (req.body.hostname !== undefined) updateData.hostname = req.body.hostname;
    if (req.body.os !== undefined) updateData.os = req.body.os;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.criticality !== undefined) updateData.criticality = req.body.criticality;
    if (req.body.is_public_facing !== undefined) {
      updateData.is_public_facing = req.body.is_public_facing === true || req.body.is_public_facing === 'true';
    }
    if (req.body.ports_open !== undefined) updateData.ports_open = req.body.ports_open;
    if (req.body.services !== undefined) updateData.services = req.body.services;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.exposure_level !== undefined) updateData.exposure_level = req.body.exposure_level;
    if (req.body.owner !== undefined) updateData.owner = req.body.owner;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.connections !== undefined) updateData.connections = req.body.connections;
    if (req.body.position_x !== undefined) updateData.position_x = req.body.position_x;
    if (req.body.position_y !== undefined) updateData.position_y = req.body.position_y;

    await asset.update(updateData);

    return successResponse(res, { asset }, 'Asset actualizado exitosamente', 200);
  } catch (error) {
    console.error('Error updating asset:', error);
    return errorResponse(res, 'Error al actualizar asset', 500);
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!asset) {
      return errorResponse(res, 'Asset no encontrado', 404);
    }

    await asset.destroy();

    return successResponse(res, null, 'Asset eliminado exitosamente', 200);
  } catch (error) {
    console.error('Error deleting asset:', error);
    return errorResponse(res, 'Error al eliminar asset', 500);
  }
};

// Get attack surface statistics
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      total,
      byType,
      byCriticality,
      byExposure,
      publicFacing,
      withVulnerabilities
    ] = await Promise.all([
      Asset.count({ where: { user_id: userId } }),
      Asset.findAll({
        where: { user_id: userId },
        attributes: [
          'type',
          [Asset.sequelize.fn('COUNT', Asset.sequelize.col('id')), 'count']
        ],
        group: ['type']
      }),
      Asset.findAll({
        where: { user_id: userId },
        attributes: [
          'criticality',
          [Asset.sequelize.fn('COUNT', Asset.sequelize.col('id')), 'count']
        ],
        group: ['criticality']
      }),
      Asset.findAll({
        where: { user_id: userId },
        attributes: [
          'exposure_level',
          [Asset.sequelize.fn('COUNT', Asset.sequelize.col('id')), 'count']
        ],
        group: ['exposure_level']
      }),
      Asset.count({ where: { user_id: userId, is_public_facing: true } }),
      Asset.count({ where: { user_id: userId, vulnerabilities_count: { [Op.gt]: 0 } } })
    ]);

    const statistics = {
      total,
      public_facing: publicFacing,
      with_vulnerabilities: withVulnerabilities,
      by_type: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.get('count'));
        return acc;
      }, {}),
      by_criticality: byCriticality.reduce((acc, item) => {
        acc[item.criticality] = parseInt(item.get('count'));
        return acc;
      }, {}),
      by_exposure: byExposure.reduce((acc, item) => {
        acc[item.exposure_level] = parseInt(item.get('count'));
        return acc;
      }, {})
    };

    return successResponse(res, { statistics }, 'Estad�sticas obtenidas exitosamente', 200);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return errorResponse(res, 'Error al obtener estad�sticas', 500);
  }
};

// Get attack surface topology (for D3.js visualization)
exports.getTopology = async (req, res) => {
  try {
    const assets = await Asset.findAll({
      where: { user_id: req.user.id }
    });

    // Build nodes and links for D3.js force-directed graph
    const nodes = assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      criticality: asset.criticality,
      exposure_level: asset.exposure_level,
      is_public_facing: asset.is_public_facing === true || asset.is_public_facing === 1,
      status: asset.status,
      vulnerabilities_count: asset.vulnerabilities_count,
      threats_count: asset.threats_count,
      ip_address: asset.ip_address,
      x: asset.position_x,
      y: asset.position_y
    }));

    // Create a Set of valid node IDs for quick lookup
    const validNodeIds = new Set(nodes.map(n => n.id));

    const links = [];
    assets.forEach(asset => {
      if (asset.connections && asset.connections.length > 0) {
        asset.connections.forEach(targetId => {
          // Only create link if target node exists
          if (validNodeIds.has(targetId)) {
            links.push({
              source: asset.id,
              target: targetId
            });
          }
        });
      }
    });

    return successResponse(res, {
      nodes,
      links
    }, 'Topolog�a obtenida exitosamente', 200);
  } catch (error) {
    console.error('Error fetching topology:', error);
    return errorResponse(res, 'Error al obtener topolog�a', 500);
  }
};

// Update asset position (for D3.js drag and drop)
exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position_x, position_y } = req.body;

    const asset = await Asset.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!asset) {
      return errorResponse(res, 'Asset no encontrado', 404);
    }

    await asset.update({ position_x, position_y });

    return successResponse(res, { asset }, 'Posici�n actualizada exitosamente', 200);
  } catch (error) {
    console.error('Error updating position:', error);
    return errorResponse(res, 'Error al actualizar posici�n', 500);
  }
};
