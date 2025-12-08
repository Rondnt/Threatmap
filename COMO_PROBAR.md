# Cómo Probar ThreatMap - Guía Rápida

## Paso 1: Liberar Puertos (Si es necesario)

Si encuentras errores como "address already in use", ejecuta:

```bash
# Opción 1: Usar el script automático
limpiar_puertos.bat

# Opción 2: Manual (si el script no funciona)
# Ver qué proceso usa el puerto
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Matar el proceso (reemplaza PID con el número que aparece)
powershell -Command "Stop-Process -Id PID -Force"
```

---

## Paso 2: Iniciar Backend

```bash
# Abrir primera terminal (PowerShell o CMD)
cd backend
npm run dev

# Deberías ver:
# ✅ MySQL Database connected successfully
# ✅ Database models synchronized
# 🚀 ThreatMap Server Started
# 🌐 Server running on: http://localhost:5000
```

**Si ves errores:**
- Verifica que MySQL/MariaDB esté corriendo
- Verifica que la base de datos `threatmap_db` exista
- Verifica las credenciales en `backend/.env`

---

## Paso 3: Iniciar Frontend

```bash
# Abrir segunda terminal (PowerShell o CMD)
cd frontend
npm run dev

# Deberías ver:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:3001/
```

---

## Paso 4: Abrir en Navegador

1. Abrir navegador en: **http://localhost:3001**
2. Deberías ver la página de Login

---

## Paso 5: Crear Usuario Admin

### Opción A: Registrarse en la interfaz

1. Hacer clic en "Registrarse"
2. Llenar el formulario:
   - Username: `admin`
   - Email: `admin@threatmap.com`
   - Password: `admin123`
   - Full Name: `Administrador`
   - Role: `Admin`
3. Hacer clic en "Registrarse"
4. Serás redirigido al Dashboard

### Opción B: Iniciar sesión (si ya tienes usuario)

1. Username: `admin`
2. Password: `admin123`
3. Hacer clic en "Iniciar Sesión"

---

## Paso 6: Probar el Dashboard

Deberías ver:
- ✅ Tarjetas de estadísticas (Total Amenazas, Vulnerabilidades, Riesgos)
- ✅ Gráficos de distribución
- ✅ Sección de actividad reciente
- ✅ Menú lateral con todos los módulos

---

## Paso 7: Probar Módulo de Amenazas

1. Ir a **Amenazas** en el menú lateral
2. Hacer clic en **"Nueva Amenaza"**
3. Llenar el formulario de ejemplo:

```
Nombre: Campaña de Phishing Dirigido
Tipo: Phishing
Severidad: High
Estado: Active
Descripción: Campaña de phishing dirigido a empleados de finanzas
Fuente: Email Security Gateway
Probabilidad: 0.75
Impacto: 8
Estrategia de Mitigación: Implementar MFA y capacitación
Fecha de Detección: (Seleccionar fecha actual)
```

4. Hacer clic en **"Crear"**
5. Deberías ver:
   - ✅ Toast de confirmación
   - ✅ La amenaza aparece en la tabla
   - ✅ Risk Score calculado automáticamente (60.0 = 0.75 × 8 × 10)

---

## Paso 8: Probar Módulo de Vulnerabilidades

1. Ir a **Vulnerabilidades**
2. Hacer clic en **"Nueva Vulnerabilidad"**
3. Ejemplo rápido:

```
CVE ID: CVE-2021-44228
Nombre: Log4Shell - Log4j RCE
Severidad: Critical
CVSS Score: 10.0
Descripción: Vulnerabilidad de ejecución remota en Apache Log4j
Estado: Patched
Exploit Disponible: ✓ Sí
Patch Disponible: ✓ Sí
Fecha de Descubrimiento: 2021-12-10
```

4. Hacer clic en **"Crear"**
5. Verificar:
   - ✅ Badges de "Exploit Disponible" y "Patch Disponible"
   - ✅ Color rojo para Critical

---

## Paso 9: Probar Módulo de Riesgos

1. Ir a **Riesgos**
2. Hacer clic en **"Nuevo Riesgo"**
3. Ejemplo:

```
Nombre: Compromiso de Base de Datos por SQLi
Categoría: Technical
Probabilidad: 0.80
Impacto: 9
Estado: Treating
Amenaza Relacionada: (Seleccionar la amenaza creada)
Vulnerabilidad Relacionada: (Seleccionar la vulnerabilidad creada)
Estrategia de Tratamiento: Mitigate
Plan de Tratamiento: Implementar WAF, auditar código, parchear aplicación
Probabilidad Residual: 0.15
Impacto Residual: 9
```

4. Hacer clic en **"Crear"**
5. Verificar:
   - ✅ Risk Score calculado: 72.0
   - ✅ Risk Level asignado automáticamente: Critical
   - ✅ Residual Risk Score: 13.5

---

## Paso 10: Probar Matriz de Riesgos

1. Ir a **Matriz de Riesgos**
2. Deberías ver:
   - ✅ Matriz 5×5 con probabilidad e impacto
   - ✅ Círculo representando el riesgo creado
   - ✅ Color según nivel (Rojo = Critical)
3. Hacer hover sobre el círculo:
   - ✅ Tooltip con detalles del riesgo
4. Probar filtros:
   - Filtrar por categoría: Technical
   - Filtrar por estado: Treating
   - Buscar por nombre

---

## Paso 11: Probar Superficie de Ataque (LO MÁS IMPORTANTE)

### Crear Primer Activo

1. Ir a **Superficie de Ataque**
2. Deberías ver: "No hay assets registrados para visualizar"
3. Hacer clic en **"Agregar Primer Asset"** o **"Nuevo Asset"**
4. Llenar con este ejemplo simple:

```
Nombre: web-prod-01
Tipo: Server
Dirección IP: 203.0.113.10
Hostname: www.empresa.com
Sistema Operativo: Ubuntu 22.04 LTS
Ubicación: Datacenter Principal
Criticidad: Critical
Nivel de Exposición: Public
Puertos Abiertos: 80,443
Servicios: HTTP,HTTPS,Nginx
Propietario: Equipo DevOps
Estado: Active
Expuesto Públicamente: ✓ (marcar checkbox)
Tags: producción,web,crítico
Notas: Servidor web principal
```

5. Hacer clic en **"Crear"**
6. Deberías ver:
   - ✅ Topología de red con un nodo ROJO
   - ✅ Borde grueso rojo (porque está expuesto públicamente)
   - ✅ Letra "S" en el centro (Server)

### Crear Segundo Activo

7. Hacer clic en **"Nuevo Asset"** nuevamente
8. Crear una base de datos:

```
Nombre: db-prod-01
Tipo: Database
Dirección IP: 10.0.5.50
Hostname: postgres-primary.local
Sistema Operativo: Red Hat Linux 8
Ubicación: Datacenter Principal
Criticidad: Critical
Nivel de Exposición: Internal
Puertos Abiertos: 5432
Servicios: PostgreSQL 15
Propietario: Equipo DBA
Estado: Active
Expuesto Públicamente: ☐ (NO marcar)
Tags: producción,database,crítico
Conexiones: web-prod-01 (seleccionar del dropdown)
Notas: Base de datos principal
```

9. Hacer clic en **"Crear"**
10. Deberías ver:
    - ✅ Segundo nodo ROJO (Critical)
    - ✅ Sin borde grueso (interno)
    - ✅ Letra "D" (Database)
    - ✅ Línea conectando web-prod-01 con db-prod-01

### Probar Interactividad del Mapa

11. **Zoom**: Usar scroll del mouse para acercar/alejar
12. **Pan**: Arrastrar el fondo del mapa para mover
13. **Arrastrar nodo**: Clic y arrastrar un nodo a otra posición
    - ✅ La posición se guarda automáticamente
14. **Hover**: Pasar mouse sobre un nodo
    - ✅ Tooltip con información del activo
15. **Clic en nodo**: Hacer clic en un nodo
    - ✅ Panel lateral "Detalles del Asset" se llena con información
    - ✅ Botones de Editar y Eliminar aparecen

### Probar Estadísticas

16. Verificar tarjetas superiores:
    - Total Assets: 2
    - Expuestos Públicamente: 1
    - Con Vulnerabilidades: 0
    - Criticidad Alta/Crítica: 2

### Probar Vista de Lista

17. Hacer clic en botón **"Lista"** (arriba a la derecha)
18. Deberías ver:
    - ✅ Tabla con ambos activos
    - ✅ Columnas: Nombre, Tipo, IP, Criticidad, Exposición, Estado, etc.
19. Volver a vista **"Topología"**

---

## Paso 12: Verificar Integración

1. Ir a **Dashboard**
2. Las estadísticas deberían reflejar:
   - Total de Amenazas: 1
   - Total de Vulnerabilidades: 1
   - Riesgos Activos: 1
3. Los gráficos deben mostrar la distribución

---

## Checklist de Funcionalidades

### ✅ Autenticación
- [ ] Registro de usuario
- [ ] Login
- [ ] Logout
- [ ] Token JWT funciona

### ✅ Amenazas
- [ ] Crear amenaza
- [ ] Ver lista de amenazas
- [ ] Editar amenaza
- [ ] Eliminar amenaza
- [ ] Filtrar por severidad/estado
- [ ] Cálculo automático de risk score

### ✅ Vulnerabilidades
- [ ] Crear vulnerabilidad
- [ ] Ver lista
- [ ] Indicadores de exploit/patch
- [ ] Asociar CVE ID

### ✅ Riesgos
- [ ] Crear riesgo
- [ ] Ver lista
- [ ] Vincular amenaza y vulnerabilidad
- [ ] Cálculo de risk score
- [ ] Cálculo de riesgo residual
- [ ] Asignación automática de risk level

### ✅ Matriz de Riesgos
- [ ] Visualización 5×5
- [ ] Colores por nivel
- [ ] Tooltips
- [ ] Filtros funcionales

### ✅ Superficie de Ataque
- [ ] Crear activo
- [ ] Visualización D3.js (topología)
- [ ] Colores por criticidad
- [ ] Bordes para activos públicos
- [ ] Iconos por tipo de activo
- [ ] Arrastrar y soltar nodos
- [ ] Zoom y pan
- [ ] Tooltips
- [ ] Panel de detalles
- [ ] Conexiones entre activos
- [ ] Vista de lista
- [ ] Estadísticas

---

## Problemas Comunes

### Error: "address already in use"
**Solución**: Ejecutar `limpiar_puertos.bat`

### Error: "Unable to connect to database"
**Solución**:
1. Verificar que MySQL esté corriendo
2. Crear la base de datos: `CREATE DATABASE threatmap_db;`
3. Verificar credenciales en `backend/.env`

### Error: "CORS policy"
**Solución**:
1. Verificar que `CORS_ORIGIN` en `backend/.env` sea `http://localhost:3001`
2. Reiniciar backend después de cambiar .env

### Los caracteres con tildes no se ven bien
**Solución**:
1. He corregido los archivos con codificación UTF-8
2. Refrescar el navegador (Ctrl+F5)
3. Si persiste, limpiar caché del navegador

### El mapa D3.js no se muestra
**Solución**:
1. Verificar consola del navegador (F12) por errores
2. Asegurar que hay al menos 1 activo creado
3. Refrescar la página

### No puedo ver mis datos después de logout/login
**Solución**:
- Todos los datos están aislados por usuario
- Asegúrate de iniciar sesión con el mismo usuario que creó los datos

---

## Resumen de URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

---

## Resumen de Puertos

- **Frontend**: 3001
- **Backend**: 5000
- **MySQL**: 3306

---

## Comandos Útiles

```bash
# Ver puertos en uso
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Matar proceso por PID
powershell -Command "Stop-Process -Id PID -Force"

# Reiniciar backend
cd backend
npm run dev

# Reiniciar frontend
cd frontend
npm run dev

# Ver logs del backend en tiempo real
# (Los logs aparecen automáticamente en la terminal donde corriste npm run dev)
```

---

¡Listo! Ahora tienes todo funcionando. Si encuentras algún problema, consulta la sección de "Problemas Comunes" arriba.
