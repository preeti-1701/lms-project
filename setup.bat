@echo off
echo ========================================
echo   EduTrack LMS - Setup Script
echo ========================================
echo.

echo [1/5] Creating virtual environment...
python -m venv venv

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Installing dependencies...
pip install -r requirements.txt

echo [4/5] Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo [5/5] Seeding demo data...
python seed_data.py

echo.
echo ========================================
echo   Setup complete!
echo   Run: python manage.py runserver
echo   Open: http://127.0.0.1:8000
echo ========================================
pause
