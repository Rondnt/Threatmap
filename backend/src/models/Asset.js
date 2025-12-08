const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'server',
      'workstation',
      'network_device',
      'database',
      'application',
      'cloud_service',
      'mobile_device',
      'iot_device',
      'api',
      'web_service',
      'firewall',
      'load_balancer',
      'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IPv4 or IPv6 address'
  },
  hostname: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  os: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Operating System'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  criticality: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium'
  },
  is_public_facing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Is asset exposed to internet'
  },
  ports_open: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('ports_open');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('ports_open', JSON.stringify(value));
    }
  },
  services: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('services');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('services', JSON.stringify(value));
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'decommissioned'),
    defaultValue: 'active'
  },
  last_scan: {
    type: DataTypes.DATE,
    allowNull: true
  },
  exposure_level: {
    type: DataTypes.ENUM('public', 'dmz', 'internal', 'isolated'),
    allowNull: false,
    defaultValue: 'internal',
    comment: 'Network exposure level'
  },
  vulnerabilities_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of associated vulnerabilities'
  },
  threats_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of associated threats'
  },
  // For D3.js visualization positioning
  position_x: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'X coordinate for network visualization'
  },
  position_y: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Y coordinate for network visualization'
  },
  // Connections to other assets
  connections: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('connections');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('connections', JSON.stringify(value));
    },
    comment: 'Array of connected asset IDs for topology'
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    },
    comment: 'Custom tags for categorization'
  },
  owner: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Asset owner or responsible team'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'assets',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['criticality']
    },
    {
      fields: ['exposure_level']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Asset;
