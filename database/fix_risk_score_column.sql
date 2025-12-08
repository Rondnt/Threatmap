-- Script para arreglar la columna risk_score en la tabla risks
-- El problema: DECIMAL(4,2) solo permite hasta 99.99
-- La solución: Cambiar a DECIMAL(5,2) para permitir hasta 100.00
-- Ejecutar en DBeaver conectado a Aiven

ALTER TABLE risks MODIFY COLUMN risk_score DECIMAL(5,2) NOT NULL
  COMMENT 'Calculated risk score (probability * impact * 10)';

-- Verificar el cambio
DESCRIBE risks;
