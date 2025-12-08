const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Threat = sequelize.define('Threat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM(
      'malware',
      'phishing',
      'ransomware',
      'ddos',
      'sql_injection',
      'xss',
      'mitm',
      'insider_threat',
      'zero_day',
      'brute_force',
      'social_engineering',
      'other'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'mitigated', 'monitoring', 'closed'),
    defaultValue: 'active'
  },
  source: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Source of threat intelligence'
  },
  probability: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Probability of occurrence (0-1)'
  },
  impact: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Impact level (1-10)'
  },
  risk_score: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    comment: 'Calculated risk score'
  },
  mitigation_strategy: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  detected_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  mitigated_at: {
    type: DataTypes.DATE,
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
  tableName: 'threats',
  timestamps: true
});

module.exports = Threat;
