#!/bin/bash

echo "========================================"
echo "   LMS Project - Starting Servers"
echo "========================================"
echo ""

echo "[1/4] Activating Python virtual environment..."
source venv/bin/activate

echo "[2/4] Starting Backend Server (Port 8000)..."
cd app
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

echo "[3/4] Waiting for backend to start..."
sleep 3

echo "[4/4] Starting Frontend Server (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "   Servers Running!"
echo "========================================"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
