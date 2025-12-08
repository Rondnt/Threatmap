# ThreatMap - Instrucciones Técnicas

## Comandos para Ejecutar la Aplicación

### Backend (Puerto 5000)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Puerto 3001)
```bash
cd frontend
npm install
npm run dev
```

### Base de Datos
- **Motor**: MariaDB/MySQL
- **Nombre BD**: threatmap_db
- **Usuario**: root
- **Password**: (vacío)
- **Puerto**: 3306

---

## Arquitectura del Sistema

### Backend (Node.js + Express)

#### Estructura de Carpetas
```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, logger)
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos de datos (Sequelize)
│   ├── routes/          # Rutas API REST
│   ├── middleware/      # Autenticación, validación, errores
│   └── server.js        # Punto de entrada
```

#### Tecnologías Backend
- **Express.js**: Framework web
- **Sequelize**: ORM para MySQL/MariaDB
- **JWT**: Autenticación con tokens
- **bcryptjs**: Hash de contraseñas
- **cors**: Control de acceso entre dominios
- **helmet**: Seguridad HTTP headers
- **morgan**: Logging de peticiones
- **winston**: Sistema de logs

#### Modelos de Datos (Sequelize)

**User (Usuario)**
- id, username, email, password (hasheado)
- role: admin | analyst | viewer
- is_active, last_login

**Threat (Amenaza)**
- id, name, description, type, severity
- status: active | mitigated | monitoring | closed
- probability (0-1), impact (1-10), risk_score
- mitigation_strategy, detected_at, mitigated_at
- user_id (relación con Usuario)

**Vulnerability (Vulnerabilidad)**
- id, cve_id, name, description, severity
- cvss_score (0-10), cvss_vector
- affected_systems, status, exploit_available
- patch_available, patch_url
- discovered_at, patched_at
- user_id (relación con Usuario)

**Risk (Riesgo)**
- id, name, description, category
- probability, impact, risk_score, risk_level
- status, treatment_strategy
- treatment_plan, residual_probability, residual_impact
- threat_id, vulnerability_id, user_id (relaciones)

**Asset (Activo)**
- id, name, type, description
- ip_address, hostname, os, location
- criticality: critical | high | medium | low
- exposure_level: public | dmz | internal | isolated
- is_public_facing, ports_open, services
- vulnerabilities_count, threats_count
- position_x, position_y (para visualización D3.js)
- connections (JSON de IDs conectados)
- tags, owner, notes, status
- user_id (relación con Usuario)

#### API Endpoints

**Autenticación** (`/api/v1/auth`)
- POST `/register` - Registro de usuarios
- POST `/login` - Inicio de sesión (retorna JWT)

**Amenazas** (`/api/v1/threats`)
- GET `/` - Listar amenazas (paginado)
- GET `/statistics` - Estadísticas de amenazas
- GET `/:id` - Obtener amenaza por ID
- POST `/` - Crear amenaza
- PUT `/:id` - Actualizar amenaza
- DELETE `/:id` - Eliminar amenaza

**Vulnerabilidades** (`/api/v1/vulnerabilities`)
- GET `/` - Listar vulnerabilidades (paginado)
- GET `/statistics` - Estadísticas de vulnerabilidades
- GET `/:id` - Obtener vulnerabilidad por ID
- POST `/` - Crear vulnerabilidad
- PUT `/:id` - Actualizar vulnerabilidad
- DELETE `/:id` - Eliminar vulnerabilidad

**Riesgos** (`/api/v1/risks`)
- GET `/` - Listar riesgos (paginado)
- GET `/statistics` - Estadísticas de riesgos
- GET `/matrix` - Datos para matriz de riesgos
- GET `/:id` - Obtener riesgo por ID
- POST `/` - Crear riesgo
- PUT `/:id` - Actualizar riesgo
- DELETE `/:id` - Eliminar riesgo

**Activos** (`/api/v1/assets`)
- GET `/` - Listar activos (paginado)
- GET `/statistics` - Estadísticas de activos
- GET `/topology` - Topología de red para D3.js
- GET `/:id` - Obtener activo por ID
- POST `/` - Crear activo
- PUT `/:id` - Actualizar activo
- PATCH `/:id/position` - Actualizar posición en topología
- DELETE `/:id` - Eliminar activo

#### Middleware

**auth.js**
- `protect`: Verifica token JWT en headers
- Extrae usuario y lo adjunta a req.user
- Valida que el token no esté expirado

**errorHandler.js**
- `errorHandler`: Manejo centralizado de errores
- `notFoundHandler`: Manejo de rutas no encontradas
- Retorna respuestas JSON con estructura consistente

#### Configuración (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=threatmap_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3001
```

---

### Frontend (React + Vite)

#### Estructura de Carpetas
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Navbar, Sidebar, PrivateRoute
│   │   ├── dashboard/        # StatCard, RecentActivity, ThreatChart
│   │   ├── threats/          # ThreatForm, ThreatList
│   │   ├── vulnerabilities/  # VulnerabilityForm, VulnerabilityList
│   │   ├── risks/            # RiskForm, RiskList
│   │   └── attackSurface/    # AssetForm, NetworkTopology
│   ├── context/
│   │   └── AuthContext.jsx   # Manejo de autenticación global
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Threats.jsx
│   │   ├── Vulnerabilities.jsx
│   │   ├── Risks.jsx
│   │   ├── RiskMatrix.jsx
│   │   └── AttackSurface.jsx
│   ├── services/
│   │   ├── api.js            # Cliente Axios configurado
│   │   ├── threatService.js
│   │   ├── vulnerabilityService.js
│   │   ├── riskService.js
│   │   └── assetService.js
│   └── App.jsx               # Rutas y configuración principal
```

#### Tecnologías Frontend
- **React 18**: Biblioteca UI
- **Vite**: Bundler ultra-rápido
- **React Router v6**: Navegación SPA
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Estilos utility-first
- **React Icons**: Iconos (Font Awesome)
- **React Toastify**: Notificaciones toast
- **D3.js**: Visualización de datos interactiva
- **Recharts**: Gráficos estadísticos

#### Componentes Principales

**AuthContext**
- Manejo de estado de autenticación global
- Login/Logout
- Almacena token en localStorage
- Protege rutas privadas

**Navbar**
- Barra superior con título de aplicación
- Información de usuario (username, role)
- Botón de logout
- Toggle del sidebar

**Sidebar**
- Menú lateral de navegación
- Links a: Dashboard, Amenazas, Vulnerabilidades, Riesgos, Matriz de Riesgos, Superficie de Ataque
- Resaltado de ruta activa

**Dashboard**
- Tarjetas de estadísticas (StatCard)
- Gráficos de distribución (ThreatChart con Recharts)
- Actividad reciente (RecentActivity)

**ThreatForm / ThreatList**
- Formulario para crear/editar amenazas
- Lista paginada con filtros por severity y status
- Modal para edición
- Confirmación de eliminación

**VulnerabilityForm / VulnerabilityList**
- Formulario para vulnerabilidades (CVE, CVSS, patches)
- Lista con filtros
- Indicadores de exploit/patch disponible

**RiskForm / RiskList**
- Formulario con cálculo automático de risk_score
- Selección de amenaza y vulnerabilidad asociada
- Estrategia de tratamiento
- Cálculo de riesgo residual

**RiskMatrix**
- Matriz 5x5 de probabilidad vs impacto
- Riesgos visualizados en cuadrantes
- Colores por severidad (crítico, alto, medio, bajo)
- Filtros por categoría y status

**NetworkTopology (D3.js)**
- Grafo de fuerza dirigido
- Nodos: Activos coloreados por criticality
- Tamaño de nodo: Según número de vulnerabilidades
- Borde de nodo: Rojo si es public-facing
- Links: Conexiones entre activos
- Zoom y pan interactivo
- Drag & drop con persistencia de posición
- Tooltips con información del activo
- Badges de vulnerabilidades

**AssetForm**
- Formulario completo para activos
- 13 tipos de activos (server, workstation, database, etc.)
- Campos de red (IP, hostname, puertos, servicios)
- Nivel de exposición y criticidad
- Tags y conexiones
- Owner y notas

#### Servicios API

**api.js**
- Cliente Axios base configurado
- baseURL: http://localhost:5000/api/v1
- Interceptor de request: Agrega token JWT
- Interceptor de response: Manejo de errores 401/403

**Servicios por módulo**
- Cada servicio (threat, vulnerability, risk, asset) tiene:
  - getAll(params): Lista con paginación
  - getById(id): Detalle
  - create(data): Crear
  - update(id, data): Actualizar
  - delete(id): Eliminar
  - getStatistics(): Estadísticas
  - Métodos específicos (getTopology, getMatrix, etc.)

#### Rutas (React Router)

**Rutas Públicas**
- `/login` - Página de inicio de sesión
- `/register` - Página de registro

**Rutas Privadas** (requieren autenticación)
- `/` - Redirect a /dashboard
- `/dashboard` - Dashboard principal
- `/threats` - Gestión de amenazas
- `/vulnerabilities` - Gestión de vulnerabilidades
- `/risks` - Gestión de riesgos
- `/risk-matrix` - Matriz de riesgos visual
- `/attack-surface` - Superficie de ataque con topología

---

## Flujo de Datos

### Autenticación
1. Usuario ingresa credenciales en Login
2. Frontend envía POST a `/api/v1/auth/login`
3. Backend valida con bcrypt
4. Backend genera JWT con payload {userId, username, role}
5. Frontend guarda token en localStorage
6. Todas las peticiones incluyen token en header: `Authorization: Bearer <token>`

### Operaciones CRUD
1. Usuario interactúa con formulario (create/update)
2. Frontend valida datos
3. Frontend envía petición API con token
4. Backend verifica token (middleware auth)
5. Backend valida datos
6. Backend ejecuta operación en DB con Sequelize
7. Backend retorna respuesta JSON estructurada
8. Frontend actualiza UI y muestra toast de confirmación

### Visualización D3.js
1. Frontend solicita `/api/v1/assets/topology`
2. Backend construye estructura {nodes, links}
3. Frontend recibe datos
4. D3.js crea simulación de fuerzas
5. Usuario puede arrastrar nodos
6. Al soltar, frontend envía PATCH `/api/v1/assets/:id/position`
7. Backend guarda position_x, position_y en DB

---

## Seguridad Implementada

### Backend
- Passwords hasheados con bcryptjs (10 rounds)
- JWT con expiración de 7 días
- Helmet para headers de seguridad HTTP
- CORS configurado para origen específico
- Validación de entrada en controladores
- Manejo de errores centralizado
- SQL injection prevenido (Sequelize ORM)

### Frontend
- Rutas protegidas con PrivateRoute
- Token validado en cada petición
- Logout al detectar 401/403
- Validación de formularios
- Sanitización de inputs

---

## Base de Datos

### Relaciones
- User 1:N Threat (un usuario tiene muchas amenazas)
- User 1:N Vulnerability
- User 1:N Risk
- User 1:N Asset
- Threat 1:N Risk (una amenaza puede estar en múltiples riesgos)
- Vulnerability 1:N Risk

### Índices
- Primary keys (id) en todas las tablas
- Unique index en User.username, User.email
- Unique index en Vulnerability.cve_id
- Index en Asset.exposure_level
- Index en Asset.status

### Sincronización
- Sequelize.sync() en desarrollo
- alter: false para evitar cambios accidentales
- Migrations recomendadas para producción

---

## Próximas Funcionalidades (No Implementadas)

1. **Sistema de Alertas en Tiempo Real**
   - Modelo Alert ya definido
   - Pendiente: Email notifications, WebSocket para real-time

2. **Exportación de Reportes PDF**
   - Modelo Report ya definido
   - Pendiente: Generación PDF con puppeteer/pdfkit

3. **Visualizaciones Avanzadas**
   - Dashboard con más métricas
   - Tendencias temporales
   - Correlaciones entre amenazas y vulnerabilidades

---

## Credenciales de Prueba

**Usuario Admin**
- Username: admin
- Password: admin123
- Role: admin

(Crear usuario mediante registro o directamente en BD)

---

## Notas Importantes

- El frontend corre en puerto 3001 (no 3000) porque ese puerto estaba ocupado
- CORS_ORIGIN debe coincidir con el puerto del frontend
- La base de datos debe existir previamente: `CREATE DATABASE threatmap_db;`
- Todos los datos están aislados por usuario (user_id)
- El cálculo de risk_score es: `probability * impact * 10`
- Los gráficos D3.js requieren datos en formato específico {nodes, links}


-------------------------------------

Buena pregunta. Déjame explicarte qué pasa cuando apagas tu laptop y qué hacer si el puerto 3001 queda ocupado:
¿Qué pasa al apagar la laptop?
Cuando apagas tu laptop normalmente (shutdown o reinicio):
✅ Todos los procesos de Node.js se terminan automáticamente
✅ Los puertos 3000, 3001, 5000, etc. quedan libres
✅ Al reiniciar, puedes usar cualquier puerto sin problema
¿Cuándo se queda un puerto ocupado?
El puerto se queda ocupado cuando:
❌ Cierras la terminal bruscamente sin detener el proceso (Ctrl+C)
❌ El sistema se congela y tienes que forzar el apagado
❌ Hay un proceso "zombie" que no se terminó correctamente
Solución: Comandos para liberar puertos
Si al iniciar el frontend/backend ves un error como:
Error: listen EADDRINUSE: address already in use :::3001
Usa estos comandos según el puerto ocupado:
Para liberar el puerto 3001 (Frontend):
# Ver qué proceso usa el puerto 3001
netstat -ano | findstr :3001

# Resultado ejemplo:
# TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       12345
#                                                                       ^^^^^ (este es el PID)

# Matar el proceso (reemplaza 12345 con el PID real)
powershell -Command "Stop-Process -Id 12345 -Force"
Para liberar el puerto 5000 (Backend):
# Ver qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Matar el proceso
powershell -Command "Stop-Process -Id <PID> -Force"
Para liberar el puerto 3000 (si vuelve a aparecer):
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso
powershell -Command "Stop-Process -Id <PID> -Force"
Script completo para liberar todos los puertos
Puedes crear un archivo limpiar_puertos.bat en la raíz del proyecto con este contenido:
@echo off
echo Liberando puertos de ThreatMap...
echo.

echo Buscando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Matando proceso %%a en puerto 3000
        taskkill /F /PID %%a 2>nul
    )
)

echo Buscando procesos en puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo Matando proceso %%a en puerto 3001
        taskkill /F /PID %%a 2>nul
    )
)

echo Buscando procesos en puerto 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="0" (
        echo Matando proceso %%a en puerto 5000
        taskkill /F /PID %%a 2>nul
    )
)

echo.
echo Puertos liberados!
pause
Cuando tengas problemas de puertos, solo ejecuta limpiar_puertos.bat y liberará todos los puertos automáticamente.
Mejor práctica: Detener correctamente los servidores
Para evitar problemas de puertos:
Siempre detén los servidores con Ctrl + C en la terminal
No cierres la terminal directamente sin detener el proceso
Si cierras Visual Studio Code, asegúrate de que no haya procesos corriendo
Resumen rápido
Situación normal (apagar/reiniciar laptop):
No hay problema, los puertos quedan libres automáticamente
Si encuentras error "address already in use":
# 1. Ver qué proceso usa el puerto
netstat -ano | findstr :3001

# 2. Matar el proceso (reemplaza PID_AQUI)
powershell -Command "Stop-Process -Id PID_AQUI -Force"

# 3. Reintentar iniciar tu servidor
cd frontend
npm run dev
¿Quieres que cree el archivo limpiar_puertos.bat para que lo tengas listo?
si crea ese archivo para estar listo e ir practicando para mañana