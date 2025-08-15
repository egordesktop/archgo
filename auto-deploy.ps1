# ===============================
# ПОЛНАЯ АВТОНАСТРОЙКА VERCEL ДЕПЛОЯ + АВТОВЕТКА + АВТООТКРЫТИЕ
# ===============================

Write-Host "=== Проверка GitHub CLI ===" -ForegroundColor Green
try {
    gh --version
    Write-Host "✅ GitHub CLI найден" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI не найден. Добавьте его в PATH перед запуском." -ForegroundColor Red
    Write-Host "Скачайте с: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Установка переменных окружения для Vercel ===" -ForegroundColor Green
$env:VERCEL_TOKEN = "Pm1LQvzpaIGt1cGSsvk975Et"
$env:VERCEL_TEAM_ID = "team_e6nD07t8aV61vAQqMIqzEYRk"
$env:VERCEL_PROJECT_ID = "prj_RW2Df5XteE00YC94JpgPGJvgj9HU0"

# Создание .env файла
"VERCEL_TOKEN=$env:VERCEL_TOKEN" | Out-File -Encoding UTF8 -FilePath .env
"VERCEL_TEAM_ID=$env:VERCEL_TEAM_ID" | Out-File -Encoding UTF8 -Append .env
"VERCEL_PROJECT_ID=$env:VERCEL_PROJECT_ID" | Out-File -Encoding UTF8 -Append .env
Write-Host "✅ Файл .env создан с переменными окружения" -ForegroundColor Green

Write-Host "=== Обновление package.json ===" -ForegroundColor Green
if (Test-Path "package.json") {
    $package = Get-Content "package.json" -Raw | ConvertFrom-Json
    $updated = $false
    
    # Добавляем скрипт start если его нет
    if (-Not $package.scripts.start) {
        $package.scripts.start = "vercel dev"
        $updated = $true
    }
    
    # Обновляем скрипт deploy с правильными параметрами
    if ($package.scripts.deploy) {
        $package.scripts.deploy = "vercel --prod --token $env:VERCEL_TOKEN --scope $env:VERCEL_TEAM_ID"
        $updated = $true
    }
    
    if ($updated) {
        $package | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 "package.json"
        Write-Host "✅ package.json обновлен" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ package.json уже содержит необходимые скрипты" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Файл package.json не найден" -ForegroundColor Red
    exit 1
}

Write-Host "=== Обновление vercel.json ===" -ForegroundColor Green
$vercelConfig = @{
    version = 2
    scope = $env:VERCEL_TEAM_ID
    projectId = $env:VERCEL_PROJECT_ID
    buildCommand = "npm run build"
    outputDirectory = "dist"
    installCommand = "npm install"
    framework = "vite"
    rewrites = @(
        @{ source = "/(.*)"; destination = "/index.html" }
    )
}

$vercelConfig | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 "vercel.json"
Write-Host "✅ vercel.json обновлен" -ForegroundColor Green

Write-Host "=== Настройка GitHub Secrets ===" -ForegroundColor Green
try {
    gh secret set VERCEL_TOKEN --body $env:VERCEL_TOKEN
    gh secret set VERCEL_TEAM_ID --body $env:VERCEL_TEAM_ID
    gh secret set VERCEL_PROJECT_ID --body $env:VERCEL_PROJECT_ID
    Write-Host "✅ GitHub Secrets настроены" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ошибка при настройке GitHub Secrets. Возможно, репозиторий не инициализирован." -ForegroundColor Yellow
    Write-Host "Убедитесь, что вы авторизованы в GitHub CLI: gh auth login" -ForegroundColor Yellow
}

Write-Host "=== Определение текущей ветки ===" -ForegroundColor Green
try {
    $branchName = git rev-parse --abbrev-ref HEAD
    Write-Host "Текущая ветка: $branchName" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Git репозиторий не инициализирован" -ForegroundColor Red
    Write-Host "Выполните: git init && git add . && git commit -m 'Initial commit'" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== Создание GitHub Actions workflow ===" -ForegroundColor Green
if (-Not (Test-Path ".github/workflows")) {
    New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null
}

$workflowContent = @"
name: Deploy to Vercel

on:
  push:
    branches: [ $branchName, main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: `${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: `${{ secrets.VERCEL_TEAM_ID }}
        vercel-project-id: `${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
"@

$workflowContent | Out-File -Encoding UTF8 ".github/workflows/deploy.yml"
Write-Host "✅ GitHub Actions workflow создан" -ForegroundColor Green

Write-Host "=== Установка Vercel CLI ===" -ForegroundColor Green
try {
    npm install -g vercel
    Write-Host "✅ Vercel CLI установлен" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ошибка при установке Vercel CLI. Попробуйте вручную: npm install -g vercel" -ForegroundColor Yellow
}

Write-Host "=== Git commit & push ===" -ForegroundColor Green
try {
    git add .
    git commit -m "Setup GitHub Actions and Vercel deployment configuration" --allow-empty
    git push origin $branchName
    Write-Host "✅ Изменения закоммичены и отправлены в репозиторий" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ошибка при git push. Возможно, репозиторий не настроен для push." -ForegroundColor Yellow
    Write-Host "Настройте remote: git remote add origin <your-repo-url>" -ForegroundColor Yellow
}

Write-Host "=== Первый деплой напрямую в Vercel ===" -ForegroundColor Green
try {
    Write-Host "Выполняется деплой..." -ForegroundColor Yellow
    $deployOutput = vercel --prod --confirm --token $env:VERCEL_TOKEN --scope $env:VERCEL_TEAM_ID 2>&1
    
    Write-Host "Вывод деплоя:" -ForegroundColor Cyan
    Write-Host $deployOutput -ForegroundColor White
    
    # Поиск URL сайта в выводе
    if ($deployOutput -match "https://[^\s]+\.vercel\.app") {
        $siteUrl = $matches[0]
        Write-Host "✅ Сайт успешно задеплоен: $siteUrl" -ForegroundColor Green
        
        Write-Host "=== Автоматическое открытие сайта в браузере ===" -ForegroundColor Green
        try {
            Start-Process $siteUrl
            Write-Host "✅ Сайт открыт в браузере" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Не удалось открыть сайт автоматически. Откройте вручную: $siteUrl" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Не удалось найти ссылку на сайт в выводе деплоя" -ForegroundColor Red
        Write-Host "Проверьте вывод выше для получения URL" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Ошибка при деплое в Vercel" -ForegroundColor Red
    Write-Host "Проверьте токен и настройки Vercel" -ForegroundColor Yellow
}

Write-Host "=== Создание .gitignore ===" -ForegroundColor Green
if (-Not (Test-Path ".gitignore")) {
    @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.vercel/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity
"@ | Out-File -Encoding UTF8 ".gitignore"
    Write-Host "✅ .gitignore создан" -ForegroundColor Green
}

Write-Host "`n" -ForegroundColor White
Write-Host "🎉 НАСТРОЙКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Vercel деплой настроен" -ForegroundColor Green
Write-Host "✅ GitHub Actions настроен" -ForegroundColor Green
Write-Host "✅ Автоматический деплой при push" -ForegroundColor Green
Write-Host "✅ Сайт должен быть открыт в браузере" -ForegroundColor Green
Write-Host "`nДля следующих деплоев просто делайте:" -ForegroundColor Yellow
Write-Host "git add . && git commit -m 'your message' && git push" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
