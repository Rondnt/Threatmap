# 📖 MANUAL DE USUARIO - THREATMAP

## Sistema de Gestión de Amenazas y Riesgos de Ciberseguridad

**Versión:** 1.0
**Fecha:** Diciembre 2024
**Autor:** ThreatMap Development Team

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Instalación de Herramientas Necesarias](#3-instalación-de-herramientas-necesarias)
4. [Configuración de la Base de Datos](#4-configuración-de-la-base-de-datos)
5. [Instalación de ThreatMap](#5-instalación-de-threatmap)
6. [Ejecución de la Aplicación](#6-ejecución-de-la-aplicación)
7. [Guía de Uso de la Aplicación](#7-guía-de-uso-de-la-aplicación)
8. [Solución de Problemas](#8-solución-de-problemas)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)

---

## 1. Introducción

**ThreatMap** es una aplicación web completa para la gestión de amenazas, vulnerabilidades y riesgos de ciberseguridad. Permite a las organizaciones:

- ✅ Registrar y gestionar **amenazas** de seguridad
- ✅ Identificar y rastrear **vulnerabilidades**
- ✅ Evaluar y priorizar **riesgos**
- ✅ Visualizar riesgos en una **matriz 5x5**
- ✅ Generar **reportes en PDF**
- ✅ Recibir **alertas** de riesgos críticos
- ✅ Gestionar **superficie de ataque**

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Hardware

- **Procesador:** Intel Core i3 o superior (recomendado i5)
- **Memoria RAM:** Mínimo 4 GB (recomendado 8 GB)
- **Espacio en Disco:** Mínimo 2 GB disponibles
- **Conexión a Internet:** Requerida para la instalación

### 2.2 Requisitos de Software

- **Sistema Operativo:** Windows 10/11, macOS, o Linux
- **Navegador Web:** Google Chrome, Firefox, Edge o Safari (versión reciente)

---

## 3. Instalación de Herramientas Necesarias

### 3.1 Instalación de Node.js

Node.js es necesario para ejecutar tanto el backend como el frontend de ThreatMap.

#### Pasos:

1. Visita [https://nodejs.org/](https://nodejs.org/)
2. Descarga la versión **LTS (Long Term Support)** recomendada
3. Ejecuta el instalador descargado
4. Sigue el asistente de instalación (acepta los términos y usa las opciones por defecto)
5. **Verifica la instalación:**
   ```bash
   node --version
   npm --version
   ```
   Deberías ver las versiones instaladas (ej: v18.17.0 y 9.6.7)

---

### 3.2 Instalación de XAMPP

XAMPP proporciona el servidor MySQL necesario para la base de datos.

#### Pasos:

1. Visita [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Descarga XAMPP para tu sistema operativo
3. Ejecuta el instalador
4. **Componentes a seleccionar:**
   - ✅ Apache
   - ✅ MySQL
   - ✅ phpMyAdmin
   - ❌ Otros componentes (opcional)
5. Instala en la ruta por defecto: `C:\xampp` (Windows)
6. Al finalizar, inicia **XAMPP Control Panel**

#### Iniciar MySQL:

1. Abre **XAMPP Control Panel**
2. Haz clic en **"Start"** al lado de **MySQL**
3. El texto debe cambiar a verde indicando que está corriendo
4. **Nota:** MySQL debe estar corriendo cada vez que uses ThreatMap

---

### 3.3 Instalación de DBeaver (Opcional pero Recomendado)

DBeaver es una herramienta para visualizar y gestionar la base de datos de forma gráfica.

#### Pasos:

1. Visita [https://dbeaver.io/download/](https://dbeaver.io/download/)
2. Descarga la versión **Community Edition** (gratuita)
3. Ejecuta el instalador y sigue el asistente
4. Abre DBeaver
5. **Crear nueva conexión:**
   - Clic en **"Nueva Conexión"** (ícono de enchufe)
   - Selecciona **MySQL**
   - Configura:
     - **Host:** localhost
     - **Port:** 3306
     - **Database:** threatmap_db
     - **Username:** root
     - **Password:** (dejar en blanco por defecto)
   - Clic en **"Test Connection"** para verificar
   - Clic en **"Finish"**

---

## 4. Configuración de la Base de Datos

### 4.1 Crear la Base de Datos

1. Asegúrate de que **MySQL está corriendo** en XAMPP
2. Abre tu navegador y ve a: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Haz clic en la pestaña **"SQL"** en la parte superior
4. **Copia y ejecuta el siguiente comando:**
   ```sql
   CREATE DATABASE IF NOT EXISTS threatmap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. Haz clic en **"Go"** o **"Continuar"**
6. La base de datos `threatmap_db` debe aparecer en el panel izquierdo

---

### 4.2 Crear las Tablas de la Base de Datos

**⚠️ IMPORTANTE:** Las tablas deben crearse **una por una** en el orden especificado debido a las dependencias entre ellas (claves foráneas).

#### Pasos:

1. Selecciona la base de datos `threatmap_db` en el panel izquierdo
2. Haz clic en la pestaña **"SQL"**
3. **Ejecuta los siguientes scripts EN ORDEN (uno a la vez):**

#### 4.2.1 Tabla de Usuarios (PRIMERO)
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'analyst', 'viewer') DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Haz clic en "Go"**, espera que termine, luego continúa con la siguiente tabla.

---

#### 4.2.2 Tabla de Amenazas
```sql
CREATE TABLE IF NOT EXISTS threats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('malware', 'phishing', 'ransomware', 'ddos', 'insider', 'apt', 'other') DEFAULT 'other',
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  source VARCHAR(255),
  date_identified DATE,
  status ENUM('active', 'mitigated', 'monitoring', 'resolved') DEFAULT 'active',
  probability DECIMAL(3,2) DEFAULT 0.5,
  impact INT DEFAULT 5,
  risk_score DECIMAL(5,2),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

#### 4.2.3 Tabla de Vulnerabilidades
```sql
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cve_id VARCHAR(50),
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  affected_systems TEXT,
  patch_available BOOLEAN DEFAULT FALSE,
  patch_details TEXT,
  discovery_date DATE,
  status ENUM('open', 'in_progress', 'patched', 'accepted_risk') DEFAULT 'open',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

#### 4.2.4 Tabla de Riesgos
```sql
CREATE TABLE IF NOT EXISTS risks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('operational', 'technical', 'compliance', 'financial', 'reputational', 'strategic') DEFAULT 'operational',
  probability DECIMAL(3,2) NOT NULL,
  impact INT NOT NULL,
  risk_score DECIMAL(5,2),
  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  status ENUM('identified', 'assessed', 'treated', 'monitored', 'closed') DEFAULT 'identified',
  treatment_strategy ENUM('avoid', 'mitigate', 'transfer', 'accept') DEFAULT 'mitigate',
  treatment_plan TEXT,
  residual_probability DECIMAL(3,2),
  residual_impact INT,
  residual_risk_score DECIMAL(5,2),
  threat_id INT,
  vulnerability_id INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (threat_id) REFERENCES threats(id) ON DELETE SET NULL,
  FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

#### 4.2.5 Tabla de Alertas
```sql
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('risk', 'threat', 'vulnerability') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'resolved') DEFAULT 'unread',
  entity_id INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

#### 4.2.6 Tabla de Reportes
```sql
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('risk', 'threat', 'vulnerability', 'comprehensive') DEFAULT 'comprehensive',
  format ENUM('pdf', 'csv', 'json') DEFAULT 'pdf',
  file_path VARCHAR(500),
  generated_by INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

#### 4.2.7 Tabla de Superficie de Ataque (ÚLTIMA)
```sql
CREATE TABLE IF NOT EXISTS attack_surfaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('web_application', 'api', 'network', 'mobile_app', 'iot', 'cloud', 'other') DEFAULT 'other',
  exposure_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  ip_addresses TEXT,
  domains TEXT,
  ports TEXT,
  technologies TEXT,
  security_measures TEXT,
  last_scanned DATE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
**Haz clic en "Go"**, espera que termine.

---

### 4.3 Verificar Creación de Tablas

1. En el panel izquierdo de phpMyAdmin, selecciona `threatmap_db`
2. Deberías ver **7 tablas** listadas:
   - users
   - threats
   - vulnerabilities
   - risks
   - alerts
   - reports
   - attack_surfaces

✅ Si ves las 7 tablas, la base de datos está configurada correctamente.

---

## 5. Instalación de ThreatMap

### 5.1 Descargar el Proyecto

1. Descarga el archivo **ZIP** del proyecto ThreatMap
2. **Extrae** el contenido a una carpeta de tu elección
   - Ejemplo Windows: `C:\ThreatMap`
   - Ejemplo macOS/Linux: `/home/usuario/ThreatMap`
3. La estructura debe verse así:
   ```
   ThreatMap/
   ├── backend/
   │   ├── src/
   │   ├── package.json
   │   └── .env
   ├── frontend/
   │   ├── src/
   │   ├── public/
   │   ├── package.json
   │   └── .env
   └── MANUAL_DE_USUARIO.md
   ```

---

### 5.2 Instalar Dependencias del Backend

**⚠️ IMPORTANTE:** Este paso es **OBLIGATORIO**. El archivo ZIP **NO incluye** las dependencias (`node_modules`) porque:
- Son muy pesadas (cientos de MB)
- Pueden causar problemas de compatibilidad entre sistemas
- Es la práctica estándar en desarrollo

#### Pasos:

1. Abre una **Terminal**, **Símbolo del sistema** o **PowerShell**
2. Navega a la carpeta del backend:
   ```bash
   cd C:\ThreatMap\backend
   ```
   *(Ajusta la ruta según donde extrajiste el proyecto)*

3. **Instala todas las dependencias:**
   ```bash
   npm install
   ```

4. Espera a que termine (puede tomar **2-5 minutos**)
5. Verás mensajes indicando la descarga de paquetes
6. Al finalizar, verás la carpeta `node_modules` creada dentro de `backend/`

**Dependencias que se instalarán (automáticamente desde `package.json`):**
- `express` - Framework del servidor web
- `sequelize` - ORM para base de datos
- `mysql2` - Driver de MySQL
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Encriptación de contraseñas
- `pdfkit` - Generación de PDFs
- `cors` - Seguridad CORS
- `dotenv` - Variables de entorno
- Y muchas más...

---

### 5.3 Instalar Dependencias del Frontend

1. En la misma terminal, navega a la carpeta del frontend:
   ```bash
   cd ..\frontend
   ```
   O desde la raíz:
   ```bash
   cd C:\ThreatMap\frontend
   ```

2. **Instala todas las dependencias:**
   ```bash
   npm install
   ```

3. Espera a que termine (puede tomar **3-7 minutos**)
4. Al finalizar, verás la carpeta `node_modules` creada dentro de `frontend/`

**Dependencias que se instalarán:**
- `react` - Librería de UI
- `react-router-dom` - Navegación
- `axios` - Peticiones HTTP
- `tailwindcss` - Framework CSS
- `chart.js` - Gráficos
- `react-chartjs-2` - Gráficos para React
- `react-icons` - Iconos
- `react-toastify` - Notificaciones
- Y muchas más...

---

### 5.4 Configurar Variables de Entorno

#### Backend:

1. En la carpeta `backend/`, verifica que existe el archivo **`.env`**
2. Si **NO existe**, créalo con el siguiente contenido:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=threatmap_db
DB_USER=root
DB_PASSWORD=

# JWT Secret (CAMBIA ESTO EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion_2024

# Server Configuration
PORT=5000
NODE_ENV=development
```

3. **⚠️ IMPORTANTE:** En un entorno de producción, cambia `JWT_SECRET` por una clave aleatoria y segura

---

#### Frontend:

1. En la carpeta `frontend/`, verifica que existe el archivo **`.env`**
2. Si **NO existe**, créalo con el siguiente contenido:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

3. **Nota:** Si cambias el puerto del backend, actualiza esta URL

---

## 6. Ejecución de la Aplicación

### 6.1 Verificar Prerequisitos

Antes de ejecutar ThreatMap, asegúrate de:

- ✅ XAMPP está abierto
- ✅ MySQL está corriendo (verde en XAMPP)
- ✅ La base de datos `threatmap_db` existe
- ✅ Las 7 tablas fueron creadas
- ✅ Las dependencias fueron instaladas (`node_modules` existe en backend y frontend)

---

### 6.2 Iniciar el Backend

1. Abre una **Terminal** o **Símbolo del sistema**
2. Navega a la carpeta del backend:
   ```bash
   cd C:\ThreatMap\backend
   ```

3. **Inicia el servidor backend:**
   ```bash
   npm start
   ```

4. Deberías ver mensajes similares a:
   ```
   Server running on port 5000
   Executing (default): SELECT 1+1 AS result
   Database connected successfully
   ```

5. **⚠️ NO CIERRES ESTA TERMINAL** - El backend debe seguir corriendo

---

### 6.3 Iniciar el Frontend

1. Abre una **NUEVA Terminal** o **Símbolo del sistema** (mantén el backend corriendo)
2. Navega a la carpeta del frontend:
   ```bash
   cd C:\ThreatMap\frontend
   ```

3. **Inicia el servidor frontend:**
   ```bash
   npm start
   ```

4. Espera a que compile (puede tomar **30-60 segundos** la primera vez)
5. Verás mensajes como:
   ```
   Compiled successfully!

   You can now view threatmap in the browser.

   Local:            http://localhost:3000
   On Your Network:  http://192.168.1.100:3000
   ```

6. **Automáticamente se abrirá** tu navegador en [http://localhost:3000](http://localhost:3000)
7. **⚠️ NO CIERRES ESTA TERMINAL** - El frontend debe seguir corriendo

---

### 6.4 Verificar que Todo Funciona

Si todo está correcto, deberías tener:

- ✅ **Terminal 1 (Backend):** Mostrando "Server running on port 5000"
- ✅ **Terminal 2 (Frontend):** Mostrando "Compiled successfully!"
- ✅ **Navegador:** Página de **Login de ThreatMap** en `http://localhost:3000`

---

## 7. Guía de Uso de la Aplicación

### 7.1 Registro e Inicio de Sesión

#### Primer Uso - Registro de Nuevo Usuario:

1. En la página de login, haz clic en **"Registrarse"** o **"Sign Up"**
2. Completa el formulario:
   - **Nombre:** Tu nombre completo
   - **Email:** Tu correo electrónico (debe ser único)
   - **Contraseña:** Mínimo 6 caracteres
   - **Confirmar Contraseña:** Repite la contraseña
3. Haz clic en **"Registrarse"**
4. Si el registro es exitoso, verás un mensaje de confirmación
5. Serás redirigido automáticamente a la página de **Login**

---

#### Inicio de Sesión:

1. Ingresa tu **email** registrado
2. Ingresa tu **contraseña**
3. Haz clic en **"Iniciar Sesión"**
4. Serás redirigido al **Dashboard** principal

---

### 7.2 Dashboard Principal

El Dashboard es la página de inicio que muestra una vista general del sistema:

#### Secciones del Dashboard:

1. **Tarjetas de Estadísticas:**
   - 📊 Total de Riesgos
   - ⚠️ Total de Amenazas
   - 🛡️ Total de Vulnerabilidades
   - 🔔 Alertas Sin Leer

2. **Gráficos Visuales:**
   - **Distribución de Riesgos:** Gráfico de donut mostrando riesgos por nivel (Crítico, Alto, Medio, Bajo)
   - **Amenazas por Categoría:** Gráfico de barras
   - **Estado de Vulnerabilidades:** Gráfico de pastel

3. **Lista de Alertas Recientes:**
   - Últimas 5 alertas críticas
   - Opción de marcar como leída

---

### 7.3 Gestión de Amenazas

#### Ver Lista de Amenazas:

1. En el **menú lateral izquierdo**, haz clic en **"Amenazas"**
2. Verás una tabla con todas las amenazas registradas mostrando:
   - Nombre
   - Categoría (Malware, Phishing, Ransomware, DDoS, etc.)
   - Severidad (Baja, Media, Alta, Crítica)
   - Estado (Activa, Mitigada, En Monitoreo, Resuelta)
   - Fecha de identificación
   - Acciones (Ver, Editar, Eliminar)

#### Filtrar Amenazas:

- Usa los filtros en la parte superior para buscar por:
  - Categoría
  - Severidad
  - Estado

---

#### Crear Nueva Amenaza:

1. Haz clic en el botón **"+ Nueva Amenaza"** (esquina superior derecha)
2. Se abrirá un formulario modal
3. **Completa los campos:**

   - **Nombre:** Nombre descriptivo de la amenaza
     - Ejemplo: *"Campaña de Phishing dirigida a empleados"*

   - **Descripción:** Detalles completos de la amenaza
     - Ejemplo: *"Emails fraudulentos suplantando al departamento de RRHH solicitando credenciales"*

   - **Categoría:** Selecciona del dropdown
     - Opciones: Malware, Phishing, Ransomware, DDoS, Insider Threat, APT, Otro

   - **Severidad:** Nivel de gravedad
     - Opciones: Baja, Media, Alta, Crítica

   - **Fuente:** De dónde proviene la información
     - Ejemplo: *"Reporte de usuario", "Análisis de logs", "Threat Intelligence Feed"*

   - **Fecha Identificada:** Cuándo se detectó

   - **Estado:** Estado actual
     - Opciones: Activa, Mitigada, En Monitoreo, Resuelta

   - **Probabilidad (0-1):** Probabilidad de que ocurra
     - Ejemplo: `0.7` = 70% de probabilidad
     - Escala: 0.0 (imposible) a 1.0 (certeza)

   - **Impacto (1-10):** Nivel de impacto si se materializa
     - Ejemplo: `8` = Impacto muy alto
     - Escala: 1 (mínimo) a 10 (catastrófico)

4. El sistema **calcula automáticamente** el **Risk Score:**
   - Fórmula: `Probabilidad × Impacto × 10`
   - Ejemplo: `0.7 × 8 × 10 = 56.00`

5. Haz clic en **"Crear Amenaza"**
6. Verás una notificación de éxito
7. La amenaza aparecerá en la tabla

---

#### Editar Amenaza:

1. En la tabla de amenazas, localiza la amenaza a editar
2. Haz clic en el ícono de **lápiz** (✏️) en la columna "Acciones"
3. Se abrirá el formulario con los datos actuales
4. Modifica los campos necesarios
5. Haz clic en **"Actualizar Amenaza"**

---

#### Eliminar Amenaza:

1. En la tabla, haz clic en el ícono de **basura** (🗑️)
2. Aparecerá un mensaje de confirmación
3. Haz clic en **"Confirmar"**
4. La amenaza será eliminada permanentemente

---

### 7.4 Gestión de Vulnerabilidades

#### Ver Lista de Vulnerabilidades:

1. En el menú lateral, haz clic en **"Vulnerabilidades"**
2. Verás todas las vulnerabilidades registradas con:
   - Nombre
   - CVE ID (si aplica)
   - Severidad
   - Sistemas afectados
   - Disponibilidad de parche
   - Estado
   - Acciones

---

#### Crear Nueva Vulnerabilidad:

1. Haz clic en **"+ Nueva Vulnerabilidad"**
2. **Completa el formulario:**

   - **Nombre:** Nombre de la vulnerabilidad
     - Ejemplo: *"SQL Injection en formulario de login"*

   - **Descripción:** Detalles técnicos
     - Ejemplo: *"Falta de sanitización de inputs permite inyección SQL"*

   - **CVE ID:** Código CVE (opcional)
     - Ejemplo: `CVE-2024-12345`
     - Si no tiene CVE oficial, dejar vacío

   - **Severidad:** Nivel de gravedad
     - Opciones: Baja, Media, Alta, Crítica

   - **Sistemas Afectados:** Qué sistemas/aplicaciones están vulnerables
     - Ejemplo: *"Aplicación web principal - Servidor Apache 2.4.48"*

   - **Parche Disponible:** Selecciona Sí o No

   - **Detalles del Parche:** Información de remediación
     - Ejemplo: *"Actualizar a Apache 2.4.50 o aplicar configuración WAF"*

   - **Fecha de Descubrimiento:** Cuándo se descubrió

   - **Estado:** Estado actual
     - Opciones:
       - **Abierta** (Open): Recién identificada, sin acciones
       - **En Progreso** (In Progress): Se está trabajando en la solución
       - **Parcheada** (Patched): Ya fue solucionada
       - **Riesgo Aceptado** (Accepted Risk): Se decidió no remediar

3. Haz clic en **"Crear Vulnerabilidad"**

---

#### Editar y Eliminar:

- Similar al proceso de amenazas
- Usa los íconos de editar (✏️) y eliminar (🗑️)

---

### 7.5 Gestión de Riesgos

Los riesgos son la combinación de amenazas y vulnerabilidades evaluadas.

#### Ver Lista de Riesgos:

1. En el menú lateral, haz clic en **"Riesgos"**
2. Verás todos los riesgos con:
   - Nombre
   - Categoría
   - Probabilidad (%)
   - Impacto (escala 1-10)
   - Score (calculado)
   - Nivel de Riesgo (badge de color)
   - Acciones

---

#### Crear Nuevo Riesgo:

1. Haz clic en **"+ Nuevo Riesgo"**
2. **Completa el formulario:**

   - **Nombre del Riesgo:** Descripción clara
     - Ejemplo: *"Pérdida de datos sensibles de clientes"*

   - **Descripción:** Detalles del riesgo
     - Ejemplo: *"Exposición de base de datos con información PII de 10,000 clientes"*

   - **Categoría:** Tipo de riesgo
     - Opciones:
       - **Operacional:** Fallas en procesos operativos
       - **Técnico:** Vulnerabilidades tecnológicas
       - **Cumplimiento:** Incumplimiento regulatorio
       - **Financiero:** Pérdidas económicas
       - **Reputacional:** Daño a la imagen
       - **Estratégico:** Objetivos de negocio

   - **Responsable:** Persona/departamento responsable
     - Ejemplo: *"CISO - Juan Pérez"*

   - **Probabilidad (0-1):** Probabilidad de ocurrencia
     - Ejemplo: `0.3` = 30% de probabilidad

   - **Impacto (1-10):** Magnitud del impacto
     - Ejemplo: `7` = Impacto alto

3. **El sistema calcula automáticamente:**
   - **Score = Probabilidad × Impacto × 10**
   - Ejemplo: `0.3 × 7 × 10 = 21.00`

   - **Nivel de Riesgo:**
     - 🟢 **Bajo:** Score < 15
     - 🟡 **Medio:** Score 15-29
     - 🟠 **Alto:** Score 30-49
     - 🔴 **Crítico:** Score ≥ 50

4. **Plan de Mitigación:** Describe las acciones a tomar
   - Ejemplo: *"Implementar cifrado de base de datos, auditorías trimestrales, capacitación al personal"*

5. Haz clic en **"Crear Riesgo"**

---

#### Ejemplo Práctico de Cálculo:

| Probabilidad | Impacto | Score | Nivel |
|--------------|---------|-------|-------|
| 0.2 (20%) | 4 | 8.00 | 🟢 Bajo |
| 0.3 (30%) | 6 | 18.00 | 🟡 Medio |
| 0.6 (60%) | 6 | 36.00 | 🟠 Alto |
| 0.8 (80%) | 8 | 64.00 | 🔴 Crítico |

---

### 7.6 Matriz de Riesgos

La **Matriz de Riesgos 5×5** es una visualización profesional que mapea riesgos según Probabilidad vs Impacto.

#### Acceder a la Matriz:

1. En el menú lateral, haz clic en **"Matriz de Riesgos"**

---

#### Componentes de la Matriz:

1. **Tarjetas de Estadísticas:**
   - Total de Riesgos
   - Riesgos Críticos
   - Riesgos Altos
   - Riesgos Medios
   - Riesgos Bajos

2. **Matriz 5×5:**
   - **Eje X (Horizontal):** Probabilidad (1-5)
     - 1 = Muy Baja (0-20%)
     - 2 = Baja (20-40%)
     - 3 = Media (40-60%)
     - 4 = Alta (60-80%)
     - 5 = Muy Alta (80-100%)

   - **Eje Y (Vertical):** Impacto (1-5)
     - 1 = Muy Bajo
     - 2 = Bajo
     - 3 = Medio
     - 4 = Alto
     - 5 = Muy Alto

3. **Colores de las Celdas:**
   - 🟢 **Verde (Bajo):** Score matriz 1-5
   - 🟡 **Amarillo (Medio):** Score matriz 6-11
   - 🟠 **Naranja (Alto):** Score matriz 12-19
   - 🔴 **Rojo (Crítico):** Score matriz 20-25

4. **Leyenda:** Explicación de los niveles de riesgo

5. **Riesgos Prioritarios:** Lista de los 10 riesgos con mayor puntuación

---

#### Interacción con la Matriz:

- **Clic en una celda:** Muestra un modal con todos los riesgos en esa categoría
- **Números en celdas:** Cantidad de riesgos en esa posición
- **Celdas vacías:** Aparecen semi-transparentes (sin riesgos)

---

#### Ejemplo de Interpretación:

Un riesgo con:
- **Probabilidad:** 0.8 (80%) → Se convierte a escala 5: **Probabilidad 4**
- **Impacto:** 8 (de 10) → Se convierte a escala 5: **Impacto 4**
- **Posición en matriz:** Celda (4, 4)
- **Score matriz:** 4 × 4 = **16**
- **Color:** 🟠 **NARANJA (Alto)**

---

### 7.7 Sistema de Alertas

#### Ver Alertas:

1. En el menú lateral, haz clic en **"Alertas"**
2. Verás todas las alertas del sistema ordenadas por fecha

#### Tipos de Alertas:

- 🔴 **Riesgo:** Alertas relacionadas con riesgos críticos
- ⚠️ **Amenaza:** Alertas de amenazas críticas
- 🛡️ **Vulnerabilidad:** Alertas de vulnerabilidades críticas

---

#### Estados de Alertas:

- **Sin Leer** (Unread): Nueva alerta, resaltada en azul
- **Leída** (Read): Ya fue vista
- **Resuelta** (Resolved): Acción tomada, marcada en verde

---

#### Acciones:

1. **Marcar como Leída:**
   - Haz clic en el ícono de **ojo** 👁️
   - La alerta cambia a estado "Leída"

2. **Marcar como Resuelta:**
   - Haz clic en el ícono de **check** ✓
   - La alerta se marca como "Resuelta"

3. **Eliminar Alerta:**
   - Haz clic en el ícono de **basura** 🗑️
   - Confirma la eliminación

---

#### Alertas Automáticas:

El sistema genera alertas automáticamente cuando:
- ✅ Se crea un **riesgo crítico** (score ≥ 50)
- ✅ Se registra una **amenaza crítica**
- ✅ Se identifica una **vulnerabilidad crítica**

---

### 7.8 Superficie de Ataque

La superficie de ataque representa todos los puntos de entrada donde un atacante podría comprometer el sistema.

#### Ver Superficies de Ataque:

1. En el menú lateral, haz clic en **"Superficie de Ataque"**
2. Verás una lista de todos los activos expuestos

---

#### Crear Nueva Superficie de Ataque:

1. Haz clic en **"+ Nueva Superficie"**
2. **Completa el formulario:**

   - **Nombre:** Identificador del activo
     - Ejemplo: *"Servidor Web Principal - Producción"*

   - **Descripción:** Detalles del activo
     - Ejemplo: *"Servidor Apache que aloja la aplicación web corporativa"*

   - **Tipo:** Categoría del activo
     - Opciones:
       - Web Application
       - API
       - Network
       - Mobile App
       - IoT
       - Cloud
       - Other

   - **Nivel de Exposición:** Qué tan expuesto está
     - Opciones: Bajo, Medio, Alto, Crítico

   - **Direcciones IP:** IPs públicas expuestas
     - Ejemplo: *"203.0.113.50, 203.0.113.51"*

   - **Dominios:** Dominios asociados
     - Ejemplo: *"www.ejemplo.com, api.ejemplo.com"*

   - **Puertos:** Puertos abiertos
     - Ejemplo: *"80, 443, 22, 3306"*

   - **Tecnologías:** Stack tecnológico
     - Ejemplo: *"Apache 2.4.48, PHP 8.1, MySQL 8.0, Ubuntu 22.04"*

   - **Medidas de Seguridad:** Controles implementados
     - Ejemplo: *"WAF CloudFlare, Firewall UFW, SSL/TLS 1.3, 2FA para SSH"*

   - **Último Escaneo:** Fecha del último análisis de seguridad

3. Haz clic en **"Crear"**

---

### 7.9 Generación de Reportes PDF

#### Crear Nuevo Reporte:

1. En el menú lateral, haz clic en **"Reportes"**
2. Haz clic en **"+ Generar Reporte"**
3. **Configura el reporte:**

   - **Nombre del Reporte:** Título descriptivo
     - Ejemplo: *"Reporte de Riesgos - Q4 2024"*

   - **Tipo de Reporte:**
     - **Riesgo:** Solo riesgos
     - **Amenaza:** Solo amenazas
     - **Vulnerabilidad:** Solo vulnerabilidades
     - **Completo:** Todo (riesgos, amenazas, vulnerabilidades)

   - **Formato:** PDF (por defecto)

4. Haz clic en **"Generar Reporte"**
5. El sistema procesará la solicitud (puede tomar 5-15 segundos)
6. Verás una notificación de éxito

---

#### Descargar Reporte:

1. En la tabla de reportes, localiza el reporte generado
2. Haz clic en el ícono de **descarga** ⬇️
3. El archivo PDF se descargará a tu carpeta de descargas

---

#### Contenido del Reporte PDF:

Los reportes profesionales incluyen:

1. **Portada:**
   - Logo de ThreatMap
   - Título del reporte
   - Fecha de generación
   - Nombre del usuario que generó

2. **Resumen Ejecutivo:**
   - Estadísticas generales
   - Total de riesgos, amenazas, vulnerabilidades

3. **Gráficos Visuales:**
   - Distribución de riesgos por nivel
   - Gráfico de amenazas por categoría
   - Estado de vulnerabilidades

4. **Tablas Detalladas:**
   - Lista completa de riesgos con scores
   - Detalles de amenazas activas
   - Vulnerabilidades abiertas

5. **Matriz de Riesgos:**
   - Visualización 5×5 coloreada

6. **Recomendaciones:**
   - Acciones prioritarias
   - Riesgos críticos a atender

---

### 7.10 Navegación y Configuración

#### Menú Lateral:

- 🏠 **Dashboard** - Vista general
- ⚠️ **Amenazas** - Gestión de amenazas
- 🛡️ **Vulnerabilidades** - Gestión de vulnerabilidades
- 🎯 **Riesgos** - Gestión de riesgos
- 📊 **Matriz de Riesgos** - Visualización 5×5
- 🌐 **Superficie de Ataque** - Activos expuestos
- 🔔 **Alertas** - Sistema de notificaciones
- 📄 **Reportes** - Generación de PDFs

---

#### Barra Superior:

- **Notificaciones:** Ícono de campana con contador
- **Perfil de Usuario:** Nombre y opciones
  - Ver perfil
  - Configuración
  - **Cerrar Sesión**

---

#### Cerrar Sesión:

1. En la esquina superior derecha, haz clic en tu **nombre de usuario**
2. Selecciona **"Salir"** o **"Cerrar Sesión"**
3. Serás redirigido a la página de login
4. Tu sesión será cerrada de forma segura

---

## 8. Solución de Problemas

### 8.1 El Backend No Inicia

#### Error: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Causa:** MySQL no está corriendo o no está escuchando en el puerto 3306.

**Solución:**
1. Abre **XAMPP Control Panel**
2. Verifica que MySQL tiene el texto en **verde** (corriendo)
3. Si está en rojo, haz clic en **"Start"** al lado de MySQL
4. Espera a que cambie a verde
5. Reinicia el backend: `Ctrl+C` y luego `npm start`

---

#### Error: `SequelizeConnectionError: Access denied for user 'root'@'localhost'`

**Causa:** Contraseña de MySQL incorrecta.

**Solución:**
1. Abre `backend/.env`
2. Verifica que `DB_PASSWORD=` está vacío (contraseña por defecto de XAMPP)
3. Si configuraste contraseña en MySQL, ingrésala:
   ```
   DB_PASSWORD=tu_contraseña
   ```
4. Reinicia el backend

---

#### Error: `Error: Cannot find module 'express'`

**Causa:** Dependencias no instaladas.

**Solución:**
1. Navega a la carpeta backend:
   ```bash
   cd C:\ThreatMap\backend
   ```
2. Elimina `node_modules` y `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```
3. Reinstala dependencias:
   ```bash
   npm install
   ```

---

### 8.2 El Frontend No Se Conecta al Backend

#### Error: `Network Error` en consola del navegador

**Causa:** Backend no está corriendo o URL incorrecta.

**Solución:**
1. Verifica que el backend está corriendo:
   - Debe haber una terminal con "Server running on port 5000"
2. Verifica el archivo `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```
3. Reinicia el frontend:
   - En la terminal: `Ctrl+C`
   - Ejecuta: `npm start`

---

#### Error: `ERR_CONNECTION_REFUSED`

**Causa:** Puerto del backend incorrecto o backend no iniciado.

**Solución:**
1. Verifica que el backend está corriendo en el puerto 5000
2. Prueba acceder directamente: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
3. Si cambiaste el puerto en `backend/.env`, actualiza `frontend/.env`

---

### 8.3 Error al Crear Tablas en la Base de Datos

#### Error: `Foreign key constraint fails`

**Causa:** Tablas creadas en orden incorrecto.

**Solución:**
1. En phpMyAdmin, selecciona `threatmap_db`
2. Haz clic en la pestaña **"Operaciones"**
3. Baja hasta **"Eliminar base de datos"**
4. Confirma la eliminación
5. Crea nuevamente la base de datos:
   ```sql
   CREATE DATABASE threatmap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
6. **Crea las tablas EN ORDEN** (ver sección 4.2):
   1. users
   2. threats
   3. vulnerabilities
   4. risks
   5. alerts
   6. reports
   7. attack_surfaces

---

### 8.4 No Puedo Iniciar Sesión

#### Problema: "Credenciales incorrectas"

**Solución:**
1. Verifica que el email no tiene espacios extra
2. La contraseña es **sensible a mayúsculas/minúsculas**
3. Verifica que te registraste correctamente (verifica en DBeaver la tabla `users`)
4. Si olvidaste la contraseña, puedes cambiarla directamente en la base de datos:
   - Abre DBeaver
   - Navega a `threatmap_db` → `users`
   - Encuentra tu usuario
   - Genera un nuevo hash de contraseña usando bcrypt
   - Actualiza el campo `password`

---

### 8.5 Dependencias No Se Instalaron Correctamente

#### Error: `npm ERR! code ENOENT`

**Causa:** Node.js no instalado o ruta incorrecta.

**Solución:**
1. Verifica que Node.js está instalado:
   ```bash
   node --version
   npm --version
   ```
2. Si no muestra versión, reinstala Node.js
3. Verifica que estás en la carpeta correcta:
   ```bash
   pwd    # En macOS/Linux
   cd     # En Windows
   ```
4. Debe estar en `ThreatMap/backend` o `ThreatMap/frontend`

---

#### Error: `npm WARN ... peer dependencies`

**Solución:** Estos warnings son normales y generalmente no afectan el funcionamiento. Puedes ignorarlos.

---

### 8.6 Puerto Ya Está en Uso

#### Error: `Port 5000 is already in use`

**Causa:** Otro proceso está usando el puerto 5000.

**Solución - Opción 1 (Cambiar Puerto):**
1. Edita `backend/.env`:
   ```
   PORT=5001
   ```
2. Edita `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5001/api/v1
   ```
3. Reinicia ambos servidores

**Solución - Opción 2 (Matar Proceso):**
- **Windows:**
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID [número_PID] /F
  ```
- **macOS/Linux:**
  ```bash
  lsof -i :5000
  kill -9 [PID]
  ```

---

#### Error: `Port 3000 is already in use` (Frontend)

**Solución:**
1. El sistema te preguntará: `Would you like to run the app on another port instead? (Y/n)`
2. Escribe `Y` y presiona Enter
3. Se ejecutará en el puerto 3001

---

### 8.7 La Matriz de Riesgos No Muestra Colores

**Causa:** Problema con Tailwind CSS o cache del navegador.

**Solución:**
1. Recarga la página con **Ctrl+F5** (forzar recarga sin cache)
2. Si persiste, reinicia el frontend:
   ```bash
   Ctrl+C
   npm start
   ```
3. Limpia la cache del navegador:
   - Chrome: `Ctrl+Shift+Del` → Borrar cache
4. Verifica la consola del navegador (F12) en busca de errores

---

### 8.8 Los PDFs No Se Generan

**Causa:** Permisos de escritura o carpeta `reports` no existe.

**Solución:**
1. Verifica que existe la carpeta `backend/reports/`
2. Si no existe, créala manualmente
3. En sistemas Unix/Linux, da permisos:
   ```bash
   chmod 755 backend/reports
   ```
4. Verifica los logs del backend en la terminal

---

## 9. Preguntas Frecuentes (FAQ)

### 9.1 ¿Puedo usar otra base de datos en lugar de MySQL?

**Respuesta:** Sí, ThreatMap usa **Sequelize ORM** que soporta:
- PostgreSQL
- SQLite
- MariaDB
- Microsoft SQL Server

Sin embargo, necesitarás:
1. Instalar el driver correspondiente
2. Modificar `backend/.env` con la nueva configuración
3. Adaptar algunos tipos de datos si es necesario

---

### 9.2 ¿Los datos son privados? ¿Otros usuarios pueden ver mis riesgos?

**Respuesta:** **No**. Cada usuario **solo puede ver sus propios datos**. El sistema filtra automáticamente todos los registros por `user_id`. Los datos están completamente aislados entre usuarios.

---

### 9.3 ¿Puedo exportar datos en otros formatos además de PDF?

**Respuesta:** Actualmente, ThreatMap genera reportes en **PDF**. Sin embargo, puedes:
- Exportar datos directamente desde **DBeaver** en formatos CSV, Excel, JSON, XML
- Usar la API del backend para obtener datos en JSON
- Futuras versiones incluirán exportación CSV y Excel desde la interfaz

---

### 9.4 ¿Cuántos usuarios puedo registrar?

**Respuesta:** No hay límite en el número de usuarios. Puedes registrar tantos usuarios como necesites. Cada uno tendrá su propio espacio de datos aislado.

---

### 9.5 ¿Cómo detengo la aplicación cuando termino de usarla?

**Respuesta:**
1. **Frontend:** En la terminal del frontend, presiona `Ctrl+C`
2. **Backend:** En la terminal del backend, presiona `Ctrl+C`
3. **XAMPP (opcional):** Si no usas MySQL para otra cosa, puedes detener MySQL en XAMPP Control Panel

**Nota:** No es necesario detener XAMPP si lo usas para otros proyectos.

---

### 9.6 ¿Cómo actualizo ThreatMap a una nueva versión?

**Respuesta:**
1. Descarga la nueva versión (ZIP)
2. **Haz backup** de tu base de datos (ver sección 9.9)
3. Extrae los archivos nuevos
4. **NO REEMPLACES** los archivos `.env` (conserva tu configuración)
5. Ejecuta `npm install` en `backend/` y `frontend/` para actualizar dependencias
6. Si hay cambios en la base de datos, ejecuta los scripts de migración proporcionados
7. Reinicia los servidores

---

### 9.7 ¿Necesito Internet para usar ThreatMap?

**Respuesta:**
- **No** para uso diario. Una vez instalado, ThreatMap funciona completamente **offline** en tu red local (localhost).
- **Sí** solo para:
  - Instalar dependencias (`npm install`)
  - Descargar actualizaciones
  - Algunas fuentes de iconos/fonts (opcional)

---

### 9.8 ¿Puedo acceder a ThreatMap desde otra computadora en mi red local?

**Respuesta:** Sí, pero requiere configuración adicional:

1. **En el backend:**
   - Edita `backend/.env`:
     ```
     HOST=0.0.0.0
     ```
   - Esto permite que el backend escuche en todas las interfaces de red

2. **En el frontend:**
   - Edita `frontend/.env`:
     ```
     REACT_APP_API_URL=http://192.168.1.100:5000/api/v1
     ```
     (Reemplaza `192.168.1.100` con la IP de la máquina donde corre el backend)

3. **Firewall:**
   - Asegúrate de permitir conexiones entrantes en los puertos 3000 y 5000

4. **Acceso:**
   - Desde otra PC en la red, accede a: `http://192.168.1.100:3000`

---

### 9.9 ¿Cómo hago backup de mis datos?

**Opción 1 - Desde phpMyAdmin:**
1. Abre [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Selecciona la base de datos `threatmap_db` en el panel izquierdo
3. Haz clic en la pestaña **"Exportar"**
4. Selecciona:
   - Método: **Rápido**
   - Formato: **SQL**
5. Haz clic en **"Continuar"**
6. Se descargará un archivo `.sql` con todos tus datos

**Opción 2 - Desde DBeaver:**
1. Abre DBeaver
2. Clic derecho en `threatmap_db`
3. Selecciona **Tools** → **Dump Database**
4. Elige formato (SQL recomendado)
5. Selecciona ubicación para guardar
6. Haz clic en **"Start"**

**Opción 3 - Línea de comandos:**
```bash
mysqldump -u root -p threatmap_db > backup_threatmap_2024_12_07.sql
```

**Recomendación:** Haz backups **semanalmente** o antes de actualizaciones importantes.

---

### 9.10 ¿Cómo restauro un backup?

**Opción 1 - phpMyAdmin:**
1. Abre [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Selecciona `threatmap_db`
3. Haz clic en la pestaña **"Importar"**
4. Haz clic en **"Seleccionar archivo"**
5. Selecciona tu archivo `.sql` de backup
6. Haz clic en **"Continuar"**
7. Espera a que termine la importación

**Opción 2 - Línea de comandos:**
```bash
mysql -u root -p threatmap_db < backup_threatmap_2024_12_07.sql
```

---

### 9.11 ¿Qué hago si olvidé mi contraseña?

**Solución usando DBeaver:**
1. Abre DBeaver y conéctate a `threatmap_db`
2. Navega a la tabla `users`
3. Encuentra tu registro por email
4. **Genera un nuevo hash bcrypt de contraseña:**
   - Usa una herramienta online: [https://bcrypt-generator.com/](https://bcrypt-generator.com/)
   - Ingresa tu nueva contraseña (ej: `nuevapassword123`)
   - Copia el hash generado (ej: `$2a$10$...`)
5. En DBeaver, edita el campo `password` con el nuevo hash
6. Guarda los cambios
7. Ahora puedes iniciar sesión con la nueva contraseña

---

### 9.12 ¿Cómo elimino todos los datos y empiezo de cero?

**Opción 1 - Eliminar solo los datos (conservar estructura):**
```sql
DELETE FROM attack_surfaces;
DELETE FROM reports;
DELETE FROM alerts;
DELETE FROM risks;
DELETE FROM vulnerabilities;
DELETE FROM threats;
DELETE FROM users;
```

**Opción 2 - Eliminar la base de datos completa:**
1. En phpMyAdmin, selecciona `threatmap_db`
2. Clic en **"Operaciones"**
3. Baja hasta **"Eliminar base de datos (DROP)"**
4. Confirma
5. Vuelve a crear la base de datos y tablas (ver sección 4)

---

### 9.13 ¿Puedo cambiar el logo o personalizar la interfaz?

**Respuesta:** Sí, puedes personalizar:

1. **Logo:**
   - Reemplaza el archivo en `frontend/src/assets/logo.png`
   - Reinicia el frontend

2. **Colores:**
   - Edita `frontend/tailwind.config.js`
   - Modifica la paleta de colores
   - Reinicia el frontend

3. **Textos:**
   - Edita los componentes en `frontend/src/pages/` y `frontend/src/components/`

**Nota:** Requiere conocimientos básicos de React y Tailwind CSS.

---

### 9.14 ¿Hay límite en la cantidad de riesgos/amenazas que puedo crear?

**Respuesta:** No hay límite impuesto por la aplicación. El límite depende de:
- Capacidad de tu base de datos MySQL
- Espacio disponible en disco
- Rendimiento del sistema

En la práctica, puedes manejar **miles de registros** sin problemas.

---

### 9.15 ¿Cómo puedo contactar soporte técnico?

**Respuesta:**
- **Email:** support@threatmap.com
- **GitHub Issues:** [https://github.com/threatmap/threatmap/issues](https://github.com/threatmap/threatmap/issues)
- **Documentación:** [https://docs.threatmap.com](https://docs.threatmap.com)
- **Community Forum:** [https://community.threatmap.com](https://community.threatmap.com)

---

## 📞 Soporte Adicional

### Recursos:

- 📚 **Documentación completa:** [https://docs.threatmap.com](https://docs.threatmap.com)
- 💬 **Foro de la comunidad:** [https://community.threatmap.com](https://community.threatmap.com)
- 🐛 **Reporte de bugs:** [https://github.com/threatmap/threatmap/issues](https://github.com/threatmap/threatmap/issues)
- 📧 **Email:** support@threatmap.com

---

## 📄 Licencia

**ThreatMap** es software propietario desarrollado para gestión de ciberseguridad.

Todos los derechos reservados © 2024 ThreatMap Team.

---

## 🎉 ¡Gracias por Usar ThreatMap!

Esperamos que esta aplicación te ayude a gestionar eficientemente los riesgos de ciberseguridad de tu organización.

**Para cualquier consulta o feedback, no dudes en contactarnos.**

---

**Versión del Manual:** 1.0
**Última actualización:** 7 de Diciembre de 2024
**Próxima revisión:** Enero 2025
