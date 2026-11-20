@echo off
echo ======================================================================
echo   STARTING APEX ORDER MANAGEMENT SYSTEM (MANUFACTURING OMS)
echo ======================================================================

echo [1/2] Starting Spring Boot 3.3.5 Backend (Port 8080)...
start "OMS Backend - Spring Boot" cmd /k "cd /d %~dp0backend && .\mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [2/2] Starting React 18 + Vite Frontend (Port 5173)...
start "OMS Frontend - Vite Dev Server" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ======================================================================
echo   ALL SERVICES LAUNCHED SUCCESSFULLY!
echo ======================================================================
echo   Frontend Application: http://localhost:5173
echo   Backend REST APIs:    http://localhost:8080
echo.
echo   Demo Accounts:
echo     Admin:         admin        / Admin@123
echo     Order Manager: ordermanager / Order@123
echo     Procurement:   procurement  / Procure@123
echo ======================================================================

start http://localhost:5173
exit
