const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Risk = sequelize.define('Risk', {
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
  category: {
    type: DataTypes.ENUM(
      'operational',
      'technical',
      'compliance',
      'financial',
      'reputational',
      'strategic'
    ),
    allowNull: false
  },
  probability: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    },
    comment: 'Probability of occurrence (0-1)'
  },
  impact: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    },
    comment: 'Impact level (1-10)'
  },
  risk_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Calculated risk score (probability * impact * 10, max 100.00)'
  },
  risk_level: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('identified', 'analyzing', 'treating', 'monitoring', 'closed'),
    defaultValue: 'identified'
  },
  treatment_strategy: {
    type: DataTypes.ENUM('mitigate', 'transfer', 'accept', 'avoid'),
    allowNull: true
  },
  treatment_plan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  residual_probability: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Residual probability after treatment'
  },
  residual_impact: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Residual impact after treatment'
  },
  residual_risk_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Residual risk score after treatment (max 100.00)'
  },
  threat_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'threats',
      key: 'id'
    }
  },
  vulnerability_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'vulnerabilities',
      key: 'id'
    }
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
  tableName: 'risks',
  timestamps: true,
  hooks: {
    beforeValidate: (risk) => {
      console.log('🔵 beforeValidate hook triggered');
      console.log(`  - probability: ${risk.probability} (type: ${typeof risk.probability})`);
      console.log(`  - impact: ${risk.impact} (type: ${typeof risk.impact})`);

      // Calculate risk score - check for null/undefined, not falsy (to allow 0 values)
      if (risk.probability !== null && risk.probability !== undefined &&
          risk.impact !== null && risk.impact !== undefined) {

        const calculatedScore = (risk.probability * risk.impact * 10).toFixed(2);
        console.log(`  - Calculated score: ${calculatedScore}`);
        risk.risk_score = calculatedScore;

        // Determine risk level - adjusted to be more reasonable
        // probability (0-1) × impact (1-10) × 10 = max score 100
        const score = parseFloat(risk.risk_score);
        let newLevel;
        if (score >= 50) {
          newLevel = 'critical';  // Very high probability AND impact
        } else if (score >= 30) {
          newLevel = 'high';      // High probability or impact
        } else if (score >= 15) {
          newLevel = 'medium';    // Moderate risk
        } else {
          newLevel = 'low';       // Low risk
        }
        console.log(`  - New risk_level: ${newLevel} (was: ${risk.risk_level})`);
        risk.risk_level = newLevel;
      } else {
        console.log('  ⚠️  Probability or impact is null/undefined, skipping calculation');
      }

      // Calculate residual risk if values present
      if (risk.residual_probability !== null && risk.residual_probability !== undefined &&
          risk.residual_impact !== null && risk.residual_impact !== undefined) {
        risk.residual_risk_score = (risk.residual_probability * risk.residual_impact * 10).toFixed(2);
      }
    }
  }
});

module.exports = Risk;
