const User = require('./User');
const Threat = require('./Threat');
const Vulnerability = require('./Vulnerability');
const Risk = require('./Risk');
const Asset = require('./Asset');
const Alert = require('./Alert');
const Report = require('./Report');

// Define associations

// User associations
User.hasMany(Threat, { foreignKey: 'user_id', as: 'threats' });
User.hasMany(Vulnerability, { foreignKey: 'user_id', as: 'vulnerabilities' });
User.hasMany(Risk, { foreignKey: 'user_id', as: 'risks' });
User.hasMany(Asset, { foreignKey: 'user_id', as: 'assets' });
User.hasMany(Report, { foreignKey: 'user_id', as: 'reports' });

// Threat associations
Threat.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Threat.hasMany(Risk, { foreignKey: 'threat_id', as: 'risks' });

// Vulnerability associations
Vulnerability.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Vulnerability.hasMany(Risk, { foreignKey: 'vulnerability_id', as: 'risks' });

// Risk associations
Risk.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Risk.belongsTo(Threat, { foreignKey: 'threat_id', as: 'threat' });
Risk.belongsTo(Vulnerability, { foreignKey: 'vulnerability_id', as: 'vulnerability' });

// Asset associations
Asset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Alert associations
Alert.belongsTo(User, { foreignKey: 'acknowledged_by', as: 'acknowledgedBy' });

// Report associations
Report.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Threat,
  Vulnerability,
  Risk,
  Asset,
  Alert,
  Report
};
