-- Script para eliminar todas las tablas de threatmap_db en Aiven
-- CUIDADO: Esto eliminará TODOS los datos
-- Ejecutar en DBeaver conectado a Aiven

-- Desactivar temporalmente las foreign key constraints
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas en el orden correcto
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS vulnerabilities;
DROP TABLE IF EXISTS threats;
DROP TABLE IF EXISTS users;

-- Reactivar las foreign key constraints
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que todas las tablas fueron eliminadas
SHOW TABLES;
