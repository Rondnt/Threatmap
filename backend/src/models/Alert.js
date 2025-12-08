const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('threat', 'vulnerability', 'risk', 'system'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low', 'info'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'acknowledged', 'in_progress', 'resolved', 'dismissed'),
    defaultValue: 'new'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  related_entity_type: {
    type: DataTypes.ENUM('threat', 'vulnerability', 'risk', 'asset'),
    allowNull: true
  },
  related_entity_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  acknowledged_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'alerts',
  timestamps: true
});

module.exports = Alert;
