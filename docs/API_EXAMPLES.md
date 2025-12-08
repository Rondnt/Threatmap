# ThreatMap API - Ejemplos de Uso

## Base URL
```
http://localhost:5000/api/v1
```

## 1. Autenticación

### Registrar Usuario
```bash
POST /api/v1/auth/register

Body:
{
  "username": "analyst1",
  "email": "analyst@threatmap.com",
  "password": "password123",
  "full_name": "John Analyst",
  "role": "analyst"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "analyst1",
      "email": "analyst@threatmap.com",
      "role": "analyst"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```bash
POST /api/v1/auth/login

Body:
{
  "email": "analyst@threatmap.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGci..."
  }
}
```

## 2. Amenazas (Threats)

### Crear Amenaza
```bash
POST /api/v1/threats
Authorization: Bearer {token}

Body:
{
  "name": "Ransomware Attack on Production Server",
  "description": "Detected ransomware attempting to encrypt production files",
  "type": "ransomware",
  "severity": "critical",
  "source": "Security Monitoring System",
  "probability": 0.8,
  "impact": 9
}

Response:
{
  "success": true,
  "message": "Threat created successfully",
  "data": {
    "threat": {
      "id": "uuid",
      "name": "Ransomware Attack on Production Server",
      "type": "ransomware",
      "severity": "critical",
      "risk_score": 72.00,
      ...
    }
  }
}
```

### Listar Amenazas (con filtros)
```bash
GET /api/v1/threats?severity=critical&page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Threats retrieved successfully",
  "data": {
    "threats": [...]
  },
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10
  }
}
```

### Obtener Estadísticas
```bash
GET /api/v1/threats/statistics
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "statistics": {
      "total": 48,
      "by_severity": {
        "critical": 12,
        "high": 18,
        "medium": 15,
        "low": 3
      },
      "active": 35,
      "mitigated": 13
    }
  }
}
```

## 3. Riesgos (Risks)

### Calcular Riesgo
```bash
POST /api/v1/risks/calculate
Authorization: Bearer {token}

Body:
{
  "probability": 0.7,
  "impact": 8
}

Response:
{
  "success": true,
  "message": "Risk calculated successfully",
  "data": {
    "calculation": {
      "probability": 0.7,
      "impact": 8,
      "riskScore": 56.00,
      "riskLevel": "high",
      "description": "High risk (56/10) - Priority attention needed"
    }
  }
}
```

### Crear Riesgo
```bash
POST /api/v1/risks
Authorization: Bearer {token}

Body:
{
  "name": "Data Breach Risk",
  "description": "Risk of sensitive data exposure",
  "category": "technical",
  "probability": 0.6,
  "impact": 9
}

Response:
{
  "success": true,
  "message": "Risk created successfully",
  "data": {
    "risk": {
      "id": "uuid",
      "name": "Data Breach Risk",
      "risk_score": 54.00,
      "risk_level": "high",
      ...
    }
  }
}
```

### Obtener Matriz de Riesgos
```bash
GET /api/v1/risks/matrix
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "matrix": {
      "data": [
        {
          "id": "uuid",
          "name": "Risk 1",
          "probability": 0.8,
          "impact": 9,
          "riskScore": 72,
          "riskLevel": "critical"
        },
        ...
      ],
      "statistics": {
        "critical": 5,
        "high": 12,
        "medium": 8,
        "low": 3,
        "total": 28
      }
    }
  }
}
```

### Obtener Riesgos Priorizados
```bash
GET /api/v1/risks/prioritized?limit=5
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "risks": [
      {
        "rank": 1,
        "id": "uuid",
        "name": "Critical Infrastructure Risk",
        "risk_score": 90.00,
        ...
      },
      ...
    ]
  }
}
```

## Códigos de Estado HTTP

- `200` OK - Operación exitosa
- `201` Created - Recurso creado exitosamente
- `400` Bad Request - Datos inválidos
- `401` Unauthorized - No autenticado
- `403` Forbidden - Sin permisos
- `404` Not Found - Recurso no encontrado
- `422` Unprocessable Entity - Errores de validación
- `500` Internal Server Error - Error del servidor

## Roles de Usuario

- `admin` - Acceso completo (crear, leer, actualizar, eliminar)
- `analyst` - Puede crear y editar amenazas/riesgos
- `viewer` - Solo lectura

## Notas

- Todos los endpoints (excepto register/login) requieren autenticación mediante Bearer Token
- Los tokens JWT expiran en 7 días por defecto
- La paginación por defecto es 20 items por página
- Los filtros se pueden combinar en las consultas GET
