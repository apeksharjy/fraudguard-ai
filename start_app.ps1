# FraudGuard AI - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   FraudGuard AI - Digital Payment Safety Assistant" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$RiskDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RiskDir\backend'; py -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

Write-Host "[2/3] Starting React Vite Frontend on http://127.0.0.1:5173..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RiskDir\frontend'; npm run dev"

Write-Host "[3/3] Launching web browser..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:5173/"

Write-Host "`nFraudGuard AI is live!" -ForegroundColor Green
Write-Host "Backend API docs: http://127.0.0.1:8000/docs" -ForegroundColor DarkGray
Write-Host "Frontend App:     http://127.0.0.1:5173/" -ForegroundColor DarkGray
