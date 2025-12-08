# Arquitectura ThreatMap

## 📐 Diseño de la Arquitectura

### Patrón: Arquitectura de 3 Capas (Three-Tier Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│                      (Frontend - React)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │Dashboard │  │ Threats  │  │  Risks   │  │ Reports ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│       │              │              │            │      │
│       └──────────────┴──────────────┴────────────┘      │
│                          │                              │
│                    API REST Client                      │
└──────────────────────────┼──────────────────────────────┘
                           │
                    HTTP/WebSocket
                           │
┌──────────────────────────┼──────────────────────────────┐
│                    CAPA DE LÓGICA                        │
│                  (Backend - Node.js/Express)             │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Auth   │  │  Threats │  │   Risk   │  │  Alerts  ││
│  │Controller  │Controller│  │Calculator│  │  Service ││
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘│
│       │              │              │            │      │
│       └──────────────┴──────────────┴────────────┘      │
│                          │                              │
│                    Sequelize ORM                        │
└──────────────────────────┼──────────────────────────────┘
                           │
                      SQL Queries
                           │
┌──────────────────────────┼──────────────────────────────┐
│                    CAPA DE DATOS                         │
│                      (MySQL Database)                    │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Users   │  │ Threats  │  │  Risks   │  │ Alerts  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🗂️ Estructura de Componentes

### Frontend (React)

#### Componentes por Módulo:

**1. Common (Componentes Reutilizables)**
```
components/common/
├── Button.jsx              # Botones personalizados
├── Card.jsx                # Tarjetas de contenido
├── Modal.jsx               # Ventanas modales
├── Table.jsx               # Tablas de datos
├── Sidebar.jsx             # Barra lateral de navegación
├── Navbar.jsx              # Barra de navegación superior
├── Loader.jsx              # Indicadores de carga
├── Badge.jsx               # Etiquetas de severidad/estado
└── Alert.jsx               # Alertas y notificaciones
```

**2. Dashboard**
```
components/dashboard/
├── DashboardLayout.jsx     # Layout principal del dashboard
├── StatsCard.jsx           # Tarjetas de estadísticas
├── ThreatOverview.jsx      # Resumen de amenazas
├── RiskMetrics.jsx         # Métricas de riesgo
├── RecentAlerts.jsx        # Alertas recientes
└── QuickActions.jsx        # Acciones rápidas
```

**3. Threats (Amenazas)**
```
components/threats/
├── ThreatList.jsx          # Lista de amenazas
├── ThreatForm.jsx          # Formulario crear/editar amenaza
├── ThreatDetail.jsx        # Detalle de amenaza
├── ThreatFilter.jsx        # Filtros de búsqueda
├── ThreatCard.jsx          # Tarjeta individual de amenaza
└── ThreatCategories.jsx    # Selector de categorías
```

**4. Vulnerabilities (Vulnerabilidades)**
```
components/vulnerabilities/
├── VulnerabilityList.jsx   # Lista de vulnerabilidades
├── VulnerabilityForm.jsx   # Formulario crear/editar
├── VulnerabilityDetail.jsx # Detalle de vulnerabilidad
├── CVSSCalculator.jsx      # Calculadora CVSS
└── VulnerabilityCard.jsx   # Tarjeta individual
```

**5. Risks (Riesgos)**
```
components/risks/
├── RiskMatrix.jsx          # Matriz de riesgos (D3.js)
├── RiskCalculator.jsx      # Calculadora de riesgo
├── RiskList.jsx            # Lista de riesgos
├── RiskDetail.jsx          # Detalle de riesgo
└── RiskChart.jsx           # Gráficos de riesgo (Recharts)
```

**6. Attack Surface (Superficie de Ataque)**
```
components/attackSurface/
├── NetworkGraph.jsx        # Grafo de red (D3.js)
├── AssetMap.jsx            # Mapa de activos
├── EntryPoints.jsx         # Puntos de entrada
├── ExposureAnalysis.jsx    # Análisis de exposición
└── TopologyView.jsx        # Vista de topología
```

**7. Reports (Reportes)**
```
components/reports/
├── ReportGenerator.jsx     # Generador de informes
├── PDFExport.jsx           # Exportación a PDF
├── ReportTemplate.jsx      # Plantilla de reporte
├── ReportPreview.jsx       # Vista previa
└── ReportHistory.jsx       # Historial de reportes
```

### Backend (Node.js/Express)

#### Estructura de Archivos:

**1. Config (Configuración)**
```
config/
├── database.js             # Configuración de MySQL/Sequelize
├── jwt.js                  # Configuración de JWT
├── email.js                # Configuración de email
└── logger.js               # Configuración de Winston logger
```

**2. Models (Modelos de Datos)**
```
models/
├── User.js                 # Modelo de usuarios
├── Threat.js               # Modelo de amenazas
├── Vulnerability.js        # Modelo de vulnerabilidades
├── Risk.js                 # Modelo de riesgos
├── Asset.js                # Modelo de activos
├── Alert.js                # Modelo de alertas
└── Report.js               # Modelo de reportes
```

**3. Controllers (Controladores)**
```
controllers/
├── authController.js       # Autenticación y autorización
├── threatController.js     # CRUD de amenazas
├── vulnerabilityController.js  # CRUD de vulnerabilidades
├── riskController.js       # Gestión de riesgos
├── assetController.js      # Gestión de activos
├── alertController.js      # Sistema de alertas
└── reportController.js     # Generación de reportes
```

**4. Routes (Rutas)**
```
routes/
├── index.js                # Rutas principales
├── auth.js                 # Rutas de autenticación
├── threats.js              # Rutas de amenazas
├── vulnerabilities.js      # Rutas de vulnerabilidades
├── risks.js                # Rutas de riesgos
├── assets.js               # Rutas de activos
├── alerts.js               # Rutas de alertas
└── reports.js              # Rutas de reportes
```

**5. Services (Servicios)**
```
services/
├── riskCalculator.js       # Lógica de cálculo de riesgo
├── emailService.js         # Envío de emails
├── pdfService.js           # Generación de PDFs
├── alertService.js         # Sistema de alertas
└── cronJobs.js             # Tareas programadas
```

**6. Middleware**
```
middleware/
├── auth.js                 # Verificación de JWT
├── errorHandler.js         # Manejo de errores
├── validation.js           # Validación de datos
└── rateLimiter.js          # Limitación de peticiones
```

**7. Validators**
```
validators/
├── threatValidator.js      # Validaciones de amenazas
├── riskValidator.js        # Validaciones de riesgos
└── userValidator.js        # Validaciones de usuarios
```

**8. Utils (Utilidades)**
```
utils/
├── helpers.js              # Funciones auxiliares
├── constants.js            # Constantes de la aplicación
└── responseFormatter.js    # Formato de respuestas
```

## 🔄 Flujo de Datos

### Ejemplo: Crear una Amenaza

```
1. Usuario → Frontend
   │
   ├─ Completa formulario en ThreatForm.jsx
   │
2. Frontend → Backend
   │
   ├─ POST /api/v1/threats
   ├─ Headers: { Authorization: "Bearer <token>" }
   ├─ Body: { name, type, severity, description }
   │
3. Backend → Middleware
   │
   ├─ auth.js: Verifica JWT
   ├─ threatValidator.js: Valida datos
   │
4. Backend → Controller
   │
   ├─ threatController.create()
   │
5. Controller → Service
   │
   ├─ Calcula riesgo inicial (riskCalculator.js)
   ├─ Verifica si genera alerta (alertService.js)
   │
6. Service → Database
   │
   ├─ Threat.create() - Sequelize ORM
   ├─ INSERT INTO threats...
   │
7. Database → Service → Controller
   │
   ├─ Retorna amenaza creada
   │
8. Controller → Frontend
   │
   ├─ Response: { success: true, data: { threat } }
   │
9. Frontend → Usuario
   │
   └─ Actualiza ThreatList.jsx
   └─ Muestra notificación de éxito
```

## 🔐 Seguridad

### Medidas Implementadas:

1. **Autenticación JWT**: Tokens seguros para sesiones
2. **Bcrypt**: Hash de contraseñas
3. **Helmet**: Headers de seguridad HTTP
4. **CORS**: Control de acceso entre orígenes
5. **Rate Limiting**: Prevención de ataques por fuerza bruta
6. **Validación**: Express-validator en todas las entradas
7. **SQL Injection**: Prevención con Sequelize ORM

## 📡 API REST

### Endpoints Principales:

```
/api/v1/
├── /auth
│   ├── POST /register          # Registro de usuario
│   ├── POST /login             # Inicio de sesión
│   └── GET /profile            # Perfil de usuario
│
├── /threats
│   ├── GET /                   # Listar amenazas
│   ├── POST /                  # Crear amenaza
│   ├── GET /:id                # Obtener amenaza
│   ├── PUT /:id                # Actualizar amenaza
│   └── DELETE /:id             # Eliminar amenaza
│
├── /vulnerabilities
│   ├── GET /                   # Listar vulnerabilidades
│   ├── POST /                  # Crear vulnerabilidad
│   └── ...
│
├── /risks
│   ├── GET /                   # Listar riesgos
│   ├── POST /calculate         # Calcular riesgo
│   ├── GET /matrix             # Obtener matriz de riesgos
│   └── ...
│
├── /assets
│   ├── GET /                   # Listar activos
│   ├── GET /attack-surface     # Obtener superficie de ataque
│   └── ...
│
├── /alerts
│   ├── GET /                   # Listar alertas
│   └── PUT /:id/acknowledge    # Marcar como leída
│
└── /reports
    ├── GET /                   # Listar reportes
    ├── POST /generate          # Generar reporte
    └── GET /:id/download       # Descargar PDF
```

## 🎨 Visualizaciones

### Tecnologías por Tipo:

**D3.js** (Visualizaciones Complejas):
- Matriz de riesgos interactiva
- Grafo de superficie de ataque
- Network topology
- Relaciones amenaza-vulnerabilidad

**Recharts** (Dashboards):
- Gráficos de barras (amenazas por tipo)
- Gráficos de líneas (tendencias)
- Gráficos de pie (distribución de severidad)
- Indicadores de KPIs

## 🚀 Próximos Pasos

1. ✅ Arquitectura creada
2. ⏭️ Diseñar esquema de base de datos
3. ⏭️ Implementar modelos Sequelize
4. ⏭️ Crear controladores y rutas
5. ⏭️ Desarrollar componentes React
6. ⏭️ Implementar visualizaciones D3.js
7. ⏭️ Sistema de alertas en tiempo real
8. ⏭️ Generación de PDFs
