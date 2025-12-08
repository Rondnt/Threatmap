-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'analyst', 'viewer') DEFAULT 'analyst',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Threats Table
CREATE TABLE IF NOT EXISTS threats (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('malware', 'phishing', 'ransomware', 'ddos', 'sql_injection', 'xss', 'mitm', 'insider_threat', 'zero_day', 'brute_force', 'social_engineering', 'other') NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  status ENUM('active', 'mitigated', 'monitoring', 'closed') DEFAULT 'active',
  source VARCHAR(200),
  probability DECIMAL(3,2),
  impact INT,
  risk_score DECIMAL(4,2),
  mitigation_strategy TEXT,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  mitigated_at DATETIME,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_risk_score (risk_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vulnerabilities Table
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id CHAR(36) PRIMARY KEY,
  cve_id VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  cvss_score DECIMAL(3,1),
  cvss_vector VARCHAR(100),
  affected_systems TEXT,
  status ENUM('open', 'in_progress', 'patched', 'mitigated', 'accepted') DEFAULT 'open',
  exploit_available BOOLEAN DEFAULT FALSE,
  patch_available BOOLEAN DEFAULT FALSE,
  patch_url VARCHAR(500),
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  patched_at DATETIME,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_cve (cve_id),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_cvss (cvss_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Risks Table
CREATE TABLE IF NOT EXISTS risks (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category ENUM('operational', 'technical', 'compliance', 'financial', 'reputational', 'strategic') NOT NULL,
  probability DECIMAL(3,2) NOT NULL,
  impact INT NOT NULL,
  risk_score DECIMAL(4,2) NOT NULL,
  risk_level ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  status ENUM('identified', 'analyzing', 'treating', 'monitoring', 'closed') DEFAULT 'identified',
  treatment_strategy ENUM('mitigate', 'transfer', 'accept', 'avoid'),
  treatment_plan TEXT,
  residual_probability DECIMAL(3,2),
  residual_impact INT,
  residual_risk_score DECIMAL(4,2),
  threat_id CHAR(36),
  vulnerability_id CHAR(36),
  user_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE SET NULL,
  FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_risk_level (risk_level),
  INDEX idx_status (status),
  INDEX idx_risk_score (risk_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type ENUM('server', 'workstation', 'network_device', 'database', 'application', 'cloud_service', 'mobile_device', 'iot_device', 'other') NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  hostname VARCHAR(255),
  os VARCHAR(100),
  location VARCHAR(200),
  criticality ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  is_public_facing BOOLEAN DEFAULT FALSE,
  ports_open TEXT,
  services TEXT,
  status ENUM('active', 'inactive', 'maintenance', 'decommissioned') DEFAULT 'active',
  last_scan DATETIME,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_criticality (criticality),
  INDEX idx_status (status),
  INDEX idx_public_facing (is_public_facing)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('threat', 'vulnerability', 'risk', 'system') NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
  status ENUM('new', 'acknowledged', 'in_progress', 'resolved', 'dismissed') DEFAULT 'new',
  is_read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  related_entity_type ENUM('threat', 'vulnerability', 'risk', 'asset'),
  related_entity_id CHAR(36),
  acknowledged_by CHAR(36),
  acknowledged_at DATETIME,
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type ENUM('threat_analysis', 'vulnerability_assessment', 'risk_matrix', 'attack_surface', 'executive_summary', 'comprehensive') NOT NULL,
  format ENUM('pdf', 'html', 'json') DEFAULT 'pdf',
  status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
  file_path VARCHAR(500),
  file_size INT,
  filters TEXT,
  date_from DATETIME,
  date_to DATETIME,
  generated_at DATETIME,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_threats_detected ON threats(detected_at DESC);
CREATE INDEX idx_vulnerabilities_discovered ON vulnerabilities(discovered_at DESC);
CREATE INDEX idx_risks_created ON risks(created_at DESC);
