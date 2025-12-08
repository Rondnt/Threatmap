-- Script para recalcular el risk_level de todos los riesgos basándose en su risk_score
-- Ejecutar en DBeaver conectado a Aiven

-- Actualizar risk_level basándose en risk_score
-- Critical: score >= 50
UPDATE risks SET risk_level = 'critical' WHERE risk_score >= 50;

-- High: score 30-49
UPDATE risks SET risk_level = 'high' WHERE risk_score >= 30 AND risk_score < 50;

-- Medium: score 15-29
UPDATE risks SET risk_level = 'medium' WHERE risk_score >= 15 AND risk_score < 30;

-- Low: score < 15
UPDATE risks SET risk_level = 'low' WHERE risk_score < 15;

-- Verificar los cambios
SELECT id, name, probability, impact, risk_score, risk_level
FROM risks
ORDER BY risk_score DESC;
