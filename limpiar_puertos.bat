@echo off
echo ================================================
echo    THREATMAP - Liberador de Puertos
echo ================================================
echo.
echo Este script liberara los puertos ocupados por
echo procesos de Node.js de ThreatMap
echo.
echo Puertos a verificar: 3000, 3001, 5000
echo.
pause
echo.

echo [1/3] Buscando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo    - Matando proceso PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo [2/3] Buscando procesos en puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo    - Matando proceso PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo [3/3] Buscando procesos en puerto 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo    - Matando proceso PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ================================================
echo    Proceso completado!
echo ================================================
echo.
echo Los puertos 3000, 3001 y 5000 estan liberados.
echo Ahora puedes iniciar tu backend y frontend.
echo.
echo Comandos para iniciar:
echo   Backend:  cd backend  ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.
pause
