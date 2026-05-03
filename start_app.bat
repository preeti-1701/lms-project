@echo off
echo Starting LMS Project...

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo LMS is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
