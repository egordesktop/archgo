@echo off
echo ========================================
echo    АВТОМАТИЧЕСКАЯ НАСТРОЙКА VERCEL
echo ========================================
echo.

echo Запуск PowerShell скрипта...
powershell -ExecutionPolicy Bypass -File "auto-deploy.ps1"

echo.
echo Нажмите любую клавишу для выхода...
pause >nul
