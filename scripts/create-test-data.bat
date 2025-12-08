@echo off
echo ========================================
echo ThreatMap - Crear Datos de Prueba
echo ========================================
echo.

REM INSTRUCCIONES:
REM 1. Obtén tu token desde el navegador (F12 consola): localStorage.getItem('token')
REM 2. Reemplaza YOUR_TOKEN_HERE abajo con tu token real
REM 3. Ejecuta este archivo haciendo doble click

set TOKEN=YOUR_TOKEN_HERE
set API_URL=http://localhost:5000/api/v1

if "%TOKEN%"=="YOUR_TOKEN_HERE" (
    echo ERROR: Debes reemplazar YOUR_TOKEN_HERE con tu token real
    echo.
    echo Para obtener tu token:
    echo 1. Abre http://localhost:3000 en el navegador
    echo 2. Presiona F12 para abrir la consola
    echo 3. Ejecuta: localStorage.getItem('token'^)
    echo 4. Copia el token y reemplazalo en este archivo
    echo.
    pause
    exit /b 1
)

echo Creando amenazas...
echo.

REM Amenaza 1: Ransomware
curl -X POST %API_URL%/threats ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Ransomware en Servidor Produccion\",\"description\":\"Se detecto actividad sospechosa de ransomware\",\"type\":\"ransomware\",\"severity\":\"critical\",\"probability\":0.9,\"impact\":10,\"source\":\"Sistema de Monitoreo\"}"
echo.

REM Amenaza 2: Phishing
curl -X POST %API_URL%/threats ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Campana de Phishing Detectada\",\"description\":\"Multiples correos de phishing\",\"type\":\"phishing\",\"severity\":\"high\",\"probability\":0.7,\"impact\":6,\"source\":\"Email Gateway\"}"
echo.

REM Amenaza 3: SQL Injection
curl -X POST %API_URL%/threats ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Intento de SQL Injection\",\"description\":\"Intentos de inyeccion SQL en login\",\"type\":\"sql_injection\",\"severity\":\"high\",\"probability\":0.6,\"impact\":8,\"source\":\"WAF Logs\"}"
echo.

REM Amenaza 4: DDoS
curl -X POST %API_URL%/threats ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Ataque DDoS Detectado\",\"description\":\"Trafico anomalo detectado\",\"type\":\"ddos\",\"severity\":\"medium\",\"probability\":0.5,\"impact\":7,\"source\":\"Cloudflare\"}"
echo.

echo Creando riesgos...
echo.

REM Riesgo 1: Crítico
curl -X POST %API_URL%/risks ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Riesgo de Perdida de Datos Criticos\",\"description\":\"Posibilidad de perdida de datos de clientes\",\"category\":\"technical\",\"probability\":0.8,\"impact\":10}"
echo.

REM Riesgo 2: Alto
curl -X POST %API_URL%/risks ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Fuga de Informacion Confidencial\",\"description\":\"Riesgo de exposicion de informacion sensible\",\"category\":\"compliance\",\"probability\":0.6,\"impact\":8}"
echo.

REM Riesgo 3: Medio
curl -X POST %API_URL%/risks ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"name\":\"Interrupcion del Servicio\",\"description\":\"Posible caida de servicios principales\",\"category\":\"operational\",\"probability\":0.5,\"impact\":6}"
echo.

echo.
echo ========================================
echo Datos de prueba creados!
echo.
echo Ahora puedes verlos en:
echo - Dashboard: http://localhost:3000/dashboard
echo - Amenazas: http://localhost:3000/threats
echo - Riesgos: http://localhost:3000/risks
echo - Matriz: http://localhost:3000/risk-matrix
echo ========================================
echo.
pause
