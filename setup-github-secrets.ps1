# PowerShell скрипт для настройки GitHub Secrets
# Требуется GitHub CLI (gh)

$VERCEL_TOKEN = "Pm1LQvzpaIGtlc5Gsvk975Et"
$REPO = "egordesktop/archgo"

Write-Host "Настройка GitHub Secrets для репозитория $REPO..."

# Проверяем, установлен ли GitHub CLI
try {
    $ghVersion = gh --version
    Write-Host "GitHub CLI найден: $ghVersion"
} catch {
    Write-Host "GitHub CLI не найден. Устанавливаем..."
    # Попытка установки через winget
    try {
        winget install GitHub.cli
    } catch {
        Write-Host "winget не найден. Устанавливаем GitHub CLI вручную..."
        # Скачиваем и устанавливаем GitHub CLI
        $url = "https://github.com/cli/cli/releases/latest/download/gh_windows_amd64.msi"
        $output = "$env:TEMP\gh.msi"
        Invoke-WebRequest -Uri $url -OutFile $output
        Start-Process msiexec.exe -Wait -ArgumentList "/i $output /quiet"
        Remove-Item $output
    }
}

# Авторизация в GitHub CLI
Write-Host "Авторизация в GitHub CLI..."
gh auth login --with-token <<< $VERCEL_TOKEN

# Настройка VERCEL_TOKEN secret
Write-Host "Настройка VERCEL_TOKEN secret..."
gh secret set VERCEL_TOKEN --body $VERCEL_TOKEN --repo $REPO

Write-Host "GitHub Secrets настроены успешно!"
