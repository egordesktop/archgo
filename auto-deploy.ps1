# Автоматический деплой проекта на Vercel
Write-Host "=== АВТОМАТИЧЕСКИЙ ДЕПЛОЙ ПРОЕКТА ===" -ForegroundColor Green

# Установка переменных окружения
$env:VERCEL_TOKEN = "Pm1LQvzpaIGtlc5Gsvk975Et"
$env:VERCEL_ORG_ID = "team_xxxxxx"
$env:VERCEL_PROJECT_ID = "pm0oov54"

Write-Host "Переменные окружения установлены" -ForegroundColor Yellow

# Проверка статуса Git
Write-Host "Проверка статуса Git..." -ForegroundColor Yellow
git status

# Добавление всех изменений
Write-Host "Добавление изменений в Git..." -ForegroundColor Yellow
git add .

# Создание коммита
Write-Host "Создание коммита..." -ForegroundColor Yellow
git commit -m "Auto-deploy: Update Vercel configuration and GitHub Actions"

# Push в GitHub
Write-Host "Отправка изменений в GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Изменения отправлены в GitHub!" -ForegroundColor Green
Write-Host "GitHub Actions запущен автоматически." -ForegroundColor Green
Write-Host "Отслеживайте прогресс: https://github.com/egordesktop/archgo/actions" -ForegroundColor Cyan

# Ожидание и проверка деплоя
Write-Host "Ожидание завершения деплоя..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Попытка получить URL деплоя
Write-Host "Попытка получить URL деплоя..." -ForegroundColor Yellow
try {
    $deployment = vercel ls --token $env:VERCEL_TOKEN --scope team_xxxxxx | Select-String "Production"
    if ($deployment) {
        Write-Host "Деплой найден!" -ForegroundColor Green
        Write-Host "URL: $deployment" -ForegroundColor Cyan
    } else {
        Write-Host "Деплой в процессе..." -ForegroundColor Yellow
        Write-Host "Проверьте: https://vercel.com/dashboard" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Не удалось получить информацию о деплое автоматически." -ForegroundColor Red
    Write-Host "Проверьте вручную: https://vercel.com/dashboard" -ForegroundColor Cyan
}

Write-Host "=== ДЕПЛОЙ ЗАВЕРШЕН ===" -ForegroundColor Green
