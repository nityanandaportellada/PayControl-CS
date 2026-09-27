@echo off
start "PayControl API" cmd /k "cd /d %~dp0src\PayControl.Api && dotnet run"
timeout /t 2 /nobreak > nul
start "PayControl Web" cmd /k "cd /d %~dp0src\PayControl.Web && npm install && npm run dev"
echo PayControl v0.2 iniciado.
echo API: http://localhost:5080
echo Front: http://localhost:5173
