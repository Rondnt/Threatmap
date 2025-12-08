// Application Constants

module.exports = {
  // Severity Levels
  SEVERITY_LEVELS: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
  },

  // Threat Types
  THREAT_TYPES: {
    MALWARE: 'malware',
    PHISHING: 'phishing',
    RANSOMWARE: 'ransomware',
    DDOS: 'ddos',
    SQL_INJECTION: 'sql_injection',
    XSS: 'xss',
    MITM: 'mitm',
    INSIDER_THREAT: 'insider_threat',
    ZERO_DAY: 'zero_day',
    BRUTE_FORCE: 'brute_force',
    SOCIAL_ENGINEERING: 'social_engineering',
    OTHER: 'other'
  },

  // Risk Levels
  RISK_LEVELS: {
    CRITICAL: { min: 7, max: 10, label: 'critical', color: '#DC2626' },
    HIGH: { min: 5, max: 6.99, label: 'high', color: '#F59E0B' },
    MEDIUM: { min: 3, max: 4.99, label: 'medium', color: '#FBBF24' },
    LOW: { min: 0, max: 2.99, label: 'low', color: '#10B981' }
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    ANALYST: 'analyst',
    VIEWER: 'viewer'
  },

  // Asset Types
  ASSET_TYPES: {
    SERVER: 'server',
    WORKSTATION: 'workstation',
    NETWORK_DEVICE: 'network_device',
    DATABASE: 'database',
    APPLICATION: 'application',
    CLOUD_SERVICE: 'cloud_service',
    MOBILE_DEVICE: 'mobile_device',
    IOT_DEVICE: 'iot_device',
    OTHER: 'other'
  },

  // Status Types
  STATUS_TYPES: {
    THREAT: {
      ACTIVE: 'active',
      MITIGATED: 'mitigated',
      MONITORING: 'monitoring',
      CLOSED: 'closed'
    },
    VULNERABILITY: {
      OPEN: 'open',
      IN_PROGRESS: 'in_progress',
      PATCHED: 'patched',
      MITIGATED: 'mitigated',
      ACCEPTED: 'accepted'
    },
    RISK: {
      IDENTIFIED: 'identified',
      ANALYZING: 'analyzing',
      TREATING: 'treating',
      MONITORING: 'monitoring',
      CLOSED: 'closed'
    },
    ALERT: {
      NEW: 'new',
      ACKNOWLEDGED: 'acknowledged',
      IN_PROGRESS: 'in_progress',
      RESOLVED: 'resolved',
      DISMISSED: 'dismissed'
    }
  },

  // Alert Types
  ALERT_TYPES: {
    THREAT: 'threat',
    VULNERABILITY: 'vulnerability',
    RISK: 'risk',
    SYSTEM: 'system'
  },

  // Report Types
  REPORT_TYPES: {
    THREAT_ANALYSIS: 'threat_analysis',
    VULNERABILITY_ASSESSMENT: 'vulnerability_assessment',
    RISK_MATRIX: 'risk_matrix',
    ATTACK_SURFACE: 'attack_surface',
    EXECUTIVE_SUMMARY: 'executive_summary',
    COMPREHENSIVE: 'comprehensive'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Risk Calculation
  RISK_CALCULATION: {
    MULTIPLIER: 10,
    MIN_PROBABILITY: 0,
    MAX_PROBABILITY: 1,
    MIN_IMPACT: 1,
    MAX_IMPACT: 10
  }
};
