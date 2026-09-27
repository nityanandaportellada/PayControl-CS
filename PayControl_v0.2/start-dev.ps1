$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$root/src/PayControl.Api'; dotnet run"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$root/src/PayControl.Web'; npm install; npm run dev"
Write-Host 'PayControl v0.2 iniciado.'
Write-Host 'API: http://localhost:5080'
Write-Host 'Front: http://localhost:5173'
