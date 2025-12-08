# Guía Rápida de Pruebas - ThreatMap

## 1. Obtener tu Token

Después de registrarte en http://localhost:3000, abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.getItem('token')
```

Copia el token que aparece.

## 2. Crear Amenazas de Prueba

### Usando CURL (desde terminal):

```bash
# Reemplaza YOUR_TOKEN con tu token real

# Amenaza 1: Ransomware Crítico
curl -X POST http://localhost:5000/api/v1/threats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Ransomware en Servidor Producción",
    "description": "Se detectó actividad sospechosa de ransomware intentando cifrar archivos",
    "type": "ransomware",
    "severity": "critical",
    "probability": 0.9,
    "impact": 10,
    "source": "Sistema de Monitoreo"
  }'

# Amenaza 2: Phishing
curl -X POST http://localhost:5000/api/v1/threats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Campaña de Phishing Detectada",
    "description": "Múltiples correos de phishing dirigidos al personal",
    "type": "phishing",
    "severity": "high",
    "probability": 0.7,
    "impact": 6,
    "source": "Email Security Gateway"
  }'

# Amenaza 3: SQL Injection
curl -X POST http://localhost:5000/api/v1/threats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Intento de SQL Injection",
    "description": "Intentos de inyección SQL en formulario de login",
    "type": "sql_injection",
    "severity": "high",
    "probability": 0.6,
    "impact": 8,
    "source": "WAF Logs"
  }'
```

### Usando Postman/Thunder Client:

**Crear Amenaza:**
```
Method: POST
URL: http://localhost:5000/api/v1/threats
Headers:
  - Content-Type: application/json
  - Authorization: Bearer YOUR_TOKEN

Body (JSON):
{
  "name": "Ransomware en Servidor Producción",
  "description": "Se detectó actividad sospechosa de ransomware",
  "type": "ransomware",
  "severity": "critical",
  "probability": 0.9,
  "impact": 10,
  "source": "Sistema de Monitoreo"
}
```

## 3. Crear Riesgos de Prueba

```bash
# Riesgo 1: Crítico
curl -X POST http://localhost:5000/api/v1/risks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Riesgo de Pérdida de Datos Críticos",
    "description": "Posibilidad de pérdida de datos de clientes",
    "category": "technical",
    "probability": 0.8,
    "impact": 10
  }'

# Riesgo 2: Alto
curl -X POST http://localhost:5000/api/v1/risks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Fuga de Información Confidencial",
    "description": "Riesgo de exposición de información sensible",
    "category": "compliance",
    "probability": 0.6,
    "impact": 8
  }'

# Riesgo 3: Medio
curl -X POST http://localhost:5000/api/v1/risks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Interrupción del Servicio",
    "description": "Posible caída de servicios principales",
    "category": "operational",
    "probability": 0.5,
    "impact": 6
  }'
```

## 4. Ver los Datos

### En el Frontend:
1. Ve a http://localhost:3000/threats
2. Ve a http://localhost:3000/risks
3. Ve a http://localhost:3000/risk-matrix
4. Verás las amenazas y riesgos que creaste

### En DBeaver:
1. Refresca (F5) la base de datos
2. Click derecho en tabla `threats` → View Data
3. Verás tus amenazas registradas

## 5. Endpoints Útiles

```bash
# Ver estadísticas de amenazas
GET http://localhost:5000/api/v1/threats/statistics

# Ver matriz de riesgos
GET http://localhost:5000/api/v1/risks/matrix

# Calcular un riesgo
POST http://localhost:5000/api/v1/risks/calculate
Body: { "probability": 0.7, "impact": 8 }
```

## 6. Tipos de Amenazas Disponibles

- `malware` - Malware
- `phishing` - Phishing
- `ransomware` - Ransomware
- `ddos` - DDoS
- `sql_injection` - SQL Injection
- `xss` - Cross-Site Scripting
- `mitm` - Man in the Middle
- `insider_threat` - Amenaza Interna
- `zero_day` - Zero Day
- `brute_force` - Fuerza Bruta
- `social_engineering` - Ingeniería Social
- `other` - Otro

## 7. Niveles de Severidad

- `critical` - Crítico
- `high` - Alto
- `medium` - Medio
- `low` - Bajo

## 8. Categorías de Riesgo

- `operational` - Operacional
- `technical` - Técnico
- `compliance` - Cumplimiento
- `financial` - Financiero
- `reputational` - Reputacional
- `strategic` - Estratégico
