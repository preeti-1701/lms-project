#!/bin/bash
echo "============================================"
echo "   EduLearn - E-Learning Platform Setup"
echo "============================================"
echo ""

echo "[1/4] Installing dependencies..."
pip install -r requirements.txt || { echo "ERROR: pip install failed."; exit 1; }

echo ""
echo "[2/4] Running database migrations..."
python manage.py makemigrations
python manage.py migrate

echo ""
echo "[3/4] Seeding sample data..."
python manage.py seed_data

echo ""
echo "[4/4] Starting development server..."
echo ""
echo "============================================"
echo " Open your browser at: http://127.0.0.1:8000"
echo " Login: student / pass1234"
echo " Login: instructor / pass1234"
echo " Admin: http://127.0.0.1:8000/admin  (admin/admin1234)"
echo "============================================"
echo ""
python manage.py runserver
