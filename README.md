# ThreatMap - Plataforma de Visualización de Amenazas

Plataforma web para mapear, categorizar y visualizar amenazas, vulnerabilidades y riesgos de seguridad en infraestructuras, con análisis de superficie de ataque.

## 🎯 Características Principales

- ✅ Registro y categorización de amenazas por tipo y severidad
- ✅ Calculadora de riesgo (probabilidad × impacto)
- ✅ Visualización gráfica de superficie de ataque
- ✅ Sistema de alertas en tiempo real
- ✅ Matriz de riesgos interactiva
- ✅ Exportación de informes en PDF

## 🛠️ Stack Tecnológico

### Frontend
- React 18+
- D3.js (visualizaciones complejas)
- Recharts (dashboards)
- Tailwind CSS
- Vite

### Backend
- Node.js + Express
- MySQL 8.0+
- Sequelize ORM
- Socket.io (alertas en tiempo real)
- JWT Authentication

## 📁 Estructura del Proyecto

```
threatmap/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── config/            # Configuraciones (DB, JWT, etc.)
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Rutas de API
│   │   ├── middleware/        # Middleware (auth, validation)
│   │   ├── services/          # Servicios (email, alerts, PDF)
│   │   ├── utils/             # Utilidades
│   │   ├── validators/        # Validaciones
│   │   └── server.js          # Punto de entrada
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── common/       # Componentes reutilizables
│   │   │   ├── threats/      # Gestión de amenazas
│   │   │   ├── vulnerabilities/  # Gestión de vulnerabilidades
│   │   │   ├── risks/        # Análisis de riesgos
│   │   │   ├── attackSurface/    # Superficie de ataque
│   │   │   ├── dashboard/    # Panel principal
│   │   │   └── reports/      # Informes y reportes
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # Servicios API
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Context API
│   │   ├── utils/            # Utilidades
│   │   ├── assets/           # Recursos estáticos
│   │   ├── App.jsx           # Componente raíz
│   │   └── main.jsx          # Punto de entrada
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── database/                   # Scripts de base de datos
│   └── schema.sql             # (Se creará después)
│
└── docs/                      # Documentación
    └── API.md                 # (Se creará después)
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd threatmap
```

2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
```

3. Configurar Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend
```

4. Configurar Base de Datos
```bash
# Crear base de datos en MySQL
mysql -u root -p < database/schema.sql
```

### Ejecución

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📊 Módulos Principales

### 1. Gestión de Amenazas
- Registro de amenazas
- Categorización por tipo
- Clasificación por severidad
- Búsqueda y filtrado

### 2. Gestión de Vulnerabilidades
- Catálogo de vulnerabilidades
- Asociación con amenazas
- Scoring CVSS

### 3. Análisis de Riesgos
- Calculadora de riesgo
- Matriz de riesgos interactiva
- Priorización automática

### 4. Superficie de Ataque
- Mapeo de infraestructura
- Visualización de puntos de entrada
- Análisis de exposición

### 5. Sistema de Alertas
- Alertas en tiempo real
- Notificaciones por email
- Niveles configurables

### 6. Reportes
- Generación de informes PDF
- Exportación de datos
- Gráficos y métricas

## 📝 Licencia

MIT

## 👥 Autor

Proyecto desarrollado para gestión de riesgos y amenazas de ciberseguridad.
