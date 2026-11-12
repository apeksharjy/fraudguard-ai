@echo off
title FraudGuard AI - Launch System
echo ========================================================
echo    FraudGuard AI - Digital Payment Safety Assistant
echo ========================================================
echo.
echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000...
start "FraudGuard Backend (FastAPI)" cmd /k "cd /d %~dp0backend && py -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting React Vite Frontend on http://127.0.0.1:5173...
start "FraudGuard Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo [3/3] Opening browser in 3 seconds...
timeout /t 3 >nul
start http://127.0.0.1:5173/

echo.
echo FraudGuard AI is running!
echo Backend:  http://127.0.0.1:8000 (Docs at /docs)
echo Frontend: http://127.0.0.1:5173
echo.
pause
