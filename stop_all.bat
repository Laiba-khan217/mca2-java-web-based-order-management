@echo off
echo ======================================================================
echo   STOPPING ALL OMS PROCESSES (PORTS 8080 and 5173)
echo ======================================================================

echo Stopping backend on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo Stopping frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

echo Done! All services stopped.
pause
exit
