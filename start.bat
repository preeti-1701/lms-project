@echo off
echo ========================================
echo    LMS Project - Starting Servers
echo ========================================
echo.

echo [1/4] Activating Python virtual environment...
call venv\Scripts\activate

echo [2/4] Starting Backend Server (Port 8000)...
start cmd /k "cd app && uvicorn main:app --reload"

echo [3/4] Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo [4/4] Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo    Servers Starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
pause > nul
