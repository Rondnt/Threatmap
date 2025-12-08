-- Script para actualizar la tabla assets con las columnas faltantes
-- Ejecutar en DBeaver en la base de datos de Aiven

-- 1. Modificar el ENUM de type para incluir todos los tipos
ALTER TABLE assets MODIFY COLUMN type ENUM(
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
) NOT NULL;

-- 2. Agregar columna exposure_level
ALTER TABLE assets ADD COLUMN exposure_level ENUM('public', 'dmz', 'internal', 'isolated')
  NOT NULL DEFAULT 'internal'
  COMMENT 'Network exposure level'
  AFTER status;

-- 3. Agregar columna vulnerabilities_count
ALTER TABLE assets ADD COLUMN vulnerabilities_count INT
  NOT NULL DEFAULT 0
  COMMENT 'Number of associated vulnerabilities'
  AFTER exposure_level;

-- 4. Agregar columna threats_count
ALTER TABLE assets ADD COLUMN threats_count INT
  NOT NULL DEFAULT 0
  COMMENT 'Number of associated threats'
  AFTER vulnerabilities_count;

-- 5. Agregar columna position_x para D3.js
ALTER TABLE assets ADD COLUMN position_x FLOAT
  NULL
  COMMENT 'X coordinate for network visualization'
  AFTER threats_count;

-- 6. Agregar columna position_y para D3.js
ALTER TABLE assets ADD COLUMN position_y FLOAT
  NULL
  COMMENT 'Y coordinate for network visualization'
  AFTER position_x;

-- 7. Agregar columna connections para topología
ALTER TABLE assets ADD COLUMN connections TEXT
  NULL
  COMMENT 'Array of connected asset IDs for topology'
  AFTER position_y;

-- 8. Agregar columna tags
ALTER TABLE assets ADD COLUMN tags TEXT
  NULL
  COMMENT 'Custom tags for categorization'
  AFTER connections;

-- 9. Agregar columna owner
ALTER TABLE assets ADD COLUMN owner VARCHAR(200)
  NULL
  COMMENT 'Asset owner or responsible team'
  AFTER tags;

-- 10. Agregar columna notes
ALTER TABLE assets ADD COLUMN notes TEXT
  NULL
  AFTER owner;

-- 11. Crear índices para las nuevas columnas
CREATE INDEX idx_exposure_level ON assets(exposure_level);

-- Verificar la estructura actualizada
DESCRIBE assets;
