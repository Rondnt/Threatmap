const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'threat_analysis',
      'vulnerability_assessment',
      'risk_matrix',
      'attack_surface',
      'executive_summary',
      'comprehensive'
    ),
    allowNull: false
  },
  format: {
    type: DataTypes.ENUM('pdf', 'html', 'json'),
    defaultValue: 'pdf'
  },
  status: {
    type: DataTypes.ENUM('generating', 'completed', 'failed'),
    defaultValue: 'generating'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'File size in bytes'
  },
  filters: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('filters');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('filters', JSON.stringify(value));
    },
    comment: 'JSON filters used for report generation'
  },
  date_from: {
    type: DataTypes.DATE,
    allowNull: true
  },
  date_to: {
    type: DataTypes.DATE,
    allowNull: true
  },
  generated_at: {
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
  tableName: 'reports',
  timestamps: true
});

module.exports = Report;
